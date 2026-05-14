/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../axios";
import moment from "moment";
import { useStateContext } from "../context/ContextProvider";

const OffersMade = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState('');
    const { user } = useStateContext();
    const userId = user ? user.id : null; // Protección adicional

    useEffect(() => {
        if (userId) { // Solo ejecutar si hay un usuario válido
            getOffers();
            getSeasons();
        }
    }, [selectedSeason, userId]);

    const getOffers = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/clausula_rescision', {
                params: {
                    season: selectedSeason
                }
            });
            setOffers(response.data.data || []); // Protección adicional
        } catch (error) {
            console.error('Error al obtener ofertas:', error);
            setOffers([]); // Establecer array vacío en caso de error
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
            setSeasons([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSeasonChange = (e) => {
        setSelectedSeason(e.target.value);
    };

    // FIX: Proteger contra created_by nulo y verificar que sea un objeto válido
    const filteredOffers = offers.filter(oferta => {
        // Verificar que oferta existe
        if (!oferta) return false;

        // Verificar que created_by existe y tiene id
        if (!oferta.created_by || typeof oferta.created_by !== 'object') return false;

        // Verificar que created_by.id existe y coincide con userId
        return oferta.created_by.id === userId;
    });

    // Protección adicional: si no hay usuario logueado
    if (!user || !userId) {
        return (
            <div className="max-w-7xl mx-auto p-4 sm:p-8 animate-fade-in-down">
                <div className="bg-amber-900/30 border-l-4 border-amber-500 text-amber-400 p-6 rounded-2xl shadow-xl backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        <div>
                            <h3 className="font-black uppercase tracking-wider">Acceso requerido</h3>
                            <p className="font-medium opacity-80 mt-1">Debes estar logueado para ver tus ofertas realizadas.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 animate-fade-in-down pb-20">

            {/* ENCABEZADO Y FILTROS */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-700">
                <div className="flex flex-col mb-4 md:mb-0 text-center md:text-left">
                    <h1 className="font-black text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 uppercase tracking-widest mb-1">
                        Mis Ofertas Realizadas
                    </h1>
                    <p className="text-slate-400 text-sm font-medium tracking-wide">Control y seguimiento de tus cláusulas ejecutadas</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <select
                        value={selectedSeason}
                        onChange={handleSeasonChange}
                        className="w-full sm:w-auto bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner"
                    >
                        <option value="">Todas las temporadas</option>
                        {seasons.map(season => (
                            <option key={season.id} value={season.id}>{season.name}</option>
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
                                <th className="px-6 py-4 text-slate-400 font-bold uppercase text-xs tracking-wider text-center">Valor Total</th>
                                <th className="px-6 py-4 text-slate-400 font-bold uppercase text-xs tracking-wider">Realizado por</th>
                                <th className="px-6 py-4 text-slate-400 font-bold uppercase text-xs tracking-wider">Horario</th>
                                <th className="px-6 py-4 text-slate-400 font-bold uppercase text-xs tracking-wider text-center">Acciones</th>
                            </tr>
                        </thead>

                        {!loading && (
                            <tbody className="divide-y divide-slate-800/50">
                                {filteredOffers.length > 0 ? filteredOffers.map((oferta) => {
                                    const formattedDate = moment(oferta.created_at).format('DD/MM/YYYY HH:mm');

                                    return (
                                        <tr key={oferta.id} className="hover:bg-slate-800/50 transition-colors group">
                                            <td className="px-6 py-4 text-sm font-medium text-white">
                                                {oferta.name || <span className="italic text-slate-500">Sin nombre</span>}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-slate-300">
                                                {oferta.id_team && oferta.id_team.name ? (
                                                    oferta.id_team.name
                                                ) : (
                                                    <span className="text-slate-500 italic">Libre / Sin equipo</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-center">
                                                <span className="bg-emerald-900/30 border border-emerald-800/50 text-emerald-400 px-3 py-1 rounded-full text-xs font-black tracking-wide w-max mx-auto block">
                                                    $ {oferta.total_value ? new Intl.NumberFormat('es-AR').format(oferta.total_value) : 0}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-sm text-slate-300">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                                                        {(oferta.created_by && oferta.created_by.name) ? oferta.created_by.name.charAt(0) : '?'}
                                                    </div>
                                                    {oferta.created_by && oferta.created_by.name ? oferta.created_by.name : 'Usuario desconocido'}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-sm text-slate-400">{formattedDate}</td>

                                            <td className="px-6 py-4 text-sm text-center">
                                                {oferta.id_player ? (
                                                    <div className="flex justify-center">
                                                        <Link
                                                            className="bg-indigo-600/20 text-indigo-400 border border-indigo-600/50 px-3 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white transition-all text-xs font-bold"
                                                            to={`/app/offers/${oferta.id_player}`}
                                                        >
                                                            Ver Oferta
                                                        </Link>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-500 italic text-xs bg-slate-800 px-2 py-1 rounded">No disponible</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                            <svg className="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                                            <p>{loading ? 'Buscando tus ofertas...' : `No tienes ofertas realizadas${selectedSeason ? ' en esta temporada' : ''}.`}</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        )}
                    </table>

                    {/* ESTADO DE CARGA ANIMADO */}
                    {loading && (
                        <div className="flex justify-center items-center py-12 border-t border-slate-800/50">
                            <div className="flex gap-2 items-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                <span className="ml-2 text-slate-400 font-medium text-sm">Cargando tus datos...</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OffersMade;
