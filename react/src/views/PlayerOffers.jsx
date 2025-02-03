/* eslint-disable no-undef */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// import { useState, useEffect } from "react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import axiosClient from "../axios";
// import moment from "moment";
// import { useStateContext } from "../context/ContextProvider";
// import { format } from 'date-fns';
// import { el } from "date-fns/locale";

// const PlayerOffers = () => {
//     const { id } = useParams();
//     const [users, setUsers] = useState([]);
//     const [offers, setOffers] = useState([]);
//     const [player, setPlayer] = useState({
//         name: '',
//         id_team: '',
//         status: '',
//         value: '',
//         ca: '',
//         pa: '',
//         age: '',
//     })
//     const [teams, setTeams] = useState([]);
//     const [isAvailable, setIsAvailable] = useState(false);
//     const [errors, setErrors] = useState(null);
//     const navigate = useNavigate()
//     const { user, setNotification } = useStateContext();
//     const [userProfit, setUserProfit] = useState({
//         id: '',
//         name: '',
//         rol: '',
//         email: '',
//         profits: 0
//     });
//     const [userCost, setUserCost] = useState({
//         id: '',
//         name: '',
//         rol: '',
//         email: '',
//         profits: 0
//     });

//     const [data, setData] = useState({});

//     useEffect(() => {
//         axiosClient.get(`/clausulas/${id}`)
//             .then(({ data }) => {
//                 setPlayer(data.player);
//                 setOffers(data.offers);
//                 checkOffersAvailability(data.offers);
//             })
//             .catch((error) => {
//             });
//         getUsers();
//         getTeam();
//     }, [id, userProfit, userCost]);

//     const getUsers = () => {
//         axiosClient.get('/users')
//             .then(({ data }) => {
//                 setUsers(data.data);
//             })
//             .catch(() => {
//             });
//     };

//     const getTeam = () => {
//         axiosClient.get('/teams')
//             .then(({ data }) => {
//                 setTeams(data.data)
//             })
//             .catch(() => {
//             })
//     }

//     const checkOffersAvailability = (playerOffers) => {
//         if (playerOffers && playerOffers.length > 0) {
//             const firstOfferDate = moment(playerOffers[0].created_at);
//             const expirationDate = firstOfferDate.add(2, 'hours');
//             const currentDate = moment();
//             if (currentDate.isAfter(expirationDate)) {
//                 setIsAvailable(true);
//             }
//         }
//     };

//     const handleConfirmOffer = async (offerId) => {
//         const oferta = offers.find(o => o.id === offerId);

//         const teamId = teams.find(t => t.id === oferta.id_team);

//         const getUser = users.find(u => teamId.user && u.id === teamId.user.id);
//         if (!getUser) {
//             setNotification("Usuario no encontrado para el equipo.");
//             return;
//         }

//         const getUserCreated = users.find(u => u.id === oferta.created_by);
//         if (!getUserCreated) {
//             setNotification("Usuario que creó la oferta no encontrado.");
//             return;
//         }
//         console.log('getUserCreated',getUserCreated);

//         const teamTo = teams.find(t => t.user && t.user.id === getUserCreated.id);
//         if (!teamTo) {
//             setNotification("Equipo destino no encontrado.");
//             return;
//         }
//         console.log('Teamto',teamTo);

//         if (!oferta) {
//             setNotification("Oferta no encontrada.");
//             return;
//         } else if (oferta.confirmed === 'yes') {
//             setNotification("Oferta ya confirmada.");
//             return;
//         } else if (oferta.active === 'no') {
//             setNotification("Oferta cerrada.");
//             return;
//         }

//         const confirmOfferData = {
//             offer: {
//                 id: oferta.id,
//                 total_value: oferta.total_value,
//                 id_team: oferta.id_team,
//                 created_by: oferta.created_by,
//                 confirmed: 'yes',
//                 active: 'no'
//             },
//             player: {
//                 id: id,
//                 id_team: teamTo.id,
//                 status: 'bloqueado',
//                 value: player.value,
//                 ca: player.ca,
//                 pa: player.pa,
//                 age: player.age
//             }
//         };
//         console.log(confirmOfferData);

