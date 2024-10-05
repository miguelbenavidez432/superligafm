/* eslint-disable no-undef */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosClient from "../axios";
import moment from "moment";
import { useStateContext } from "../context/ContextProvider";
import { format } from 'date-fns';

const PlayerOffers = () => {
    const { id } = useParams();
    const [users, setUsers] = useState([]);
    const [offers, setOffers] = useState([]);
    const [player, setPlayer] = useState({
        name: '',
        id_team: '',
        status: '',
        value: '',
        ca: '',
        pa: '',
        age: '',
    })
    const [teams, setTeams] = useState([]);
    const [isAvailable, setIsAvailable] = useState(false);
    const [errors, setErrors] = useState(null);
    const navigate = useNavigate()
    const { user, setNotification } = useStateContext();
    const [userProfit, setUserProfit] = useState({
        id: '',
        name: '',
        rol: '',
        email: '',
        profits: 0
    });
    const [userCost, setUserCost] = useState({
        id: '',
        name: '',
        rol: '',
        email: '',
        profits: 0
    });

    useEffect(() => {
        axiosClient.get(`/clausulas/${id}`)
            .then(({ data }) => {
                setPlayer(data.player);
                setOffers(data.offers);
                checkOffersAvailability(data.offers);
            })
            .catch((error) => {
            });
        getUsers();
        getTeam();
    }, [id, userProfit, userCost]);

    const getUsers = () => {
        axiosClient.get('/users')
            .then(({ data }) => {
                setUsers(data.data);
            })
            .catch(() => {
            });
    };

    const getTeam = () => {
        axiosClient.get('/teams')
            .then(({ data }) => {
                setTeams(data.data)
            })
            .catch(() => {
            })
    }

    const checkOffersAvailability = (playerOffers) => {
        if (playerOffers && playerOffers.length > 0) {
            const firstOfferDate = moment(playerOffers[0].created_at);
            const expirationDate = firstOfferDate.add(6, 'hours');
            const currentDate = moment();
            if (currentDate.isAfter(expirationDate)) {
                setIsAvailable(true);
            }
        }
    };

    const handleConfirmOffer = async (offerId) => {
        const oferta = offers.find(o => o.id === offerId);

        if (!oferta) {
            setNotification("Oferta no encontrada.");
            return;
        }

        const teamId = teams.find(t => t.id === oferta.id_team);

        if (!teamId) {
            setNotification("Equipo no encontrado.");
            return;
        }

        const getUser = users.find(u => teamId.user && u.id === teamId.user.id);
        if (!getUser) {
            setNotification("Usuario no encontrado para el equipo.");
            return;
        }

        const getUserCreated = users.find(u => u.id === oferta.created_by);
        if (!getUserCreated) {
            setNotification("Usuario que creó la oferta no encontrado.");
            return;
        }

        const teamTo = teams.find(t => t.user && t.user.id === getUserCreated.id);
        if (!teamTo) {
            setNotification("Equipo destino no encontrado.");
            return;
        }

        const updatedPlayer = {
            ...player,
            id_team: teamTo.id
        };

        const updatedUserProfit = {
            ...userProfit,
            id: getUser.id,
            name: getUser.name,
            rol: getUser.rol,
            email: getUser.email,
            profits: getUser.profits + oferta.value,
        };

        const updatedUserCost = {
            ...userCost,
            id: getUserCreated.id,
            name: getUserCreated.name,
            rol: getUserCreated.rol,
            email: getUserCreated.email,
            profits: getUserCreated.profits - oferta.value,
        };

        try {
            setUserProfit(updatedUserProfit);
            setUserCost(updatedUserCost);
            setPlayer(updatedPlayer);

            await axiosClient.put(`/users/${getUser.id}`, updatedUserProfit);
            await axiosClient.put(`/users/${getUserCreated.id}`, updatedUserCost);
            await axiosClient.put(`/players/${oferta.id_player}`, updatedPlayer);
            setNotification("Oferta confirmada satisfactoriamente");
            navigate("/offers");
        } catch (error) {
            setNotification("Error al confirmar la oferta:", error);
            const response = error.response;
            if (response && response.status === 422) {
                setErrors(response.data.errors);
            }
        }
    };

    const handleCloseOffer = async (offerId) => {
        // Buscar la oferta con el ID proporcionado
        const oferta = offers.find(o => o.id === offerId);

        if (!oferta) {
            setNotification("Oferta no encontrada.");
            return;
        }

        // Crear el objeto con los campos requeridos por la API
        const updateOffer = {
            id: offerId,
            active: 'no',
            id_team: oferta.id_team,
            total_value: oferta.total_value,
        };

        try {
            await axiosClient.put(`/cerrar-oferta/${offerId}`, updateOffer);
            setNotification("Oferta cerrada satisfactoriamente");
            navigate("/offers");
        } catch (error) {
            setNotification("Error al cerrar la oferta:", error);
            const response = error.response;
            if (response && response.status === 422) {
                setErrors(response.data.errors);
            }
        }
    };


    return (
        <div>
            {isAvailable ? (<ul>
                {Array.isArray(offers) && offers.length > 0 ? (
                    offers
                        .map((oferta) => {
                            const userName = users.find(u => u.id === oferta.created_by);
                            const userNameToShow = userName ? userName.name : "Usuario no encontrado";
                            const fecha = new Date(oferta.created_at);
                            const fechaFormateada = format(fecha, 'dd/MM/yy HH:mm:ss');
                            return (
                                <li key={oferta.id}>
                                    <br />
                                    <span>Jugador: {oferta.name}</span>
                                    <br />
                                    <span>Usuario: {userNameToShow}</span>
                                    <br />
                                    <span>Jugadores extras: {oferta.other_players}</span>
                                    <br />
                                    <span>Valor total: {oferta.total_value}</span>
                                    <br />
                                    <span>Valor: {oferta.value}</span>
                                    <br />
                                    <span>Horario: {fechaFormateada}</span>
                                    <br />{
                                        user.rol === 'Admin' || user.rol === 'Organizador' ?
                                            <div>
                                                <button className="btn-add" onClick={() => handleConfirmOffer(parseInt(oferta.id))}>Confirmar oferta</button>
                                                <button className="btn-edit" onClick={() => handleCloseOffer(parseInt(oferta.id))}>Cerrar oferta</button>
                                            </div>
                                            :
                                            ''
                                    }
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
