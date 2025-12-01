/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */


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
            const response = await axiosClient.get('/clausula_rescision/public', {
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
            const response = await axiosClient.get('/season/public');
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
                <h1 className="text-2xl font-bold text-center md:text-left mb-4 md:mb-0 bg-slate-800 bg-oppacity-70 rounded text-white p-3">
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
                <label className="block text-sm font-medium mb-2 text-black">Temporada:</label>
                <select
                    value={selectedSeason}
                    onChange={handleSeasonChange}
                    className="w-full md:w-1/3 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-800 text-white"
                >
                    <option value="">Todas las temporadas</option>
                    {seasons && seasons.map(season => (
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
                                            <tr key={oferta.id} className="border-b hover:bg-slate-900">
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
                                                        to={oferta.id_player ? `app/offers/${oferta.id_player.id}` : "#"}
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
    );
};

export default OffersList;
