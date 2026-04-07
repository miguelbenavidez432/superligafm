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
                    season: selectedSeason || ''
                }
            });
            const confirmedOffers = (response.data?.data || []).filter(oferta => oferta.confirmed === 'yes');
            setOffers(sortOffersByUserName(confirmedOffers));
        } catch (error) {
            console.error('Error al obtener ofertas:', error);
            setNotification('Error al obtener las claúsulas confirmadas');
        } finally {
            setLoading(false);
        }
    };

    const getSeasons = async () => {
        try {
            const response = await axiosClient.get('/season');
            setSeasons(response.data?.data || []);
        } catch (error) {
            console.error('Error al obtener temporadas:', error);
        }
    };

    const handleSeasonChange = (e) => {
        setSelectedSeason(e.target.value);
    };

    const sortOffersByUserName = (offers) => {
        return offers.sort((a, b) => {
            const userA = (a.created_by?.name || '').toUpperCase();
            const userB = (b.created_by?.name || '').toUpperCase();
            if (userA < userB) return -1;
            if (userA > userB) return 1;
            return 0;
        });
    };

    const formatCurrency = (value) => {
        const amount = Number(value) || 0;
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (user?.rol !== 'Admin') {
        return (
            <div className="max-w-7xl mx-auto p-4 sm:p-8 animate-fade-in-down">
                <div className="bg-red-900/30 border border-red-800 rounded-2xl p-6 text-red-300">
                    <p className="font-semibold">No tienes permiso para ver esta página.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 animate-fade-in-down pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-700 shadow-xl">
                <div>
                    <h1 className="font-black text-2xl sm:text-3xl text-white uppercase tracking-wider">Claúsulas Confirmadas</h1>
                    <p className="text-slate-400 mt-1">Historial de rescisiones ejecutadas</p>
                </div>

                <div className="w-full md:w-64">
                    <label className="block text-sm font-semibold text-slate-200 mb-2">Temporada</label>
                    <select
                        value={selectedSeason}
                        onChange={handleSeasonChange}
                        className="w-full p-3 border border-slate-600 rounded-xl bg-slate-950/80 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-medium"
                    >
                        <option value="">Todas las temporadas</option>
                        {seasons.map(season => (
                            <option key={season.id} value={season.id}>{season.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-12 text-center shadow-xl">
                    <div className="inline-flex items-center gap-3">
                        <div className="w-6 h-6 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin"></div>
                        <span className="text-slate-300 font-medium">Cargando claúsulas confirmadas...</span>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && offers.length === 0 && (
                <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-12 text-center shadow-xl">
                    <p className="text-slate-400 font-medium text-lg">No hay claúsulas confirmadas en esta temporada.</p>
                </div>
            )}

            {/* Table */}
            {!loading && offers.length > 0 && (
                <div className="bg-slate-900/80 border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-700 bg-slate-950/50">
                        <p className="text-slate-300 text-sm font-semibold">
                            Total de claúsulas: <span className="text-emerald-400 text-lg font-bold">{offers.length}</span>
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left text-slate-200">
                            <thead className="bg-slate-950 text-slate-400 uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Jugador</th>
                                    <th className="px-6 py-4">Equipo</th>
                                    <th className="px-6 py-4">Valor Base</th>
                                    <th className="px-6 py-4">Adicionales</th>
                                    <th className="px-6 py-4">Valor Total</th>
                                    <th className="px-6 py-4">Realizado por</th>
                                    <th className="px-6 py-4">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {offers.map((oferta, idx) => {
                                    const formattedDate = moment(oferta.created_at).format('DD/MM/YYYY HH:mm');
                                    const playerName = oferta.name || oferta?.player?.name || 'Sin jugador';
                                    const teamName = oferta?.team?.name || 'Sin equipo';
                                    const createdByName = oferta?.created_by?.name || 'Usuario desconocido';

                                    return (
                                        <tr key={oferta.id} className="hover:bg-slate-800/70 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-white">{playerName}</td>
                                            <td className="px-6 py-4 text-slate-300">{teamName}</td>
                                            <td className="px-6 py-4 font-mono text-slate-300">{formatCurrency(oferta.value)}</td>
                                            <td className="px-6 py-4 text-slate-400 text-xs">
                                                {oferta.other_players ? (
                                                    <span className="bg-slate-800/50 px-2 py-1 rounded border border-slate-700">
                                                        {oferta.other_players}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-500">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-emerald-400">{formatCurrency(oferta.total_value)}</td>
                                            <td className="px-6 py-4 text-slate-300 font-medium">{createdByName}</td>
                                            <td className="px-6 py-4 text-slate-400 text-xs">{formattedDate}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConfirmedOffersList;
