import { useEffect, useState } from "react";
import axiosClient from "../axios";
import { Link } from 'react-router-dom';

export default function AuctionsList() {

    const [auctions, setAuctions] = useState([]);

    useEffect(() => {
        getAuctions();
    }, []);

    const getAuctions = async () => {
        try {
            const response = await axiosClient.get('/auctions/last');
            setAuctions(response.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="auction-list">
            <h3>Subastas Activas</h3>
            <ul>
                {auctions.map(auction => (
                    <li key={auction.id}>
                        <Link to={`/auction/${auction.player_id}`}>
                            {auction.player.name} - Valor inicial: {auction.value}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
