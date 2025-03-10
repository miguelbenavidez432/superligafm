/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../axios";
import moment from "moment";
import { useStateContext } from "../context/ContextProvider";

const ConfirmedOffersList = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState('');
    const { user, setNotification } = useStateContext();

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
            const confirmedOffers = response.data.data.filter(oferta => oferta.confirmed === 'yes');
            setOffers(sortOffersByUserName(confirmedOffers));
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

    const sortOffersByUserName = (offers) => {
        return offers.sort((a, b) => {
            const userA = a.created_by.name.toUpperCase();
            const userB = b.created_by.name.toUpperCase();
            if (userA < userB) {
                return -1;
            }
            if (userA > userB) {
                return 1;
            }
            return 0;
        });
    };

    if (user.rol !== 'Admin') {
        return <p>No tienes permiso para ver esta página.</p>;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: "space-between", alignItems: "center" }}>
                <h1><strong>OFERTAS CONFIRMADAS</strong></h1>
            </div>
            <br />
            <div>
                <label>Temporada:</label>
                <select value={selectedSeason} onChange={handleSeasonChange}>
                    <option value="">Todas las temporadas</option>
                    {seasons.map(season => (
                        <option key={season.id} value={season.id}>{season.name}</option>
                    ))}
                </select>
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
                        </tr>
                    </thead>
                    {!loading &&
                        <tbody>
                            {offers.map((oferta) => {
                                const formattedDate = moment(oferta.created_at).format('DD-MM-YYYY HH:mm:ss');
                                return (
                                    <tr key={oferta.id}>
                                        <th>{oferta.name}</th>
                                        <th>{oferta.id_team && oferta.id_team.name}</th>
                                        <th>{oferta.value}</th>
                                        <th>{oferta.other_players}</th>
                                        <th>{oferta.total_value}</th>
                                        <th>{oferta.created_by && oferta.created_by.name}</th>
                                        <th>{formattedDate}</th>
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

export default ConfirmedOffersList;
