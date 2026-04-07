/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import axiosClient from "../axios";

export default function TeamForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, setNotification } = useStateContext();

    const [team, setTeam] = useState({
        name: '',
        division: '',
        id_user: '',
        title_first_division: 0,
        title_second_division: 0,
        title_third_division: 0,
        title_cup: 0,
        title_ucl: 0,
        title_uel: 0,
        title_league_cup: 0,
        title_champions_cup: 0,
        title_super_cup: 0
    });

    const [allTeams, setAllTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(null);

    const [bestPlayersCA, setBestPlayersCA] = useState(null);
    const [blockedPlayersCount, setBlockedPlayersCount] = useState(0);
    const [playersOver20Count, setPlayersOver20Count] = useState(0);
    const [filterPlayersOver20ByRegister, setFilterPlayersOver20ByRegister] = useState(0);
    const [filterPlayersByRegister, setFilterPlayersByRegister] = useState(0);

    useEffect(() => {
        axiosClient.get('/teams')
            .then(({ data }) => setAllTeams(data.data || data))
            .catch(() => console.error("Error al cargar la lista de equipos"));
    }, []);

    useEffect(() => {
        if (id) {
            setLoading(true);
            axiosClient.get(`/teams/${id}`)
                .then(({ data }) => {
                    const teamData = data.data || data;
                    const managerId = teamData.id_user || teamData.user_id || teamData.user?.id || '';
                    setTeam({
                        ...teamData,
                        id_user: managerId,
                        title_first_division: teamData.title_first_division || 0,
                        title_second_division: teamData.title_second_division || 0,
                        title_third_division: teamData.title_third_division || 0,
                        title_cup: teamData.title_cup || 0,
                        title_ucl: teamData.title_ucl || 0,
                        title_uel: teamData.title_uel || 0,
                        title_league_cup: teamData.title_league_cup || 0,
                        title_champions_cup: teamData.title_champions_cup || 0,
                        title_super_cup: teamData.title_super_cup || 0
                    });
                    getPlayers();
                    getUsers();
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        } else {
            setTeam({
                name: '', division: '', id_user: '',
                title_first_division: 0, title_second_division: 0, title_third_division: 0,
                title_cup: 0, title_ucl: 0, title_uel: 0,
                title_league_cup: 0, title_champions_cup: 0, title_super_cup: 0
            });
            setPlayers([]);
        }
    }, [id]);

    useEffect(() => {
        if (players.length > 0) {
            countBlockedPlayers();
            countPlayersOver20();
            getBestPlayersCA();
            countRegisterAndOver20();
            countRegistered();
        } else {
            setBestPlayersCA(null);
            setBlockedPlayersCount(0);
            setPlayersOver20Count(0);
            setFilterPlayersOver20ByRegister(0);
            setFilterPlayersByRegister(0);
        }
    }, [players]);

    const getPlayers = () => {
        setLoading(true);
        axiosClient.get(`/players-teams?id_team=${id}&status=all`)
            .then(({ data }) => {
                setPlayers(data.data || data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const getUsers = () => {
        axiosClient.get('/users')
            .then(({ data }) => setUsers(data.data || data))
            .catch(() => console.error("Error cargando usuarios"));
    };

    // --- FUNCIONES DE ESTADÍSTICAS ---
    const getBestPlayersCA = () => {
        const sortedPlayers = players.slice().sort((a, b) => b.ca - a.ca);
        const bestPlayers = sortedPlayers.slice(0, 16);
        const averageCA = bestPlayers.reduce((sum, player) => sum + player.ca, 0) / (bestPlayers.length || 1);
        setBestPlayersCA(averageCA.toFixed(2));
    };

    const countPlayersOver20 = () => setPlayersOver20Count(players.filter((p) => p.age > 20).length);
    const countBlockedPlayers = () => setBlockedPlayersCount(players.filter((p) => p.status === "bloqueado").length);
    const countRegisterAndOver20 = () => setFilterPlayersOver20ByRegister(players.filter(p => p.status === 'registrado' && p.age > 20).length);
    const countRegistered = () => setFilterPlayersByRegister(players.filter(p => p.status === 'registrado').length);

    // --- MANEJO DEL FORMULARIO ---
    const onSubmit = (e) => {
        e.preventDefault();
        setErrors(null);

        const payload = { ...team, id_user: parseInt(team.id_user) || null };

        if (team.id) {
            axiosClient.put(`/teams/${team.id}`, payload)
                .then(() => {
                    setNotification('Equipo actualizado satisfactoriamente');
                    navigate('/app/teams');
                })
                .catch(err => {
                    if (err.response && err.response.status === 422) setErrors(err.response.data.errors);
                });
        } else {
            axiosClient.post(`/teams`, payload)
                .then(() => {
                    setNotification('Equipo creado satisfactoriamente');
                    navigate('/app/teams');
                })
                .catch(err => {
                    if (err.response && err.response.status === 422) setErrors(err.response.data.errors);
                });
        }
    };

    const handleTitleChange = (e) => {
        const { name, value } = e.target;
        setTeam(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    };

    return (
        <div className="max-w-7xl mx-auto p-4 animate-fade-in-down">

            {/* SELECTOR RÁPIDO DE EQUIPOS */}
            {id && (
                <div className="mb-6 bg-slate-900 border border-slate-700 p-4 rounded-xl shadow flex flex-col sm:flex-row items-center gap-4">
                    <label className="text-blue-400 font-bold uppercase tracking-wider text-sm">
                        Cambiar a otro equipo:
                    </label>
                    <select
                        className="p-2 w-full sm:w-auto border border-slate-600 rounded bg-slate-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                        value={id || ''}
                        onChange={(e) => navigate(`/app/teams/${e.target.value}`)}
                    >
                        <option value="" disabled>Seleccione un equipo...</option>
                        {allTeams.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white bg-slate-900 border border-slate-700 px-6 py-3 rounded-xl shadow-lg inline-block">
                    {team.id ? `EDITAR EQUIPO: ${team.name}` : 'CREAR NUEVO EQUIPO'}
                </h1>
            </div>

            {loading && (
                <div className="flex justify-center items-center py-10 bg-slate-900 border border-slate-700 rounded-xl mb-6 shadow-lg">
                    <p className="text-gray-400 font-semibold animate-pulse">CARGANDO DATOS DEL EQUIPO...</p>
                </div>
            )}

            {errors && (
                <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-xl mb-6 shadow-lg">
                    {Object.keys(errors).map(key => (
                        <p key={key}>• {errors[key][0]}</p>
                    ))}
                </div>
            )}

            <form onSubmit={onSubmit} className="space-y-6">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* INFORMACIÓN GENERAL */}
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-lg space-y-4 h-full">
                        <h2 className="text-lg font-bold text-blue-400 border-b border-slate-700 pb-2 mb-4">📝 Información General</h2>

                        <div>
                            <label className="text-gray-400 font-medium text-xs uppercase tracking-wider mb-1 block">Nombre del Equipo</label>
                            <input
                                className="block w-full p-2.5 border border-slate-600 rounded-lg text-white bg-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                                value={team.name || ''}
                                onChange={e => setTeam({ ...team, name: e.target.value })}
                                placeholder="Ej: Real Madrid"
                                type="text"
                                disabled={user?.rol !== 'Admin'}
                            />
                        </div>

                        <div>
                            <label className="text-gray-400 font-medium text-xs uppercase tracking-wider mb-1 block">Manager Asignado</label>
                            <select
                                className="block w-full p-2.5 border border-slate-600 rounded-lg text-white bg-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                                value={team.id_user || ''}
                                onChange={e => setTeam({ ...team, id_user: e.target.value })}
                            >
                                <option value=''>Seleccione un manager...</option>
                                {users.map((u) => (
                                    <option value={u.id} key={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-gray-400 font-medium text-xs uppercase tracking-wider mb-1 block">División Actual</label>
                            <select
                                value={team.division || ''}
                                onChange={e => setTeam({ ...team, division: e.target.value })}
                                className="block w-full p-2.5 border border-slate-600 rounded-lg text-white bg-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                            >
                                <option value=''>Seleccionar división...</option>
                                <option value="Primera">Primera</option>
                                <option value="Segunda">Segunda</option>
                            </select>
                        </div>
                    </div>

                    {/* PALMARÉS / TÍTULOS */}
                    <div className="lg:col-span-2 bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-lg">
                        <h2 className="text-lg font-bold text-yellow-500 border-b border-slate-700 pb-2 mb-4 flex items-center gap-2">
                            🏆 Títulos Oficiales
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                                { name: 'title_first_division', label: '1ra División' },
                                { name: 'title_second_division', label: '2da División' },
                                { name: 'title_third_division', label: '3ra División' },
                                { name: 'title_cup', label: 'Copa FM' },
                                { name: 'title_league_cup', label: 'Copa de la Superliga' },
                                { name: 'title_super_cup', label: 'Supercopa' },
                                { name: 'title_ucl', label: 'Champions League' },
                                { name: 'title_uel', label: 'Europa League' },
                                { name: 'title_champions_cup', label: 'Copa de Campeones' }
                            ].map((trophy) => (
                                <div key={trophy.name} className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex flex-col justify-between">
                                    <label className="text-gray-300 font-medium text-xs tracking-wider mb-2 text-center">{trophy.label}</label>
                                    <input
                                        type="number"
                                        min="0"
                                        name={trophy.name}
                                        value={team[trophy.name] === null || team[trophy.name] === undefined ? 0 : team[trophy.name]}
                                        onChange={handleTitleChange}
                                        className="w-full bg-slate-900 border border-slate-600 text-white text-center font-bold text-lg rounded py-1 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                    {user?.rol === 'Admin' && (
                        <button type="submit" className="bg-green-600 hover:bg-green-500 px-8 py-3 rounded-lg text-white font-bold transition-colors shadow-lg shadow-green-900/50 flex items-center gap-2">
                            💾 Guardar Cambios
                        </button>
                    )}
                    {team.id && (
                        <Link className="bg-violet-600 hover:bg-violet-500 px-8 py-3 rounded-lg text-white font-bold transition-colors shadow-lg shadow-violet-900/50 flex items-center gap-2" to={`/app/estadisticas/${id}`}>
                            📊 Ver Estadísticas Completas
                        </Link>
                    )}
                </div>

                <hr className="border-slate-700 my-8" />

                {team.id && players.length > 0 && (
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-lg mb-6">
                        <h3 className="text-lg font-bold text-blue-400 border-b border-slate-700 pb-2 mb-4">📈 Resumen de la Plantilla</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {bestPlayersCA !== null && (
                                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-center">
                                    <p className="text-gray-400 text-xs uppercase mb-1">CA Medio (Top 16)</p>
                                    <p className="text-yellow-400 text-2xl font-black">{bestPlayersCA}</p>
                                </div>
                            )}
                            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-center">
                                <p className="text-gray-400 text-xs uppercase mb-1">Total Registrados</p>
                                <p className="text-blue-400 text-2xl font-black">{filterPlayersByRegister}</p>
                            </div>
                            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-center">
                                <p className="text-gray-400 text-xs uppercase mb-1">Reg. Mayores 20</p>
                                <p className="text-white text-2xl font-black">{filterPlayersOver20ByRegister}</p>
                            </div>
                            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-center">
                                <p className="text-gray-400 text-xs uppercase mb-1">Total + 20 Años</p>
                                <p className="text-white text-2xl font-black">{playersOver20Count}</p>
                            </div>
                            <div className="bg-slate-800 p-4 rounded-lg border border-red-900/50 text-center">
                                <p className="text-red-400 text-xs uppercase mb-1">Bloqueados</p>
                                <p className="text-red-400 text-2xl font-black">{blockedPlayersCount}</p>
                            </div>
                        </div>
                    </div>
                )}

                {players.length > 0 && (
                    <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
                        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                👕 Plantilla Actual <span className="text-sm bg-blue-600 text-white px-2 py-0.5 rounded-full">{players.length}</span>
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left text-gray-300">
                                <thead className="bg-slate-800 text-gray-400 uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Nombre del Jugador</th>
                                        <th className="px-6 py-4 text-center font-semibold">CA</th>
                                        <th className="px-6 py-4 text-center font-semibold">Edad</th>
                                        <th className="px-6 py-4 text-center font-semibold">Estado</th>
                                        <th className="px-6 py-4 text-right font-semibold">Valor de Mercado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {players.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-800/80 transition-colors">
                                            <td className="px-6 py-4 font-bold text-white"><Link to={`/app/players/${p.id}`}>
                                                {p.name}
                                            </Link></td>
                                            <td className="px-6 py-4 text-center text-blue-400 font-bold bg-blue-900/10">{p.ca}</td>
                                            <td className="px-6 py-4 text-center">{p.age}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${p.status === 'bloqueado' ? 'bg-red-900/50 text-red-400 border border-red-800' : 'bg-green-900/50 text-green-400 border border-green-800'}`}>
                                                    {p.status ? p.status.toUpperCase() : 'SIN ESTADO'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-green-300 font-medium">
                                                ${Number(p.value).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </form>
        </div>
    );
}
