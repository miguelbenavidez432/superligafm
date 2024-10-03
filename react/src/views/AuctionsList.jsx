/* eslint-disable no-unused-vars */
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
            console.log(response.data)
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="auction-list">
            <h3>Subastas Activas</h3>
            <br />
            <ul>
                {auctions ? auctions.map(auction => {
                    const id_player = auction.player ? auction.player.id : ''; // Asegúrate de acceder a player.id correctamente
                    return (
                        <li key={auction.id}>
                            <label>{auction.player ? auction.player.name : ''} - Valor inicial: {auction.amount} </label>
                            <Link to={`/subastas/${id_player}`} className="btn-edit"> {/* Cambiado auction.id_player a id_player */}
                                Hacer una nueva oferta
                            </Link>
                            <br />
                            <span className="text-white"> - </span>
                        </li>
                    );
                }) : 'No se encontraron subastas'}
            </ul>
        </div>
    );
}
