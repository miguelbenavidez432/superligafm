/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import axiosClient from "../axios";
import { useStateContext } from "../context/ContextProvider";
import Tempo from "@formkit/tempo";

const Auctions = () => {
    const { user, setNotification } = useStateContext();
    const [players, setPlayers] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [auctionData, setAuctionData] = useState({
        player_id: '',
        value: 0,
        created_by: user.id,
        status: 'active',
    });
    const [loading, setLoading] = useState(false);
    const [auctionEndTime, setAuctionEndTime] = useState(null);  // Para el countdown

    useEffect(() => {
        getPlayers();

        // Recuperar el tiempo de finalización almacenado en localStorage
        const storedEndTime = localStorage.getItem('auctionEndTime');
        if (storedEndTime) {
            const currentTime = new Date().getTime();
            if (currentTime < storedEndTime) {
                setAuctionEndTime(storedEndTime);
                startCountdown(storedEndTime);
            } else {
                // Si el tiempo de subasta ha expirado
                localStorage.removeItem('auctionEndTime');
            }
        }
    }, []);

    const getPlayers = async () => {
        try {
            const response = await axiosClient.get('/players');
            setPlayers(response.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handlePlayerChange = (e) => {
        const playerId = parseInt(e.target.value);
        const player = players.find(p => p.id === playerId);
        setSelectedPlayer(player);
        setAuctionData({
            ...auctionData,
            player_id: player.id,
            value: player.value
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
                startCountdown(endTime);

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
    const startCountdown = (endTime) => {
        const countdown = new Tempo({
            target: new Date(parseInt(endTime)), // Hora de finalización de la subasta
            interval: 1000,  // Actualiza cada segundo
            onUpdate: (time) => {
                const countdownElement = document.getElementById('countdown');
                if (countdownElement) {
                    countdownElement.innerHTML = `${time.hours}h ${time.minutes}m ${time.seconds}s`;
                }
            },
            onFinish: () => {
                const countdownElement = document.getElementById('countdown');
                if (countdownElement) {
                    countdownElement.innerHTML = "Subasta finalizada";
                }
                // Remover el tiempo de finalización de localStorage cuando termina la subasta
                localStorage.removeItem('auctionEndTime');
            }
        });
        countdown.start();
    };

    return (
        <div className="auction-form">
            <h3>Crear una nueva subasta</h3>
            <form onSubmit={handleAuctionSubmit}>
                <label htmlFor="player">Seleccionar jugador:</label>
                <select onChange={handlePlayerChange}>
                    <option value="">Selecciona un jugador</option>
                    {players.map(player => (
                        <option key={player.id} value={player.id}>
                            {player.name}
                        </option>
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
