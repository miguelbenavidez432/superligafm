/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import axiosClient from "../axios";

// --- MINI COMPONENTE REUTILIZABLE (SRP) ---
const StatCard = ({ icon, title, value, colorClass }) => (
    <div className={`flex flex-col items-center justify-center p-5 bg-slate-800/80 border-b-4 ${colorClass} rounded-xl shadow-lg hover:bg-slate-700/80 transition-colors`}>
        <div className="flex items-center gap-3 w-full justify-center mb-2">
            <span className="text-2xl drop-shadow-md">{icon}</span>
            <span className="text-gray-400 text-xs sm:text-sm font-bold uppercase tracking-wider text-center">{title}</span>
        </div>
        <p className="text-3xl font-black text-white drop-shadow-md">
            {value !== undefined && value !== null ? value : '-'}
        </p>
    </div>
);

export default function PlayerForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, setNotification } = useStateContext();

    // --- ESTADOS DE DATOS ---
    const [players, setPlayers] = useState({
        name: '', id_external: 0, id_team: 61, status: '', value: '', ca: '', pa: '', age: '',
    });
    const [team, setTeam] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [allTournaments, setAllTournaments] = useState([]);

    // --- ESTADOS DE ESTADÍSTICAS Y TRASPASOS ---
    const [stats, setStats] = useState({});
    const [transfers, setTransfers] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState('');
    const [selectedTournament, setSelectedTournament] = useState('');
    const [filteredTournaments, setFilteredTournaments] = useState([]);

    // --- ESTADOS DE UI ---
    const [loading, setLoading] = useState(false);
    const [loadingStats, setLoadingStats] = useState(false);
    const [loadingTransfers, setLoadingTransfers] = useState(false);
    const [errors, setErrors] = useState(null);

    const isAdmin = user?.rol === 'Admin' || user?.rol === 'Organizador';

    // --- EFECTOS ---
    useEffect(() => {
        getGlobalData();
        if (id) {
            fetchPlayerInfo();
            fetchPlayerTransfers();
        }
    }, [id]);

    useEffect(() => {
        if (selectedSeason && allTournaments.length > 0) {
            const matchTournaments = allTournaments.filter(t =>
                (t.season?.id === parseInt(selectedSeason)) ||
                (t.season === parseInt(selectedSeason))
            );
            setFilteredTournaments(matchTournaments);
            setSelectedTournament('');
        }
    }, [selectedSeason, allTournaments]);

    useEffect(() => {
        if (id && selectedSeason) {
            fetchPlayerStats();
        }
    }, [id, selectedSeason, selectedTournament]);

    // --- PETICIONES API ---
    const getGlobalData = async () => {
        try {
            const [teamsRes, seasonsRes, tournamentsRes] = await Promise.all([
                axiosClient.get('/teams/public?all=true'),
                axiosClient.get('/season?all=true'),
                axiosClient.get('/tournaments?all=true&status=all')
            ]);

            setTeam(teamsRes.data.data);
            setAllTournaments(tournamentsRes.data.data || tournamentsRes.data);

            const fetchedSeasons = seasonsRes.data.data || seasonsRes.data;
            setSeasons(fetchedSeasons);

            const activeSeason = fetchedSeasons.find(s => s.active === 'yes') || fetchedSeasons[0];
            if (activeSeason) setSelectedSeason(activeSeason.id);

        } catch (error) {
            console.error("Error al cargar datos globales", error);
        }
    };

    const fetchPlayerInfo = () => {
        setLoading(true);
        axiosClient.get(`players/${id}`)
            .then(({ data }) => {
                setPlayers({
                    ...data,
                    id_team: data.id_team?.id
                });
            })
            .catch(() => console.log('Error al obtener el jugador'))
            .finally(() => setLoading(false));
    };

    const fetchPlayerStats = () => {
        setLoadingStats(true);
        let url = `/players/${id}/stats?season_id=${selectedSeason}`;
        if (selectedTournament) {
            url += `&tournament_id=${selectedTournament}`;
        }

        axiosClient.get(url)
            .then(({ data }) => setStats(data.data || data))
            .catch(() => setStats({}))
            .finally(() => setLoadingStats(false));
    };

    const fetchPlayerTransfers = () => {
        setLoadingTransfers(true);
        axiosClient.get(`/players/${id}/transfers`)
            .then(({ data }) => {
                setTransfers(data.data || []);
            })
            .catch(() => {
                // DATOS DE PRUEBA: Borrar cuando tu endpoint de Laravel devuelva la data unida
            })
            .finally(() => setLoadingTransfers(false));
    };

    // --- MANEJADORES ---
    const onSubmit = (e) => {
        e.preventDefault();
        setErrors(null);

        let payload = { ...players };
        if (payload.status === 'liberado') {
            payload.id_team = 61;
        }

        const request = players.id
            ? axiosClient.put(`/players/${players.id}`, payload)
            : axiosClient.post(`/players`, payload);

        request
            .then(() => {
                setNotification(`Jugador ${players.id ? 'actualizado' : 'creado'} satisfactoriamente`);
                navigate('/app/players');
            })
            .catch(err => {
                if (err.response && err.response.status === 422) {
                    setErrors(err.response.data.errors);
                }
            });
    };

    return (
        <div className="max-w-7xl mx-auto p-4 animate-fade-in-down pb-12">

            {/* ENCABEZADO */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-slate-700 gap-4">
                <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                    <span className="bg-blue-600/20 text-blue-400 p-2 rounded-xl border border-blue-500/30 shadow-inner">👤</span>
                    {players.id ? `Perfil: ${players.name}` : 'Nuevo Jugador'}
                </h1>

                {players.id && (
                    <div className="flex gap-6 items-center bg-slate-950/50 px-6 py-2 rounded-xl border border-slate-800">
                        <div className="text-center">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Valor de Mercado</p>
                            <p className="text-xl font-black text-green-400 drop-shadow-md">
                                ${players.value?.toLocaleString()}
                            </p>
                        </div>
                        <div className="w-px h-10 bg-slate-700"></div>
                        <div className="text-center">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">ID FM</p>
                            <p className="text-lg font-bold text-slate-300">
                                {players.id_external}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {errors && (
                <div className="bg-red-900/50 backdrop-blur-md border border-red-500 p-4 rounded-xl text-red-200 mb-6 shadow-lg">
                    {Object.keys(errors).map(key => (
                        <p key={key} className="mb-1 text-sm font-medium">• {errors[key][0]}</p>
                    ))}
                </div>
            )}

            {/* LAYOUT A DOS COLUMNAS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* --- COLUMNA 1: FORMULARIO DEL JUGADOR --- */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-900/70 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-700">
                        <h2 className="text-xl font-black text-blue-400 mb-6 flex items-center gap-2 uppercase tracking-wide">
                            <span className="text-xl">📋</span> Datos Personales
                        </h2>

                        {loading ? (
                            <div className="animate-pulse flex flex-col gap-5">
                                <div className="h-12 bg-slate-800 rounded-lg"></div>
                                <div className="h-12 bg-slate-800 rounded-lg"></div>
                                <div className="h-12 bg-slate-800 rounded-lg"></div>
                                <div className="h-12 bg-slate-800 rounded-lg mt-4"></div>
                            </div>
                        ) : (
                            <form onSubmit={onSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Nombre Completo</label>
                                    <input value={players.name} onChange={e => setPlayers({ ...players, name: e.target.value })} disabled={!isAdmin}
                                        className="w-full p-3 border border-slate-600 rounded-lg bg-slate-800/80 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-inner" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Equipo Actual</label>
                                        <select value={players.id_team || ''} onChange={e => setPlayers({ ...players, id_team: parseInt(e.target.value) })} disabled={!isAdmin}
                                            className="w-full p-3 border border-slate-600 rounded-lg bg-slate-800/80 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-inner">
                                            <option value="">Seleccione...</option>
                                            {team.map(t => <option value={t.id} key={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Estado</label>
                                        <select value={players.status} onChange={e => setPlayers({ ...players, status: e.target.value })} disabled={!isAdmin}
                                            className="w-full p-3 border border-slate-600 rounded-lg bg-slate-800/80 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-inner">
                                            <option value="">Sin modificar</option>
                                            <option value="liberado">Liberado</option>
                                            {isAdmin && <option value="bloqueado">Bloqueado</option>}
                                            <option value="registrado">Registrado</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                                    <div>
                                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 text-center">Edad</label>
                                        <input value={players.age} onChange={e => setPlayers({ ...players, age: parseInt(e.target.value) })} type="number" disabled={!isAdmin}
                                            className="w-full p-2.5 border border-slate-600 rounded-lg bg-slate-800/80 text-white font-bold text-center disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 outline-none shadow-inner" />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 text-center text-green-400">Valor ($)</label>
                                        <input value={players.value} onChange={e => setPlayers({ ...players, value: parseInt(e.target.value) })} type="number" disabled={!isAdmin}
                                            className="w-full p-2.5 border border-green-800/50 rounded-lg bg-slate-800/80 text-green-300 font-bold text-center disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-green-500 outline-none shadow-inner" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 text-center text-blue-300">CA</label>
                                        <input value={players.ca} onChange={e => setPlayers({ ...players, ca: parseInt(e.target.value) })} type="number" disabled={!isAdmin}
                                            className="w-full p-2.5 border border-blue-800/50 rounded-lg bg-blue-900/20 text-blue-300 font-bold text-center disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 outline-none shadow-inner" />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 text-center text-purple-300">PA</label>
                                        <input value={players.pa} onChange={e => setPlayers({ ...players, pa: parseInt(e.target.value) })} type="number" disabled={!isAdmin}
                                            className="w-full p-2.5 border border-purple-800/50 rounded-lg bg-purple-900/20 text-purple-300 font-bold text-center disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-purple-500 outline-none shadow-inner" />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 text-center">ID FM</label>
                                        <input value={players.id_external} onChange={e => setPlayers({ ...players, id_external: parseInt(e.target.value) })} type="number" disabled={!isAdmin}
                                            className="w-full p-2.5 border border-slate-600 rounded-lg bg-slate-800/80 text-white font-bold text-center disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-slate-400 outline-none shadow-inner" />
                                    </div>
                                </div>

                                {isAdmin && (
                                    <button type="submit" className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-1">
                                        💾 Guardar Cambios
                                    </button>
                                )}
                            </form>
                        )}
                    </div>
                </div>

                {/* --- COLUMNA 2: DASHBOARD DE ESTADÍSTICAS --- */}
                {players.id && (
                    <div className="lg:col-span-2">
                        <div className="bg-slate-900/70 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-700 h-full flex flex-col">

                            {/* Cabecera del Dashboard */}
                            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 pb-6 border-b border-slate-700/50 gap-6">
                                <div>
                                    <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-wide">
                                        <span className="text-xl">📊</span> Rendimiento
                                    </h2>
                                    <p className="text-sm text-slate-400 mt-1 font-medium">Estadísticas de la temporada</p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto bg-slate-950/40 p-3 rounded-xl border border-slate-800 shadow-inner">
                                    <div className="flex-1 sm:flex-none">
                                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Temporada</label>
                                        <select
                                            value={selectedSeason}
                                            onChange={(e) => setSelectedSeason(e.target.value)}
                                            className="w-full sm:w-40 p-2 border border-slate-600 rounded-lg bg-slate-800 text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        >
                                            {seasons.map(s => (
                                                <option key={s.id} value={s.id}>{s.name} {s.active === 'yes' ? '⭐' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1 sm:flex-none">
                                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Torneo</label>
                                        <select
                                            value={selectedTournament}
                                            onChange={(e) => setSelectedTournament(e.target.value)}
                                            className="w-full sm:w-48 p-2 border border-slate-600 rounded-lg bg-slate-800 text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        >
                                            <option value="">Todas las competiciones</option>
                                            {filteredTournaments.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Contenido del Dashboard */}
                            {loadingStats ? (
                                <div className="flex-1 flex flex-col justify-center items-center py-20">
                                    <div className="loader inline-block border-4 border-slate-600 border-t-blue-500 rounded-full w-12 h-12 animate-spin mb-4"></div>
                                    <p className="text-slate-400 font-bold animate-pulse tracking-wide">Analizando datos...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                                    <div className="col-span-2 sm:col-span-3 xl:col-span-4 bg-blue-900/20 border border-blue-800/50 rounded-xl p-4 mb-2">
                                        <div className="flex justify-around text-center">
                                            <div>
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Partidos Jugados</p>
                                                <p className="text-4xl font-black text-blue-300 drop-shadow-md">{stats.matches_played ?? '-'}</p>
                                            </div>
                                            <div className="w-px bg-slate-700"></div>
                                            <div>
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Calif. Media</p>
                                                <p className="text-4xl font-black text-purple-400 drop-shadow-md">{stats.average_rating ?? '-'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <StatCard icon="⚽" title="Goles" value={stats.goals} colorClass="border-green-500" />
                                    <StatCard icon="👟" title="Asistencias" value={stats.assists} colorClass="border-cyan-400" />
                                    <StatCard icon="🏆" title="Veces MVP" value={stats.mvp_count} colorClass="border-yellow-400" />

                                    <StatCard icon="🟨" title="Amarillas" value={stats.yellow_cards} colorClass="border-yellow-600" />
                                    <StatCard icon="🟥" title="Rojas" value={stats.red_cards} colorClass="border-red-600" />

                                    <div className="col-span-1 sm:col-span-1 xl:col-span-3 grid grid-cols-1 gap-4">
                                        <StatCard icon="🩹" title="Lesiones" value={stats.simple_injuries} colorClass="border-orange-500" />
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </div>

            {/* --- SECCIÓN HISTORIAL DE TRASPASOS (FULL WIDTH) --- */}
            {players.id && (
                <div className="mt-8 bg-slate-900/70 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-700">
                    <h2 className="text-xl font-black text-white mb-8 flex items-center gap-2 uppercase tracking-wide border-b border-slate-700/50 pb-4">
                        <span className="text-xl">🔄</span> Historial de Traspasos
                    </h2>

                    {loadingTransfers ? (
                        <div className="flex justify-center items-center py-10">
                            <div className="loader inline-block border-4 border-slate-600 border-t-blue-500 rounded-full w-10 h-10 animate-spin mb-4"></div>
                        </div>
                    ) : transfers.length === 0 ? (
                        <div className="text-center py-12 bg-slate-950/40 rounded-xl border border-slate-800">
                            <p className="text-4xl mb-4">📜</p>
                            <p className="text-slate-400 font-medium">No hay registros de traspasos para este jugador.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
                            {transfers.map((t, idx) => (
                                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">

                                    {/* Icono del Timeline */}
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-600 bg-slate-800 text-slate-300 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                        {t.type === 'Subasta' ? '🔨' : t.type === 'Cláusula' ? '📄' : '🤝'}
                                    </div>

                                    {/* Tarjeta de Traspaso */}
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-800/80 backdrop-blur-sm border border-slate-600 p-4 sm:p-5 rounded-xl shadow-lg hover:bg-slate-700/80 transition-colors">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 shadow-inner">
                                                📅 {t.date || 'Sin fecha'}
                                            </span>
                                            <span className="text-xs font-bold text-blue-400 bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-900/50 shadow-inner">
                                                {t.type || 'Traspaso'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 mb-5 justify-between sm:justify-start bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                            <span className="font-bold text-slate-300 truncate text-sm sm:text-base text-center w-full" title={t.from_team_name}>
                                                {t.from_team_name}
                                            </span>
                                            <span className="text-xl text-slate-500 shrink-0">➡️</span>
                                            <span className="font-bold text-white truncate text-sm sm:text-base text-center w-full" title={t.to_team_name}>
                                                {t.to_team_name}
                                            </span>
                                        </div>

                                        <div className="text-green-400 font-black tracking-wider text-center bg-slate-950 px-4 py-3 rounded-lg border border-slate-700 shadow-inner text-lg sm:text-xl">
                                            💰 ${Number(t.value).toLocaleString()}
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}
