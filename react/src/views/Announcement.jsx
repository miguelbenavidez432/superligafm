/* eslint-disable no-empty */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import axiosClient from "../axios"
import { useStateContext } from "../context/ContextProvider";
import { useNavigate, useParams } from "react-router-dom";

export default function Announcement() {

    const navigate = useNavigate();
    const { playerId } = useParams();
    const [team, setTeam] = useState([]);
    const [players, setPlayers] = useState([]);
    const [filteredTeam, setFilteredTeam] = useState([]);
    const { user, setNotification } = useStateContext();
    const [selectedEquipo, setSelectedEquipo] = useState('');
    const [playerToBlock, setPlayerToBlock] = useState([]);
    const [errors, setErrors] = useState(null);
    const [teamPlayers, setTeamPlayers] = useState([]);
    const [playerTransfered, setPlayerTransfered] = useState({
        id_player: '',
        name: '',
        id_team: '',
        created_by: user.id,
        value: 0,
        other_players: [],
        extra_value: 0,
        total_value: 0,
        id_season: 60,
    });
    const [inputValue, setInputValue] = useState(0);

    useEffect(() => {
        getTeam();
        getPlayers();
    }, []);

    useEffect(() => {
        if (selectedEquipo) {
            filterPlayersByTeam();
            filterPlayersByUser();
        }
    }, [selectedEquipo]);

    useEffect(() => {
        if (playerId && players.length > 0) {
            preloadPlayerData(playerId);
        }
    }, [playerId, players]);

    const preloadPlayerData = (playerIdParam) => {
        const player = players.find(p => p.id === parseInt(playerIdParam));
        if (player && player.id_team) {
            setSelectedEquipo(player.id_team.id);
            setInputValue(player.value);
            setPlayerTransfered({
                created_by: user.id,
                id_player: player.id,
                name: player.name,
                id_team: player.id_team ? player.id_team.id : '',
                value: player.value,
                other_players: [],
                extra_value: 0,
                total_value: player.value,
                id_season: 60,
            });

            if (player.id_team) {
                const filteredPlayers = players.filter(p => p.id_team && p.id_team.id === player.id_team.id);
                setTeamPlayers(player.id_team?.id);
            }
        }
    };

    const getTeam = () => {
        axiosClient.get('/teams')
            .then(({ data }) => {
                const teamFilter = data.data.filter((t) => t.division === 'Primera' || t.division === 'Segunda');
                const teamUser = data.data.filter(t => t.id_user === user.id);
                setFilteredTeam(teamUser);
                setTeam(teamFilter);
            })
            .catch(() => {
                setErrors("Error al obtener los equipos.");
            });
    };

    const getPlayers = () => {
        axiosClient.get('/players')
            .then(({ data })=>  {
                setPlayers(data.data);
            })
    }

    const handleIdEquipoChange = (event) => {
        const equipoId = parseInt(event.target.value);
        setSelectedEquipo(equipoId);
    };

    const handleInputChange = (event) => {
        const newValue = parseInt(event.target.value);

        setPlayerTransfered((prev) => ({
            ...prev,
            value: newValue,
            total_value: newValue + prev.extra_value
        }));
    };

    const handlePlayerSelect = (event) => {
        const selectedPlayerId = parseInt(event.target.value);
        const selectedPlayer = players.find(jugador => jugador.id === selectedPlayerId);

        if (selectedPlayer) {
            setPlayerTransfered((prev) => {
                const newTotalValue = selectedPlayer.value + prev.extra_value;
                return {
                    ...prev,
                    id_player: selectedPlayer.id,
                    name: selectedPlayer.name,
                    value: selectedPlayer.value,
                    total_value: newTotalValue,
                    id_team: selectedPlayer.id_team ? selectedPlayer.id_team.id : ''
                };
            });
            setInputValue(selectedPlayer.value);
        }
    };

    const handlerPlayerAdd = (e) => {
        const newIdPlayer = parseInt(e.target.value);
        const playerData = teamPlayers.find(p => p.id === newIdPlayer);
        if (!playerData) return;

        setPlayerTransfered((prev) => {
            const newExtraValue = prev.extra_value + playerData.value;
            const newTotalValue = prev.value + newExtraValue;

            return {
                ...prev,
                other_players: [...prev.other_players, playerData.name],
                extra_value: newExtraValue,
                total_value: newTotalValue
            };
        });

        const datosJugadorEquipo = {
            id: playerData.id,
            id_team: playerData.id_team ? playerData.id_team.id : '',
            name: playerData.name,
            age: playerData.age,
            ca: playerData.ca,
            pa: playerData.pa,
            value: playerData.value,
            status: 'restringido'
        };

        setPlayerToBlock((prev) => [...prev, datosJugadorEquipo]);
    };

    const filterPlayersByTeam = async () => {
        if (selectedEquipo) {
            try {
                const response = await axiosClient.get(`/players?all=true`);
                const filteredPlayers = response.data.data.filter(player => player.id_team && player.id_team.id == parseInt(selectedEquipo));
                setPlayers(filteredPlayers);
            } catch (error) {
                setErrors("Error al filtrar jugadores por equipo.");
            }
        }
    };

    const filterPlayersByUser = async () => {
        if (filteredTeam.length > 0) {
            try {
                const response = await axiosClient.get(`/players?all=true`);
                const filteredPlayers = response.data.data.filter(player => player.id_team ? player.id_team.id == filteredTeam[0].id : '');
                setTeamPlayers(filteredPlayers);
            } catch (error) {
                setErrors("Error al filtrar jugadores por usuario.");
            }
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();
        axiosClient.post('/clausula_rescision', {
            ...playerTransfered,
            other_players: JSON.stringify(playerTransfered.other_players)
        })
            .then(() => {
                setPlayerTransfered({
                    id_player: '',
                    name: '',
                    id_team: 0,
                    created_by: user.id,
                    value: 0,
                    other_players: [],
                    extra_value: 0,
                    total_value: 0,
                    status: 'bloqueado',
                    id_season: 59
                });
                setNotification('Ejecución de cláusula enviada');
                navigate('/offers');
            })
            .catch(error => {
                setErrors(error.response?.data.errors || "Error al enviar la cláusula de rescisión.");
            });
    };

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <div className="text-lg font-bold bg-slate-900 text-white rounded-md p-2">Ejecución de cláusula de rescisión</div>
            </div>
            {playerId && (
                <div className="mb-4 p-4 bg-blue-800 border-l-4 border-blue-400 rounded-md">
                    <p className="text-white font-medium">
                        🎯 Jugador seleccionado: {playerTransfered ? playerTransfered.name : 'Cargando...'}
                    </p>
                    {playerTransfered && (
                        <p className=" bg-blue-800 text-white text-sm mt-1">
                            Equipo: {playerTransfered.id_team ? playerTransfered.id_team.name : 'Sin equipo'} |
                            Valor mínimo: {playerTransfered.value}
                        </p>
                    )}
                </div>
            )}
            <div className="bg-slate-900 shadow-md rounded-md">
                <select
                    id="equipo"
                    value={selectedEquipo}
                    onChange={handleIdEquipoChange}
                    className="w-4/5 mx-2 p-2 border bg-gray-800 text-white border-gray-300 rounded-md my-4"
                >
                    <option value="">Selecciona un equipo</option>
                    {team.map((t, index) => (
                        <option value={t.id} key={index}>{t.name}</option>
                    ))}
                </select>

                {selectedEquipo && (
                    <form onSubmit={onSubmit}>
                        <div className="mb-4">
                            <label htmlFor="jugador" className="block text-sm font-medium text-white mx-2 mb-2">
                                Seleccionar jugador:
                            </label>
                            <select
                                value={playerTransfered?.id_player || ''}
                                onChange={handlePlayerSelect}
                                className="w-4/5 mx-2 p-2 border bg-gray-800 text-white border-gray-300 rounded-md mb-4"
                            >
                                <option value="">Seleccione un jugador</option>
                                {players
                                    .filter(jugador =>
                                        jugador.id_team &&
                                        jugador.id_team.id === parseInt(selectedEquipo) &&
                                        jugador.status !== 'bloqueado' &&
                                        jugador.status !== 'restringido')
                                    .map(jugador => (
                                        <option key={jugador.id} value={jugador.id}>
                                            {jugador.name}
                                        </option>
                                    ))}
                            </select>
                            <input
                                type="range"
                                min={inputValue}
                                max={inputValue * 2}
                                step="any"
                                onChange={handleInputChange}
                                value={playerTransfered.value}
                                className="w-4/5 mx-2"
                            />
                            <div className="mt-2 text-sm text-white mx-2">
                                <strong>Valor pagado para ejecutar la cláusula de rescisión:</strong> {playerTransfered.value}
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-4/5 mx-2 bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-blue-900 transition"
                        >
                            Confirmar ejecución de cláusula
                        </button>
                    </form>
                )}

                {selectedEquipo && (
                    <div className="mt-4 mb-4 text-sm text-white mx-2">
                        <div>Oferta a realizar por: <strong>{playerTransfered.name}</strong></div>
                        <div>Valor extra: <strong>{playerTransfered.extra_value}</strong></div>
                        <div>Oferta total: <strong>{playerTransfered.total_value}</strong></div>
                    </div>
                )}
            </div>
        </>
    );
}

