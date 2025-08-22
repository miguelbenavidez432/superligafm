/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import axiosClient from "../axios";
// import moment from "moment";

// const OffersList = () => {
//     const [offers, setOffers] = useState([]);
//     const [users, setUsers] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [teams, setTeams] = useState([])

//     useEffect(() => {
//         axiosClient.get('/clausula_rescision?all=true')
//             .then(({ data }) => {
//                 setOffers(data.data);
//             })
//             .catch((error) => {
//             });
//         getUsers();
//         getTeam()
//     }, []);

//     const getTeam = async () => {
//         setLoading(true)
//         await axiosClient.get('/teams')
//             .then(({ data }) => {
//                 const teamFilter = data.data.filter((t) => t.division === 'Primera' || t.division === 'Segunda')
//                 setTeams(teamFilter)
//             })
//             .catch(() => {
//                 setLoading(false)
//             })
//     }

//     const getUsers = () => {
//         setLoading(true);
//         axiosClient.get('/users')
//             .then(({ data }) => {
//                 setLoading(false);
//                 setUsers(data.data);
//             })
//             .catch(() => {
//                 setLoading(false);
//             });
//     };

//     const checkOffersAvailability = (created_at) => {
//         if (created_at) {
//             const offerCreatedAt = moment(created_at);
//             const expirationDate = offerCreatedAt.add(10, 'hours');
//             const currentDate = moment();
//             return currentDate.isAfter(expirationDate);
//         }
//         return false;
//     };

//     const shouldDisplayValue = (createdAt) => {
//         const offerDate = new Date(createdAt);
//         const currentDate = new Date();

//         // Verificar si la oferta fue creada el mismo día
//         const isSameDay = currentDate.toDateString() === offerDate.toDateString();

//         // Comparar la hora actual con las 18:00:00
//         const specificTime = new Date(offerDate);
//         specificTime.setHours(6, 0, 0, 0); // 18:00:00 del día de creación de la oferta

//         return !isSameDay || currentDate >= specificTime;
//     };

//     return (
//         <div>
//             <div style={{ display: 'flex', justifyContent: "space-between", alignItems: "center" }}>
//                 <h1><strong>CLÁUSULAS DE RESCISIÓN EJECUTADAS</strong></h1>
//                 <Link to={`/clausula_rescision`} className="btn-add">Nueva oferta</Link>
//             </div>
//             <br />
//             {loading &&
//                 <tbody>
//                     <tr>
//                         <td colSpan="9" className="text-center">
//                             CARGANDO...
//                         </td>
//                     </tr>
//                 </tbody>
//             }
//             <div className="card animated fadeInDown">
//                 <table>
//                     <thead>
//                         <tr>
//                             <th>Jugador</th>
//                             <th>Equipo</th>
//                             <th>Valor</th>
//                             <th>Valor extra</th>
//                             <th>Valor Total</th>
//                             <th>Realizado por</th>
//                             <th>Horario</th>
//                             <th>Actions</th>
//                         </tr>
//                     </thead>
//                     {!loading &&
//                         <tbody>
//                             {offers.filter(oferta => oferta.confirmed == 'no' && oferta.active == 'yes')
//                             .map((oferta) => {
//                                 const userName = users.find(u => u.id === oferta.created_by);
//                                 const isOfferAvailable = checkOffersAvailability(oferta.created_at);
//                                 const teamName = teams.find(t => t.id === oferta.id_team)
//                                 const userNameToShow = userName ? userName.name : "Usuario no encontrado";
//                                 const teamNameToShow = teamName ? teamName.name : " ";
//                                 const formattedDate = moment(oferta.created_at).format('DD-MM-YYYY HH:mm:ss');
//                                 return (
//                                     <tr key={oferta.id}>
//                                         <th >{oferta.name}</th>
//                                         <th >{teamNameToShow}</th>
//                                         <th>{isOfferAvailable ? oferta.value : '??'}</th>
//                                         <th>{isOfferAvailable ? oferta.other_players : '??'}</th>
//                                         <th>{isOfferAvailable ? oferta.total_value : '??'}</th>
//                                         <th>{userNameToShow}</th>
//                                         <th>{formattedDate}</th>
//                                         <th className="mt-1">
//                                             <Link className="btn-edit my-1" to={`/offers/${oferta.id_player}`}>Ofertas</Link>
//                                             <br />
//                                         </th>
//                                     </tr>
//                                 )
//                             })}
//                         </tbody>
//                     }
//                 </table>
//             </div>
//         </div>

