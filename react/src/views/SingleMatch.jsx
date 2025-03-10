/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import axiosClient from '../axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useStateContext } from '../context/ContextProvider';

export default function SingleMatch() {
    const [match, setMatch] = useState({});
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, setNotification } = useStateContext();
    const [isEditing, setIsEditing] = useState(false);
    const [scoreHome, setScoreHome] = useState(match.score_home || 0);
    const [scoreAway, setScoreAway] = useState(match.score_away || 0);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        axiosClient.get(`/games/${id}`)
            .then(({ data }) => {
                setMatch(data.data);
                fetchPlayers(data.data.team_home.id, data.data.team_away.id);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [id]);

    const fetchPlayers = (teamHomeId, teamAwayId) => {
        axiosClient.get(`/players-teams?id_team=${teamHomeId},${teamAwayId}`)
            .then(({ data }) => {
                setPlayers(data.data);
            })
            .catch(() => {
                setNotification('Error al obtener jugadores');
            });
    };

    const handleStatisticChange = (playerId, field, value) => {
        setPlayers(prevPlayers =>
            prevPlayers.map(player =>
                player.id === playerId ? { ...player, [field]: value } : player
            )
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const statistics = players.map(player => ({
            player_id: player.id,
            tournament_id: match.tournament.id,
            user_id: user.id,
            goals: player.goals || 0,
            assists: player.assists || 0,
            yellow_cards: player.yellow_cards || 0,
            red_cards: player.red_cards || 0,
            simple_injuries: player.simple_injuries || 0,
            serious_injuries: player.serious_injuries || 0,
            mvp: player.mvp || false,
        }));

        axiosClient.post('/match-statistics', { statistics })
            .then(() => {
                setNotification('Estadísticas guardadas correctamente');
            })
            .catch(() => {
                setNotification('Error al guardar estadísticas');
            });
    };

    // const deleteMatch = () => {
    //     setLoading(true);
    //     axiosClient.delete(`/games/${id}`)
    //         .then(() => {
    //             setNotification('Partido eliminado correctamente');
    //             navigate('/partidos');
    //         })
    //         .catch(() => {
    //             setLoading(false);
    //         });
    // };


    // const updateMatch = () => {
    //     setIsEditing(true);
    // };

    // const saveMatch = () => {
    //     console.log('save match');
    //     console.log(scoreHome, scoreAway);
    //     axiosClient.put(`/game-update/${id}`, {
    //         score_home: scoreHome,
    //         score_away: scoreAway,
    //         status: 'pending'
    //     })
    //     .then(() => {
    //         setNotification('Partido actualizado correctamente');
    //         setIsEditing(false);
    //     })
    //     .catch(() => {
    //         setNotification('Error al actualizar el partido');
    //     });
    // };

    return (
        <div className="p-4">
            {loading ? (
                <p className="text-center text-gray-500">Cargando jugadores...</p>
            ) : (
                <div>
                    <h1 className="text-2xl font-bold mb-4">
                        {match.team_home?.name} vs {match.team_away?.name}
                    </h1>
                    <h3 className="text-2xl font-semibold mb-4">
                        {match.score_home} - {match.score_away}
                    </h3>
                    <p className="text-gray-600">{match.date}</p>
                    <p className="text-gray-600 mb-4">{match.status == 'pending' ? 'Pendiente de carga' : 'Completado el resultado'}</p>
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col lg:flex-row mb-4">
                            <div className="w-full lg:w-1/2 lg:pr-2 mb-4 lg:mb-0">
                                <h2 className="text-xl font-semibold mb-2">{match.team_home?.name}</h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-1/2 bg-white border border-gray-200 mb-4">
                                        <thead>
                                            <tr>
                                                <th className="py-1 px-1 border-b">Jugador</th>
                                                <th className="py-1 px-1 border-b">Goles</th>
                                                <th className="py-1 px-1 border-b">Asis.</th>
                                                <th className="py-1 px-1 border-b">Amar.</th>
                                                <th className="py-1 px-1 border-b">Rojas</th>
                                                <th className="py-1 px-1 border-b">L. Simples</th>
                                                <th className="py-1 px-1 border-b">L. Graves</th>
                                                <th className="py-1 px-1 border-b">MVP</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {players.filter(player => player.id_team?.id == match.team_home?.id).map(player => (
                                                <tr key={player.id} className="text-center">
                                                    <td className="py-1 px-1 border-b text-left">{player.name}</td>
                                                    <td className="py-1 px-1 border-b">
                                                        <input
                                                            type="number"
                                                            value={player.goals || 0}
                                                            onChange={e => handleStatisticChange(player.id, 'goals', parseInt(e.target.value))}
                                                            className="w-8 p-1 border rounded"
                                                        />
                                                    </td>
                                                    <td className="py-1 px-1 border-b">
                                                        <input
                                                            type="number"
                                                            value={player.assists || 0}
                                                            onChange={e => handleStatisticChange(player.id, 'assists', parseInt(e.target.value))}
                                                            className="w-8 p-1 border rounded"
                                                        />
                                                    </td>
                                                    <td className="py-1 px-1 border-b">
                                                        <input
                                                            type="checkbox"
                                                            checked={player.yellow_cards || false}
                                                            onChange={e => handleStatisticChange(player.id, 'yellow_cards', e.target.checked)}
                                                            className="w-4 h-4"
                                                        />
                                                    </td>
                                                    <td className="py-1 px-1 border-b">
                                                        <input
                                                            type="checkbox"
                                                            checked={player.red_cards || false}
                                                            onChange={e => handleStatisticChange(player.id, 'red_cards', e.target.checked)}
                                                            className="w-4 h-4"
                                                        />
                                                    </td>
                                                    <td className="py-1 px-1 border-b">
                                                        <input
                                                            type="checkbox"
                                                            checked={player.simple_injuries || false}
                                                            onChange={e => handleStatisticChange(player.id, 'simple_injuries', e.target.checked)}
                                                            className="w-4 h-4"
                                                        />
                                                    </td>
                                                    <td className="py-1 px-1 border-b">
                                                        <input
                                                            type="checkbox"
                                                            checked={player.serious_injuries || false}
                                                            onChange={e => handleStatisticChange(player.id, 'serious_injuries', e.target.checked)}
                                                            className="w-4 h-4"
                                                        />
                                                    </td>
                                                    <td className="py-1 px-1 border-b">
                                                        <input
                                                            type="checkbox"
                                                            checked={player.mvp || false}
                                                            onChange={e => handleStatisticChange(player.id, 'mvp', e.target.checked)}
                                                            className="w-4 h-4"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="w-full lg:w-1/2 lg:pl-2">
                                <h2 className="text-xl font-semibold mb-2">{match.team_away?.name}</h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-1/2 bg-white border border-gray-200 mb-4">
                                        <thead>
                                            <tr>
                                                <th className="py-1 px-1 border-b">Jugador</th>
                                                <th className="py-1 px-1 border-b">Goles</th>
                                                <th className="py-1 px-1 border-b">Asis.</th>
                                                <th className="py-1 px-1 border-b">Amar.</th>
                                                <th className="py-1 px-1 border-b">Rojas</th>
                                                <th className="py-1 px-1 border-b">L. Simples</th>
                                                <th className="py-1 px-1 border-b">L. Graves</th>
                                                <th className="py-1 px-1 border-b">MVP</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {players.filter(player => player.id_team?.id == match.team_away?.id).map(player => (
                                                <tr key={player.id} className="text-center">
                                                    <td className="py-1 px-1 border-b text-left">{player.name}</td>
                                                    <td className="py-1 px-1 border-b">
                                                        <input
                                                            type="number"
                                                            value={player.goals || 0}
                                                            onChange={e => handleStatisticChange(player.id, 'goals', parseInt(e.target.value))}
                                                            className="w-8 p-1 border rounded"
                                                        />
                                                    </td>
                                                    <td className="py-1 px-1 border-b">
                                                        <input
                                                            type="number"
                                                            value={player.assists || 0}
                                                            onChange={e => handleStatisticChange(player.id, 'assists', parseInt(e.target.value))}
                                                            className="w-8 p-1 border rounded"
                                                        />
                                                    </td>
                                                    <td className="py-1 px-1 border-b">
                                                        <input
                                                            type="checkbox"
                                                            checked={player.yellow_cards || false}
                                                            onChange={e => handleStatisticChange(player.id, 'yellow_cards', e.target.checked)}
                                                            className="w-4 h-4"
                                                        />
                                                    </td>
                                                    <td className="py-1 px-1 border-b">
                                                        <input
                                                            type="checkbox"
                                                            checked={player.red_cards || false}
                                                            onChange={e => handleStatisticChange(player.id, 'red_cards', e.target.checked)}
                                                            className="w-4 h-4"
                                                        />
                                                    </td>
                                                    <td className="py-1 px-1 border-b">
                                                        <input
                                                            type="checkbox"
                                                            checked={player.simple_injuries || false}
                                                            onChange={e => handleStatisticChange(player.id, 'simple_injuries', e.target.checked)}
                                                            className="w-4 h-4"
                                                        />
                                                    </td>
                                                    <td className="py-1 px-1 border-b">
                                                        <input
                                                            type="checkbox"
                                                            checked={player.serious_injuries || false}
                                                            onChange={e => handleStatisticChange(player.id, 'serious_injuries', e.target.checked)}
                                                            className="w-4 h-4"
                                                        />
                                                    </td>
                                                    <td className="py-1 px-1 border-b">
                                                        <input
                                                            type="checkbox"
                                                            checked={player.mvp || false}
                                                            onChange={e => handleStatisticChange(player.id, 'mvp', e.target.checked)}
                                                            className="w-4 h-4"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
                        >
                            Guardar Estadísticas
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
