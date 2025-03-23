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
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">OFERTAS CONFIRMADAS</h1>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Temporada:</label>
                <select
                    value={selectedSeason}
                    onChange={handleSeasonChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                    <option value="">Todas las temporadas</option>
                    {seasons.map(season => (
                        <option key={season.id} value={season.id}>{season.name}</option>
                    ))}
                </select>
            </div>
            {loading && (
                <div className="text-center text-gray-500">CARGANDO...</div>
            )}
            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jugador</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor extra</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Realizado por</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horario</th>
                        </tr>
                    </thead>
                    {!loading && (
                        <tbody className="bg-white divide-y divide-gray-200">
                            {offers.map((oferta) => {
                                const formattedDate = moment(oferta.created_at).format('DD-MM-YYYY HH:mm:ss');
                                return (
                                    <tr key={oferta.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{oferta.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{oferta.id_team && oferta.id_team.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{oferta.value}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{oferta.other_players}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{oferta.total_value}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{oferta.created_by && oferta.created_by.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formattedDate}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    )}
                </table>
            </div>
        </div>
    );
};

export default ConfirmedOffersList;