//         // <div>
//         //     <div style={{ display: 'flex', justifyContent: "space-between", alignItems: "center" }}>
//         //         <h1><strong>CLÁUSULAS DE RESCISIÓN EJECUTADAS</strong></h1>
//         //         <Link to={`/clausula_rescision`} className="btn-add">Nueva oferta</Link>
//         //     </div>
//         //     <br />
//         //     {loading &&
//         //         <tbody>
//         //             <tr>
//         //                 <td colSpan="9" className="text-center">
//         //                     CARGANDO...
//         //                 </td>
//         //             </tr>
//         //         </tbody>
//         //     }
//         //     <div className="card animated fadeInDown">
//         //         <table>
//         //             <thead>
//         //                 <tr>
//         //                     <th>Jugador</th>
//         //                     <th>Equipo</th>
//         //                     <th>Valor</th>
//         //                     <th>Valor extra</th>
//         //                     <th>Valor Total</th>
//         //                     <th>Realizado por</th>
//         //                     <th>Horario</th>
//         //                     <th>Actions</th>
//         //                 </tr>
//         //             </thead>
//         //             {!loading &&
//         //                 <tbody>
//         //                     {offers.map((oferta) => {
//         //                         const userName = users.find(u => u.id === oferta.created_by);
//         //                         const teamName = teams.find(t => t.id === oferta.id_team);
//         //                         const userNameToShow = userName ? userName.name : "Usuario no encontrado";
//         //                         const teamNameToShow = teamName ? teamName.name : " ";
//         //                         const formattedDate = new Date(oferta.created_at).toLocaleString('es-ES', {
//         //                             day: '2-digit',
//         //                             month: '2-digit',
//         //                             year: 'numeric',
//         //                             hour: '2-digit',
//         //                             minute: '2-digit',
//         //                             second: '2-digit',
//         //                         });
//         //                         return (
//         //                             <tr key={oferta.id}>
//         //                                 <th>{oferta.name}</th>
//         //                                 <th>{teamNameToShow}</th>
//         //                                 <th>{shouldDisplayValue(oferta.created_at) ? oferta.value : '??'}</th>
//         //                                 <th>{shouldDisplayValue(oferta.created_at) ? oferta.other_players : '??'}</th>
//         //                                 <th>{shouldDisplayValue(oferta.created_at) ? oferta.total_value : '??'}</th>
//         //                                 <th>{userNameToShow}</th>
//         //                                 <th>{formattedDate}</th>
//         //                                 <th className="mt-1">
//         //                                     <Link className="btn-edit my-1" to={`/offers/${oferta.id_player}`}>Ofertas</Link>
//         //                                     <br />
//         //                                 </th>
//         //                             </tr>
//         //                         );
//         //                     })}
//         //                 </tbody>
//         //             }
//         //         </table>
//         //     </div>
//         // </div>
//     );
// };


// export default OffersList;

/* eslint-disable no-unused-vars */
// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import axiosClient from "../axios";
// import moment from "moment";

// const OffersList = () => {
//     const [offers, setOffers] = useState([]);
//     const [users, setUsers] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [teams, setTeams] = useState([]);

//     useEffect(() => {
//         axiosClient.get('/clausula_rescision?all=true')
//             .then(({ data }) => {
//                 setOffers(data.data);
//             })
//             .catch((error) => {
//             });
//         getUsers();
//         getTeam();
//     }, []);

//     const getUsers = () => {
//         setLoading(true);
//         axiosClient.get('/users')
//             .then(({ data }) => {
//                 setLoading(false);
//                 setUsers(data.data);
//             })
//             .catch(() => {
//                 setLoading(false);
//             });
//     };

//     const getTeam = async () => {
//         setLoading(true);
//         await axiosClient.get('/teams?all=true')
//             .then(({ data }) => {
//                 const teamFilter = data.data.filter((t) => t.division === 'Primera' || t.division === 'Segunda');
//                 setTeams(teamFilter);
//             })
//             .catch(() => {
//                 setLoading(false);
//             });
//     };

