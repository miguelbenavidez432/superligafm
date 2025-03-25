/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import axiosClient from "../axios";
import { useStateContext } from "../context/ContextProvider";
import { useNavigate } from "react-router-dom";
//import Tempo from "../path/to/formkit_tempo";

const Auctions = () => {
    const { user, setNotification } = useStateContext();
    const navigate = useNavigate();
    const [errors, setErrors] = useState(null);
    const [players, setPlayers] = useState([]);
    const [leagueTeams, setLeagueTeams] = useState([]);
    const [otherTeams, setOtherTeams] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [auctionData, setAuctionData] = useState({
        id_player: '',
        value: 0,
        created_by: user.id,
        active: 'yes',
    });
    const [auctionEndTime, setAuctionEndTime] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState({});
    const [teamPlayers, setTeamPlayers] = useState([]);

    useEffect(() => {
        getTeam()
        getPlayers()

        const storedEndTime = localStorage.getItem('auctionEndTime');
        if (storedEndTime) {
            const currentTime = new Date().getTime();
            if (currentTime < storedEndTime) {
                setAuctionEndTime(storedEndTime);
            } else {
                localStorage.removeItem('auctionEndTime');
            }
        }
    }, [selectedTeam]);

    const getTeam = () => {
        axiosClient.get('/teams?all=true')
            .then(({ data }) => {
                const leagueTeamsFilter = data.data.filter((t) => t.division === 'Primera' || t.division === 'Segunda')
                const otherTeamsFilter = data.data.filter((t) => t.division === '')
                setLeagueTeams(leagueTeamsFilter)
                setOtherTeams(otherTeamsFilter)
            })
            .catch(() => {
            })
    };

    const getPlayers = () => {
        axiosClient.get('/players?all=true')
            .then(({ data }) => {
                setPlayers(data.data)
                const filteredPlayers = data.data.filter(p => p.id_team && p.id_team.id == selectedTeam)
                setTeamPlayers(filteredPlayers)
            })
            .catch(() => {
            })
    };

    const handlePlayerChange = (e) => {
        const playerId = parseInt(e.target.value);
        const player = players.find(p => p.id === playerId);
        setSelectedPlayer(player);
        setAuctionData({
            ...auctionData,
            id_player: player.id,
            amount: player.value,
            id_team: player.id_team ? player.id_team.id : '',
            auctioned_by: user.id,
            created_by: user.id,
            active: 'yes',
            id_season: 55
        });
    };

    const handleAuctionSubmit = (e) => {
        e.preventDefault();
        axiosClient.post('/auctions', auctionData)
            .then((response) => {
                setNotification('Subasta creada exitosamente');

                const auctionCreatedTime = new Date(response.data.created_at).getTime();
                const endTime = auctionCreatedTime + (12 * 60 * 60 * 1000);
                setAuctionEndTime(endTime);

                localStorage.setItem('auctionEndTime', endTime);

                setAuctionData({
                    player_id: '',
                    amount: 0,
                    created_by: user.id,
                    status: 'active',
                });
            })
            .catch((error) => {
                const mensaje = error.response.data.error;
                const mensaje2 = error.response.data.message;
                setNotification("Error al crear la subasta: " + mensaje + " " );
                const response = error.response;
                if (response && response.status === 422) {
                    setErrors(response.data.errors);
                    setNotification("Error al crear la subasta: " + mensaje2);
                }
            });
    };

    // Función para iniciar el countdown usando FormKit Tempo
    // const startCountdown = (endTime) => {
    //     const countdown = new Tempo({
    //         target: new Date(parseInt(endTime)), // Hora de finalización de la subasta
    //         interval: 1000,  // Actualiza cada segundo
    //         onUpdate: (time) => {
    //             const countdownElement = document.getElementById('countdown');
    //             if (countdownElement) {
    //                 countdownElement.innerHTML = `${time.hours}h ${time.minutes}m ${time.seconds}s`;
    //             }
    //         },
    //         onFinish: () => {
    //             const countdownElement = document.getElementById('countdown');
    //             if (countdownElement) {
    //                 countdownElement.innerHTML = "Subasta finalizada";
    //             }
    //             // Remover el tiempo de finalización de localStorage cuando termina la subasta
    //             localStorage.removeItem('auctionEndTime');
    //         }
    //     });
    //     countdown.start();
    // };

    return (
        <div className="card animated fadeInDown p-6 bg-white shadow-md rounded-md">
            <form onSubmit={handleAuctionSubmit} className="space-y-4">
                <div>
                    <label htmlFor="equipo" className="block text-sm font-medium text-gray-700">Seleccionar equipo:</label>
                    <select
                        id="equipo"
                        onChange={e => setSelectedTeam(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                        <option value="">Seleccione un equipo del jugador</option>
                        {
                            otherTeams.map(equipo => (
                                <option key={equipo.id} value={equipo.id}>{equipo.name}</option>
                            ))
                        }
                    </select>
                </div>

                <div>
                    <label htmlFor="jugador" className="block text-sm font-medium text-gray-700">Seleccionar jugador:</label>
                    <select
                        id="jugador"
                        onChange={handlePlayerChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                        <option value="">Seleccione el jugador subastado</option>
                        {
                            teamPlayers.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))
                        }
                    </select>
                </div>

                {selectedPlayer && (
                    <div className="bg-gray-50 p-4 rounded-md shadow-inner">
                        <p className="text-sm text-gray-700">Valor inicial de subasta: <span className="font-semibold">{selectedPlayer.value}</span></p>
                        <input
                            type="number"
                            min={selectedPlayer.value / 2}
                            value={auctionData.amount}
                            onChange={(e) => setAuctionData({ ...auctionData, amount: parseInt(e.target.value) })}
                            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                )}

                <button
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    type="submit"
                >
                    Crear Subasta
                </button>
            </form>

            {auctionEndTime && (
                <div className="countdown mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
                    <h4 className="text-sm font-medium text-yellow-700">Tiempo restante: <span id="countdown" className="font-bold"></span></h4>
                </div>
            )}
        </div>
    );
}

export default Auctions;
