/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import axiosClient from '../axios';
import { useParams, Link } from 'react-router-dom';
import { useStateContext } from '../context/ContextProvider';

export default function SingleMatch() {
    const { id } = useParams();
    const { setNotification } = useStateContext();

    const [match, setMatch] = useState({});
    const [statistics, setStatistics] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados para el visor de imágenes
    const [selectedImage, setSelectedImage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        axiosClient.get(`/games/${id}`)
            .then(({ data }) => {
                setMatch(data.data);
                fetchStatistics();
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const fetchStatistics = async () => {
        await axiosClient.get(`/match-statistics`, { params: { match_id: id } })
            .then(({ data }) => setStatistics(data.data))
            .catch(() => setNotification('Error al obtener estadísticas'));
    };

    const openImageModal = (url) => {
        setSelectedImage(url);
        setIsModalOpen(true);
    };

    // --- LÓGICA DE ORDENAMIENTO Y AGRUPACIÓN ---
    const sortByName = (a, b) => {
        const nameA = a.player_id?.name || '';
        const nameB = b.player_id?.name || '';
        return nameA.localeCompare(nameB);
    };

    const statsHome = statistics.filter(stat => stat.team_id === match.team_home?.id).sort(sortByName);
    const statsAway = statistics.filter(stat => stat.team_id === match.team_away?.id).sort(sortByName);
    const maxRating = Math.max(...statistics.map(stat => Number(stat.rating) || 0));

    // Verificamos si hubo penales
    const hasPenalties = match.penalties_home !== null && match.penalties_home !== undefined &&
        match.penalties_away !== null && match.penalties_away !== undefined;

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in-down pb-20">

            {/* BOTÓN VOLVER */}
            <div className="mb-6">
                <Link to="/app/partidos" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 font-bold tracking-wide transition-colors bg-slate-800/50 hover:bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Volver a Partidos
                </Link>
            </div>

            {/* MODAL DE IMAGEN CORREGIDO */}
            {isModalOpen && selectedImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 sm:p-8 animate-fade-in"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div className="relative w-full h-full max-w-6xl flex flex-col items-center justify-center">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 z-50 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white p-3 rounded-full transition-all border border-red-500/20"
                            title="Cerrar"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        {/* 🔥 La corrección: w-full y h-full con object-contain fuerza a la imagen a crecer lo más posible sin deformarse */}
                        <div className="w-full h-full p-4 flex items-center justify-center">
                            <img
                                src={selectedImage}
                                className="w-auto h-auto max-w-full max-h-full object-contain rounded-xl shadow-[0_0_50px_rgba(59,130,246,0.3)] border border-slate-700"
                                alt="Captura del partido en grande"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col justify-center items-center py-32 bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-700 shadow-xl">
                    <div className="loader inline-block border-4 border-slate-600 border-t-blue-500 rounded-full w-12 h-12 animate-spin mb-4"></div>
                    <p className="text-slate-400 font-bold animate-pulse tracking-wide text-lg">Cargando reporte de partido...</p>
                </div>
            ) : (
                <div className="space-y-8">

                    {/* SCOREBOARD PREMIUM (GLASSMORPHISM) */}
                    <div className="relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-10 md:p-14 text-center">

                        {/* Glows de fondo del marcador */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600"></div>
                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

                        {/* Info Torneo y Fecha */}
                        <div className="relative z-10 mb-8 inline-block bg-slate-950/50 border border-slate-800 px-6 py-2 rounded-full shadow-inner">
                            <p className="text-blue-400 font-black uppercase tracking-widest text-xs sm:text-sm flex items-center justify-center gap-3">
                                <span>🏆 {match.tournament?.name}</span>
                                <span className="text-slate-600">|</span>
                                <span className="text-emerald-400">📅 {match.match_date}</span>
                            </p>
                        </div>

                        {/* Nombres y Resultado */}
                        <div className="relative z-10 flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">

                            {/* Local */}
                            <div className="flex-1 text-center md:text-right w-full">
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white truncate drop-shadow-lg tracking-tight">
                                    {match.team_home?.name}
                                </h2>
                            </div>

                            {/* Caja del Resultado */}
                            <div className="flex-none flex flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900 px-10 py-6 rounded-3xl border border-slate-600 shadow-[0_0_30px_rgba(0,0,0,0.6)] relative z-20 transform hover:scale-105 transition-transform duration-300">
                                <span className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tighter drop-shadow-md">
                                    {match.score_home} - {match.score_away}
                                </span>

                                {/* Penales */}
                                {hasPenalties && (
                                    <div className="mt-4 bg-yellow-900/40 border border-yellow-700 px-5 py-1.5 rounded-full shadow-inner">
                                        <span className="text-yellow-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                                            <span>Penales:</span>
                                            <span className="text-white bg-yellow-600/50 px-2 py-0.5 rounded-md">{match.penalties_home}</span>
                                            <span>-</span>
                                            <span className="text-white bg-yellow-600/50 px-2 py-0.5 rounded-md">{match.penalties_away}</span>
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Visitante */}
                            <div className="flex-1 text-center md:text-left w-full">
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white truncate drop-shadow-lg tracking-tight">
                                    {match.team_away?.name}
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* GALERÍA DE CAPTURAS */}
                    {match.images?.length > 0 && (
                        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 p-6 sm:p-8 rounded-3xl shadow-xl">
                            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3 uppercase tracking-wider">
                                <span className="bg-blue-600/20 text-blue-400 p-2 rounded-xl border border-blue-500/30">📸</span>
                                Capturas del Partido
                            </h3>
                            <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                                {match.images.map((img, idx) => (
                                    <div key={img.id || idx} className="relative group overflow-hidden rounded-2xl border border-slate-600 shadow-md">
                                        <img
                                            src={img.url}
                                            alt={`Captura ${idx + 1}`}
                                            className="h-32 sm:h-40 md:h-48 w-auto object-cover cursor-pointer transition-transform duration-500 group-hover:scale-110"
                                            onClick={() => openImageModal(img.url)}
                                        />
                                        <div
                                            className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-center justify-center"
                                        >
                                            <svg className="w-10 h-10 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TABLAS DE ESTADÍSTICAS */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                        {/* TABLA LOCAL */}
                        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-3xl shadow-xl overflow-hidden flex flex-col">
                            <div className="bg-slate-800/80 p-5 border-b border-slate-700 flex items-center gap-3">
                                <span className="text-2xl">🏠</span>
                                <h2 className="text-xl font-black text-white uppercase tracking-wide truncate">{match.team_home?.name}</h2>
                            </div>
                            <div className="overflow-x-auto flex-1 p-1 sm:p-4">
                                <table className="min-w-full text-sm text-left text-gray-300">
                                    <thead className="text-slate-400 uppercase text-xs font-bold bg-[#0f172a] tracking-wider">
                                        <tr>
                                            <th className="py-4 px-4 rounded-tl-lg">Jugador</th>
                                            <th className="py-4 px-2 text-center" title="Goles">⚽</th>
                                            <th className="py-4 px-2 text-center" title="Asistencias">👟</th>
                                            <th className="py-4 px-2 text-center" title="Amarillas">🟨</th>
                                            <th className="py-4 px-2 text-center" title="Rojas">🟥</th>
                                            <th className="py-4 px-2 text-center" title="Lesión Grave">🚑</th>
                                            <th className="py-4 px-4 text-center rounded-tr-lg" title="MVP">⭐</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {statsHome.length === 0 ? (
                                            <tr><td colSpan="7" className="py-8 text-center text-slate-500 font-medium italic">Sin estadísticas registradas</td></tr>
                                        ) : (
                                            statsHome.map((stat, index) => {
                                                const isMVP = maxRating > 0 && Number(stat.rating) === maxRating;
                                                return (
                                                    <tr key={stat.id || index} className={`hover:bg-slate-800/60 transition-colors group ${isMVP ? 'bg-yellow-900/10' : ''}`}>
                                                        <td className={`py-3 px-4 font-bold text-base transition-colors ${isMVP ? 'text-yellow-400' : 'text-white group-hover:text-blue-300'}`}>
                                                            <Link to={`/app/players/${stat.player_id?.id}`} className={`py-3 px-4 font-bold text-base transition-colors ${isMVP ? 'text-yellow-400' : 'text-white group-hover:text-blue-300'}`}>
                                                                {stat.player_id?.name}
                                                            </Link>
                                                        </td>
                                                        <td className="py-3 px-2 text-center font-black text-green-400 text-base">{stat.goals > 0 ? stat.goals : <span className="text-slate-700">-</span>}</td>
                                                        <td className="py-3 px-2 text-center font-black text-blue-400 text-base">{stat.assists > 0 ? stat.assists : <span className="text-slate-700">-</span>}</td>
                                                        <td className="py-3 px-2 text-center text-lg">{stat.yellow_cards > 0 ? '🟨' : <span className="text-slate-700">-</span>}</td>
                                                        <td className="py-3 px-2 text-center text-lg">{stat.red_cards > 0 ? '🟥' : <span className="text-slate-700">-</span>}</td>
                                                        <td className="py-3 px-2 text-center text-lg">{stat.serious_injuries > 0 ? '🚑' : <span className="text-slate-700">-</span>}</td>
                                                        <td className="py-3 px-4 text-center font-black text-yellow-400 text-base">
                                                            {stat.rating > 0 ? (
                                                                <div className="flex items-center justify-center gap-1.5 bg-slate-950/50 px-2 py-1 rounded-lg border border-slate-700">
                                                                    <span>{stat.rating}</span>
                                                                    {isMVP && <span className="animate-pulse drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" title="Mejor Jugador del Partido">⭐</span>}
                                                                </div>
                                                            ) : <span className="text-slate-700">-</span>}
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* TABLA VISITANTE */}
                        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-3xl shadow-xl overflow-hidden flex flex-col">
                            <div className="bg-slate-800/80 p-5 border-b border-slate-700 flex items-center gap-3">
                                <span className="text-2xl">✈️</span>
                                <h2 className="text-xl font-black text-white uppercase tracking-wide truncate">{match.team_away?.name}</h2>
                            </div>
                            <div className="overflow-x-auto flex-1 p-1 sm:p-4">
                                <table className="min-w-full text-sm text-left text-gray-300">
                                    <thead className="text-slate-400 uppercase text-xs font-bold bg-[#0f172a] tracking-wider">
                                        <tr>
                                            <th className="py-4 px-4 rounded-tl-lg">Jugador</th>
                                            <th className="py-4 px-2 text-center" title="Goles">⚽</th>
                                            <th className="py-4 px-2 text-center" title="Asistencias">👟</th>
                                            <th className="py-4 px-2 text-center" title="Amarillas">🟨</th>
                                            <th className="py-4 px-2 text-center" title="Rojas">🟥</th>
                                            <th className="py-4 px-2 text-center" title="Lesión Grave">🚑</th>
                                            <th className="py-4 px-4 text-center rounded-tr-lg" title="MVP">⭐</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {statsAway.length === 0 ? (
                                            <tr><td colSpan="7" className="py-8 text-center text-slate-500 font-medium italic">Sin estadísticas registradas</td></tr>
                                        ) : (
                                            statsAway.map((stat, index) => {
                                                const isMVP = maxRating > 0 && Number(stat.rating) === maxRating;
                                                return (
                                                    <tr key={stat.id || index} className={`hover:bg-slate-800/60 transition-colors group ${isMVP ? 'bg-yellow-900/10' : ''}`}>
                                                        <td className={`py-3 px-4 font-bold text-base transition-colors ${isMVP ? 'text-yellow-400' : 'text-white group-hover:text-blue-300'}`}>
                                                            <Link to={`/app/players/${stat.player_id?.id}`}>
                                                                {stat.player_id?.name}
                                                            </Link>
                                                        </td>
                                                        <td className="py-3 px-2 text-center font-black text-green-400 text-base">{stat.goals > 0 ? stat.goals : <span className="text-slate-700">-</span>}</td>
                                                        <td className="py-3 px-2 text-center font-black text-blue-400 text-base">{stat.assists > 0 ? stat.assists : <span className="text-slate-700">-</span>}</td>
                                                        <td className="py-3 px-2 text-center text-lg">{stat.yellow_cards > 0 ? '🟨' : <span className="text-slate-700">-</span>}</td>
                                                        <td className="py-3 px-2 text-center text-lg">{stat.red_cards > 0 ? '🟥' : <span className="text-slate-700">-</span>}</td>
                                                        <td className="py-3 px-2 text-center text-lg">{stat.serious_injuries > 0 ? '🚑' : <span className="text-slate-700">-</span>}</td>
                                                        <td className="py-3 px-4 text-center font-black text-yellow-400 text-base">
                                                            {stat.rating > 0 ? (
                                                                <div className="flex items-center justify-center gap-1.5 bg-slate-950/50 px-2 py-1 rounded-lg border border-slate-700">
                                                                    <span>{stat.rating}</span>
                                                                    {isMVP && <span className="animate-pulse drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" title="Mejor Jugador del Partido">⭐</span>}
                                                                </div>
                                                            ) : <span className="text-slate-700">-</span>}
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
