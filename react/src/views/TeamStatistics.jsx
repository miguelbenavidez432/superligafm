/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../axios";

const TeamStatistics = () => {
    const { team_id } = useParams();
    const [processedStats, setProcessedStats] = useState({});
    const [loading, setLoading] = useState(false);
    const [teamName, setTeamName] = useState("Cargando Equipo..."); // Opcional: Para mostrar el nombre si viene en la API

    useEffect(() => {
        fetchStatistics();
    }, [team_id]);

    const fetchStatistics = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get(`/match-statistics/team/${team_id}`);
            // Si tu API devuelve el nombre del equipo en el primer registro, lo guardamos para el título
            if (response.data.data && response.data.data.length > 0) {
                setTeamName(response.data.data[0]?.team_id?.name || "Estadísticas del Equipo");
            }
            processPlayerStats(response.data.data);
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatName = (format) => {
        switch (format) {
            case "PD": return "Primera División";
            case "SD": return "Segunda División";
            case "UCL": return "Champions League";
            case "UEL": return "Europa League";
            case "CFM": return "Copa FM";
            default: return format;
        }
    };

    const formatStage = (currentStage, format) => {
        if (format === 'PD') {
            switch (currentStage) {
                case 14: return "Playin";
                case 15: return "Cuartos";
                case 16: return "Semifinal";
                case 17: return "Final";
                default: return `F${currentStage}`;
            }
        }
        if (format === 'SD') {
            switch (currentStage) {
                case 14: return "Cuartos";
                case 15: return "Semifinal";
                case 18: return "Final";
                default: return `F${currentStage}`;
            }
        }
        if (format === 'UCL') {
            switch (currentStage) {
                case 4: return "Cuartos";
                case 5: return "Semifinal";
                case 6: return "Final";
                default: return `F${currentStage}`;
            }
        }
        if (format === 'UEL') {
            switch (currentStage) {
                case 1: return "Octavos";
                case 2: return "Cuartos";
                case 3: return "Semifinal";
                case 4: return "Final";
                default: return `F${currentStage}`;
            }
        }
        if (format === 'CFM') {
            switch (currentStage) {
                case 1: return "1° Ronda";
                case 2: return "Octavos";
                case 3: return "Cuartos";
                case 4: return "Semifinal";
                case 5: return "Final";
                default: return `F${currentStage}`;
            }
        }
        return `F${currentStage}`;
    };

    const processPlayerStats = (data) => {
        const tournaments = {};

        data.forEach(stat => {
            const format = stat.tournament_id?.format || 'Desconocido';
            const playerId = stat.player_id?.id;
            const currentStage = Number(stat.match_id?.stage || 0);

            if (!tournaments[format]) {
                tournaments[format] = {
                    players: {},
                    maxStage: 0 // Registramos cuál fue la fecha más alta jugada en este torneo
                };
            }

            // Actualizamos el stage máximo para saber cuántas columnas dibujar
            tournaments[format].maxStage = Math.max(tournaments[format].maxStage, currentStage);

            if (!tournaments[format].players[playerId]) {
                tournaments[format].players[playerId] = {
                    player: stat.player_id?.name || 'Desconocido',
                    total_yellow_cards: 0,
                    total_red_cards: 0,
                    total_simple_injuries: 0,
                    total_serious_injuries: 0,
                    last_stage: 0,
                    total_assists: 0,
                    total_goals: 0,
                    suspension: new Set(),
                    stages: {} // 🔥 NUEVO: Guardamos qué pasó en CADA fecha
                };
            }

            const playerStats = tournaments[format].players[playerId];

            // --- INICIO: Llenado de datos por fecha (Stage) ---
            if (!playerStats.stages[currentStage]) {
                playerStats.stages[currentStage] = { goals: 0, assists: 0, yellow: 0, red: 0, simple_inj: 0, serious_inj: 0 };
            }
            playerStats.stages[currentStage].goals += Number(stat.goals || 0);
            playerStats.stages[currentStage].assists += Number(stat.assists || 0);
            playerStats.stages[currentStage].yellow += Number(stat.yellow_cards || 0);
            playerStats.stages[currentStage].red += Number(stat.red_cards || 0);
            playerStats.stages[currentStage].simple_inj += Number(stat.simple_injuries || 0);
            playerStats.stages[currentStage].serious_inj += Number(stat.serious_injuries || 0);
            // --- FIN: Llenado de datos por fecha ---

            // Totales globales
            playerStats.total_goals += Number(stat.goals || 0);
            playerStats.total_assists += Number(stat.assists || 0);
            playerStats.total_yellow_cards += Number(stat.yellow_cards || 0);
            playerStats.total_red_cards += Number(stat.red_cards || 0);
            playerStats.total_simple_injuries += Number(stat.simple_injuries || 0);
            playerStats.total_serious_injuries += Number(stat.serious_injuries || 0);
            playerStats.last_stage = Math.max(playerStats.last_stage, currentStage);

            // --- INICIO: Tu lógica original de suspensiones intacta ---
            if (format === 'UCL' || format === 'UEL' || format === 'CFM') {
                format === 'UCL' && currentStage === 5 ? stat.yellow_cards = 0 : null;
                format === 'UEL' && currentStage === 3 ? stat.yellow_cards = 0 : null;
                format === 'CFM' && currentStage === 4 ? stat.yellow_cards = 0 : null;
                if (Number(stat.yellow_cards) > 0 && playerStats.total_yellow_cards % 2 === 0) {
                    playerStats.suspension.add(currentStage + 1); // 🔥 Cambio clave: Guardo el NÚMERO del stage, es más fácil de comparar
                }
                if (Number(stat.yellow_cards) > 0 && playerStats.total_yellow_cards % 4 === 0) {
                    playerStats.suspension.add(currentStage + 2);
                }
            }
            if (Number(stat.yellow_cards) > 0 && playerStats.total_yellow_cards % 3 === 0) {
                playerStats.suspension.add(currentStage + 1);
            }
            if (Number(stat.yellow_cards) > 0 && playerStats.total_yellow_cards % 6 === 0) {
                playerStats.suspension.add(currentStage + 1);
                playerStats.suspension.add(currentStage + 2);
            }
            if (Number(stat.simple_injuries) > 0) {
                playerStats.suspension.add(currentStage + 1);
            }
            if (Number(stat.serious_injuries) > 0) {
                playerStats.suspension.add(currentStage + 1);
                playerStats.suspension.add(currentStage + 2);
            }
            if (Number(stat.red_cards) > 0) {
                if (stat.direct_red === 'yes') {
                    playerStats.suspension.add(currentStage + 1);
                    playerStats.suspension.add(currentStage + 2);
                } else {
                    playerStats.suspension.add(currentStage + 1);
                }
            }
            // --- FIN: Lógica de suspensiones ---
        });

        // Convertir Sets a Arrays para mostrar en React
        Object.keys(tournaments).forEach(format => {
            Object.keys(tournaments[format].players).forEach(playerId => {
                tournaments[format].players[playerId].suspension = Array.from(tournaments[format].players[playerId].suspension).sort((a, b) => a - b);
            });
        });

        setProcessedStats(tournaments);
    };

    // Componente interno para renderizar el contenido de una celda específica
    const StageCell = ({ stageData, isSuspended }) => {
        if (isSuspended) {
            return <div className="flex justify-center" title="Suspendido / Inhabilitado"><span className="text-xl drop-shadow-md">🚫</span></div>;
        }
        if (!stageData) return <span className="text-slate-600">-</span>;

        const icons = [];
        if (stageData.goals > 0) icons.push(<span key="g" title={`Goles: ${stageData.goals}`}>⚽{stageData.goals > 1 ? `x${stageData.goals}` : ''}</span>);
        if (stageData.assists > 0) icons.push(<span key="a" title={`Asistencias: ${stageData.assists}`}>👟{stageData.assists > 1 ? `x${stageData.assists}` : ''}</span>);
        if (stageData.yellow > 0) icons.push(<span key="y" title="Amarilla">🟨</span>);
        if (stageData.red > 0) icons.push(<span key="r" title="Roja">🟥</span>);
        if (stageData.serious_inj > 0) icons.push(<span key="ih" title="Lesión ">🩹</span>);

        return (
            <div className="flex flex-wrap justify-center gap-1 text-sm">
                {icons.length > 0 ? icons : <span className="text-slate-600">✔️</span>} {/* ✔️ significa jugó pero sin eventos destacados */}
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 animate-fade-in-down pb-20">

            {/* ENCABEZADO */}
            <div className="flex flex-col items-center justify-center mb-10 bg-slate-900/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-slate-700 text-center">
                <span className="text-5xl mb-4 drop-shadow-lg">📈</span>
                <h1 className="font-black text-3xl sm:text-4xl text-white uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                    Rendimiento del Plantel
                </h1>
                <p className="text-slate-400 mt-2 font-bold tracking-widest uppercase">{teamName}</p>
            </div>

            {/* NUEVO: CARTEL DE REFERENCIAS AÑADIR AQUÍ */}
            <div className="mb-10 flex flex-col lg:flex-row items-center justify-center gap-3 lg:gap-6 bg-slate-900/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/50 shadow-inner">
                <span className="text-slate-400 font-black uppercase tracking-widest text-xs border-b lg:border-b-0 lg:border-r border-slate-600 pb-2 lg:pb-0 lg:pr-4">
                    Referencias
                </span>
                <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm text-slate-300 font-medium">
                    <span className="flex items-center gap-1 hover:text-white transition-colors"><span className="text-base drop-shadow-md">⚽</span> Gol</span>
                    <span className="flex items-center gap-1 hover:text-white transition-colors"><span className="text-base drop-shadow-md">👟</span> Asistencia</span>
                    <span className="flex items-center gap-1 hover:text-white transition-colors"><span className="text-base drop-shadow-md">🟨</span> Amarilla</span>
                    <span className="flex items-center gap-1 hover:text-white transition-colors"><span className="text-base drop-shadow-md">🟥</span> Roja</span>
                    <span className="flex items-center gap-1 hover:text-white transition-colors"><span className="text-base drop-shadow-md">🩹</span> Lesión</span>
                    <span className="flex items-center gap-1 text-red-400 font-bold hover:text-red-300 transition-colors"><span className="text-base drop-shadow-md">🚫</span> Suspendido</span>
                    <span className="flex items-center gap-1 text-slate-400"><span className="text-base opacity-70">✔️</span> Jugó (Sin incidencias)</span>
                    <span className="flex items-center gap-1 text-slate-500"><span className="text-base font-black">-</span> Sin registro / No jugó</span>
                </div>
            </div>
            {/* FIN DEL CARTEL */}

            {loading ? (
                <div className="flex justify-center items-center py-20 bg-slate-900/50 rounded-2xl border border-slate-700">
                    <div className="loader inline-block border-4 border-slate-600 border-t-blue-500 rounded-full w-12 h-12 animate-spin mb-4"></div>
                </div>
            ) : Object.keys(processedStats).length === 0 ? (
                <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-700">
                    <p className="text-slate-400 text-lg">No hay estadísticas registradas para este equipo.</p>
                </div>
            ) : (
                Object.entries(processedStats).map(([format, data]) => {
                    // Creamos un array con las columnas de fechas a dibujar [1, 2, 3... maxStage]
                    const stageColumns = Array.from({ length: data.maxStage }, (_, i) => i + 1);

                    return (
                        <div key={format} className="mb-10 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
                            {/* TÍTULO DEL TORNEO */}
                            <div className="bg-slate-800/80 p-5 border-b border-slate-700 flex items-center gap-3">
                                <span className="text-2xl">🏆</span>
                                <h2 className="text-xl font-black text-white uppercase tracking-wider">{formatName(format)}</h2>
                            </div>

                            {/* TABLA GRID (SCROLL HORIZONTAL) */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-left text-gray-300">
                                    <thead className="bg-[#0f172a] text-slate-400 uppercase text-xs font-bold tracking-wider">
                                        <tr>
                                            {/* Columna fija para el nombre del jugador */}
                                            <th className="py-4 px-4 sticky left-0 bg-[#0f172a] z-10 border-r border-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                                                Jugador
                                            </th>

                                            {/* Columnas Dinámicas de Fechas */}
                                            {stageColumns.map(stageNum => (
                                                <th key={stageNum} className="py-4 px-3 text-center min-w-[60px] border-r border-slate-800/50">
                                                    {formatStage(stageNum, format)}
                                                </th>
                                            ))}

                                            {/* Columnas Extra */}
                                            <th className="py-4 px-4 text-center text-blue-400 border-l border-slate-700">Totales (G/A)</th>
                                            <th className="py-4 px-4 text-center text-red-400">Suspendido En</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {Object.values(data.players).map(player => (
                                            <tr key={player.player} className="hover:bg-slate-800/80 transition-colors">

                                                {/* Celda: Nombre (Sticky) */}
                                                <td className="py-3 px-4 font-bold text-white sticky left-0 bg-slate-900 group-hover:bg-slate-800 transition-colors z-10 border-r border-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] whitespace-nowrap">
                                                    {player.player}
                                                </td>

                                                {/* Celdas: Timeline por Fecha */}
                                                {stageColumns.map(stageNum => {
                                                    const isSuspended = player.suspension.includes(stageNum);
                                                    const stageData = player.stages[stageNum];

                                                    return (
                                                        <td key={stageNum} className={`py-3 px-2 text-center border-r border-slate-800/50 ${isSuspended ? 'bg-red-950/20' : ''}`}>
                                                            <StageCell stageData={stageData} isSuspended={isSuspended} />
                                                        </td>
                                                    );
                                                })}

                                                {/* Celda: Totales */}
                                                <td className="py-3 px-4 text-center font-bold text-emerald-400 border-l border-slate-700 bg-slate-800/20">
                                                    {player.total_goals > 0 ? `⚽${player.total_goals}` : ''}
                                                    {player.total_goals > 0 && player.total_assists > 0 ? ' - ' : ''}
                                                    {player.total_assists > 0 ? `👟${player.total_assists}` : ''}
                                                    {player.total_goals === 0 && player.total_assists === 0 ? '-' : ''}
                                                </td>

                                                {/* Celda: Sanciones Futuras */}
                                                <td className="py-3 px-4 text-center text-red-400 font-medium bg-slate-800/20">
                                                    {player.suspension.length > 0
                                                        ? player.suspension.map(s => formatStage(s, format)).join(', ')
                                                        : <span className="text-slate-600">-</span>
                                                    }
                                                </td>

                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default TeamStatistics;
