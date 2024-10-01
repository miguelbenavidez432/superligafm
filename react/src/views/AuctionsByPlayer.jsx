/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import axiosClient from "../axios";
import { useParams } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";

export default function PlayerAuctions() {
    const { playerId } = useParams();
    const { user, setNotification } = useStateContext();
    const [auctions, setAuctions] = useState([]);
    const [newBid, setNewBid] = useState(0);

    useEffect(() => {
        getAuctionsByPlayer();
    }, []);

    const getAuctionsByPlayer = async () => {
        try {
            const response = await axiosClient.get(`/auctions/player/${playerId}`);
            setAuctions(response.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleNewBidSubmit = (e) => {
        e.preventDefault();

        const lastAuction = auctions[auctions.length - 1];
        if (newBid <= lastAuction.value) {
            alert('La oferta debe ser mayor que la oferta anterior.');
            return;
        }

        axiosClient.post('/auctions', {
            player_id: playerId,
            value: newBid,
            created_by: user.id,
        }).then(() => {
            setNotification('Oferta enviada correctamente');
            getAuctionsByPlayer(); // Recargar las subastas
        }).catch((error) => {
            console.error(error);
        });
    };

    return (
        <div className="player-auctions">
            <h3>Subastas del jugador</h3>
            <ul>
                {auctions.map(auction => (
                    <li key={auction.id}>
                        {auction.value} - Creado por: {auction.created_by}
                    </li>
                ))}
            </ul>

            <form onSubmit={handleNewBidSubmit}>
                <label htmlFor="bid">Nueva oferta:</label>
                <input
                    type="number"
                    min={auctions.length ? auctions[auctions.length - 1].value + 1 : 0}
                    value={newBid}
                    onChange={(e) => setNewBid(parseInt(e.target.value))}
                />
                <button type="submit">Enviar Oferta</button>
            </form>
        </div>
    );
}
