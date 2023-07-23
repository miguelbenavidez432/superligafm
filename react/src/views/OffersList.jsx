/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../axios";
import moment from "moment";

const OffersList = () => {
    const [offers, setOffers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axiosClient.get("/clausula_rescision")
            .then(({ data }) => {
                console.log(data)
                setOffers(data.data);
            })
            .catch((error) => {
            });

        getUsers();
    }, []);

    const getUsers = () => {
        setLoading(true);
        axiosClient.get('/users')
            .then(({ data }) => {
                setLoading(false);
                console.log(data);
                setUsers(data.data);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const checkOffersAvailability = (created_at) => {
        if (created_at) {
          const offerCreatedAt = moment(created_at);
          const expirationDate = offerCreatedAt.add(6, 'hours');
          const currentDate = moment();
          return currentDate.isAfter(expirationDate);
        }
        return false;
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
                            {offers.map((oferta) => {
                                const userName = users.find(u => u.id === oferta.created_by);
                                const isOfferAvailable = checkOffersAvailability(oferta.created_at);
                                const userNameToShow = userName ? userName.name : "Usuario no encontrado";
                                const formattedDate = moment(oferta.created_at).format('DD-MM-YYYY HH:mm:ss');
                                return (
                                    <tr key={oferta.id}>
                                        <th >{oferta.name}</th>
                                        <th>{isOfferAvailable ? oferta.value : '??'}</th>
                                        <th>{isOfferAvailable ? oferta.other_players : '??'}</th>
                                        <th>?</th>
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
    );
};


export default OffersList;