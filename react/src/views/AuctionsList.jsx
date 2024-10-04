/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import axiosClient from "../axios";
import { Link } from 'react-router-dom';

export default function AuctionsList() {

    const [auctions, setAuctions] = useState([]);

    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        };
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', options); // Cambia 'es-ES' al locale que prefieras
    };

    useEffect(() => {
        getAuctions();
    }, []);

    const getAuctions = async () => {
        try {
            const response = await axiosClient.get('/auction/last');
            setAuctions(response.data);
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
                    const id_player = auction.player ? auction.player.id : '';
                    return (
                        <li key={auction.id}>
                            <label><strong>Jugador :</strong> {auction.player ? auction.player.name : ''} - <strong>Valor inicial:</strong> {auction.amount} - <strong> Hora de inicio:</strong> {formatDate(auction.created_at) + " "} </label>
                            <Link to={`/subastas/${auction.id_player}`} className="btn-edit">
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
