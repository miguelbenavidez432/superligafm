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
        id_season: 60,
    })
    const { user, setNotification } = useStateContext();
    const navigate = useNavigate();

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
        axiosClient.get('/teams/public')
            .then(({ data }) => {
                const teamFilter = data.data.filter((t) => t.division === 'Primera' || t.division === 'Segunda')
                setTeams(teamFilter)
            })
            .catch(() => {
            })
    }

    const getPlayers = () => {
        axiosClient.get('/players/public?all=true')
            .then(({ data }) => {
                setPlayers(data.data)
            })
            .catch(() => {
            })
    }

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

        axiosClient.post('/transfer', { data: transferData })
            .then(() => {
                setNotification('Transferencia realizada correctamente');
                navigate('/dashboard');
                setDatosActualizados([]);
                setPlayersToSend([]);
            })
            .catch(error => {
                const response = error.response;
                if (response && response.status === 422) {
                    setNotification('Error en la Trasnferencia: ' + error.response.data.message);
                }
            });
    };

    const resetInfo = () => {
        setDatosActualizados([]);
        setPlayersToSend([]);
    };

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <div className="mb-4">
                <label htmlFor="equipo" className="block text-sm font-medium text-black">Seleccionar equipo:</label>
                <select
                    id="equipo"
                    value={selectedEquipo}
                    onChange={handleEquipoChange}
                    className="mt-1 block w-full rounded-md bg-slate-900 text-white border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                    <option key="0" value="">Seleccione un equipo</option>
                    {teams.map((equipo, index) => (
                        <option key={index} value={equipo.id}>{equipo.name}</option>
                    ))}
                </select>
            </div>

            {selectedEquipo && (
                <div className="space-y-4">
                    <div>
                        <label htmlFor="equipo" className="block text-sm font-medium text-black">Seleccionar equipo a traspasar:</label>
                        <select
                            id="equipo"
                            value={teams.name}
                            onChange={handleIdEquipoChange}
                            className="mt-1 block w-full rounded-md bg-slate-900 text-white border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option key="0" value="">Seleccione un equipo</option>
                            {teams.map((equipo, index) => (
                                <option key={index} value={equipo.id}>{equipo.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="jugador" className="block text-sm font-medium text-black">Seleccionar jugador:</label>
                        <select
                            id="jugador"
                            value={selectedJugador}
                            onChange={handleJugadorChange}
                            className="mt-1 block w-full rounded-md bg-slate-900 text-white border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="">Seleccione un jugador</option>
                            {players
                                .filter(jugador => jugador.id_team.id === parseInt(selectedEquipo))
                                .map((jugador, index) => (
                                    <option key={index} value={jugador.id}>{jugador.name}</option>
                                ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="transferValue" className="block text-sm font-medium text-black">Valor de la transferencia:</label>
                        <input
                            type="number"
                            value={transfer.budget}
                            onChange={(e) => setTransfer({ ...transfer, budget: parseInt(e.target.value) })}
                            className="mt-1 block w-full rounded-md bg-slate-900 text-white border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="buy_by" className="block text-sm font-medium text-black">Seleccionar comprador:</label>
                        <select
                            value={transfer.buy_by}
                            onChange={handleManagerChangeBuy}
                            className="mt-1 block w-full rounded-md bg-slate-900 text-white border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="">Seleccione comprador</option>
                            {teams.map((equipo, index) => equipo.user ? (
                                <option key={index} value={parseInt(equipo.user.id)}>{equipo.user ? equipo.user.name : ''}</option>
                            ) : '')}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="sold_by" className="block text-sm font-medium text-black">Seleccionar vendedor:</label>
                        <select
                            value={transfer.sold_by}
                            onChange={handleManagerChangeSold}
                            className="mt-1 block w-full rounded-md bg-slate-900 text-white border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="">Seleccione vendedor</option>
                            {teams.map((equipo, index) => equipo.user ? (
                                <option key={index} value={parseInt(equipo.user.id)}>{equipo.user ? equipo.user.name : ''}</option>
                            ) : '')}
                        </select>
                    </div>
                </div>
            )}
            <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900">Datos actualizados:</h3>
                <ul className="mt-2 space-y-2">
                    {datosActualizados.map((dato, index) => (
                        <li key={`${dato.id}-${index}`} className="p-2 bg-gray-100 rounded-md shadow">
                            ID: {dato.id}, ID Equipo: {dato.id_team}, Nombre: {dato.name}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="mt-6 flex space-x-4">
                <button
                    onClick={resetInfo}
                    className="px-4 py-2 bg-red-500 text-white rounded-md shadow hover:bg-red-600"
                >
                    Cancelar transferencia
                </button>
                <button
                    onClick={sendInfo}
                    className="px-4 py-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600"
                >
                    Enviar Transferencia
                </button>
            </div>
        </div>
    )
}
