/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import axiosClient from "../axios";
import { useStateContext } from "../context/ContextProvider";
import moment from "moment"; // Agregado para formatear la fecha igual que en las ofertas

export default function TransferList() {
    const [transfers, setTransfers] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState('');
    const [loading, setLoading] = useState(true);
    const { setNotification } = useStateContext();

    useEffect(() => {
        getTransfers();
        getSeasons();
    }, []);

    useEffect(() => {
        if (selectedSeason) {
            filterTransfersBySeason(selectedSeason);
        } else {
            getTransfers();
        }
    }, [selectedSeason]);

    const getTransfers = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/traspasos');
            setTransfers(response.data.data || []);
        } catch (error) {
            setNotification({ message: 'Error al obtener transferencias: ' + error.message, type: 'error' });
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
            setNotification({ message: 'Error al obtener temporadas: ' + error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const filterTransfersBySeason = async (seasonId) => {
        setLoading(true);
        try {
            const response = await axiosClient.get(`/traspasos?season=${seasonId}`);
            setTransfers(response.data.data || []);
        } catch (error) {
            setNotification({ message: 'Error al filtrar transferencias: ' + error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 animate-fade-in-down pb-20">

            {/* ENCABEZADO Y FILTROS */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-700">
                <div className="flex flex-col mb-4 md:mb-0 text-center md:text-left">
                    <h1 className="font-black text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 uppercase tracking-widest mb-1">
                        Historial de Traspasos
                    </h1>
                    <p className="text-slate-400 text-sm font-medium tracking-wide">Registro general de movimientos en el mercado</p>
                </div>

                <div className="w-full md:w-auto">
                    <label htmlFor="season" className="sr-only">Filtrar por temporada</label>
                    <select
                        id="season"
                        value={selectedSeason}
                        onChange={(e) => setSelectedSeason(e.target.value)}
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
                {/* CARDS MOBILE */}
                {!loading && (
                    <div className="md:hidden divide-y divide-slate-800/50">
                        {Array.isArray(transfers) && transfers.length > 0 ? (
                            transfers.map(p => {
                                const teamFromName = p.team_from?.name ? p.team_from.name.substring(0, 15) : 'Sin equipo';
                                const teamToName = p.team_to?.name ? p.team_to.name.substring(0, 15) : 'Sin equipo';
                                const createdByName = p.created_by?.name || 'Desconocido';
                                const formattedDate = moment(p.created_at).format('DD/MM/YYYY HH:mm');
                                const isConfirmed = p.confirmed?.toLowerCase() === 'si';

                                return (
                                    <div key={p.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                                        <div className="font-medium text-white text-sm mb-2 leading-snug">
                                            {p.transferred_players}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-2">
                                            <span className="truncate max-w-[100px]">{teamFromName}</span>
                                            <svg className="w-3 h-3 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                            <span className="truncate max-w-[100px] font-bold text-white">{teamToName}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {p.budget > 0 ? (
                                                    <span className="bg-emerald-900/30 border border-emerald-800/50 text-emerald-400 px-2 py-0.5 rounded-full text-xs font-black">
                                                        $ {new Intl.NumberFormat('es-AR').format(p.budget)}
                                                    </span>
                                                ) : (
                                                    <span className="bg-slate-800 border border-slate-600 text-slate-400 px-2 py-0.5 rounded-full text-xs font-bold">
                                                        Gratis / Trueque
                                                    </span>
                                                )}
                                                <span className="text-xs text-slate-500">{formattedDate}</span>
                                            </div>
                                            {isConfirmed ? (
                                                <span className="bg-blue-900/30 border border-blue-800/50 text-blue-400 px-2 py-0.5 rounded text-xs font-bold">Confirmada</span>
                                            ) : (
                                                <span className="bg-amber-900/30 border border-amber-800/50 text-amber-400 px-2 py-0.5 rounded text-xs font-bold">Pendiente</span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="px-6 py-12 text-center text-slate-500">
                                <p>No se encontraron transferencias en esta temporada.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* TABLA DESKTOP */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950 border-b border-slate-700">
                                <th className="px-6 py-4 text-slate-400 font-bold uppercase text-xs tracking-wider">Jugadores Transferidos</th>
                                <th className="px-6 py-4 text-slate-400 font-bold uppercase text-xs tracking-wider">Operación (De → Hacia)</th>
                                <th className="px-6 py-4 text-slate-400 font-bold uppercase text-xs tracking-wider text-center">Valor</th>
                                <th className="px-6 py-4 text-slate-400 font-bold uppercase text-xs tracking-wider">Creado por</th>
                                <th className="px-6 py-4 text-slate-400 font-bold uppercase text-xs tracking-wider">Fecha</th>
                                <th className="px-6 py-4 text-slate-400 font-bold uppercase text-xs tracking-wider text-center">Estado</th>
                            </tr>
                        </thead>

                        {!loading && (
                            <tbody className="divide-y divide-slate-800/50">
                                {Array.isArray(transfers) && transfers.length > 0 ? (
                                    transfers.map(p => {
                                        const teamFromName = p.team_from?.name ? p.team_from.name.substring(0, 15) : 'Sin equipo';
                                        const teamToName = p.team_to?.name ? p.team_to.name.substring(0, 15) : 'Sin equipo';
                                        const createdByName = p.created_by?.name || 'Desconocido';
                                        const formattedDate = moment(p.created_at).format('DD/MM/YYYY HH:mm');
                                        const isConfirmed = p.confirmed?.toLowerCase() === 'si';

                                        return (
                                            <tr key={p.id} className="hover:bg-slate-800/50 transition-colors group">

                                                {/* Jugadores */}
                                                <td className="px-6 py-4 text-sm font-medium text-white max-w-xs truncate" title={p.transferred_players}>
                                                    {p.transferred_players}
                                                </td>

                                                {/* Operación (Equipos) */}
                                                <td className="px-6 py-4 text-sm text-slate-300">
                                                    <div className="flex items-center gap-2">
                                                        <span className="truncate max-w-[100px]">{teamFromName}</span>
                                                        <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                                        <span className="truncate max-w-[100px] font-bold text-white">{teamToName}</span>
                                                    </div>
                                                </td>

                                                {/* Valor */}
                                                <td className="px-6 py-4 text-sm text-center">
                                                    {p.budget > 0 ? (
                                                        <span className="bg-emerald-900/30 border border-emerald-800/50 text-emerald-400 px-3 py-1 rounded-full text-xs font-black tracking-wide w-max mx-auto block">
                                                            $ {new Intl.NumberFormat('es-AR').format(p.budget)}
                                                        </span>
                                                    ) : (
                                                        <span className="bg-slate-800 border border-slate-600 text-slate-400 px-3 py-1 rounded-full text-xs font-bold tracking-wide w-max mx-auto block">
                                                            Gratis / Trueque
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Creador */}
                                                <td className="px-6 py-4 text-sm text-slate-300">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white uppercase flex-shrink-0">
                                                            {createdByName.charAt(0)}
                                                        </div>
                                                        <span className="truncate max-w-[120px]">{createdByName}</span>
                                                    </div>
                                                </td>

                                                {/* Fecha */}
                                                <td className="px-6 py-4 text-sm text-slate-400 whitespace-nowrap">
                                                    {formattedDate}
                                                </td>

                                                {/* Estado (Confirmada) */}
                                                <td className="px-6 py-4 text-sm text-center">
                                                    {isConfirmed ? (
                                                        <span className="inline-flex items-center gap-1.5 bg-blue-900/30 border border-blue-800/50 text-blue-400 px-2.5 py-1 rounded-md text-xs font-bold">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                            Confirmada
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 bg-amber-900/30 border border-amber-800/50 text-amber-400 px-2.5 py-1 rounded-md text-xs font-bold">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                            Pendiente
                                                        </span>
                                                    )}
                                                </td>

                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                            <svg className="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                                            <p>No se encontraron transferencias en esta temporada.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        )}
                    </table>
                </div>

                {/* ESTADO DE CARGA ANIMADO */}
                {loading && (
                    <div className="flex justify-center items-center py-12 border-t border-slate-800/50">
                        <div className="flex gap-2 items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            <span className="ml-2 text-slate-400 font-medium text-sm">Cargando traspasos...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
