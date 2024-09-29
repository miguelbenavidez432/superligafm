/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import axiosClient from "../axios";
import { useStateContext } from "../context/ContextProvider";

const Auctions = () => {

    const { user, setNotification } = useStateContext();
    const [players, setPlayers] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [auctionData, setAuctionData] = useState({
        player_id: '',
        value: 0,
        created_by: user.id,
        duration: 12,  // Duración de la subasta en horas
        status: 'active',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getPlayers();
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
            .then(() => {
                setNotification('Subasta creada exitosamente');
                setAuctionData({
                    player_id: '',
                    value: 0,
                    created_by: user.id,
                    duration: 12,
                    status: 'active',
                });
            })
            .catch((error) => {
                console.error(error);
            });
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
        </div>
    )
}

export default Auctions
