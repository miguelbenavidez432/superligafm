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
    const [players, setPlayers] = useState([]);
    const [leagueTeams, setLeagueTeams] = useState([]);
    const [otherTeams, setOtherTeams] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [auctionData, setAuctionData] = useState({
        id_player: '',
        value: 0,
        created_by: user.id,
        status: 'active',
    });
    const [auctionEndTime, setAuctionEndTime] = useState(null);  // Para el countdown
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

    useEffect(() => {
        if (otherTeams) {
            getPlayers();
        }
    }, [otherTeams]);

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
                const filteredPlayers = data.data.filter(p => p.id_team === selectedTeam)
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
            value: player.value,
            name: player.name,
            status: 'bloqueado',
            ca: player.ca,
            pa: player.pa,
            age: player.age,
        });
    };

    const handleAuctionSubmit = (e) => {
        e.preventDefault();

        axiosClient.post('/auctions', auctionData)
            .then((response) => {
                setNotification('Subasta creada exitosamente');

                // Establece el tiempo de finalización de la subasta
                const auctionCreatedTime = new Date(response.data.created_at).getTime();
                const endTime = auctionCreatedTime + (12 * 60 * 60 * 1000); // Añadir 12 horas en milisegundos
                setAuctionEndTime(endTime);

                // Almacenar el tiempo de finalización en localStorage
                localStorage.setItem('auctionEndTime', endTime);

                // Inicia el countdown usando FormKit Tempo
                //startCountdown(endTime);

                // Reinicia el formulario
                setAuctionData({
                    player_id: '',
                    value: 0,
                    created_by: user.id,
                    status: 'active',
                });
            })
            .catch((error) => {
                console.error(error);
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
        <div className="card animated fadeInDown">
            <form onSubmit={handleAuctionSubmit}>
                <label htmlFor="player">Seleccionar jugador:</label>


                <label htmlFor="equipo">Seleccionar equipo:</label>
                <select id="equipo" onChange={e => setSelectedTeam(e.target.value)}>
                    <option value="">Seleccione un equipo del jugador</option>
                    {
                        otherTeams.map(equipo => (
                            <option key={equipo.id} value={equipo.id}>{equipo.name}</option>
                        ))}
                </select>

                <select id="equipo" onChange={handlePlayerChange}>
                    <option value="">Seleccione el jugador subastado</option>
                    {
                        teamPlayers.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                </select>

                {selectedPlayer && (
                    <div>
                        <p>Valor inicial de subasta: {selectedPlayer.value}</p>
                        <input
                            type="number"
                            min={selectedPlayer.value}
                            value={auctionData.value}
                            onChange={(e) => setAuctionData({ ...auctionData, value: parseInt(e.target.value) })}
                        />
                    </div>
                )}

                <button type="submit">Crear Subasta</button>
            </form>

            {auctionEndTime && (
                <div className="countdown">
                    <h4>Tiempo restante: <span id="countdown"></span></h4>
                </div>
            )}
        </div>
    );
}

export default Auctions;
