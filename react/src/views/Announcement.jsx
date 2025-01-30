/* eslint-disable no-empty */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import axiosClient from "../axios"
import { useStateContext } from "../context/ContextProvider";

export default function Announcement() {

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
        id_season: 54,
    });
    const [inputValue, setInputValue] = useState(0);

    useEffect(() => {
        getTeam();
    }, []);

    useEffect(() => {
        if (selectedEquipo) {
            filterPlayersByTeam();
            filterPlayersByUser();
        }
    }, [selectedEquipo]);

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

        // axiosClient.post('/transfer', { data: playerToBlock })
        //     .then(() => {
        //         setNotification('Ejecución de cláusula enviada');
        //     })
        //     .catch(error => {
        //         setErrors(error.response?.data.errors || "Error al enviar la transferencia.");
        //     });

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
                    id_season: 54
                });
                setNotification('Ejecución de cláusula enviada');
            })
            .catch(error => {
                setErrors(error.response?.data.errors || "Error al enviar la cláusula de rescisión.");
            });
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: "space-between", alignItems: "center" }} >
                <div><strong>Ejecución de cláusula de rescisión</strong></div>
            </div>
            <br />
            <div className="card animated fadeInDown">
                <select id="equipo"
                    value={selectedEquipo}
                    onChange={handleIdEquipoChange}>
                    <option value="">Selecciona un equipo</option>
                    {
                        team.map((t, index) => (
                            <option value={t.id} key={index}>{t.name}</option>
                        ))
                    }
                </select>

                {selectedEquipo && (
                    <form onSubmit={onSubmit}>
                        <div>
                            <br />
                            <label htmlFor="jugador">Seleccionar jugador:</label>
                            <select onChange={handlePlayerSelect}>
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
                            />
                            <strong>Valor pagado para ejecutar la cláusula de rescisión:</strong> {playerTransfered.value}
                            <br />
                            {/* <select onChange={handlerPlayerAdd}>
                                <option value="">Selecciona un jugador a ofrecer</option>
                                {teamPlayers.map(p => (
                                    <option value={p.id} key={p.id}>{p.name}</option>
                                ))}
                            </select> */}
                        </div>
                        <br />
                        <button type="submit" className="btn-add">Confirmar ejecución de cláusula</button>
                        <br />
                    </form>
                )}

                <br />
                <span>Oferta a realizar por {playerTransfered.name}</span>
                <br />
                <span>Valor extra: {playerTransfered.extra_value}</span>
                <br />
                <span>Oferta a realizar por un total de: {playerTransfered.total_value}</span>
            </div>
        </>
    );
}

