import { useState, useEffect } from 'react';
import axiosClient from '../axios';
import { useStateContext } from '../context/ContextProvider';

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
        }
    }, [selectedSeason]);

    useEffect(() => {
        if (selectedTournament) {
            fetchStatistics(selectedTournament);
        }
    }, [selectedTournament]);

    const fetchSeasons = async () => {
        try {
            const response = await axiosClient.get('/season');
            setSeasons(response.data.data);
        } catch (error) {
            console.error('Error al obtener temporadas:', error);
            setNotification('Error al obtener temporadas ' + error.response.data.message);
        }
    };

    const fetchTournaments = async (seasonId) => {
        try {
            const response = await axiosClient.get(`/tournaments?season=${seasonId}`);
            setTournaments(response.data.data);
        } catch (error) {
            console.error('Error al obtener torneos:', error);
            setNotification('Error al obtener torneos ' + error.response.data
                .message);
        }
    };

    const fetchStatistics = async (tournamentId) => {
        setLoading(true);
        try {
            const response = await axiosClient.get(`/match-statistics`, { params: { tournament_id: tournamentId } });
            setStatistics(response.data.data);
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Estadísticas</h1>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Temporada:</label>
                <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(e.target.value)}
                >
                    <option value="">Selecciona una temporada</option>
                    {seasons.map(season => (
                        <option key={season.id} value={season.id}>{season.name}</option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Torneo:</label>
                <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={selectedTournament}
                    onChange={(e) => setSelectedTournament(e.target.value)}
                >
                    <option value="">Selecciona un torneo</option>
                    {tournaments.map(tournament => (
                        <option key={tournament.id} value={tournament.id}>{tournament.name}</option>
                    ))}
                </select>
            </div>
            {loading ? (
                <p>Cargando...</p>
            ) : (
                <div>
                    <h2 className="text-xl font-bold mb-4">Estadísticas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <h3 className="text-lg font-bold">Goles</h3>
                            <ul>
                                {statistics.filter(stat => stat.type === 'goals').map(stat => (
                                    <li key={stat.id}>{stat.player.name}: {stat.value}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Asistencias</h3>
                            <ul>
                                {statistics.filter(stat => stat.type === 'assists').map(stat => (
                                    <li key={stat.id}>{stat.player.name}: {stat.value}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">MVP</h3>
                            <ul>
                                {statistics.filter(stat => stat.type === 'mvp').map(stat => (
                                    <li key={stat.id}>{stat.player.name}: {stat.value}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Lesiones</h3>
                            <ul>
                                {statistics.filter(stat => stat.type === 'injuries').map(stat => (
                                    <li key={stat.id}>{stat.player.name}: {stat.value}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Statistics;