//         try {
//             await axiosClient.post('/confirm-offer', confirmOfferData);
//             setNotification("Oferta confirmada satisfactoriamente");
//             //navigate("/offers");
//         } catch (error) {
//             setNotification("Error al confirmar la oferta:", error);
//             const response = error.response;
//             if (response && response.status === 422) {
//                 setErrors(response.data.errors);
//             }
//         }
//     };

//     const handleCloseOffer = async (offerId) => {
//         const oferta = offers.find(o => o.id === offerId);

//         if (!oferta) {
//             setNotification("Oferta no encontrada.");
//             return;
//         }

//         const updateOffer = {
//             id: offerId,
//             active: 'no',
//             id_team: oferta.id_team,
//             total_value: oferta.total_value,
//         };

//         try {
//             await axiosClient.put(`/cerrar-oferta/${offerId}`, updateOffer);
//             setNotification("Oferta cerrada satisfactoriamente");
//             navigate("/offers");
//         } catch (error) {
//             setNotification("Error al cerrar la oferta:", error);
//             const response = error.response;
//             if (response && response.status === 422) {
//                 setErrors(response.data.errors);
//             }
//         }
//     };


//     return (
//         <div>
//             {isAvailable ? (<ul>
//                 {Array.isArray(offers) && offers.length > 0 ? (
//                     offers
//                         .map((oferta) => {
//                             const userName = users.find(u => u.id === oferta.created_by);
//                             const userNameToShow = userName ? userName.name : "Usuario no encontrado";
//                             const fecha = new Date(oferta.created_at);
//                             const fechaFormateada = format(fecha, 'dd/MM/yy HH:mm:ss');
//                             return (
//                                 <li key={oferta.id}>
//                                     <br />
//                                     <span>Jugador: {oferta.name}</span>
//                                     <br />
//                                     <span>Usuario: {userNameToShow}</span>
//                                     <br />
//                                     <span>Jugadores extras: {oferta.other_players}</span>
//                                     <br />
//                                     <span>Valor total: {oferta.total_value}</span>
//                                     <br />
//                                     <span>Valor: {oferta.value}</span>
//                                     <br />
//                                     <span>Horario: {fechaFormateada}</span>
//                                     <br />{
//                                         user.rol === 'Admin' || user.rol === 'Organizador' ?
//                                             <div>
//                                                 <button className="btn-add" onClick={() => handleConfirmOffer(parseInt(oferta.id))}>Confirmar oferta</button>
//                                                 <button className="btn-edit" onClick={() => handleCloseOffer(parseInt(oferta.id))}>Cerrar oferta</button>
//                                             </div>
//                                             :
//                                             ''
//                                     }
//                                 </li>
//                             )
//                         })
//                 ) : (
//                     <li>No hay ofertas disponibles para este jugador en este momento.</li>
//                 )}
//             </ul>) : (
//                 <p>Las ofertas estarán disponibles después de 7 u 8 horas de la primera oferta.</p>
//             )}
//             <br />
//             <Link className="btn-edit" to={`/clausula_rescision`}>Realizar ofertas</Link>
//         </div>
//     );
// };

