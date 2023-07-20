/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axiosClient from "../axios";
import moment from "moment";

const PlayerOffers = () => {
    const { id } = useParams();
    const [users, setUsers] = useState([]);
    const [offers, setOffers] = useState([]);
    const [players, setPlayers] = useState([]);
    const [isAvailable, setIsAvailable] = useState(false);

    useEffect(() => {
        axiosClient.get(`/clausulas/${id}`)
            .then(({ data }) => {
                console.log(data);
                setOffers(data.offers);
                checkOffersAvailability(data.offers)
                getPlayers();
                getUsers();
            })
            .catch((error) => {
            });
    }, [id]);


    const getPlayers = () => {
        axiosClient.get('/players')
            .then(({ data }) => {
                const playerData = data.data.find((player) => player.id === id);
                if (playerData) {
                    setPlayers(playerData);
                    console.log(playerData)
                }
            })
            .catch(() => {
            });
    }

    const getUsers = () => {
        axiosClient.get('/users')
            .then(({ data }) => {
                console.log(data);
                setUsers(data.data);
            })
            .catch(() => {
            });
    };

    const checkOffersAvailability = (playerOffers) => {
        if (playerOffers && playerOffers.length > 0) {
            // Obtener la fecha de la primera oferta
            const firstOfferDate = moment(playerOffers[0].created_at);
            // Calcular la fecha y hora de expiración (6 horas después de la primera oferta)
            const expirationDate = firstOfferDate.add(6, 'hours');
            // Obtener la fecha y hora actual
            const currentDate = moment();
            // Comparar la fecha y hora actual con la fecha y hora de expiración
            if (currentDate.isAfter(expirationDate)) {
                setIsAvailable(true);
            }
        }
    };

    return (
        <div>
            {players && <h2>Ofertas por el Jugador {players.name}</h2>}
            {isAvailable ? (<ul>
                {Array.isArray(offers) && offers.length > 0 ? (
                    offers.map((oferta) => {
                        const userName = users.find(u => u.id === oferta.created_by);
                        const userNameToShow = userName ? userName.name : "Usuario no encontrado";
                        return (
                            <li key={oferta.id}>
                                <br />
                                <span>Jugador: {oferta.name}</span>
                                <br />
                                <span>Usuario: {userNameToShow}</span>
                                <br />
                                {
                                    // isOfferHidden(oferta.created_at) ? (
                                    //     <span>Valor total: Oferta incógnita</span>
                                    // ) : 
                                    (
                                        <span>Valor total: {oferta.total_value}</span>
                                    )}
                                <br />
                            </li>
                        )
                    })
                ) : (
                    <li>No hay ofertas disponibles para este jugador en este momento.</li>
                )}
            </ul>) : (
                <p>Las ofertas estarán disponibles después de 6 horas de la primera oferta.</p>
            )}
            <br />
            <Link className="btn-edit" to={`/clausula_rescision`}>Realizar ofertas</Link>
        </div>
    );
};

export default PlayerOffers;