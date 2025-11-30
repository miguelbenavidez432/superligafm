/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import axiosClient from '../axios';
import { useStateContext } from '../context/ContextProvider';


const Standings = () => {

    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState('');
    const [tournament, setTournament] = useState('');
    const { setNotification } = useStateContext();

    useEffect(() => {
        axiosClient.get('/season/public')
            .then(({ data }) => {
                setSeasons(data.data);
                setSelectedSeason(data.data[0].id);
                getTournaments(selectedSeason);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (selectedSeason) {
            getTournaments(selectedSeason);
        }
    }, [selectedSeason]);

    const getStandings = (selectedTournament) => {
        setLoading(true);
        axiosClient.get(`/standings/public`, { params: { tournament_id: selectedTournament } })
            .then(({ data }) => {
                const dataFilter = data.data.filter(standing => standing.tournament.id == selectedTournament);
                setStandings(dataFilter);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                setNotification('No se pudo obtener la información');
            });
    }

    const getTournaments = (selectedSeason) => {
        axiosClient.get(`/tournaments/public`)
            .then(({ data }) => {
                const dataFilter = data.data.filter(tournament => tournament.season.id == selectedSeason);
                setTournament(dataFilter);
            })
            .catch(() => {
                setLoading(false);
            });
    }

    const handleTournament = (e) => {
        getStandings(e.target.value);
    }

    return (
        <div className="p-4 mx-10">
            <h1 className="text-2xl font-bold mb-4">Tablas</h1>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Temporada:</label>
                <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
                    onChange={handleTournament}
                >
                    <option value="">Selecciona un torneo</option>
                    {tournament && tournament.map(tournament => (
                        <option key={tournament.id} value={tournament.id}>{tournament.name}</option>
                    ))}
                </select>
            </div>
            {loading ? (
                <p>Cargando...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posición</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PJ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PG</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PE</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PP</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GF</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GC</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DG</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntos</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {standings.map((standing, index) => (
                                <tr key={standing.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{standing.team.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{standing.played}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{standing.won}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{standing.drawn}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{standing.lost}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{standing.goals_for}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{standing.goals_against}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{standing.goal_difference}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{standing.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default Standings