//     const shouldDisplayValue = (createdAt) => {
//         const offerDate = new Date(createdAt);
//         const currentDate = new Date();

//         // Obtener la hora de creación de la oferta
//         const offerHour = offerDate.getHours();

//         // Definir las horas específicas para mostrar las ofertas
//         const showTime1 = new Date(offerDate);
//         showTime1.setHours(1, 0, 0, 0); // 01:00:00

//         const showTime2 = new Date(offerDate);
//         showTime2.setHours(10, 0, 0, 0); // 10:00:00

//         const showTime3 = new Date(offerDate);
//         showTime3.setHours(18, 0, 0, 0); // 18:00:00

//         // Condiciones para mostrar las ofertas
//         if (offerHour >= 18) {
//             return currentDate >= showTime1;
//         } else if (offerHour < 1) {
//             return currentDate >= showTime1;
//         } else if (offerHour >= 1 && offerHour < 10) {
//             return currentDate >= showTime2;
//         } else if (offerHour >= 10 && offerHour < 18) {
//             return currentDate >= showTime3;
//         }

//         return false;
//     };

//     return (
//         <div>
//             <div style={{ display: 'flex', justifyContent: "space-between", alignItems: "center" }}>
//                 <h1><strong>CLÁUSULAS DE RESCISIÓN EJECUTADAS</strong></h1>
//                 <Link to={`/clausula_rescision`} className="btn-add">Nueva oferta</Link>
//             </div>
//             <br />
//             {loading &&
//                 <tbody>
//                     <tr>
//                         <td colSpan="9" className="text-center">
//                             CARGANDO...
//                         </td>
//                     </tr>
//                 </tbody>
//             }
//             <div className="card animated fadeInDown">
//                 <table>
//                     <thead>
//                         <tr>
//                             <th>Jugador</th>
//                             <th>Equipo</th>
//                             <th>Valor</th>
//                             <th>Valor extra</th>
//                             <th>Valor Total</th>
//                             <th>Realizado por</th>
//                             <th>Horario</th>
//                             <th>Actions</th>
//                         </tr>
//                     </thead>
//                     {!loading &&
//                         <tbody>
//                             {offers.filter(oferta => oferta.confirmed === 'no' && oferta.active === 'yes')
//                                 .map((oferta) => {
//                                     const userName = users.find(u => u.id === oferta.created_by);
//                                     const teamName = teams.find(t => t.id === oferta.id_team);
//                                     const userNameToShow = userName ? userName.name : "Usuario no encontrado";
//                                     const teamNameToShow = teamName ? teamName.name : " ";
//                                     const formattedDate = moment(oferta.created_at).format('DD-MM-YYYY HH:mm:ss');
//                                     return (
//                                         <tr key={oferta.id}>
//                                             <th>{oferta.name}</th>
//                                             <th>{teamNameToShow}</th>
//                                             <th>{shouldDisplayValue(oferta.created_at) ? oferta.value : '??'}</th>
//                                             <th>{shouldDisplayValue(oferta.created_at) ? oferta.other_players : '??'}</th>
//                                             <th>{shouldDisplayValue(oferta.created_at) ? oferta.total_value : '??'}</th>
//                                             <th>{userNameToShow}</th>
//                                             <th>{formattedDate}</th>
//                                             <th className="mt-1">
//                                                 <Link className="btn-edit my-1" to={`/offers/${oferta.id_player}`}>Ofertas</Link>
//                                                 <br />
//                                             </th>
//                                         </tr>
//                                     )
//                                 })}
//                         </tbody>
//                     }
//                 </table>
//             </div>
//         </div>
//     );
// };

// export default OffersList;
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../axios";
import moment from "moment";
import { useStateContext } from "../context/ContextProvider";

