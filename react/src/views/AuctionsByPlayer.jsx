/* eslint-disable no-undef */
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
    const [auctionData, setAuctionData] = useState({
        id_player: parseInt(id),
        value: 0,
        created_by: user.id,
        status: 'active',
        auctioned_by: user.id,
    });

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

    const handleNewBidSubmit = async (e) => {
        e.preventDefault();
        const lastAuction = auctions[0];

        // Verifica que lastAuction tenga datos
        if (!lastAuction) {
            alert('No hay subastas disponibles para este jugador.');
            return;
        }

        if (newBid < (lastAuction.amount + 1000000)) {
            alert('La oferta debe ser mayor que la oferta anterior.');
            return;
        }

        // Actualiza auctionData correctamente antes de enviar
        const updatedAuctionData = {
            id_player: parseInt(id),
            id_team: lastAuction.id_team,
            amount: newBid,
            created_by: user.id,
            auctioned_by: user.id,
            status: 'active',
        };

        try {
            const response = await axiosClient.post('/auctions', updatedAuctionData);
            setNotification('Subasta creada exitosamente');

            // Establece el tiempo de finalización de la subasta
            const auctionCreatedTime = new Date(response.data.created_at).getTime();
            const endTime = auctionCreatedTime + (12 * 60 * 60 * 1000); // Añadir 12 horas en milisegundos
            setAuctionEndTime(endTime);

            // Almacenar el tiempo de finalización en localStorage
            localStorage.setItem('auctionEndTime', endTime);

            // Reinicia el formulario
            setNewBid(0); // Reinicia el valor de la oferta
            getAuctionsByPlayer(); // Recargar las subastas
        } catch (error) {
            if (error.response && error.response.data.message) {
                setNotification(error.response.data.message);
            } else {
                setNotification('Error al enviar la oferta');
            }
            console.error(error);
        }
    };


    const handleAuctionSubmit = (e) => {
        e.preventDefault();
        console.log(auctionData)
        axiosClient.post('/auctions', auctionData)
            .then((response) => {
                setNotification('Subasta creada exitosamente');

                // Establece el tiempo de finalización de la subasta
                const auctionCreatedTime = new Date(response.data.created_at).getTime();
                const endTime = auctionCreatedTime + (12 * 60 * 60 * 1000); // Añadir 12 horas en milisegundos
                setAuctionEndTime(endTime);

                // Almacenar el tiempo de finalización en localStorage
                localStorage.setItem('auctionEndTime', endTime);

                // Inicia el countdown usando FormKit Tempo
                //startCountdown(endTime);

                // Reinicia el formulario
                setAuctionData({
                    player_id: '',
                    amount: 0,
                    created_by: user.id,
                    status: 'active',
                });
            })
            .catch((error) => {
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
