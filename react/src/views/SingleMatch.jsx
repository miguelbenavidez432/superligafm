/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import axiosClient from '../axios';
import { useParams } from 'react-router-dom';
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
        <div className="max-w-7xl mx-auto p-4 animate-fade-in-down">

            {/* MODAL DE IMAGEN (Pantalla Completa) */}
            {isModalOpen && selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 backdrop-blur-md p-4"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div className="relative max-w-7xl w-full flex justify-center">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute -top-12 right-0 text-white text-5xl font-bold hover:text-red-500 transition-colors"
                            title="Cerrar"
                        >
                            &times;
                        </button>
                        <img
                            src={selectedImage}
                            className="max-w-full max-h-[95vh] object-contain rounded-xl shadow-2xl border border-slate-700"
                            alt="Captura del partido en grande"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center py-20 bg-slate-900 border border-slate-700 rounded-xl shadow-xl">
                    <div className="loader inline-block border-4 border-slate-600 border-t-blue-500 rounded-full w-12 h-12 animate-spin mb-4"></div>
                </div>
            ) : (
                <div className="space-y-6">

                    {/* SCOREBOARD PRINCIPAL */}
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-xl p-6 md:p-10 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600"></div>

                        <p className="text-blue-400 font-bold mb-6 uppercase tracking-widest text-sm md:text-base">
                            🏆 {match.tournament?.name} <span className="text-slate-500 mx-2">•</span> 📅 {match.match_date}
                        </p>

                        <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white md:w-2/5 text-center md:text-right truncate drop-shadow-lg">
                                {match.team_home?.name}
                            </h2>

                            <div className="flex flex-col items-center justify-center bg-slate-800/80 px-8 py-4 rounded-2xl border border-slate-600 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                <span className="text-5xl sm:text-6xl font-black text-white tracking-wider">
                                    {match.score_home} - {match.score_away}
                                </span>

                                {/* RESULTADO DE PENALES */}
                                {hasPenalties && (
                                    <div className="mt-2 bg-yellow-900/30 border border-yellow-700/50 px-4 py-1 rounded-full">
                                        <span className="text-yellow-400 font-bold text-sm sm:text-base uppercase tracking-wider">
                                            Penales: ({match.penalties_home} - {match.penalties_away})
                                        </span>
                                    </div>
                                )}
                            </div>

                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white md:w-2/5 text-center md:text-left truncate drop-shadow-lg">
                                {match.team_away?.name}
                            </h2>
                        </div>
                    </div>

                    {/* FOTOS DEL PARTIDO (GALERÍA DE MINIATURAS) */}
                    {match.images?.length > 0 && (
                        <div className="bg-slate-900 border border-slate-700 p-4 sm:p-6 rounded-2xl shadow-xl">
                            <h3 className="text-xl font-black text-white mb-4 border-b border-slate-700 pb-3 flex items-center gap-2 uppercase tracking-wide">
                                📸 Capturas del Partido
                            </h3>
                            {/* 🔥 Cambiado a flex-wrap para que se vean como miniaturas una al lado de la otra */}
                            <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                                {match.images.map((img, idx) => (
                                    <img
                                        key={img.id || idx}
                                        src={img.url}
                                        alt={`Captura ${idx + 1}`}
                                        // 🔥 Alturas controladas (h-32 a h-48) y object-cover para que queden como cuadritos/rectángulos perfectos
                                        className="h-32 sm:h-40 md:h-48 w-auto object-cover rounded-xl cursor-pointer hover:scale-105 transition-transform border-2 border-slate-700 hover:border-blue-500 shadow-lg"
                                        onClick={() => openImageModal(img.url)}
                                        title="Click para ver en pantalla completa"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PANEL DE ESTADÍSTICAS */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                        {/* TABLA LOCAL */}
                        <div className="bg-slate-900 border border-slate-700 p-1 sm:p-4 rounded-2xl shadow-xl overflow-x-auto">
                            <h2 className="text-xl font-black text-white m-3 sm:mb-4 border-b border-slate-700 pb-2">🏠 {match.team_home?.name}</h2>
                            <table className="min-w-full text-sm text-left text-gray-300">
                                <thead className="bg-slate-800 text-gray-400 uppercase text-xs">
                                    <tr>
                                        <th className="py-3 px-3 rounded-tl-lg">Jugador</th>
                                        <th className="py-3 px-2 text-center" title="Goles">⚽</th>
                                        <th className="py-3 px-2 text-center" title="Asistencias">👟</th>
                                        <th className="py-3 px-2 text-center" title="Amarillas">🟨</th>
                                        <th className="py-3 px-2 text-center" title="Rojas">🟥</th>
                                        <th className="py-3 px-2 text-center" title="Lesión Grave">🚑</th>
                                        <th className="py-3 px-3 text-center rounded-tr-lg" title="MVP">⭐</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {statsHome.length === 0 && (
                                        <tr><td colSpan="8" className="py-6 text-center text-slate-500 font-medium">Sin estadísticas registradas</td></tr>
                                    )}
                                    {statsHome.map((stat, index) => {
                                        const isMVP = maxRating > 0 && Number(stat.rating) === maxRating;
                                        return (
                                        <tr key={stat.id || index} className={`hover:bg-slate-800/80 transition-colors ${isMVP ? 'bg-yellow-900/10' : ''}`}>
                                            <td className={`py-3 px-3 font-bold ${isMVP ? 'text-yellow-400' : 'text-white'}`}>
                                                {stat.player_id?.name}
                                            </td>
                                            <td className="py-3 px-2 text-center font-bold text-green-400 text-base">{stat.goals > 0 ? stat.goals : '-'}</td>
                                            <td className="py-3 px-2 text-center font-bold text-blue-400 text-base">{stat.assists > 0 ? stat.assists : '-'}</td>
                                            <td className="py-3 px-2 text-center text-base">{stat.yellow_cards > 0 ? '🟨' : '-'}</td>
                                            <td className="py-3 px-2 text-center text-base">{stat.red_cards > 0 ? '🟥' : '-'}</td>
                                            <td className="py-3 px-2 text-center text-base">{stat.serious_injuries > 0 ? '🚑' : '-'}</td>
                                            <td className="py-3 px-3 text-center font-black text-yellow-400 text-base">
                                                    {stat.rating > 0 ? (
                                                        <div className="flex items-center justify-center gap-1">
                                                            <span>{stat.rating}</span>
                                                            {isMVP && <span className="animate-pulse" title="Mejor Jugador del Partido">⭐</span>}
                                                        </div>
                                                    ) : '-'}
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>

                        {/* TABLA VISITANTE */}
                        <div className="bg-slate-900 border border-slate-700 p-1 sm:p-4 rounded-2xl shadow-xl overflow-x-auto">
                            <h2 className="text-xl font-black text-white m-3 sm:mb-4 border-b border-slate-700 pb-2">✈️ {match.team_away?.name}</h2>
                            <table className="min-w-full text-sm text-left text-gray-300">
                                <thead className="bg-slate-800 text-gray-400 uppercase text-xs">
                                    <tr>
                                        <th className="py-3 px-3 rounded-tl-lg">Jugador</th>
                                        <th className="py-3 px-2 text-center" title="Goles">⚽</th>
                                        <th className="py-3 px-2 text-center" title="Asistencias">👟</th>
                                        <th className="py-3 px-2 text-center" title="Amarillas">🟨</th>
                                        <th className="py-3 px-2 text-center" title="Rojas">🟥</th>
                                        <th className="py-3 px-2 text-center" title="Lesión Grave">🚑</th>
                                        <th className="py-3 px-3 text-center rounded-tr-lg" title="MVP">⭐</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {statsAway.length === 0 && (
                                        <tr><td colSpan="8" className="py-6 text-center text-slate-500 font-medium">Sin estadísticas registradas</td></tr>
                                    )}
                                    {statsAway.map((stat, index) => {
                                        const isMVP = maxRating > 0 && Number(stat.rating) === maxRating;
                                        return (
                                        <tr key={stat.id || index} className={`hover:bg-slate-800/80 transition-colors ${isMVP ? 'bg-yellow-900/10' : ''}`}>
                                            <td className={`py-3 px-3 font-bold ${isMVP ? 'text-yellow-400' : 'text-white'}`}>
                                                {stat.player_id?.name}
                                            </td>
                                            <td className="py-3 px-2 text-center font-bold text-green-400 text-base">{stat.goals > 0 ? stat.goals : '-'}</td>
                                            <td className="py-3 px-2 text-center font-bold text-blue-400 text-base">{stat.assists > 0 ? stat.assists : '-'}</td>
                                            <td className="py-3 px-2 text-center text-base">{stat.yellow_cards > 0 ? '🟨' : '-'}</td>
                                            <td className="py-3 px-2 text-center text-base">{stat.red_cards > 0 ? '🟥' : '-'}</td>
                                            <td className="py-3 px-2 text-center text-base">{stat.serious_injuries > 0 ? '🚑' : '-'}</td>
                                            <td className="py-3 px-3 text-center font-black text-yellow-400 text-base">
                                                    {stat.rating > 0 ? (
                                                        <div className="flex items-center justify-center gap-1">
                                                            <span>{stat.rating}</span>
                                                            {isMVP && <span className="animate-pulse" title="Mejor Jugador del Partido">⭐</span>}
                                                        </div>
                                                    ) : '-'}
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
