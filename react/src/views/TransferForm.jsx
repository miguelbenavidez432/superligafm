/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import axiosClient from "../axios";
import { useStateContext } from "../context/ContextProvider";
import { useNavigate } from "react-router-dom";

export default function TransferForm() {

    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [selectedEquipo, setSelectedEquipo] = useState('');
    const [selectedJugador, setSelectedJugador] = useState('');
    const [datosActualizados, setDatosActualizados] = useState([]);
    const [secondTeam, setSecondTeam] = useState('');
    const [playersToSend, setPlayersToSend] = useState([]);
    const [transferValue, setTransferValue] = useState(0);
    const [selectedBuyBy, setSelectedBuyBy] = useState('');
    const [selectedSoldBy, setSelectedSoldBy] = useState('');
    const [transfer, setTransfer] = useState({
        transferred_players: '',
        id_team_from: '',
        id_team_to: '',
        budget: 0,
        status: '',
        created_by: '',
        buy_by: '',
        sold_by: '',
    });
    const { user, setNotification } = useStateContext();
    const navigate = useNavigate();
    const [errors, setErrors] = useState(null);

    useEffect(() => {
        getTeam();
        getPlayers();
    }, []);

    useEffect(() => {
        setTransfer((prevTransfer) => ({
            ...prevTransfer,
            transferred_players: playersToSend.toString(),
            budget: transferValue,
            buy_by: selectedBuyBy,
            sold_by: selectedSoldBy,
        }));
    }, [playersToSend, transferValue, selectedBuyBy, selectedSoldBy]);

    const getTeam = () => {
        axiosClient.get('/teams')
            .then(({ data }) => {
                const teamFilter = data.data.filter((t) => t.division === 'Primera' || t.division === 'Segunda');
                setTeams(teamFilter);
            })
            .catch(() => {
            });
    };

    const getPlayers = () => {
        axiosClient.get('/players')
            .then(({ data }) => {
                setPlayers(data.data);
            })
            .catch(() => {
            });
    };

    const handleIdEquipoChange = (event) => {
        const equipoId = event.target.value;
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
            status: 'bloqueado',
        };

        setPlayersToSend([...playersToSend, jugadorSeleccionado.name]);

        setTransfer((prevTransfer) => ({
            ...prevTransfer,
            transferred_players: playersToSend.toString(),
            id_team_from: jugadorSeleccionado.id_team,
            id_team_to: parseInt(secondTeam),
            created_by: user.id,
            buy_by: selectedBuyBy,
            sold_by: selectedSoldBy,
        }));
        setDatosActualizados([...datosActualizados, datosJugadorEquipo]);
    };

    const sendInfo = (e) => {
        e.preventDefault();

        // Primero, enviar la actualización de los jugadores.
        axiosClient.post('/transfer', { data: datosActualizados })
            .then(() => {
                // Enviar la transferencia con los datos completos.
                axiosClient.post('/traspasos', transfer)
                    .then(() => {
                        setNotification('Transferencia realizada correctamente');
                        navigate('/transfer');
                        setDatosActualizados([]);
                        setPlayersToSend([]);
                    })
                    .catch(error => {
                        const response = error.response;
                        if (response && response.status === 422) {
                            setErrors(response.data.errors);
                        }
                    });
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
        setTransferValue(0);
        setSelectedBuyBy('');
        setSelectedSoldBy('');
    };

    return (
        <>
            <div>
                <label htmlFor="equipo">Seleccionar equipo:</label>
                <select id="equipo" value={selectedEquipo} onChange={handleEquipoChange}>
                    <option value="">Seleccione un equipo</option>
                    {
                        teams.map(equipo => (
                            <option key={equipo.id} value={equipo.id}>{equipo.name}</option>
                        ))}
                </select>

                {selectedEquipo && (
                    <div>
                        <label htmlFor="secondTeam">Seleccionar equipo a traspasar:</label>
                        <select id="secondTeam" value={secondTeam} onChange={handleIdEquipoChange}>
                            <option value="">Seleccione un equipo</option>
                            {
                                teams.map(equipo => (
                                    <option key={equipo.id} value={equipo.id}>{equipo.name}</option>
                                ))}
                        </select>
                        <br />
                        <label htmlFor="jugador">Seleccionar jugador:</label>
                        <select id="jugador" value={selectedJugador} onChange={handleJugadorChange}>
                            <option value="">Seleccione un jugador</option>
                            {players
                                .filter(jugador => jugador.id_team.toString() === selectedEquipo)
                                .map(jugador => (
                                    <option key={jugador.id} value={jugador.id}>{jugador.name}</option>
                                ))}
                        </select>
                    </div>
                )}
                {selectedEquipo && secondTeam && (
                    <div>
                        <label htmlFor="valor">Valor de transferencia:</label>
                        <input
                            id="valor"
                            type="number"
                            value={transferValue}
                            onChange={(e) => setTransferValue(parseInt(e.target.value))}
                            placeholder="Inserte el valor a pagar"
                        />
                        <br />
                        <label htmlFor="buyBy">Seleccionar manager que paga:</label>
                        <select id="buyBy" value={selectedBuyBy} onChange={(e) => setSelectedBuyBy(e.target.value)}>
                            <option value="">Seleccione un manager</option>
                            <option value={teams.find(team => team.id === parseInt(selectedEquipo))?.id_user}>
                                {teams.find(team => team.id === parseInt(selectedEquipo))?.name} Manager
                            </option>
                            <option value={teams.find(team => team.id === parseInt(secondTeam))?.id_user}>
                                {teams.find(team => team.id === parseInt(secondTeam))?.name} Manager
                            </option>
                        </select>
                        <br />
                        <label htmlFor="soldBy">Seleccionar manager que recibe:</label>
                        <select id="soldBy" value={selectedSoldBy} onChange={(e) => setSelectedSoldBy(e.target.value)}>
                            <option value="">Seleccione un manager</option>
                            <option value={teams.find(team => team.id === parseInt(selectedEquipo))?.id_user}>
                                {teams.find(team => team.id === parseInt(selectedEquipo))?.name} Manager
                            </option>
                            <option value={teams.find(team => team.id === parseInt(secondTeam))?.id_user}>
                                {teams.find(team => team.id === parseInt(secondTeam))?.name} Manager
                            </option>
                        </select>
                    </div>
                )}
                <br />
                <h3>Datos actualizados:</h3>
                <ul>
                    {datosActualizados.map(dato => (
                        <li key={dato.id}>
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
        </>
    );
}
