/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../axios";
import moment from "moment";

const OffersList = () => {
    const [offers, setOffers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [teams, setTeams] = useState([])

    useEffect(() => {
        axiosClient.get('/clausula_rescision?all=true')
            .then(({ data }) => {
                setOffers(data.data);
            })
            .catch((error) => {
            });
        getUsers();
        getTeam()
    }, []);

    const getTeam = async () => {
        setLoading(true)
        await axiosClient.get('/teams')
            .then(({ data }) => {
                const teamFilter = data.data.filter((t) => t.division === 'Primera' || t.division === 'Segunda')
                setTeams(teamFilter)
            })
            .catch(() => {
                setLoading(false)
            })
    }

    const getUsers = () => {
        setLoading(true);
        axiosClient.get('/users')
            .then(({ data }) => {
                setLoading(false);
                setUsers(data.data);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const checkOffersAvailability = (created_at) => {
        if (created_at) {
            const offerCreatedAt = moment(created_at);
            const expirationDate = offerCreatedAt.add(10, 'hours');
            const currentDate = moment();
            return currentDate.isAfter(expirationDate);
        }
        return false;
    };

    const shouldDisplayValue = (createdAt) => {
        const offerDate = new Date(createdAt);
        const currentDate = new Date();

        // Verificar si la oferta fue creada el mismo día
        const isSameDay = currentDate.toDateString() === offerDate.toDateString();

        // Comparar la hora actual con las 18:00:00
        const specificTime = new Date(offerDate);
        specificTime.setHours(6, 0, 0, 0); // 18:00:00 del día de creación de la oferta

        return !isSameDay || currentDate >= specificTime;
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: "space-between", alignItems: "center" }}>
                <h1><strong>CLÁUSULAS DE RESCISIÓN EJECUTADAS</strong></h1>
                <Link to={`/clausula_rescision`} className="btn-add">Nueva oferta</Link>
            </div>
            <br />
            {loading &&
                <tbody>
                    <tr>
                        <td colSpan="9" className="text-center">
                            CARGANDO...
                        </td>
                    </tr>
                </tbody>
            }
            <div className="card animated fadeInDown">
                <table>
                    <thead>
                        <tr>
                            <th>Jugador</th>
                            <th>Equipo</th>
                            <th>Valor</th>
                            <th>Valor extra</th>
                            <th>Valor Total</th>
                            <th>Realizado por</th>
                            <th>Horario</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    {!loading &&
                        <tbody>
                            {offers
                            .map((oferta) => {
                                const userName = users.find(u => u.id === oferta.created_by);
                                const isOfferAvailable = checkOffersAvailability(oferta.created_at);
                                const teamName = teams.find(t => t.id === oferta.id_team)
                                const userNameToShow = userName ? userName.name : "Usuario no encontrado";
                                const teamNameToShow = teamName ? teamName.name : " ";
                                const formattedDate = moment(oferta.created_at).format('DD-MM-YYYY HH:mm:ss');
                                return (
                                    <tr key={oferta.id}>
                                        <th >{oferta.name}</th>
                                        <th >{teamNameToShow}</th>
                                        <th>{isOfferAvailable ? oferta.value : '??'}</th>
                                        <th>{isOfferAvailable ? oferta.other_players : '??'}</th>
                                        <th>{isOfferAvailable ? oferta.total_value : '??'}</th>
                                        <th>{userNameToShow}</th>
                                        <th>{formattedDate}</th>
                                        <th className="mt-1">
                                            <Link className="btn-edit my-1" to={`/offers/${oferta.id_player}`}>Ofertas</Link>
                                            <br />
                                        </th>
                                    </tr>
                                )
                            })}
                        </tbody>
                    }
                </table>
            </div>
        </div>

        // <div>
        //     <div style={{ display: 'flex', justifyContent: "space-between", alignItems: "center" }}>
        //         <h1><strong>CLÁUSULAS DE RESCISIÓN EJECUTADAS</strong></h1>
        //         <Link to={`/clausula_rescision`} className="btn-add">Nueva oferta</Link>
        //     </div>
        //     <br />
        //     {loading &&
        //         <tbody>
        //             <tr>
        //                 <td colSpan="9" className="text-center">
        //                     CARGANDO...
        //                 </td>
        //             </tr>
        //         </tbody>
        //     }
        //     <div className="card animated fadeInDown">
        //         <table>
        //             <thead>
        //                 <tr>
        //                     <th>Jugador</th>
        //                     <th>Equipo</th>
        //                     <th>Valor</th>
        //                     <th>Valor extra</th>
        //                     <th>Valor Total</th>
        //                     <th>Realizado por</th>
        //                     <th>Horario</th>
        //                     <th>Actions</th>
        //                 </tr>
        //             </thead>
        //             {!loading &&
        //                 <tbody>
        //                     {offers.map((oferta) => {
        //                         const userName = users.find(u => u.id === oferta.created_by);
        //                         const teamName = teams.find(t => t.id === oferta.id_team);
        //                         const userNameToShow = userName ? userName.name : "Usuario no encontrado";
        //                         const teamNameToShow = teamName ? teamName.name : " ";
        //                         const formattedDate = new Date(oferta.created_at).toLocaleString('es-ES', {
        //                             day: '2-digit',
        //                             month: '2-digit',
        //                             year: 'numeric',
        //                             hour: '2-digit',
        //                             minute: '2-digit',
        //                             second: '2-digit',
        //                         });
        //                         return (
        //                             <tr key={oferta.id}>
        //                                 <th>{oferta.name}</th>
        //                                 <th>{teamNameToShow}</th>
        //                                 <th>{shouldDisplayValue(oferta.created_at) ? oferta.value : '??'}</th>
        //                                 <th>{shouldDisplayValue(oferta.created_at) ? oferta.other_players : '??'}</th>
        //                                 <th>{shouldDisplayValue(oferta.created_at) ? oferta.total_value : '??'}</th>
        //                                 <th>{userNameToShow}</th>
        //                                 <th>{formattedDate}</th>
        //                                 <th className="mt-1">
        //                                     <Link className="btn-edit my-1" to={`/offers/${oferta.id_player}`}>Ofertas</Link>
        //                                     <br />
        //                                 </th>
        //                             </tr>
        //                         );
        //                     })}
        //                 </tbody>
        //             }
        //         </table>
        //     </div>
        // </div>
    );
};


export default OffersList;
