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
            const response = await axiosClient.get('/auction/last');
            setAuctions(response.data);
            console.log(auctions)
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="auction-list">
            <h3>Subastas Activas</h3>
            <br />
            <ul>
                {auctions ? auctions.map(auction => (
                    <li key={auction.id}>
                        <label htmlFor="">{auction.player? auction.player.name : ''} - Valor inicial: {auction.amount} </label>
                        <Link to={`/subastas/${auction.id_player}`} className="btn-edit">
                            Hacer una nueva oferta
                        </Link>
                        <br />
                        <span className="text-white"> - </span>
                    </li>
                )) : 'No se encontraron subastas'}
            </ul>
        </div>
    );
}
