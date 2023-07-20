/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../axios";
import { useStateContext } from "../context/ContextProvider";

const OffersList = () => {
    const [offers, setOffers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useStateContext();

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

    return (
        <div>
            <h2>Lista de Ofertas</h2>
            <ul>
                {loading &&
                    <tbody>
                        <tr>
                            <td colSpan="9" className="text-center">
                                CARGANDO...
                            </td>
                        </tr>
                    </tbody>
                }
                {!loading && offers.map((oferta) => {
                    const userName = users.find(u => u.id === oferta.created_by);
                    const userNameToShow = userName ? userName.name : "Usuario no encontrado";
                    console.log(userName)
                    return (
                        <li key={oferta.id}>
                            <br />
                            <span>Usuario: {oferta.name}</span>
                            <br />
                            <span>Monto: ? </span>
                            <br />
                            <span>Jugadores extras: ? </span>
                            <br />
                            <span>Realizada por: {userNameToShow} </span>
                            {/* Mostrar otros detalles de la oferta */}
                            {/* ... */}
                            <Link className="btn-edit" to={`/offers/${oferta.id_player}`}>Ver ofertas</Link>
                            <br />
                        </li>
                    )
                })}
            </ul>
        </div>
    );
};


export default OffersList;