const OffersList = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState('');
    const { setNotification } = useStateContext();

    useEffect(() => {
        getOffers();
        getSeasons();
    }, [selectedSeason]);

    const getOffers = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/clausula_rescision', {
                params: {
                    all: true,
                    season: selectedSeason
                }
            });
            setOffers(response.data.data);
        } catch (error) {
            console.error('Error al obtener ofertas:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSeasons = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/season');
            setSeasons(response.data.data || []);
        } catch (error) {
            console.error('Error al obtener temporadas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSeasonChange = (e) => {
        setSelectedSeason(e.target.value);
    };

    const shouldHideValues = (createdAt) => {
        const offerDate = new Date(createdAt);
        const currentDate = new Date();

        // Definir las horas específicas para mostrar las ofertas
        const showTime1 = new Date(offerDate);
        showTime1.setHours(1, 0, 0, 0); // 01:00:00

        const showTime2 = new Date(offerDate);
        showTime2.setHours(10, 0, 0, 0); // 10:00:00

        const showTime3 = new Date(offerDate);
        showTime3.setHours(18, 0, 0, 0); // 18:00:00


        if (offerDate.getHours() >= 18) {
            const nextDayShowTime1 = new Date(showTime1);
            nextDayShowTime1.setDate(nextDayShowTime1.getDate() + 1);
            return currentDate < nextDayShowTime1;
        } else if (offerDate.getHours() < 1) {
            return currentDate < showTime1;
        } else if (offerDate.getHours() >= 1 && offerDate.getHours() < 10) {
            return currentDate < showTime2;
        } else if (offerDate.getHours() >= 10 && offerDate.getHours() < 18) {
            return currentDate < showTime3;
        }

        return false;
    };

    // Filtrar las ofertas para obtener solo la última oferta de cada jugador
    const latestOffers = offers.reduce((acc, offer) => {
        const existingOffer = acc.find(o => o.id_player === offer.id_player);
        if (!existingOffer || new Date(existingOffer.created_at) < new Date(offer.created_at)) {
            return acc.filter(o => o.id_player !== offer.id_player).concat(offer);
        }
        return acc;
    }, []);

    return (
        <div className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-center md:text-left mb-4 md:mb-0">
                    CLÁUSULAS DE RESCISIÓN EJECUTADAS
                </h1>
                <Link
                    to={`/clausula_rescision`}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                    Nueva oferta
                </Link>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Temporada:</label>
                <select
                    value={selectedSeason}
                    onChange={handleSeasonChange}
                    className="w-full md:w-1/3 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Todas las temporadas</option>
                    {seasons.map(season => (
                        <option key={season.id} value={season.id}>
                            {season.name}
                        </option>
                    ))}
                </select>
            </div>
            {loading && (
                <div className="text-center py-4">
                    <p className="text-gray-500">CARGANDO...</p>
                </div>
            )}
            <div className="overflow-x-auto">
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto bg-black bg-opacity-70 text-white border-gray-800 my-2">
                        <thead>
                            <tr>
                                <th className="border px-4 py-2 bg-black text-white">Jugador</th>
                                <th className="border px-4 py-2 bg-black text-white">Equipo</th>
                                <th className="border px-4 py-2 bg-black text-white">Valor</th>
                                <th className="border px-4 py-2 bg-black text-white">Realizado por</th>
                                <th className="border px-4 py-2 bg-black text-white">Horario</th>
                                <th className="border px-4 py-2 bg-black text-white">Acciones</th>
                            </tr>
                        </thead>
                        {!loading && (
                            <tbody>
                                {latestOffers
                                    .filter(
                                        oferta =>
                                            oferta.confirmed === 'no' &&
                                            oferta.active === 'yes' &&
                                            (selectedSeason === '' || oferta.id_season.id === parseInt(selectedSeason))
                                    )
                                    .map(oferta => {
                                        const formattedDate = moment(oferta.created_at).format('DD-MM-YYYY HH:mm:ss');
                                        const hideValues = shouldHideValues(oferta.created_at);
                                        return (
                                            <tr key={oferta.id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-2 text-sm ">{oferta.name}</td>
                                                <td className="px-4 py-2 text-sm ">
                                                    {oferta.id_team && oferta.id_team.name}
                                                </td>
                                                <td className="px-4 py-2 text-sm ">
                                                    {hideValues ? 'Oculto' : oferta.total_value}
                                                </td>
                                                <td className="px-4 py-2 text-sm ">
                                                    {oferta.created_by && oferta.created_by.name}
                                                </td>
                                                <td className="px-4 py-2 text-sm ">{formattedDate}</td>
                                                <td className="px-4 py-2 text-sm ">
                                                    <Link
                                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                                                        to={`/offers/${oferta.id_player.id}`}
                                                    >
                                                        Ofertas
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OffersList;