// export default PlayerOffers;
import React, { useState, useEffect } from 'react';
import axiosClient from '../axios';
import { Link, useNavigate, useParams } from "react-router-dom";
import { useStateContext } from '../context/ContextProvider';
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
    });
    const [teams, setTeams] = useState([]);
    const [isAvailable, setIsAvailable] = useState(false);
    const [errors, setErrors] = useState(null);
    const { user, setNotification } = useStateContext();
    const navigate = useNavigate()

    useEffect(() => {
        axiosClient.get(`/clausulas/${id}`)
            .then(({ data }) => {
                setPlayer(data.player);
                setOffers(data.offers);
                checkOffersAvailability(data.offers);
            })
            .catch((error) => {
                setErrors("Error al obtener las ofertas del jugador.");
            });
        getUsers();
        getTeam();
    }, [id]);

    const getUsers = () => {
        axiosClient.get('/users')
            .then(({ data }) => {
                setUsers(data.data);
            })
            .catch(() => {
                setErrors("Error al obtener los usuarios.");
            });
    };

    const getTeam = () => {
        axiosClient.get('/teams')
            .then(({ data }) => {
                setTeams(data.data);
            })
            .catch(() => {
                setErrors("Error al obtener los equipos.");
            });
    };

    const checkOffersAvailability = (playerOffers) => {
        if (playerOffers && playerOffers.length > 0) {
            const firstOfferDate = new Date(playerOffers[0].created_at);
            setIsAvailable(shouldDisplayOffer(firstOfferDate));
        }
    };

    const shouldDisplayOffer = (createdAt) => {
        const offerDate = new Date(createdAt);
        const currentDate = new Date();

        // Definir las horas específicas para mostrar las ofertas
        const showTime1 = new Date(offerDate);
        showTime1.setHours(1, 0, 0, 0); // 01:00:00

        const showTime2 = new Date(offerDate);
        showTime2.setHours(10, 0, 0, 0); // 10:00:00

        const showTime3 = new Date(offerDate);
        showTime3.setHours(18, 0, 0, 0); // 18:00:00

        // Condiciones para mostrar las ofertas
        if (offerDate.getHours() >= 18) {
            const nextDayShowTime1 = new Date(showTime1);
            nextDayShowTime1.setDate(nextDayShowTime1.getDate() + 1);
            return currentDate >= nextDayShowTime1;
        } else if (offerDate.getHours() < 1) {
            return currentDate >= showTime1;
        } else if (offerDate.getHours() >= 1 && offerDate.getHours() < 10) {
            return currentDate >= showTime2;
        } else if (offerDate.getHours() >= 10 && offerDate.getHours() < 18) {
            return currentDate >= showTime3;
        }

        return false;
    };

    const handleConfirmOffer = async (offerId) => {
        const oferta = offers.find(o => o.id === offerId);

        const teamId = teams.find(t => t.id === oferta.id_team);

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

        if (!oferta) {
            setNotification("Oferta no encontrada.");
            return;
        } else if (oferta.confirmed === 'yes') {
            setNotification("Oferta ya confirmada.");
            return;
        } else if (oferta.active === 'no') {
            setNotification("Oferta cerrada.");
            return;
        }

        const confirmOfferData = {
            offer: {
                id: oferta.id,
                total_value: oferta.total_value,
                id_team: oferta.id_team,
                created_by: oferta.created_by,
                confirmed: 'yes',
                active: 'no'
            },
            player: {
                id: id,
                id_team: teamTo.id,
                status: 'bloqueado',
                value: player.value,
                ca: player.ca,
                pa: player.pa,
                age: player.age
            }
        };

        try {
            await axiosClient.post('/confirm-offer', confirmOfferData);
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
        const oferta = offers.find(o => o.id === offerId);

        if (!oferta) {
            setNotification("Oferta no encontrada.");
            return;
        }

        const updateOffer = {
            id: offerId,
            active: 'no',
            id_team: oferta.id_team,
            total_value: oferta.total_value,
        };

        try {
            await axiosClient.put(`/cerrar-oferta/${offerId}`, updateOffer);
            setNotification("Oferta cerrada satisfactoriamente");
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
            {isAvailable ? (
                <ul>
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
                                            user.rol === 'Admin' || user.rol === 'Organizador' ? (
                                                <div>
                                                    <button className="btn-add" onClick={() => handleConfirmOffer(parseInt(oferta.id))}>Confirmar oferta</button>
                                                    <button className="btn-edit" onClick={() => handleCloseOffer(parseInt(oferta.id))}>Cerrar oferta</button>
                                                </div>
                                            ) : (
                                                ''
                                            )
                                        }
                                    </li>
                                );
                            })
                    ) : (
                        <li>No hay ofertas disponibles para este jugador en este momento.</li>
                    )}
                </ul>
            ) : (
                <p>Las ofertas estarán disponibles después de 7 u 8 horas de la primera oferta.</p>
            )}
            <br />
            <Link className="btn-edit" to={`/clausula_rescision`}>Realizar ofertas</Link>
        </div>
    );
};

export default PlayerOffers;
