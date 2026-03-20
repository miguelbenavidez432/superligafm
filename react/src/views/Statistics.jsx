/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import axiosClient from '../axios';
import { useStateContext } from '../context/ContextProvider';

// --- MINI COMPONENTE REUTILIZABLE PARA LAS TABLAS DE TOP ---
const StatTable = ({ title, icon, data, statKey, colorClass, highlightColor }) => {
    return (
        <div className={`bg-slate-900/80 backdrop-blur-md border-t-4 ${colorClass} rounded-2xl shadow-xl overflow-hidden border-x border-b border-slate-700 flex flex-col h-full`}>
            <div className="bg-slate-800/50 p-5 border-b border-slate-700/50 flex items-center justify-between">
                <h3 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-wide">
                    <span className="text-2xl drop-shadow-md">{icon}</span> {title}
                </h3>
            </div>
            <div className="overflow-y-auto max-h-[350px] flex-1">
                <table className="min-w-full text-sm text-left text-gray-300">
                    <thead className="bg-[#0f172a] uppercase text-xs font-bold tracking-wider text-slate-400 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-6 py-4 text-center w-16">#</th>
                            <th className="px-6 py-4">Jugador</th>
                            <th className="px-6 py-4 text-center">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="px-6 py-10 text-center text-slate-500 italic font-medium">No hay registros suficientes en este torneo</td>
                            </tr>
                        ) : (
                            data.map((stat, index) => (
                                <tr key={stat.id} className="hover:bg-slate-800/80 transition-colors group">
                                    <td className="px-6 py-3 text-center font-bold text-lg">
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : <span className="text-slate-500 text-sm">{index + 1}</span>}
                                    </td>
                                    <td className="px-6 py-3 font-bold text-white group-hover:text-blue-300 transition-colors text-base">
                                        {stat.player_id?.name || 'Desconocido'}
                                    </td>
                                    <td className={`px-6 py-3 text-center font-black text-xl ${highlightColor}`}>
                                        {stat[statKey]}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const Statistics = () => {
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState('');
    const [tournaments, setTournaments] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState('');
    const [statistics, setStatistics] = useState([]);
    const [loading, setLoading] = useState(false);
    const { setNotification } = useStateContext();

    useEffect(() => {
        fetchSeasons();
    }, []);

    useEffect(() => {
        if (selectedSeason) {
            fetchTournaments(selectedSeason);
            setSelectedTournament('');
        }
    }, [selectedSeason]);

    useEffect(() => {
        if (selectedSeason) {
            fetchStatistics();
        }
    }, [selectedSeason, selectedTournament]);

    const fetchSeasons = async () => {
        try {
            const response = await axiosClient.get('/season');
            const data = response.data.data || response.data;
            setSeasons(data);

            const activeSeason = data.find(s => s.active === 'yes') || data[0];
            if (activeSeason) {
                setSelectedSeason(activeSeason.id);
            }
        } catch (error) {
            setNotification('Error al obtener temporadas');
        }
    };

    const fetchTournaments = async (seasonId) => {
        try {
            const response = await axiosClient.get(`/tournaments?season=${seasonId}`);
            setTournaments(response.data.data || response.data);
        } catch (error) {
            setNotification('Error al obtener torneos');
        }
    };

    const fetchStatistics = async () => {
        setLoading(true);
        try {
            const params = { season_id: selectedSeason };
            if (selectedTournament) {
                params.tournament_id = selectedTournament;
            }

            const response = await axiosClient.get(`/match-statistics`, { params });
            setStatistics(response.data.data || response.data);
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            setNotification('Error al obtener estadísticas');
        } finally {
            setLoading(false);
        }
    };

    // --- PROCESAMIENTO DE DATOS (CORREGIDO MVP_COUNT) ---
    const topGoleadores = [...statistics]
        .filter(s => s.goals > 0)
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 20);

    const topAsistidores = [...statistics]
        .filter(s => s.assists > 0)
        .sort((a, b) => b.assists - a.assists)
        .slice(0, 20);

    const topMVP = [...statistics]
        .filter(s => s.mvp > 0)
        .sort((a, b) => b.mvp - a.mvp)
        .slice(0, 20);

    const topLesionados = [...statistics]
        .filter(s => s.simple_injuries > 0)
        .sort((a, b) => b.simple_injuries - a.simple_injuries)
        .slice(0, 20);

    return (
        <div className="max-w-7xl mx-auto p-4 animate-fade-in-down pb-12">

            {/* ENCABEZADO */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-slate-700 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3 uppercase tracking-wide">
                        <span className="bg-yellow-600/20 text-yellow-500 p-2 rounded-xl border border-yellow-500/30 shadow-inner">🏆</span>
                        Líderes Estadísticos
                    </h1>
                    <p className="text-sm text-slate-400 mt-1 font-medium ml-1">Rankings de la competición actual</p>
                </div>

                {/* FILTROS */}
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto bg-slate-950/40 p-3 rounded-xl border border-slate-800 shadow-inner">
                    <div className="flex-1 sm:flex-none">
                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Temporada</label>
                        <select
                            value={selectedSeason}
                            onChange={(e) => setSelectedSeason(e.target.value)}
                            className="w-full sm:w-48 p-2.5 border border-slate-600 rounded-lg bg-slate-800 text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
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
                            className="w-full sm:w-64 p-2.5 border border-slate-600 rounded-lg bg-slate-800 text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
                        >
                            <option value="">Todas las competiciones</option>
                            {tournaments.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* CONTENEDOR DE ESTADÍSTICAS (CUADRÍCULA 2x2) */}
            {loading ? (
                <div className="flex flex-col justify-center items-center py-32 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700 shadow-xl">
                    <div className="loader inline-block border-4 border-slate-600 border-t-blue-500 rounded-full w-12 h-12 animate-spin mb-4"></div>
                    <p className="text-slate-400 font-bold animate-pulse tracking-wide text-lg">Compilando estadísticas...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <StatTable
                        title="Goleadores"
                        icon="⚽"
                        data={topGoleadores}
                        statKey="goals"
                        colorClass="border-t-green-500"
                        highlightColor="text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]"
                    />

                    <StatTable
                        title="Asistidores"
                        icon="👟"
                        data={topAsistidores}
                        statKey="assists"
                        colorClass="border-t-cyan-500"
                        highlightColor="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]"
                    />

                    <StatTable
                        title="Premios MVP"
                        icon="⭐"
                        data={topMVP}
                        statKey="mvp"
                        colorClass="border-t-yellow-400"
                        highlightColor="text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]"
                    />

                    <StatTable
                        title="Lesiones"
                        icon="🩹"
                        data={topLesionados}
                        statKey="simple_injuries"
                        colorClass="border-t-orange-500"
                        highlightColor="text-orange-400 drop-shadow-[0_0_5px_rgba(251,146,60,0.5)]"
                    />
                </div>
            )}
        </div>
    );
};

export default Statistics;
