/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import axiosClient from "../axios";
import { useStateContext } from "../context/ContextProvider";
import { Link } from 'react-router-dom';

export default function AuctionsList() {
    const [auctions, setAuctions] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState('');
    const [loading, setLoading] = useState(true);
    const { user } = useStateContext();

    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        };
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', options);
    };

    useEffect(() => {
        getSeasons();
    }, []);

    // Actualizado: Se separó getAuctions para que dependa correctamente de la temporada
    useEffect(() => {
        getAuctions();
    }, [selectedSeason]);

    const getSeasons = async () => {
        try {
            const response = await axiosClient.get('/season');
            setSeasons(response.data.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const getAuctions = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/auction/last', {
                params: {
                    id_season: selectedSeason
                }
            });
            setAuctions(response.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSeasonChange = (e) => {
        setSelectedSeason(e.target.value);
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 animate-fade-in-down pb-20">

            {/* ENCABEZADO Y FILTROS */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-700">
                <div className="flex flex-col mb-4 md:mb-0 text-center md:text-left">
                    <h1 className="font-black text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 uppercase tracking-widest mb-1">
                        Subastas Activas
                    </h1>
                    <p className="text-slate-400 text-sm font-medium tracking-wide">Mercado en tiempo real. ¡Supera la última puja!</p>
                </div>

                <div className="w-full md:w-auto">
                    <label htmlFor="season" className="sr-only">Filtrar por temporada</label>
                    <select
                        id="season"
                        value={selectedSeason}
                        onChange={handleSeasonChange}
                        className="w-full sm:w-auto bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner"
                    >
                        <option value="">Todas las temporadas</option>
                        {Array.isArray(seasons) && seasons.map(season => (
                            <option key={season.id} value={season.id}>{season.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* CAJA DE LA TABLA */}
            <div className="bg-slate-900/80 backdrop-blur-md shadow-2xl rounded-3xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950 border-b border-slate-700">
                                <th className="px-6 py-4 text-slate-400 font-bold uppercase text-xs tracking-wider">Jugador</th>
                                <th className="px-6 py-4 text-slate-400 font-bold uppercase text-xs tracking-wider text-center">Valor de Puja</th>
                                <th className="px-6 py-4 text-slate-400 font-bold uppercase text-xs tracking-wider">Último Postor</th>
                                <th className="px-6 py-4 text-slate-400 font-bold uppercase text-xs tracking-wider">Última Actividad</th>
                                <th className="px-6 py-4 text-slate-400 font-bold uppercase text-xs tracking-wider text-center">Acciones</th>
                            </tr>
                        </thead>

                        {!loading && (
                            <tbody className="divide-y divide-slate-800/50">
                                {Array.isArray(auctions) && auctions.length > 0 ? (
                                    auctions.map(auction => {
                                        // Intentamos buscar el nombre del mánager en diferentes posibles relaciones del backend
                                        const lastBidderName = auction.auctioned_by?.name || auction.auctioneer?.name || 'Precio Base';

                                        return (
                                            <tr key={auction.id} className="hover:bg-slate-800/50 transition-colors group">

                                                {/* Jugador */}
                                                <td className="px-6 py-4 text-sm font-medium text-white">
                                                    <Link to={`/app/players/${auction.player?.id}`}>
                                                        {auction.player ? auction.player.name : <span className="text-slate-500 italic">Desconocido</span>}
                                                    </Link>
                                                </td>

                                                {/* Valor Actual */}
                                                <td className="px-6 py-4 text-sm text-center">
                                                    <span className="bg-emerald-900/30 border border-emerald-800/50 text-emerald-400 px-3 py-1 rounded-full text-xs font-black tracking-wide w-max mx-auto block">
                                                        $ {new Intl.NumberFormat('es-AR').format(auction.amount)}
                                                    </span>
                                                </td>

                                                {/* Último Postor (El Manager) */}
                                                <td className="px-6 py-4 text-sm text-slate-300">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase flex-shrink-0 ${lastBidderName === 'Precio Base' ? 'bg-slate-700' : 'bg-indigo-600'}`}>
                                                            {lastBidderName === 'Precio Base' ? '-' : lastBidderName.charAt(0)}
                                                        </div>
                                                        <span className={`truncate max-w-[150px] ${lastBidderName === 'Precio Base' ? 'text-slate-500 italic' : 'font-semibold text-indigo-300'}`}>
                                                            {lastBidderName}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Fecha */}
                                                <td className="px-6 py-4 text-sm text-slate-400 whitespace-nowrap">
                                                    {formatDate(auction.created_at)}
                                                </td>

                                                {/* Acción */}
                                                <td className="px-6 py-4 text-sm text-center">
                                                    <div className="flex justify-center">
                                                        <Link
                                                            to={`/app/subastas/${auction.id_player}`}
                                                            className="bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/50 px-4 py-2 rounded-xl transition-all text-xs font-bold shadow-lg shadow-blue-900/20 flex items-center gap-2"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                            Pujar
                                                        </Link>
                                                    </div>
                                                </td>

                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                                                <p className="text-lg font-medium text-slate-400">No hay subastas activas</p>
                                                <p className="text-sm mt-1">Selecciona otra temporada o espera a que se inicie un nuevo periodo de pujas.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        )}
                    </table>

                    {/* ESTADO DE CARGA ANIMADO */}
                    {loading && (
                        <div className="flex justify-center items-center py-16 border-t border-slate-800/50">
                            <div className="flex gap-2 items-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                <span className="ml-3 text-slate-400 font-medium text-sm tracking-wide">Analizando el mercado...</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
