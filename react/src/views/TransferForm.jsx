/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react"
import axiosClient from "../axios"
import { useStateContext } from "../context/ContextProvider";
import { useNavigate } from "react-router-dom";

export default function TransferForm() {

    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([])
    const [selectedEquipo, setSelectedEquipo] = useState('');
    const [selectedJugador, setSelectedJugador] = useState('');
    const [datosActualizados, setDatosActualizados] = useState([]);
    const [secondTeam, setSecondTeam] = useState();
    const [playersToSend, setPlayersToSend] = useState([]);
    const [transfer, setTransfer] = useState({
        transferred_players: '',
        id_team_from: '',
        id_team_to: '',
        budget: 0,
        status: '',
        created_by: '',
        buy_by: '',
        sold_by: '',
    })
    const { user, setNotification } = useStateContext();
    const navigate = useNavigate();
    const [errors, setErrors] = useState(null);

    useEffect(() => {
        getTeam();
        getPlayers();
    }, [])

    useEffect(() => {
        setTransfer((prevTransfer) => ({
            ...prevTransfer,
            transferred_players: playersToSend.toString(),
        }));
    }, [playersToSend]);

    const getTeam = () => {
        axiosClient.get('/teams')
            .then(({ data }) => {
                const teamFilter = data.data.filter((t) => t.division === 'Primera' || t.division === 'Segunda')
                setTeams(teamFilter)
            })
            .catch(() => {
            })
    }

    const getPlayers = () => {
        axiosClient.get('/players?all=true')
            .then(({ data }) => {
                setPlayers(data.data)
            })
            .catch(() => {
            })
    }

    const handleIdEquipoChange = (event) => {
        const equipoId = event.target.value;
        console.log(equipoId)
        setSecondTeam(equipoId);
        setSelectedJugador('');
    };

    const handleEquipoChange = (event) => {
        const equipoId = event.target.value;
        setSelectedEquipo(equipoId);
        setSelectedJugador('');
    };

    const handleJugadorChange = (event) => {
        const jugadorId = event.target.value;

        setSelectedJugador(jugadorId);

        const jugadorSeleccionado = players.find(jugador => jugador.id === parseInt(jugadorId));

        const datosJugadorEquipo = {
            id: jugadorSeleccionado.id,
            id_team: secondTeam,
            name: jugadorSeleccionado.name,
            age: jugadorSeleccionado.age,
            ca: jugadorSeleccionado.ca,
            pa: jugadorSeleccionado.pa,
            value: jugadorSeleccionado.value,
            status: 'bloqueado'
        };

        setPlayersToSend([...playersToSend, jugadorSeleccionado.name])

        setTransfer(prevTransfer => ({
            ...prevTransfer,
            transferred_players: playersToSend.toString(),
            id_team_from: jugadorSeleccionado.id_team.id,
            id_team_to: parseInt(secondTeam),
            created_by: user.id,
            status: 'bloqueado'
        }));
        setDatosActualizados([...datosActualizados, datosJugadorEquipo]);

    };

    const handleManagerChangeBuy = (event) => {
        const userId = event.target.value;

        setTransfer(prevTransfer => ({
            ...prevTransfer,
            buy_by: parseInt(userId),
        }));

    };

    const handleManagerChangeSold = (event) => {
        const userId = event.target.value;

        setTransfer(prevTransfer => ({
            ...prevTransfer,
            sold_by: parseInt(userId),
        }));

    };

    const sendInfo = (e) => {
        e.preventDefault();

        const transferData = {
            ...transfer,
            transferred_players: playersToSend.toString(),
        };

        axiosClient.post('/transfer', transferData)
            .then((response) => {
                setNotification('Transferencia realizada correctamente');
                navigate('/dashboard');
                setDatosActualizados([]);
                setPlayersToSend([]);
            })
            .catch(error => {
                const response = error.response;
                if (response && response.status === 422) {
                    setErrors(response.data.errors);
                }
            });
    };

    const resetInfo = () => {
        setDatosActualizados([]);
        setPlayersToSend([]);
    };

    return (
        <div>
            <label htmlFor="equipo">Seleccionar equipo:</label>
            <select id="equipo" value={selectedEquipo} onChange={handleEquipoChange}>
                <option key="0" value="">Seleccione un equipo</option>
                {teams.map((equipo, index) => (
                    <option key={index} value={equipo.id}>{equipo.name}</option>
                ))}
            </select>

            {selectedEquipo && (
                <div>
                    <label htmlFor="equipo">Seleccionar equipo a traspasar:</label>
                    <select id="equipo" value={teams.name} onChange={handleIdEquipoChange}>
                        <option key="0" value="">Seleccione un equipo</option>
                        {teams.map((equipo, index) => (
                            <option key={index} value={equipo.id}>{equipo.name}</option>
                        ))}
                    </select>
                    <br />
                    <label htmlFor="jugador">Seleccionar jugador:</label>
                    <select id="jugador" value={selectedJugador} onChange={handleJugadorChange}>
                        <option value="">Seleccione un jugador</option>
                        {players
                            .filter(jugador => jugador.id_team.id === parseInt(selectedEquipo))
                            .map((jugador, index) => (
                                <option key={index} value={jugador.id}>{jugador.name}</option>
                            ))}
                    </select>
                    <br />
                    <label htmlFor="transferValue">Valor de la transferencia:</label>
                    <input
                        type="number"
                        value={transfer.budget}
                        onChange={(e) => setTransfer({ ...transfer, budget: parseInt(e.target.value) })}
                    />
                    <br />
                    <label htmlFor="buy_by">Seleccionar comprador:</label>
                    <select value={transfer.buy_by} onChange={handleManagerChangeBuy}>
                        <option value="">Seleccione comprador</option>
                        {teams.map((equipo, index) => equipo.user ? (
                            <option key={index} value={parseInt(equipo.user.id)}>{equipo.user ? equipo.user.name : ''}</option>
                        ) : '')}
                    </select>
                    <br />
                    <label htmlFor="sold_by">Seleccionar vendedor:</label>
                    <select value={transfer.sold_by} onChange={handleManagerChangeSold}>
                        <option value="">Seleccione vendedor</option>
                        {teams.map((equipo, index) => equipo.user ? (
                            <option key={index} value={parseInt(equipo.user.id)}>{equipo.user ? equipo.user.name : ''}</option>
                        ) : '')}
                    </select>
                </div>
            )}
            <h3>Datos actualizados:</h3>
            <ul>
                {datosActualizados.map((dato, index) => (
                    <li key={`${dato.id}-${index}`}>
                        ID: {dato.id}, ID Equipo: {dato.id_team}, Nombre: {dato.name}
                    </li>
                ))}
            </ul>
            <br />
            <button onClick={resetInfo} className="btn-add">Cancelar transferencia</button>
            <br />
            <br />
            <button onClick={sendInfo} className="btn-add">Enviar Transferencia</button>
        </div>

    )
}
