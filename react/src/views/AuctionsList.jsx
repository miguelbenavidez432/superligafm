/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// import { useContext, useEffect, useState } from "react";
// import axiosClient from "../axios";
// import { useStateContext } from "../context/ContextProvider";
// import { Link } from 'react-router-dom';

// export default function AuctionsList() {

//     const [auctions, setAuctions] = useState([]);
//     const { user } = useStateContext();

//     const formatDate = (dateString) => {
//         const options = {
//             year: 'numeric',
//             month: '2-digit',
//             day: '2-digit',
//             hour: '2-digit',
//             minute: '2-digit',
//             second: '2-digit',
//             hour12: false,
//         };
//         const date = new Date(dateString);
//         return date.toLocaleString('es-ES', options);
//     };

//     useEffect(() => {
//         getAuctions();
//     }, []);

//     const getAuctions = async () => {
//         try {
//             const response = await axiosClient.get('/auction/last');
//             setAuctions(response.data);
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     return (
//         <div className="auction-list">
//             <h3>Subastas Activas</h3>
//             <br />
//             <ul>
//                 {auctions ? auctions.map(auction => {
//                     return (
//                         <li key={auction.id}>
//                             <label><strong>Jugador :</strong> {auction.player ? auction.player.name : ''} - <strong>Valor inicial:</strong> {auction.amount} - <strong> Hora de inicio:</strong> {formatDate(auction.created_at) + " "} </label>
//                             <Link to={`/subastas/${auction.id_player}`} className="btn-edit mr-2 pb-10">
//                                 Hacer una nueva oferta
//                             </Link>
//                             <br />
//                             <br />
//                         </li>
//                     );
//                 }) : 'No se encontraron subastas'}
//             </ul>
//         </div>
//     );
// }

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
                    season: selectedSeason
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
        <div className="auction-list">
            <h3>Subastas Activas</h3>
            <br />
            <div>
                <label>Temporada:</label>
                <select value={selectedSeason} onChange={handleSeasonChange}>
                    <option value="">Todas las temporadas</option>
                    {Array.isArray(seasons) && seasons.map(season => (
                        <option key={season.id} value={season.id}>{season.name}</option>
                    ))}
                </select>
            </div>
            <br />
            <ul>
                {auctions ? auctions.map(auction => {
                    return (
                        <li key={auction.id}>
                            <label><strong>Jugador :</strong> {auction.player ? auction.player.name : ''} - <strong>Valor inicial:</strong> {auction.amount} - <strong> Hora de inicio:</strong> {formatDate(auction.created_at) + " "} </label>
                            <Link to={`/subastas/${auction.id_player}`} className="btn-edit mr-2 pb-10">
                                Hacer una nueva oferta
                            </Link>
                            <br />
                            <br />
                        </li>
                    );
                }) : 'No se encontraron subastas'}
            </ul>
        </div>
    );
}
