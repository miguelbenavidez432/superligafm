/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import axiosClient from "../axios";
import { useParams } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";

export default function PlayerAuctions() {

    const { id } = useParams();
    const { user, setNotification } = useStateContext();
    const [name, setName] = useState([]);
    const [auctions, setAuctions] = useState([]);
    const [newBid, setNewBid] = useState(0);

    useEffect(() => {
        getAuctionsByPlayer();
    }, []);

    const getAuctionsByPlayer = async () => {
        try {
            const response = await axiosClient.get(`/auctions/player/${id}`);
            setAuctions(response.data);
            if (response.data.length > 0) {
                setName(response.data[0].player.name);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleNewBidSubmit = (e) => {
        e.preventDefault();
        const lastAuction = auctions[0];
        if (newBid < (lastAuction.amount + 1000000)) {
            alert('La oferta debe ser mayor que la oferta anterior.');
            return;
        }

        axiosClient.post('/add_auctions', {
            id_player: parseInt(id),
            amount: newBid,
            auctioned_by: user.id,
            id_season: 52,
            created_by: lastAuction.creator ? lastAuction.creator.id : '',
            id_team: lastAuction.creator ? lastAuction.creator.id : '',
        })
            .then(() => {
                setNotification('Oferta enviada correctamente');
                getAuctionsByPlayer();
            })
            .catch((error) => {

                if (error.response && error.response.data.message) {
                    setNotification(error.response.data.message);
                } else {
                    setNotification('Error al enviar la oferta');
                }
                console.error(error);
            });
    };

    return (
        <div className="player-auctions">
            {name ? `Subastas del jugador: ${name}` : 'Cargando nombre del jugador...'}
            <ul>
                {auctions.map(auction => (
                    <li key={auction.id}>
                        {auction.amount} - Subastado por: {auction.auctioneer && auction.auctioneer.name}
                    </li>
                ))}
            </ul>

            <form onSubmit={handleNewBidSubmit}>
                <label htmlFor="bid">Nueva oferta:</label>
                <input
                    type="number"
                    min={auctions.length ? auctions[0].amount + 1000000 : 0}
                    value={newBid}
                    onChange={(e) => setNewBid(parseInt(e.target.value))}
                />
                <button className="btn-add" type="submit">Enviar Oferta</button>
            </form>
        </div>
    );
}
