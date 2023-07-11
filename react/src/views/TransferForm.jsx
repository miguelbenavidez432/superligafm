/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react"
import axiosClient from "../axios"
import { useStateContext } from "../context/ContextProvider";

export default function TransferForm() {

    const [loading, setLoading] = useState(false);
    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([])
    const [selectedEquipo, setSelectedEquipo] = useState('');
    const [selectedJugador, setSelectedJugador] = useState('');
    const [datosActualizados, setDatosActualizados] = useState([]);
    const [secondTeam, setSecondTeam] = useState();
    const [playersToSend, setPlayersToSend] = useState([]);

    useEffect(() => {
        getTeam();
        getPlayers();
    }, [])

    const getTeam = () => {
        setLoading(true)
        axiosClient.get('/teams')
            .then(({ data }) => {
                setLoading(false)
                const teamFilter = data.data.filter((t) => t.division === 'Primera' || t.division === 'Segunda')
                console.log(teamFilter)
                setTeams(teamFilter)
            })
            .catch(() => {
                setLoading(false)
            })
    }

    const getPlayers = () => {
        setLoading(true)
        axiosClient.get('/players')
            .then(({ data }) => {
                setLoading(false)
                setPlayers(data.data)
            })
            .catch(() => {
                setLoading(false)
            })
    }

    const handleIdEquipoChange = (event) => {
        const equipoId = event.target.value;
        setSecondTeam(equipoId);

        const jugadoresEquipo = players.filter(jugador => jugador.id_team == equipoId);
        setSelectedJugador('');

        console.log(jugadoresEquipo);
    };

    const handleEquipoChange = (event) => {
        const equipoId = event.target.value;
        setSelectedEquipo(equipoId);

        const jugadoresEquipo = players.filter(jugador => jugador.id_team == equipoId);
        setSelectedJugador('');

        console.log(jugadoresEquipo);
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
        };

        setDatosActualizados([...datosActualizados, datosJugadorEquipo]);

        console.log(datosActualizados);
    };

    const sendInfo = (e) => {
        e.preventDefault();

        axiosClient.post('/transfer', { data: datosActualizados })
            .then((response) => {
                console.log(response.data);
            })
            .catch(error => {
                console.error(error)
            });
    };

    const resetInfo = () => {
        setDatosActualizados([]);
    }

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

                {selectedEquipo &&
                    (
                        <div>
                            <label htmlFor="equipo">Seleccionar equipo a traspasar:</label>
                            <select id="equipo" value={teams.name} onChange={handleIdEquipoChange}>
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

                <h3>Datos actualizados:</h3>
                <ul>
                    {datosActualizados.map(dato => (
                        <li key={dato.id}>
                            ID: {dato.id}, ID Equipo: {dato.id_team}, Nombre: {dato.name}
                        </li>
                    ))}
                </ul>
                <br />
                <button onClick={resetInfo} className="btn-add"> Agregar Info</button>
                <br />
                <br />
                <button onClick={sendInfo} className="btn-add">Enviar Transferencia</button>
            </div>
        </>
    )
}
