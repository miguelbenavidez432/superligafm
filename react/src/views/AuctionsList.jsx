/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-vars */
import { useContext, useEffect, useState } from "react";
import axiosClient from "../axios";
import { useStateContext } from "../context/ContextProvider";
import { Link } from 'react-router-dom';

export default function AuctionsList() {

    const [auctions, setAuctions] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState('');
    const { user } = useStateContext();

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
        return date.toLocaleString('es-ES', options);
    };

    useEffect(() => {
        getSeasons();
        getAuctions();
    }, [selectedSeason]);

    const getSeasons = async () => {
        try {
            const response = await axiosClient.get('/season');
            setSeasons(response.data.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const getAuctions = async () => {
        try {
            const response = await axiosClient.get('/auction/last', {
                params: {
                    id_season: selectedSeason
                }
            });
            setAuctions(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSeasonChange = (e) => {
        setSelectedSeason(e.target.value);
    };

    return (
        <div className="auction-list p-6 bg-gray-100 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Subastas Activas</h3>
            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Temporada:</label>
                <select
                    value={selectedSeason}
                    onChange={handleSeasonChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Todas las temporadas</option>
                    {Array.isArray(seasons) && seasons.map(season => (
                        <option key={season.id} value={season.id}>{season.name}</option>
                    ))}
                </select>
            </div>
            <ul className="space-y-4">
                {auctions ? auctions.map(auction => {
                    return (
                        <li
                            key={auction.id}
                            className="p-4 bg-white rounded-lg shadow-md border border-gray-200"
                        >
                            <label className="block text-gray-700 mb-2">
                                <strong>Jugador :</strong> {auction.player ? auction.player.name : ''} -
                                <strong> Valor inicial:</strong> {auction.amount} -
                                <strong> Hora de inicio:</strong> {formatDate(auction.created_at) + " "}
                            </label>
                            <Link
                                to={`/app/subastas/${auction.id_player}`}
                                className="inline-block px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition"
                            >
                                Hacer una nueva oferta
                            </Link>
                        </li>
                    );
                }) : (
                    <li className="text-gray-500">No se encontraron subastas</li>
                )}
            </ul>
        </div>
    );
}
