/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import axiosClient from '../axios';
import { useStateContext } from '../context/ContextProvider';

export default function TournamentForm() {
    const [tournament, setTournament] = useState({
        name: '',
        start_date: '',
        end_date: '',
        season_id: '',
        format: '',
        type: '',
    });
    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(false);
    const { setNotification } = useStateContext();

    useEffect(() => {
        axiosClient.get('/season')
            .then(({ data }) => {
                setSeasons(data.data || data);
            })
            .catch(() => {
                setNotification('Error al cargar temporadas');
            });
    }, []);

    const onSubmit = (e) => {
        e.preventDefault();

        if (!tournament.name || !tournament.season_id || !tournament.format || !tournament.type) {
            setNotification('Por favor, completa todos los campos obligatorios.');
            return;
        }

        setLoading(true);
        axiosClient.post('/tournaments/public', tournament)
            .then(() => {
                setLoading(false);
                setNotification('🏆 Torneo creado correctamente');
                setTournament({
                    name: '',
                    start_date: '',
                    end_date: '',
                    season_id: '',
                    format: '',
                    type: '',
                });
            })
            .catch((error) => {
                setLoading(false);
                const errorMsg = error.response?.data?.message || 'Error al crear el torneo';
                setNotification(`Error: ${errorMsg}`);
            });
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8 animate-fade-in-down pb-20">

            {/* ENCABEZADO */}
            <div className="flex flex-col items-center justify-center mb-8 bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-700 text-center">
                <span className="text-4xl sm:text-5xl mb-3 drop-shadow-lg">🏆</span>
                <h1 className="font-black text-2xl sm:text-3xl text-white uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                    Nuevo Torneo
                </h1>
                <p className="text-slate-400 mt-2 font-medium tracking-wide">Configura las propiedades de la competición</p>
            </div>

            <form onSubmit={onSubmit} className="bg-slate-900/80 backdrop-blur-md shadow-2xl rounded-2xl p-6 sm:p-10 border border-slate-700">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">

                    {/* NOMBRE DEL TORNEO */}
                    <div className="md:col-span-2">
                        <label htmlFor="name" className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                            Nombre del Torneo <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            value={tournament.name}
                            onChange={e => setTournament({ ...tournament, name: e.target.value })}
                            placeholder="Ej: Primera División Apertura"
                            type="text"
                            className="w-full p-3 border border-slate-600 rounded-lg bg-slate-800 text-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-inner"
                            required
                        />
                    </div>

                    {/* FECHA DE INICIO */}
                    <div>
                        <label htmlFor="start_date" className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                            Fecha de inicio <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="start_date"
                            value={tournament.start_date}
                            onChange={e => setTournament({ ...tournament, start_date: e.target.value })}
                            type="date"
                            className="w-full p-3 border border-slate-600 rounded-lg bg-slate-800 text-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-inner [color-scheme:dark]"
                            required
                        />
                    </div>

                    {/* FECHA DE FIN */}
                    <div>
                        <label htmlFor="end_date" className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                            Fecha de fin <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="end_date"
                            value={tournament.end_date}
                            onChange={e => setTournament({ ...tournament, end_date: e.target.value })}
                            type="date"
                            className="w-full p-3 border border-slate-600 rounded-lg bg-slate-800 text-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-inner [color-scheme:dark]"
                            required
                        />
                    </div>

                    {/* MODALIDAD (NUEVO: LIGA O COPA) */}
                    <div>
                        <label htmlFor="type" className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                            Modalidad (Tipo) <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="type"
                            value={tournament.type}
                            onChange={e => setTournament({ ...tournament, type: e.target.value })}
                            className="w-full p-3 border border-slate-600 rounded-lg bg-slate-800 text-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-inner cursor-pointer"
                            required
                        >
                            <option value='' disabled>Seleccionar Modalidad...</option>
                            <option value='league'>Formato Liga (Puntos)</option>
                            <option value='cup'>Formato Copa (Eliminatoria)</option>
                        </select>
                    </div>

                    {/* FORMATO ESPECÍFICO */}
                    <div>
                        <label htmlFor="format" className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                            Competición <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="format"
                            value={tournament.format}
                            onChange={e => setTournament({ ...tournament, format: e.target.value })}
                            className="w-full p-3 border border-slate-600 rounded-lg bg-slate-800 text-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-inner cursor-pointer"
                            required
                        >
                            <option value='' disabled>Seleccionar Competición...</option>
                            <option value='PD'>Primera División (PD)</option>
                            <option value='SD'>Segunda División (SD)</option>
                            <option value='UCL'>Champions League (UCL)</option>
                            <option value='UEL'>Europa League (UEL)</option>
                            <option value='CopaFM'>Copa FM</option>
                        </select>
                    </div>

                    {/* TEMPORADA */}
                    <div className="md:col-span-2">
                        <label htmlFor="season_id" className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                            Temporada Asignada <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="season_id"
                            value={tournament.season_id}
                            onChange={e => setTournament({ ...tournament, season_id: e.target.value })}
                            className="w-full p-3 border border-slate-600 rounded-lg bg-slate-800 text-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-inner cursor-pointer"
                            required
                        >
                            <option value='' disabled>Seleccionar Temporada...</option>
                            {seasons && seasons.length > 0 ? (
                                seasons.map(season => (
                                    <option key={season.id} value={season.id}>
                                        {season.name} {season.active === 'yes' ? '⭐ (Activa)' : ''}
                                    </option>
                                ))
                            ) : (
                                <option value='' disabled>Cargando temporadas...</option>
                            )}
                        </select>
                    </div>
                </div>

                {/* BOTÓN SUBMIT */}
                <div className="mt-10 border-t border-slate-700 pt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-white uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
                            loading
                            ? 'bg-slate-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(52,211,238,0.4)]'
                        }`}
                    >
                        {loading ? (
                            <>
                                <div className="loader inline-block border-2 border-slate-300 border-t-white rounded-full w-5 h-5 animate-spin"></div>
                                Guardando...
                            </>
                        ) : (
                            '💾 Crear Torneo'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
