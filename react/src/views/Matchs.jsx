import { useState, useEffect } from 'react';
import axiosClient from '../axios';
import { Link } from 'react-router-dom';
import { useStateContext } from '../context/ContextProvider';

export default function Matches() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const { setNotification, user } = useStateContext();
    const [tournaments, setTournaments] = useState([]);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        axiosClient.get('/matches')
            .then(({ data }) => {
                setMatches(data.data);
                setLoading(false);
                getTournaments();
            })
            .catch(() => {
                setLoading(false);
            });
    }, [creating]);

    const getTournaments = () => {
        axiosClient.get('/tournaments')
            .then(({ data }) => {
                setTournaments(data.data);
            })
            .catch(() => {
                setLoading(false);
            });
    }

    const onUpdate = (match) => {
        if (!window.confirm('¿Estás seguro que quieres habilitar la edición de este partido?')) {
            return
        }

        axiosClient.put(`/games/${match}/enable-edit`)
            .then(() => {
                setNotification('Partido habilitado para editar');
                axiosClient.get('/matches?all=true')
                    .then(({ data }) => {
                        setMatches(data.data);
                    });
                setCreating(false);
            })
            .catch(err => {
                const response = err.response;
                if (response && response.status === 422) {
                    setMessage(response.data.errors);
                }
                setCreating(false);
            });
    }

    const formatStage = (currentStage, format) => {
        if (format === 'PD') {
            switch (currentStage) {
                case 14: return "Playin";
                case 15: return "Cuartos de Final";
                case 16: return "Semifinal";
                case 17: return "Final";
                default: return `Fecha ${currentStage}`;
            }
        }

        if (format === 'SD') {
            switch (currentStage) {
                case 14: return "Cuartos de Final";
                case 15: return "Semifinal";
                case 18: return "Final";
                default: return `Fecha ${currentStage}`;
            }
        }

        if (format === 'UCL') {
            switch (currentStage) {
                case 4: return "Cuartos de Final";
                case 5: return "Semifinal";
                case 6: return "Semifinal";
                case 7: return "Final";
                default: return `Fecha ${currentStage}`;
            }
        }

        if (format === 'UEL') {
            switch (currentStage) {
                case 1: return "Octavos de Final";
                case 2: return "Cuartos de Final";
                case 3: return "Semifinal";
                case 4: return "Final";
                default: return `Ronda ${currentStage}`;
            }
        }

        if (format === 'CFM') {
            switch (currentStage) {
                case 1: return "1° Ronda";
                case 2: return "Octavos de Final";
                case 3: return "Cuartos de Final";
                case 4: return "Semifinal";
                case 5: return "Final";
                default: return `Ronda ${currentStage}`;
            }
        }

        return currentStage;
    };

    return (
        <div className="max-w-7xl mx-auto p-2 sm:p-4 animate-fade-in-down">

            {/* ENCABEZADO */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-white bg-slate-900/80 backdrop-blur-md border border-slate-700 px-6 py-3 rounded-xl shadow-lg w-full sm:w-auto text-center">
                    ⚽ Calendario y Resultados
                </h1>

                <Link
                    to="/app/cargar-imagenes"
                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                    ➕ Crear Nuevo Partido
                </Link>
            </div>

            {/* ALERTAS */}
            {message && (
                <div className="bg-red-900/50 backdrop-blur-md border border-red-500 text-red-200 p-4 rounded-xl mb-6 shadow-lg text-sm">
                    {Object.keys(message).map(key => (
                        <p key={key}>• {message[key][0]}</p>
                    ))}
                </div>
            )}

            {/* CONTENIDO */}
            {loading ? (
                <div className="flex justify-center items-center py-20 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl shadow-lg">
                    <p className="font-bold text-gray-400 animate-pulse text-lg">Cargando partidos...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {tournaments.map(tournament => {
                        // 1. Obtenemos todos los partidos del torneo
                        const tournamentMatches = matches.filter(match => match.tournament?.id == tournament.id);

                        // 2. Agrupamos los partidos por etapa (stage)
                        const groupedByStage = tournamentMatches.reduce((acc, match) => {
                            if (!acc[match.stage]) acc[match.stage] = [];
                            acc[match.stage].push(match);
                            return acc;
                        }, {});

                        // 3. Ordenamos las etapas de mayor a menor (para ver la fecha más reciente primero)
                        const sortedStages = Object.keys(groupedByStage).sort((a, b) => b - a);

                        return (
                            <details key={tournament.id} className="group/tour bg-slate-900/70 backdrop-blur-md border border-slate-700 rounded-xl shadow-lg overflow-hidden transition-all duration-300">
                                {/* CABECERA DEL ACORDEÓN PRINCIPAL (TORNEO) */}
                                <summary className="cursor-pointer list-none p-4 flex justify-between items-center bg-slate-800/80 hover:bg-slate-700/80 transition-colors">
                                    <h2 className="text-lg sm:text-xl font-bold text-blue-400 flex items-center gap-2">
                                        🏆 {tournament.name}
                                    </h2>
                                    <div className="text-slate-400 group-open/tour:rotate-180 transition-transform duration-300 bg-slate-900 border border-slate-600 rounded-full w-8 h-8 flex items-center justify-center text-xs">
                                        ▼
                                    </div>
                                </summary>

                                <div className="p-3 sm:p-5 bg-slate-950/50 border-t border-slate-700 flex flex-col gap-3">
                                    {sortedStages.length > 0 ? (
                                        sortedStages.map((stage, index) => (
                                            /* ACORDEÓN SECUNDARIO (POR FECHA/ETAPA) */
                                            /* Abrimos solo la primera fecha (la más reciente) por defecto */
                                            <details key={stage} className="group/stage bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden" open={index === 0}>

                                                <summary className="cursor-pointer list-none px-4 py-2.5 flex justify-between items-center bg-slate-800 hover:bg-slate-700 transition-colors border-b border-slate-700/50">
                                                    <span className="text-gray-300 font-bold text-sm tracking-wider uppercase">
                                                        📅 {formatStage(Number(stage), tournament.format)}
                                                    </span>
                                                    <span className="text-slate-500 group-open/stage:rotate-180 transition-transform duration-200 text-xs">
                                                        ▼
                                                    </span>
                                                </summary>

                                                <div className="p-2 sm:p-3 flex flex-col gap-2">
                                                    {groupedByStage[stage].map(match => (

                                                        /* TARJETA DE PARTIDO COMPACTA */
                                                        <div key={match.id} className="bg-slate-900/80 hover:bg-slate-800 transition-colors border border-slate-700 rounded-lg p-2.5 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">

                                                            {/* EQUIPOS Y MARCADOR */}
                                                            <div className="flex-1 flex items-center justify-center md:justify-start w-full gap-2 sm:gap-4">
                                                                <div className="flex-1 text-right text-white font-bold text-xs sm:text-sm truncate">
                                                                    {match.team_home?.name}
                                                                </div>

                                                                <div className="shrink-0 bg-slate-950 border border-slate-600 px-3 py-1.5 rounded-lg text-center shadow-inner min-w-[70px]">
                                                                    {match.status === 'completed' ? (
                                                                        <span className="text-yellow-400 font-black text-sm tracking-widest">
                                                                            {match.score_home} - {match.score_away}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-gray-500 font-black text-xs tracking-widest uppercase">
                                                                            VS
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div className="flex-1 text-left text-white font-bold text-xs sm:text-sm truncate">
                                                                    {match.team_away?.name}
                                                                </div>
                                                            </div>

                                                            {/* BOTONES DE ACCIÓN COMPACTOS */}
                                                            <div className="w-full md:w-auto flex justify-center gap-2 shrink-0">
                                                                {match.status === 'completed' ? (
                                                                    <Link
                                                                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md text-xs font-bold shadow transition-colors flex-1 md:flex-none text-center"
                                                                        to={`/app/partidos/${match.id}`}
                                                                    >
                                                                        👁️ Ver
                                                                    </Link>
                                                                ) : (
                                                                    <Link
                                                                        className="bg-orange-500 hover:bg-orange-400 text-white px-3 py-1.5 rounded-md text-xs font-bold shadow transition-colors flex-1 md:flex-none text-center"
                                                                        to={`/app/partidos/${match.id}`}
                                                                    >
                                                                        📝 Cargar
                                                                    </Link>
                                                                )}

                                                                {user?.rol === 'Admin' && (
                                                                    <button
                                                                        className="bg-slate-800 hover:bg-red-600 text-red-400 hover:text-white border border-red-800 hover:border-red-600 px-2 py-1.5 rounded-md text-xs font-bold shadow transition-colors flex items-center justify-center"
                                                                        onClick={() => onUpdate(match.id)}
                                                                        title="Habilitar Edición"
                                                                    >
                                                                        🔓
                                                                    </button>
                                                                )}
                                                            </div>

                                                        </div>
                                                    ))}
                                                </div>
                                            </details>
                                        ))
                                    ) : (
                                        <div className="text-center py-6">
                                            <p className="text-slate-500 italic text-sm">No hay partidos disponibles para este torneo.</p>
                                        </div>
                                    )}
                                </div>
                            </details>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
