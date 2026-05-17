/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../axios";
import { useStateContext } from "../context/ContextProvider";
import moment from "moment";

export default function FixturesList() {
    const [fixtures, setFixtures] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [tournaments, setTournaments] = useState([]); // Nuevo estado para los torneos

    const [selectedSeason, setSelectedSeason] = useState('');
    const [selectedTournament, setSelectedTournament] = useState(''); // Reemplaza a selectedDivision
    const [loading, setLoading] = useState(false);

    const { user, setNotification } = useStateContext();
    const isAdmin = user && (user.role === 'Admin' || user.role === 'admin');

    // 1. Cargar las temporadas al montar el componente
    useEffect(() => {
        getSeasons();
    }, []);

    // 2. Si cambia la temporada, buscamos los torneos de esa temporada
    useEffect(() => {
        if (selectedSeason) {
            getTournaments(selectedSeason);
        } else {
            setTournaments([]);
            setSelectedTournament('');
            setFixtures([]);
        }
    }, [selectedSeason]);

    // 3. Si cambia el torneo seleccionado (o la temporada), traemos el fixture
    useEffect(() => {
        if (selectedSeason && selectedTournament) {
            getFixtures();
        } else {
            setFixtures([]); // Limpiamos si no hay torneo seleccionado
        }
    }, [selectedSeason, selectedTournament]);

    const getSeasons = async () => {
        try {
            const response = await axiosClient.get('/season');
            const fetchedSeasons = response.data.data || [];
            setSeasons(fetchedSeasons);

            if (fetchedSeasons.length > 0) {
                const activeSeason = fetchedSeasons.find(s => s.active === 'yes') || fetchedSeasons[0];
                setSelectedSeason(activeSeason.id);
            }
        } catch (error) {
            setNotification("Error al cargar las temporadas");
        }
    };

    // Nuevo método para traer los torneos de la API
    const getTournaments = async (seasonId) => {
        try {
            const response = await axiosClient.get('/tournaments', {
                params: { id_season: seasonId }
            });
            const fetchedTournaments = response.data.data || [];
            setTournaments(fetchedTournaments);

            // Auto-seleccionar el primer torneo de la lista si hay disponibles
            if (fetchedTournaments.length > 0) {
                setSelectedTournament(fetchedTournaments[0].id);
            } else {
                setSelectedTournament('');
            }
        } catch (error) {
            setNotification("Error al cargar los torneos");
        }
    };

    const getFixtures = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/fixtures', {
                params: {
                    id_season: selectedSeason,
                    id_tournament: selectedTournament // Enviamos el ID del torneo
                }
            });
            setFixtures(response.data.data || []);
        } catch (error) {
            setNotification("Error al cargar el fixture");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este partido?")) return;

        try {
            await axiosClient.delete(`/fixtures/${id}`);
            setNotification("Partido eliminado correctamente");
            getFixtures();
        } catch (error) {
            setNotification("Error al eliminar el partido");
        }
    };

    const renderMatchCenter = (fixture) => {
        if (fixture.status === 'jugado') {
            return (
                <div className="flex flex-col items-center justify-center px-4">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Final</span>
                    <div className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 flex items-center gap-3 shadow-inner">
                        <span className="text-2xl font-black text-white">{fixture.home_goals ?? '-'}</span>
                        <span className="text-slate-500 font-bold">-</span>
                        <span className="text-2xl font-black text-white">{fixture.away_goals ?? '-'}</span>
                    </div>
                </div>
            );
        }

        if (fixture.status === 'aplazado') {
            return (
                <div className="flex flex-col items-center justify-center px-4">
                    <span className="bg-red-900/30 border border-red-800/50 text-red-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        Aplazado
                    </span>
                    <span className="text-xl font-bold text-slate-600 mt-2">VS</span>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center px-4 w-32">
                <span className="text-xl font-black text-slate-500 mb-1">VS</span>
                {fixture.due_date ? (
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Vence:</span>
                        <span className="text-xs text-amber-400 font-medium">
                            {moment(fixture.due_date).format('DD/MM HH:mm')}
                        </span>
                    </div>
                ) : (
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Por definir</span>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 animate-fade-in-down pb-20">

            {/* ENCABEZADO Y FILTROS */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-700">
                <div className="flex flex-col mb-4 md:mb-0 text-center md:text-left">
                    <h1 className="font-black text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 uppercase tracking-widest mb-1">
                        Fixture y Resultados
                    </h1>
                    <p className="text-slate-400 text-sm font-medium tracking-wide">Calendario oficial de la Superliga</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <select
                        value={selectedSeason}
                        onChange={(e) => setSelectedSeason(e.target.value)}
                        className="w-full sm:w-auto bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner"
                    >
                        <option value="">Seleccionar temporada</option>
                        {Array.isArray(seasons) && seasons.map(season => (
                            <option key={season.id} value={season.id}>{season.name}</option>
                        ))}
                    </select>

                    {isAdmin && (
                        <Link
                            to={`/app/fixtures/create`}
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            Nuevo Partido
                        </Link>
                    )}
                </div>
            </div>

            {/* PESTAÑAS DE TORNEOS DINÁMICAS */}
            {tournaments.length > 0 && (
                <div className="flex justify-center mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    <div className="bg-slate-900/80 p-1 rounded-2xl flex gap-1 border border-slate-700/50 shadow-lg min-w-max">
                        {tournaments.map(tournament => (
                            <button
                                key={tournament.id}
                                onClick={() => setSelectedTournament(tournament.id)}
                                className={`px-6 sm:px-8 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                                    selectedTournament === tournament.id
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                }`}
                            >
                                {tournament.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* LISTA DE PARTIDOS */}
            <div className="bg-transparent">
                {loading ? (
                    <div className="flex justify-center items-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 backdrop-blur-sm">
                        <div className="flex gap-2 items-center">
                            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
                            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            <span className="ml-3 text-slate-400 font-medium text-sm tracking-wide">Cargando calendario...</span>
                        </div>
                    </div>
                ) : fixtures.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 backdrop-blur-sm">
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-20 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <p className="text-lg font-medium text-slate-300">No hay partidos programados</p>
                        <p className="text-sm text-slate-500 mt-1">
                            {tournaments.length === 0 ? 'No hay torneos disponibles en esta temporada.' : 'El fixture para este torneo aún no ha sido cargado.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {fixtures.map(fixture => (
                            <div key={fixture.id} className="relative bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/80 p-4 hover:border-indigo-500/50 transition-colors shadow-lg group overflow-hidden">

                                {/* Etiqueta de Jornada */}
                                <div className="absolute top-0 left-0 bg-slate-800 text-slate-300 text-[10px] font-black uppercase px-4 py-1 rounded-br-xl border-r border-b border-slate-700">
                                    Fecha {fixture.matchday}
                                </div>

                                <div className="flex items-center justify-between mt-4 md:mt-2">

                                    {/* EQUIPO LOCAL */}
                                    <div className="flex-1 flex justify-end items-center gap-4 text-right">
                                        <span className="font-bold text-white text-sm md:text-base hidden sm:block">
                                            {fixture.home_team?.name || 'Equipo Local'}
                                        </span>
                                        <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-600 font-bold text-slate-400 flex-shrink-0">
                                            {fixture.home_team?.name?.substring(0,3).toUpperCase() || 'LOC'}
                                        </div>
                                    </div>

                                    {/* CENTRO (VS / RESULTADO) */}
                                    <div className="mx-2 md:mx-6 flex-shrink-0">
                                        {renderMatchCenter(fixture)}
                                    </div>

                                    {/* EQUIPO VISITANTE */}
                                    <div className="flex-1 flex justify-start items-center gap-4 text-left">
                                        <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-600 font-bold text-slate-400 flex-shrink-0">
                                            {fixture.away_team?.name?.substring(0,3).toUpperCase() || 'VIS'}
                                        </div>
                                        <span className="font-bold text-white text-sm md:text-base hidden sm:block">
                                            {fixture.away_team?.name || 'Equipo Visitante'}
                                        </span>
                                    </div>
                                </div>

                                {/* ACCIONES DE ADMINISTRADOR */}
                                {isAdmin && (
                                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link
                                            to={`/app/fixtures/edit/${fixture.id}`}
                                            className="p-1.5 bg-blue-900/40 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-colors border border-blue-800/50"
                                            title="Editar Partido"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(fixture.id)}
                                            className="p-1.5 bg-red-900/40 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-colors border border-red-800/50"
                                            title="Eliminar Partido"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
