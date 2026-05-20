/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../axios";
import { useStateContext } from "../context/ContextProvider";
import moment from "moment";
import 'moment/locale/es';

moment.locale('es');

export default function FixturesList() {
    const [fixtures, setFixtures] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [tournaments, setTournaments] = useState([]);

    const [selectedSeason, setSelectedSeason] = useState('');
    const [selectedTournament, setSelectedTournament] = useState('');
    const [loading, setLoading] = useState(false);

    const { user, setNotification } = useStateContext();
    const isAdmin = user && (user.role === 'Admin' || user.role === 'admin' || user.rol === 'Admin'); // Asegurando compatibilidad con role/rol

    useEffect(() => {
        getSeasons();
    }, []);

    useEffect(() => {
        if (selectedSeason) {
            getTournaments(selectedSeason);
        } else {
            setTournaments([]);
            setSelectedTournament('');
            setFixtures([]);
        }
    }, [selectedSeason]);

    useEffect(() => {
        if (selectedSeason && selectedTournament) {
            getFixtures();
        } else {
            setFixtures([]);
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

    const getTournaments = async (seasonId) => {
        try {
            const response = await axiosClient.get('/tournaments', {
                params: { id_season: seasonId }
            });

            let fetchedTournaments = response.data.data || [];
            fetchedTournaments = Array.from(new Map(fetchedTournaments.map(t => [t.id, t])).values());
            fetchedTournaments.sort((a, b) => a.id - b.id);

            setTournaments(fetchedTournaments);

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
                    id_tournament: selectedTournament
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

    const groupedFixtures = fixtures.reduce((acc, fixture) => {
        const matchday = fixture.matchday || 'Sin Fecha';
        if (!acc[matchday]) acc[matchday] = [];
        acc[matchday].push(fixture);
        return acc;
    }, {});

    const renderMatchCenter = (fixture) => {
        if (fixture.status === 'jugado') {
            return (
                <div className="flex flex-col items-center justify-center px-4">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Final</span>
                    <div className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-1.5 flex items-center gap-3 shadow-inner">
                        {/* Se eliminaron home_goals y away_goals, aquí deberías traer el resultado desde Game si lo necesitas, o dejar un check */}
                        <span className="text-sm font-bold text-emerald-400">JUGADO</span>
                    </div>
                </div>
            );
        }

        if (fixture.status === 'aplazado') {
            return (
                <div className="flex flex-col items-center justify-center px-4 w-24">
                    <span className="bg-red-900/40 text-red-400 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border border-red-800/50">
                        Aplazado
                    </span>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center px-4 w-24">
                <span className="text-lg font-black text-slate-600">VS</span>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-8 animate-fade-in-down pb-20">

            {/* ENCABEZADO UNIFICADO: Título, Temporada, Torneo y Botón */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-8 bg-slate-900/40 p-6 sm:p-8 rounded-3xl border border-slate-700/50 gap-6">

                {/* Izquierda: Título y Temporada */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 w-full xl:w-auto">
                    <h1 className="text-3xl font-black text-indigo-400 tracking-widest uppercase pb-1">
                        Fixture
                    </h1>

                    <div className="flex flex-col w-full sm:w-48 mt-4 sm:mt-0">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                            Temporada
                        </label>
                        <select
                            value={selectedSeason}
                            onChange={(e) => setSelectedSeason(e.target.value)}
                            className="w-full py-2.5 px-4 rounded-lg bg-[#0a0f1d] border border-slate-700 text-white font-bold text-sm outline-none focus:border-indigo-500 transition-colors appearance-none"
                        >
                            <option value="">Seleccionar...</option>
                            {Array.isArray(seasons) && seasons.map(season => (
                                <option key={season.id} value={season.id}>{season.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Derecha: Torneo y Botón Crear */}
                <div className="flex flex-col sm:flex-row items-end gap-4 w-full xl:w-auto">

                    {tournaments.length > 0 && (
                        <div className="flex flex-col w-full sm:w-64">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                                Torneo
                            </label>
                            <select
                                value={selectedTournament || ''}
                                onChange={(e) => setSelectedTournament(Number(e.target.value))}
                                className="w-full py-2.5 px-4 rounded-lg bg-[#0a0f1d] border border-slate-700 text-white font-bold text-sm outline-none focus:border-indigo-500 transition-colors appearance-none"
                            >
                                <option value="">Seleccione...</option>
                                {tournaments.map(tournament => (
                                    <option key={tournament.id} value={tournament.id}>
                                        {tournament.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {isAdmin && (
                        <Link
                            to={`/app/fixture/create`}
                            className="w-full sm:w-auto py-2.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            Programar Partido
                        </Link>
                    )}
                </div>
            </div>

            {/* CONTENIDO DEL FIXTURE */}
            <div className="bg-transparent">
                {loading ? (
                    <div className="flex justify-center items-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
                        <span className="text-slate-400 font-medium">Cargando fixture...</span>
                    </div>
                ) : fixtures.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
                        <p className="text-lg font-medium text-slate-400">No hay partidos programados</p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {/* Iteramos sobre los matchdays ordenados numéricamente */}
                        {Object.keys(groupedFixtures).sort((a, b) => Number(a) - Number(b)).map(matchday => (
                            <div key={matchday} className="bg-slate-900/60 rounded-3xl border border-slate-700/50 overflow-hidden shadow-xl">

                                {/* Título de la Jornada */}
                                <div className="bg-slate-800/80 px-6 py-3 border-b border-slate-700/80">
                                    <h2 className="text-lg font-black text-white uppercase tracking-widest">
                                        Fecha {matchday}
                                    </h2>
                                </div>

                                <div className="flex flex-col divide-y divide-slate-700/50">
                                    {groupedFixtures[matchday].map(fixture => (
                                        <div key={fixture.id} className="relative p-4 hover:bg-slate-800/40 transition-colors group flex flex-col sm:flex-row items-center justify-between gap-4">

                                            {/* INFO DE VENCIMIENTO (Izquierda) */}
                                            <div className="w-full sm:w-1/4 text-center sm:text-left flex flex-col">
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Vencimiento</span>
                                                {fixture.due_date ? (
                                                    <span className="text-xs font-semibold text-amber-400">
                                                        {moment(fixture.due_date).format('dddd DD/MM - HH:mm')}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-semibold text-slate-600">Por definir</span>
                                                )}
                                            </div>

                                            {/* ENCUENTRO CENTRAL */}
                                            <div className="flex-1 flex items-center justify-center w-full">
                                                {/* Local */}
                                                <div className="flex-1 flex justify-end items-center gap-3">
                                                    <span className="font-bold text-white text-sm sm:text-base text-right">
                                                        {fixture.home_team?.name || 'Local'}
                                                    </span>
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-600 font-bold text-slate-400 text-xs sm:text-sm flex-shrink-0">
                                                        {fixture.home_team?.name?.substring(0, 3).toUpperCase() || 'LOC'}
                                                    </div>
                                                </div>

                                                {/* Marcador */}
                                                <div className="mx-2 sm:mx-4 flex-shrink-0">
                                                    {renderMatchCenter(fixture)}
                                                </div>

                                                {/* Visitante */}
                                                <div className="flex-1 flex justify-start items-center gap-3">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-600 font-bold text-slate-400 text-xs sm:text-sm flex-shrink-0">
                                                        {fixture.away_team?.name?.substring(0, 3).toUpperCase() || 'VIS'}
                                                    </div>
                                                    <span className="font-bold text-white text-sm sm:text-base text-left">
                                                        {fixture.away_team?.name || 'Visitante'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* ACCIONES (Derecha) */}
                                            {isAdmin && (
                                                <div className="w-full sm:w-1/4 flex justify-center sm:justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity mt-2 sm:mt-0">
                                                    <Link
                                                        to={`/app/fixtures/edit/${fixture.id}`}
                                                        className="p-2 bg-blue-900/40 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
                                                        title="Editar Partido"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(fixture.id)}
                                                        className="p-2 bg-red-900/40 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                                                        title="Eliminar Partido"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
