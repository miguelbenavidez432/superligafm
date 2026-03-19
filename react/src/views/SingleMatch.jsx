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
                fectchStatistics();
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const fectchStatistics = async () => {
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

    return (
        <div className="max-w-7xl mx-auto p-4">

            {/* MODAL DE IMAGEN (Pantalla Completa) */}
            {isModalOpen && selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm p-4"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div className="relative max-w-6xl w-full flex justify-center">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute -top-12 right-0 text-white text-4xl font-bold hover:text-red-500 transition-colors"
                            title="Cerrar"
                        >
                            &times;
                        </button>
                        <img
                            src={selectedImage}
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-slate-700"
                            alt="Captura del partido en grande"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center py-20 bg-slate-900 border border-slate-700 rounded-xl shadow-xl">
                    <p className="text-gray-400 text-lg font-semibold animate-pulse">Cargando datos del partido...</p>
                </div>
            ) : (
                <div className="space-y-6">

                    {/* SCOREBOARD PRINCIPAL */}
                    <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-6 text-center">
                        <p className="text-blue-400 font-semibold mb-2 uppercase tracking-widest text-sm">
                            {match.tournament?.name} • {match.match_date}
                        </p>
                        <div className="flex justify-center items-center gap-4 sm:gap-12">
                            <h2 className="text-2xl sm:text-4xl font-bold text-white w-1/3 text-right truncate">
                                {match.team_home?.name}
                            </h2>
                            <div className="bg-slate-800 px-6 py-3 rounded-lg border border-slate-600 shadow-inner">
                                <span className="text-3xl sm:text-5xl font-black text-white">
                                    {match.score_home} - {match.score_away}
                                </span>
                            </div>
                            <h2 className="text-2xl sm:text-4xl font-bold text-white w-1/3 text-left truncate">
                                {match.team_away?.name}
                            </h2>
                        </div>
                    </div>

                    {/* FOTOS DEL PARTIDO (Solo si hay imágenes cargadas) */}
                    {match.images?.length > 0 && (
                        <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-xl">
                            <h3 className="text-lg font-bold text-blue-400 mb-4 border-b border-slate-700 pb-2">📸 Capturas del Partido</h3>
                            <div className="flex flex-wrap gap-4">
                                {match.images.map((img, idx) => (
                                    <img
                                        key={img.id || idx}
                                        src={img.url}
                                        alt={`Captura ${idx + 1}`}
                                        className="h-24 sm:h-32 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform border-2 border-slate-600 hover:border-blue-500 shadow-md"
                                        onClick={() => openImageModal(img.url)}
                                        title="Click para agrandar"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PANEL DE ESTADÍSTICAS */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                        {/* TABLA LOCAL */}
                        <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-xl overflow-x-auto">
                            <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">{match.team_home?.name} (Local)</h2>
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
                                        <tr><td colSpan="8" className="py-4 text-center text-slate-500">Sin estadísticas registradas</td></tr>
                                    )}
                                    {statsHome.map((stat, index) => {
                                        const isMVP = maxRating > 0 && Number(stat.rating) === maxRating;
                                        return (
                                        <tr key={stat.id || index} className={`hover:bg-slate-800 transition-colors ${isMVP ? 'bg-yellow-900/10' : ''}`}>
                                            <td className={`py-3 px-3 font-semibold ${stat.mvp ? 'text-yellow-400' : 'text-white'}`}>
                                                {stat.player_id?.name}
                                            </td>
                                            <td className="py-3 px-2 text-center font-bold text-green-400">{stat.goals > 0 ? stat.goals : '-'}</td>
                                            <td className="py-3 px-2 text-center font-bold text-blue-400">{stat.assists > 0 ? stat.assists : '-'}</td>
                                            <td className="py-3 px-2 text-center">{stat.yellow_cards > 0 ? '🟨' : '-'}</td>
                                            <td className="py-3 px-2 text-center">{stat.red_cards > 0 ? '🟥' : '-'}</td>
                                            <td className="py-3 px-2 text-center">{stat.serious_injuries > 0 ? '🚑' : '-'}</td>
                                            <td className="py-3 px-3 text-center font-bold text-yellow-400">
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
                        <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-xl overflow-x-auto">
                            <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">{match.team_away?.name} (Visitante)</h2>
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
                                        <tr><td colSpan="8" className="py-4 text-center text-slate-500">Sin estadísticas registradas</td></tr>
                                    )}
                                    {statsAway.map((stat, index) => {
                                        const isMVP = maxRating > 0 && Number(stat.rating) === maxRating;
                                        return (
                                        <tr key={stat.id || index} className={`hover:bg-slate-800 transition-colors ${stat.mvp ? 'bg-yellow-900/10' : ''}`}>
                                            <td className={`py-3 px-3 font-semibold ${isMVP ? 'text-yellow-400' : 'text-white'}`}>
                                                {stat.player_id?.name}
                                            </td>
                                            <td className="py-3 px-2 text-center font-bold text-green-400">{stat.goals > 0 ? stat.goals : '-'}</td>
                                            <td className="py-3 px-2 text-center font-bold text-blue-400">{stat.assists > 0 ? stat.assists : '-'}</td>
                                            <td className="py-3 px-2 text-center">{stat.yellow_cards > 0 ? '🟨' : '-'}</td>
                                            <td className="py-3 px-2 text-center">{stat.red_cards > 0 ? '🟥' : '-'}</td>
                                            <td className="py-3 px-2 text-center">{stat.serious_injuries > 0 ? '🚑' : '-'}</td>
                                            <td className="py-3 px-3 text-center">{stat.rating}</td>
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
