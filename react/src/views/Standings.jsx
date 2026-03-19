/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import axiosClient from '../axios';
import { useStateContext } from '../context/ContextProvider';

const Standings = () => {
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState('');
    const [tournaments, setTournaments] = useState([]);
    const [groupedStandings, setGroupedStandings] = useState({});
    const [loading, setLoading] = useState(false);
    const { setNotification } = useStateContext();

    // 1. Cargar las temporadas y seleccionar la activa por defecto
    useEffect(() => {
        axiosClient.get('/season/public')
            .then(({ data }) => {
                const seasonsData = data.data || data;
                setSeasons(seasonsData);

                // Buscamos la temporada activa (o tomamos la primera de la lista por defecto)
                const activeSeason = seasonsData.find(s => s.status === 'Activa') || seasonsData[0];
                if (activeSeason) {
                    setSelectedSeason(activeSeason.id);
                }
            })
            .catch(() => {
                setNotification('Error al cargar las temporadas');
            });
    }, []);

    // 2. Cuando cambia la temporada, buscamos torneos y posiciones
    useEffect(() => {
        if (selectedSeason) {
            fetchDataForSeason(selectedSeason);
        }
    }, [selectedSeason]);

    const fetchDataForSeason = async (seasonId) => {
        setLoading(true);
        try {
            // A. Traer todos los torneos
            const { data: tourData } = await axiosClient.get(`/tournaments/public`);
            const allTournaments = tourData.data || tourData;

            // B. Filtrar torneos de la temporada elegida Y que tengan tabla
            const seasonTournaments = allTournaments.filter(t =>
                t.season && t.season.id == seasonId &&
                !t.name.toLowerCase().includes('copa fm') &&
                !t.name.toLowerCase().includes('europa league') &&
                !t.name.toLowerCase().includes('playoff')
            );

            setTournaments(seasonTournaments);

            // C. Crear un diccionario para guardar las tablas
            const grouped = {};

            // D. Disparar peticiones EN PARALELO por cada torneo válido
            const promises = seasonTournaments.map(async (tour) => {
                try {
                    const { data: standData } = await axiosClient.get(`/standings/public`, {
                        params: { tournament_id: tour.id }
                    });

                    let tourStandings = standData.data || standData;

                    // 🔥 LA SOLUCIÓN: Verificamos que realmente sea un Array antes de ordenar
                    if (Array.isArray(tourStandings)) {
                        tourStandings.sort((a, b) => {
                            if (b.points !== a.points) return b.points - a.points;
                            if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
                            return b.goals_for - a.goals_for;
                        });
                        grouped[tour.id] = tourStandings;
                    } else {
                        // Si Laravel devuelve null o un objeto, lo convertimos en array vacío para que React no falle
                        grouped[tour.id] = [];
                    }
                } catch (innerError) {
                    console.error(`Error al cargar la tabla del torneo ${tour.name}:`, innerError);
                    grouped[tour.id] = []; // Si falla esta petición específica, mostramos la tabla vacía pero no rompemos la app
                }
            });

            // E. Esperar a que TODAS las peticiones simultáneas terminen
            await Promise.all(promises);

            // F. Actualizar el estado de React de una sola vez
            setGroupedStandings(grouped);

        } catch (error) {
            console.error(error);
            setNotification('No se pudo obtener la información de las tablas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 animate-fade-in-down">

            {/* ENCABEZADO Y SELECTOR DE TEMPORADA */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-2xl font-bold text-white bg-slate-900 border border-slate-700 px-6 py-3 rounded-xl shadow-lg w-full sm:w-auto text-center">
                    📊 Tablas de Posiciones
                </h1>

                <div className="bg-slate-900 border border-slate-700 p-2 rounded-xl shadow-lg flex items-center gap-3 w-full sm:w-auto px-4">
                    <label className="text-gray-400 font-bold uppercase tracking-wider text-xs whitespace-nowrap">
                        Temporada:
                    </label>
                    <select
                        className="bg-slate-800 text-white border border-slate-600 rounded-lg p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-full cursor-pointer"
                        value={selectedSeason}
                        onChange={(e) => setSelectedSeason(e.target.value)}
                    >
                        {seasons.map(season => (
                            <option key={season.id} value={season.id}>
                                {season.name} {season.status === 'Activa' ? '(Activa)' : ''}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* CONTENEDOR DE TARJETAS (GRID) */}
            {loading ? (
                <div className="flex justify-center items-center py-20 bg-slate-900 border border-slate-700 rounded-xl shadow-lg">
                    <p className="font-bold text-gray-400 animate-pulse text-lg">Cargando posiciones...</p>
                </div>
            ) : tournaments.length === 0 ? (
                <div className="text-center py-20 bg-slate-900 border border-slate-700 rounded-xl shadow-lg">
                    <p className="text-gray-500 text-lg">No hay torneos con tabla registrados para esta temporada.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {tournaments.map(tournament => (
                        <div key={tournament.id} className="bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden flex flex-col">

                            {/* TÍTULO DEL TORNEO */}
                            <div className="bg-slate-800/80 border-b border-slate-700 p-4">
                                <h2 className="text-lg font-bold text-blue-400 flex items-center gap-2">
                                    🏆 {tournament.name}
                                </h2>
                            </div>

                            {/* TABLA */}
                            <div className="overflow-x-auto flex-1">
                                <table className="min-w-full text-sm text-left text-gray-300">
                                    <thead className="!bg-[#0f172a] text-gray-300 uppercase text-xs font-bold tracking-wider border-b-2 border-slate-700">
                                        <tr>
                                            <th className="px-4 py-3 text-center w-10">#</th>
                                            <th className="px-4 py-3">Equipo</th>
                                            <th className="px-3 py-3 text-center" title="Partidos Jugados">PJ</th>
                                            <th className="px-3 py-3 text-center" title="Partidos Ganados">PG</th>
                                            <th className="px-3 py-3 text-center" title="Partidos Empatados">PE</th>
                                            <th className="px-3 py-3 text-center" title="Partidos Perdidos">PP</th>
                                            <th className="px-3 py-3 text-center" title="Goles a Favor">GF</th>
                                            <th className="px-3 py-3 text-center" title="Goles en Contra">GC</th>
                                            <th className="px-3 py-3 text-center" title="Diferencia de Gol">DG</th>
                                            <th className="px-4 py-3 text-center text-yellow-500 font-black text-sm">PTS</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {(!groupedStandings[tournament.id] || groupedStandings[tournament.id].length === 0) ? (
                                            <tr>
                                                <td colSpan="10" className="text-center py-6 text-slate-500 italic">
                                                    No hay equipos registrados en esta tabla aún.
                                                </td>
                                            </tr>
                                        ) : (
                                            groupedStandings[tournament.id].map((standing, index) => (
                                                <tr key={standing.id} className="hover:bg-slate-800 transition-colors group">
                                                    <td className="px-4 py-3 text-center font-bold text-gray-500 group-hover:text-white transition-colors">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-4 py-3 font-bold text-white whitespace-nowrap">
                                                        {standing.team?.name || 'Equipo Desconocido'}
                                                    </td>
                                                    <td className="px-3 py-3 text-center">{standing.played}</td>
                                                    <td className="px-3 py-3 text-center text-green-400">{standing.won}</td>
                                                    <td className="px-3 py-3 text-center text-gray-400">{standing.drawn}</td>
                                                    <td className="px-3 py-3 text-center text-red-400">{standing.lost}</td>
                                                    <td className="px-3 py-3 text-center">{standing.goals_for}</td>
                                                    <td className="px-3 py-3 text-center">{standing.goals_against}</td>
                                                    <td className="px-3 py-3 text-center font-medium">
                                                        <span className={standing.goal_difference > 0 ? 'text-green-300' : standing.goal_difference < 0 ? 'text-red-300' : 'text-gray-400'}>
                                                            {standing.goal_difference > 0 ? `+${standing.goal_difference}` : standing.goal_difference}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-black text-yellow-400 text-base bg-slate-800/50">
                                                        {standing.points}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Standings;
