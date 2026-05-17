/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */

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

    // Extraemos el 'user' del contexto para poder validar si es Admin
    const { user, setNotification } = useStateContext();

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
            setNotification("Error al cargar las ofertas"); //
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

    // Función para que los Admins eliminen la oferta
    const handleDelete = async (oferta) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar esta oferta de rescisión? Esta acción no se puede deshacer.")) {
            return;
        }

        try {
            await axiosClient.delete(`/clausula_rescision/${oferta.id}`);
            setNotification("Oferta eliminada correctamente");
            getOffers();
        } catch (error) {
            console.error("Error al eliminar:", error);
            setNotification("Error al eliminar la oferta");
        }
    };

    const handleSeasonChange = (e) => {
        setSelectedSeason(e.target.value);
    };

    // LÓGICA DE HORARIOS INTACTA
    const shouldHideValues = (createdAt) => {
        const offerDate = new Date(createdAt);
        const currentDate = new Date();

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
        <div className="max-w-7xl mx-auto p-4 sm:p-8 animate-fade-in-down pb-20">

            {/* ENCABEZADO Y FILTROS */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-700">
                <div className="flex flex-col mb-4 md:mb-0 text-center md:text-left">
                    <h1 className="font-black text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 uppercase tracking-widest mb-1">
                        Cláusulas de Rescisión
                    </h1>
                    <p className="text-slate-400 text-sm font-medium tracking-wide">Registro de ofertas ejecutadas en el mercado</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <select
                        value={selectedSeason}
                        onChange={handleSeasonChange}
                        className="w-full sm:w-auto bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner"
                    >
                        <option value="">Todas las temporadas</option>
                        {seasons && seasons.map(season => (
                            <option key={season.id} value={season.id}>
                                {season.name}
                            </option>
                        ))}
                    </select>

                    <Link
                        to={`/clausula_rescision`}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Nueva oferta
                    </Link>
                </div>
            </div>

            {/* CAJA DE LA TABLA */}
            <div className="bg-slate-900/80 backdrop-blur-md shadow-2xl rounded-3xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950 border-b border-slate-700">
                                <th className="px-6 py-4 text-slate-400 font-bold uppercase text-xs tracking-wider">Jugador</th>
                                <th className="px-6 py-4 text-slate-400 font-bold uppercase text-xs tracking-wider">Equipo</th>
                                <th className="px-6 py-4 text-slate-400 font-bold uppercase text-xs tracking-wider text-center">Valor</th>
                                <th className="px-6 py-4 text-slate-400 font-bold uppercase text-xs tracking-wider">Realizado por</th>
                                <th className="px-6 py-4 text-slate-400 font-bold uppercase text-xs tracking-wider">Horario</th>
                                <th className="px-6 py-4 text-slate-400 font-bold uppercase text-xs tracking-wider text-center">Acciones</th>
                            </tr>
                        </thead>

                        {!loading && (
                            <tbody className="divide-y divide-slate-800/50">
                                {latestOffers
                                    .filter(
                                        oferta =>
                                            oferta.confirmed === 'no' &&
                                            oferta.active === 'yes' &&
                                            (selectedSeason === '' || oferta.id_season?.id === parseInt(selectedSeason))
                                    )
                                    .map(oferta => {
                                        const formattedDate = moment(oferta.created_at).format('DD/MM/YYYY HH:mm');
                                        const hideValues = shouldHideValues(oferta.created_at);

                                        return (
                                            <tr key={oferta.id} className="hover:bg-slate-800/50 transition-colors group">
                                                <td className="px-6 py-4 text-sm font-medium text-white">{oferta.name}</td>
                                                <td className="px-6 py-4 text-sm text-slate-300">
                                                    {oferta.id_team ? oferta.id_team.name : <span className="text-slate-500 italic">Libre</span>}
                                                </td>

                                                {/* Valor Oculto o Visible */}
                                                <td className="px-6 py-4 text-sm text-center">
                                                    {hideValues ? (
                                                        <span className="bg-slate-800 border border-slate-600 text-slate-400 px-3 py-1 rounded-full text-xs font-bold tracking-wide flex items-center justify-center w-max mx-auto gap-1">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                                            Oculto
                                                        </span>
                                                    ) : (
                                                        <span className="bg-emerald-900/30 border border-emerald-800/50 text-emerald-400 px-3 py-1 rounded-full text-xs font-black tracking-wide w-max mx-auto block">
                                                            $ {new Intl.NumberFormat('es-AR').format(oferta.total_value)}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-sm text-slate-300">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                                                            {oferta.created_by?.name?.charAt(0) || '?'}
                                                        </div>
                                                        {oferta.created_by?.name || 'Desconocido'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-400">{formattedDate}</td>

                                                {/* Botones de Acción */}
                                                <td className="px-6 py-4 text-sm text-center">
                                                    <div className="flex justify-center items-center gap-2">
                                                        <Link
                                                            className="bg-indigo-600/20 text-indigo-400 border border-indigo-600/50 px-3 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white transition-all text-xs font-bold"
                                                            to={oferta.id_player ? `/app/offers/${oferta.id_player.id}` : "#"}
                                                        >
                                                            Ver Oferta
                                                        </Link>

                                                        {/* BOTÓN ELIMINAR (Solo Admin) */}
                                                        {/* Asegúrate de que tu context devuelva el rol del usuario para validar aquí. Ej: user?.role === 'Admin' */}
                                                        {user && (user.rol === 'Admin' || user.rol === 'admin') && (
                                                            <button
                                                                onClick={() => handleDelete(oferta)}
                                                                className="bg-red-900/30 text-red-400 border border-red-800/50 p-1.5 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                                                                title="Eliminar Oferta"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        )}
                    </table>

                    {/* ESTADO DE CARGA O VACÍO */}
                    {loading && (
                        <div className="flex justify-center items-center py-12">
                            <div className="flex gap-2 items-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                <span className="ml-2 text-slate-400 font-medium text-sm">Cargando mercado...</span>
                            </div>
                        </div>
                    )}

                    {!loading && latestOffers.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            <svg className="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                            <p>No hay cláusulas ejecutadas en este momento.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OffersList;
