/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import axiosClient from "../axios"
import { useStateContext } from "../context/ContextProvider";

export default function Announcement() {

    const [team, setTeam] = useState([]);
    const [players, setPlayers] = useState([]);
    const [filteredTeam, setFilteredTeam] = useState();
    const { user, setNotification } = useStateContext();
    const [selectedEquipo, setSelectedEquipo] = useState()
    const [playerToBlock, setPlayerToBlock] = useState([])
    const [errors, setErrors] = useState(null);
    const [playerTransfered, setPlayerTransfered] = useState({
        id_player: '',
        name: '',
        id_team: '',
        created_by: user.id,
        value: 0,
        other_players: [],
        extra_value: 0,
        total_value: 0
    })
    const [inputValue, setInputValue] = useState()

    useEffect(() => {
        getTeam()
        getPlayers()
    }, [])

    useEffect(() => {
    }, [playerToBlock, playerTransfered]);

    const getTeam = () => {
        axiosClient.get('/teams')
            .then(({ data }) => {
                const teamFilter = data.data.filter((t) => t.division === 'Primera' || t.division === 'Segunda')
                const teamUser = data.data.filter(t => t.id_user === user.id)
                setFilteredTeam(teamUser)
                setTeam(teamFilter)
            })
            .catch(() => {
            })
    }

    const getPlayers = () => {
        axiosClient.get('/players')
            .then(({ data }) => {
                setPlayers(data.data)
            })
            .catch(() => {
            })
    }

    const handleIdEquipoChange = (event) => {
        const equipoId = event.target.value;
        setSelectedEquipo(equipoId);       
    };

    const handleInputChange = (event) => {
        const newValue = parseInt(event.target.value);
        setPlayerTransfered({
            ...playerTransfered,
            value: newValue,
            total_value: newValue
        });
    };

    const handlerPlayerAdd = (e) => {
        const newIdPlayer = parseInt(e.target.value);
        const playerData = players.find(p => p.id === newIdPlayer)
        setPlayerTransfered({
            ...playerTransfered,
            other_players: [...playerTransfered.other_players, playerData.name],
            extra_value: parseInt(playerTransfered.extra_value) + parseInt(playerData.value),
            total_value: parseInt(playerTransfered.value) + parseInt(playerTransfered.extra_value) + parseInt(playerData.value),
        })

        const datosJugadorEquipo = {
            id: playerData.id,
            id_team: parseInt(playerData.id_team),
            name: playerData.name,
            age: playerData.age,
            ca: playerData.ca,
            pa: playerData.pa,
            value: playerData.value,
            status: 'restringido'
        };
        setPlayerToBlock([...playerToBlock, datosJugadorEquipo]);
    }

    const onSubmit = (e) => {
        e.preventDefault();

        axiosClient.post('/transfer', { data: playerToBlock })
            .then((response) => {
            })
            .catch(error => {
                const response = error.response;
                if (response && response.status === 422) {
                    setErrors(response.data.errors)
                }
            });
        axiosClient.post('/clausula_rescision', {
            ...playerTransfered,
            other_players: JSON.stringify(playerTransfered.other_players)
        })
            .then((response) => {
                setNotification('Ejecución de claúsula enviada')
                setPlayerTransfered({
                    id_player: '',
                    name: '',
                    id_team: '',
                    created_by: user.id,
                    value: 0,
                    other_players: [],
                    extra_value: 0,
                    total_value: 0
                })
            })
            .catch(error => {
                const response = error.response;
                if (response && response.status === 422) {
                    setErrors(response.data.errors)
                }
            });
    }

    return (
        <>
            <div style={{ display: 'flex', justifyContent: "space-between", alignItems: "center" }}>
                <div>Ejecución de clausula de rescición</div>
            </div>
            <br />
            <select id="equipo"
                value={team.id}
                onChange={handleIdEquipoChange}
                onClick={e => setPlayerTransfered({ ...playerTransfered, id_team: parseInt(e.target.value) })}>
                <option value=""></option>
                {
                    team.map((t, index) => {
                        return (
                            <option value={t.id} key={index}>{t.name}</option>
                        )
                    })
                }
            </select>
            <input hidden value={selectedEquipo} placeholder="Equipo" type="text" />

            {selectedEquipo &&
                (
                    <form action="" onSubmit={onSubmit}>
                        <div>
                            <br />
                            <label htmlFor="jugador">Seleccionar jugador:</label>
                            <select
                                onChange={e => {
                                    const selectedPlayerId = parseInt(e.target.value);
                                    const selectedPlayer = players.find(
                                        jugador => jugador.id === selectedPlayerId
                                    );
                                    setPlayerTransfered({
                                        ...playerTransfered,
                                        id_player: parseInt(selectedPlayer.id),
                                        name: selectedPlayer.name,
                                        value: selectedPlayer.value
                                    });
                                    setInputValue(selectedPlayer.value)
                                }}>
                                <option value="">Seleccione un jugador</option>
                                {players
                                    .filter(jugador =>
                                        jugador.id_team.toString() === selectedEquipo &&
                                        jugador.status !== 'bloqueado' &&
                                        jugador.status !== 'restringido')
                                    .map(jugador => (
                                        <option key={jugador.id}
                                            value={jugador.id}
                                        >{jugador.name}</option>
                                    ))}
                            </select>
                            <input
                                type="range"
                                min={inputValue}
                                max={inputValue * 1.75}
                                step="any"
                                onChange={handleInputChange}
                                value={playerTransfered.value}
                            />
                            <br />
                            {playerTransfered.value}
                            <br />
                            <span><strong>Determinar primero el valor a pagar en dinero y luego los jugadores a agregar
                                En caso de no hacerlo asì puede ocurrir un error que los OBLIGUE a  pagar más como multa por los obedecer esta indicación</strong></span>
                            <select
                                onChange={handlerPlayerAdd}>
                                <option value=""> Selecciona un jugador a ofrecer</option>
                                {players
                                    .filter(jugador => jugador.id_team === filteredTeam[0].id)
                                    .map(p => (
                                        <option value={p.id}
                                            key={p.id}>{p.name}</option>
                                    ))}
                            </select>
                        </div>

                        <br />
                        <button type="submit" className="btn-add">Confirmar ejecución de claúsula</button>
                        <br />
                    </form>
                )}

            <br />
            <span>Oferta a realizar por {playerTransfered.name}</span>
            <br />
            <span>Valor extra: {playerTransfered.extra_value}</span>
            <br />
            <span>Jugadores extra: {playerTransfered.other_players + ' '} </span>
            <br />
            <span>Oferta a realizar por un total de: {playerTransfered.total_value}</span>

        </>
    )

}