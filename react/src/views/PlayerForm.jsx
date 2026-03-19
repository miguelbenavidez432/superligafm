/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import axiosClient from "../axios";

// --- MINI COMPONENTE REUTILIZABLE (SRP) ---
const StatCard = ({ icon, title, value, colorClass }) => (
    <div className={`flex items-center p-4 bg-slate-800 border-l-4 ${colorClass} rounded-lg shadow-md`}>
        <div className="text-3xl mr-4">{icon}</div>
        <div>
            <p className="text-gray-400 text-sm font-semibold uppercase">{title}</p>
            <p className="text-2xl font-bold text-white">{value !== undefined && value !== null ? value : '-'}</p>
        </div>
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

    // --- ESTADOS DE ESTADÍSTICAS ---
    const [stats, setStats] = useState({});
    const [selectedSeason, setSelectedSeason] = useState('');
    const [selectedTournament, setSelectedTournament] = useState('');
    const [filteredTournaments, setFilteredTournaments] = useState([]);

    // --- ESTADOS DE UI ---
    const [loading, setLoading] = useState(false);
    const [loadingStats, setLoadingStats] = useState(false);
    const [errors, setErrors] = useState(null);

    const isAdmin = user?.rol === 'Admin' || user?.rol === 'Organizador';

    // --- EFECTOS ---
    useEffect(() => {
        getGlobalData();
        if (id) {
            fetchPlayerInfo();
        }
    }, [id]);

    useEffect(() => {
        if (selectedSeason && allTournaments.length > 0) {
            // Filtramos los torneos para que solo salgan los de la temporada seleccionada
            // Soportamos si el backend manda id_season como objeto o como número directo
            const matchTournaments = allTournaments.filter(t =>
                (t.season?.id === parseInt(selectedSeason)) ||
                (t.season === parseInt(selectedSeason))
            );
            setFilteredTournaments(matchTournaments);
            setSelectedTournament(''); // Reseteamos el torneo al cambiar de temporada
        }
    }, [selectedSeason, allTournaments]);

    // Efecto de Red: Pedimos estadísticas si cambian los filtros
    useEffect(() => {
        if (id && selectedSeason) {
            fetchPlayerStats();
        }
    }, [id, selectedSeason, selectedTournament]);

    // --- PETICIONES API ---
    const getGlobalData = async () => {
        try {
            // Cargamos todo de una sola vez para no hacer múltiples peticiones lentas
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
                console.log('Jugador obtenido:', data);
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
            .then(({ data }) => {
                setStats(data.data || data);
            })
            .catch(() => {
                console.log('Error al obtener estadísticas, seteando a cero');
                setStats({});
            })
            .finally(() => setLoadingStats(false));
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
        <div className="max-w-7xl mx-auto p-4">

            <div className="flex justify-between items-center mb-6 bg-slate-900 p-4 rounded-xl shadow-lg border border-slate-700">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="bg-blue-600 p-2 rounded-lg">⚽</span>
                    {players.id ? `Perfil de ${players.name}` : 'Nuevo Jugador'}
                </h1>
                {players.id && (
                    <div className="text-right">
                        <p className="text-sm text-gray-400">ID FM: {players.id_external}</p>
                        <p className="font-bold text-green-400">${players.value?.toLocaleString()}</p>
                    </div>
                )}
            </div>

            {errors && (
                <div className="bg-red-500 bg-opacity-20 border-l-4 border-red-500 p-4 rounded-lg text-red-200 mb-6">
                    {Object.keys(errors).map(key => (
                        <p key={key} className="mb-1">• {errors[key][0]}</p>
                    ))}
                </div>
            )}

            {/* LAYOUT A DOS COLUMNAS (Formulario a la izq, Stats a la der) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* --- COLUMNA 1: FORMULARIO DEL JUGADOR --- */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-900 p-6 rounded-xl shadow-xl border border-slate-700">
                        <h2 className="text-xl font-bold text-blue-400 mb-4 border-b border-slate-700 pb-2">Datos Personales</h2>

                        {loading ? (
                            <div className="animate-pulse flex flex-col gap-4">
                                <div className="h-10 bg-slate-700 rounded"></div>
                                <div className="h-10 bg-slate-700 rounded"></div>
                                <div className="h-10 bg-slate-700 rounded"></div>
                            </div>
                        ) : (
                            <form onSubmit={onSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-1">Nombre</label>
                                    <input value={players.name} onChange={e => setPlayers({ ...players, name: e.target.value })} disabled={!isAdmin}
                                        className="w-full p-2.5 border border-slate-600 rounded bg-slate-800 text-white disabled:opacity-50 focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-1">Equipo</label>
                                        <select value={players.id_team || ''} onChange={e => setPlayers({ ...players, id_team: parseInt(e.target.value) })} disabled={!isAdmin}
                                            className="w-full p-2.5 border border-slate-600 rounded bg-slate-800 text-white disabled:opacity-50">
                                            <option value="">Seleccione...</option>
                                            {team.map(t => <option value={t.id} key={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-1">Estado</label>
                                        <select value={players.status} onChange={e => setPlayers({ ...players, status: e.target.value })} disabled={!isAdmin}
                                            className="w-full p-2.5 border border-slate-600 rounded bg-slate-800 text-white disabled:opacity-50">
                                            <option value="">Sin modificar</option>
                                            <option value="liberado">Liberado</option>
                                            {isAdmin && <option value="bloqueado">Bloqueado</option>}
                                            <option value="registrado">Registrado</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-1">Edad</label>
                                        <input value={players.age} onChange={e => setPlayers({ ...players, age: parseInt(e.target.value) })} type="number" disabled={!isAdmin}
                                            className="w-full p-2.5 border border-slate-600 rounded bg-slate-800 text-white disabled:opacity-50 text-center" />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-1">Valor ($)</label>
                                        <input value={players.value} onChange={e => setPlayers({ ...players, value: parseInt(e.target.value) })} type="number" disabled={!isAdmin}
                                            className="w-full p-2.5 border border-slate-600 rounded bg-slate-800 text-white disabled:opacity-50 text-center" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-1">CA</label>
                                        <input value={players.ca} onChange={e => setPlayers({ ...players, ca: parseInt(e.target.value) })} type="number" disabled={!isAdmin}
                                            className="w-full p-2.5 border border-slate-600 rounded bg-slate-800 text-white disabled:opacity-50 text-center" />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-1">PA</label>
                                        <input value={players.pa} onChange={e => setPlayers({ ...players, pa: parseInt(e.target.value) })} type="number" disabled={!isAdmin}
                                            className="w-full p-2.5 border border-slate-600 rounded bg-slate-800 text-white disabled:opacity-50 text-center" />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-1">ID FM</label>
                                        <input value={players.id_external} onChange={e => setPlayers({ ...players, id_external: parseInt(e.target.value) })} type="number" disabled={!isAdmin}
                                            className="w-full p-2.5 border border-slate-600 rounded bg-slate-800 text-white disabled:opacity-50 text-center" />
                                    </div>
                                </div>

                                {isAdmin && (
                                    <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg transition-colors">
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
                        <div className="bg-slate-900 p-6 rounded-xl shadow-xl border border-slate-700 min-h-full">

                            {/* Cabecera del Dashboard */}
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 pb-4 border-b border-slate-700 gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-blue-400">Rendimiento Histórico</h2>
                                    <p className="text-sm text-gray-400">Estadísticas oficiales del simulador</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                    {/* Selector de Temporada */}
                                    <div className="flex items-center">
                                        <label className="text-gray-300 text-sm mr-2 font-medium w-20 sm:w-auto">Temporada:</label>
                                        <select
                                            value={selectedSeason}
                                            onChange={(e) => setSelectedSeason(e.target.value)}
                                            className="p-2 w-full sm:w-auto border border-slate-600 rounded bg-slate-800 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            {seasons.map(s => (
                                                <option key={s.id} value={s.id}>{s.name} {s.active === 'yes' ? '(Activa)' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {/* Selector de Torneo (En Cascada) */}
                                    <div className="flex items-center">
                                        <label className="text-gray-300 text-sm mr-2 font-medium w-20 sm:w-auto">Torneo:</label>
                                        <select
                                            value={selectedTournament}
                                            onChange={(e) => setSelectedTournament(e.target.value)}
                                            className="p-2 w-full sm:w-auto border border-slate-600 rounded bg-slate-800 text-white focus:ring-2 focus:ring-blue-500 outline-none"
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
                                <div className="flex justify-center items-center py-20">
                                    <p className="text-gray-400 animate-pulse">Cargando estadísticas de la temporada...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                    <StatCard icon="🏟️" title="Partidos Jugados" value={stats.matches_played} colorClass="border-blue-500" />
                                    <StatCard icon="⚽" title="Goles" value={stats.goals} colorClass="border-green-500" />
                                    <StatCard icon="👟" title="Asistencias" value={stats.assists} colorClass="border-yellow-400" />
                                    <StatCard icon="⭐" title="Calif. Media" value={stats.average_rating} colorClass="border-purple-500" />
                                    <StatCard icon="🏆" title="Veces MVP" value={stats.mvp_count} colorClass="border-pink-500" />

                                    <div className="sm:col-span-2 xl:col-span-1 grid grid-cols-2 gap-2">
                                        <StatCard icon="🟨" title="Amarillas" value={stats.yellow_cards} colorClass="border-yellow-600" />
                                        <StatCard icon="🟥" title="Rojas" value={stats.red_cards} colorClass="border-red-600" />
                                    </div>

                                    <StatCard icon="🩹" title="Lesiones Leves" value={stats.simple_injuries} colorClass="border-orange-400" />
                                    <StatCard icon="🚑" title="Lesiones Graves" value={stats.serious_injuries} colorClass="border-red-800" />
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
