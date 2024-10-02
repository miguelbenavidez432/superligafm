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
            setAuctions(response.data);
            console.log(auctions)
        } catch (error) {
            console.error(error);
        }
    };

    const handleNewBidSubmit = (e) => {
        e.preventDefault();

        const lastAuction = auctions[auctions.length - 1];
        if (newBid <= (lastAuction.amount + 1000000)) {
            alert('La oferta debe ser mayor que la oferta anterior.');
            return;
        }

        axiosClient.post('/auctions', {
            player_id: playerId,
            amount: newBid,
            auctioned_by: user.id,
            id_season: 59
        }).then(() => {
            setNotification('Oferta enviada correctamente');
            getAuctionsByPlayer();
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
                        {auction.amount} - Creado por: {auction.auctioned_by && auction.auctioned_by.name}
                    </li>
                ))}
            </ul>

            <form onSubmit={handleNewBidSubmit}>
                <label htmlFor="bid">Nueva oferta:</label>
                <input
                    type="number"
                    min={auctions.length ? auctions[auctions.length - 1].amount + 1000000 : 0}
                    value={newBid}
                    onChange={(e) => setNewBid(parseInt(e.target.value))}
                />
                <button className="btn-add" type="submit">Enviar Oferta</button>
            </form>
        </div>
    );
}
