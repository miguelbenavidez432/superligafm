/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../axios";

const TeamStatistics = () => {
    const { team_id } = useParams();
    const [processedStats, setProcessedStats] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStatistics();
    }, [team_id]);

    const fetchStatistics = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get(`/match-statistics/team/${team_id}`);
            console.log(response.data.data)
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
            case "UCL": return "UEFA Champions League";
            default: return format;
        }
    };

    const formatStage = (currentStage, format) => {
        if (format === 'PD') {
            switch (currentStage) {
                case 14: return "Playin";
                case 15: return "Cuartos de Final";
                case 16: return "Semifinal";
                case 17: return "Final";
                default: return currentStage;
            }
        }

        if (format === 'SD') {
            switch (currentStage) {
                case 14: return "Cuartos de Final";
                case 15: return "Semifinal";
                case 18: return "Final";
                default: return currentStage;
            }
        }

        if (format === 'UCL') {
            switch (currentStage) {
                case 4: return "Cuartos de Final";
                case 5: return "Semifinal";
                case 6: return "Final";
                default: return currentStage;
            }
        }

        if (format === 'UEL') {
            switch (currentStage) {
                case 1: return "Octavos de Final";
                case 2: return "Cuartos de Final";
                case 3: return "Semifinal";
                case 4: return "Final";
                default: return currentStage;
            }
        }

        if (format === 'CFM') {
            switch (currentStage) {
                case 1: return "1° Ronda";
                case 2: return "Octavos de Final";
                case 3: return "Cuartos de Final";
                case 4: return "Semifinal";
                case 5: return "Final";
                default: return currentStage;
            }
        }
    };

    const processPlayerStats = (data) => {
        const tournaments = {};

        data.forEach(stat => {
            const format = stat.tournament_id.format;
            const playerId = stat.player_id.id;

            if (!tournaments[format]) {
                tournaments[format] = {};
            }

            if (!tournaments[format][playerId]) {
                tournaments[format][playerId] = {
                    player: stat.player_id.name,
                    total_yellow_cards: 0,
                    total_red_cards: 0,
                    total_simple_injuries: 0,
                    total_serious_injuries: 0,
                    last_stage: 0,
                    total_assists: 0,
                    total_goals: 0,
                    suspension: new Set()
                };
            }

            const playerStats = tournaments[format][playerId];
            playerStats.total_goals += Number(stat.goals || 0);
            playerStats.total_assists += Number(stat.assists || 0);
            playerStats.total_yellow_cards += Number(stat.yellow_cards || 0);
            playerStats.total_red_cards += Number(stat.red_cards || 0);
            playerStats.total_simple_injuries += Number(stat.simple_injuries || 0);
            playerStats.total_serious_injuries += Number(stat.serious_injuries || 0);
            playerStats.last_stage = Math.max(playerStats.last_stage, Number(stat.match_id.stage || 0));

            const currentStage = Number(stat.match_id.stage);

            if (format == 'UCL' || format == 'UEL' || format == 'CFM') {
                format == 'UCL' && currentStage == 5 ? stat.yellow_cards = 0 : null;
                format == 'UEL' && currentStage == 3 ? stat.yellow_cards = 0 : null;
                format == 'CFM' && currentStage == 4 ? stat.yellow_cards = 0 : null;
                if (Number(stat.yellow_cards) > 0) {
                    if (playerStats.total_yellow_cards % 2 === 0) {
                        const stage = formatStage(currentStage + 1, format);
                        playerStats.suspension.add(stage);
                    }
                }
                if (Number(stat.yellow_cards) > 0) {
                    if (playerStats.total_yellow_cards % 4 === 0) {
                        const stage = formatStage(currentStage + 2, format);
                        playerStats.suspension.add(stage);
                    }
                }
            }
            if (Number(stat.yellow_cards) > 0) {
                if (playerStats.total_yellow_cards % 3 === 0) {
                    const stage = formatStage(currentStage + 1, format);
                    playerStats.suspension.add(stage);
                }
            }
            if (Number(stat.yellow_cards) > 0) {
                if (playerStats.total_yellow_cards % 6 === 0) {
                    const stage = formatStage(currentStage + 1, format);
                    playerStats.suspension.add(stage);
                    const stages = formatStage(currentStage + 2, format);
                    playerStats.suspension.add(stages);
                }
            }
            if (Number(stat.simple_injuries) > 0) {
                const stage = formatStage(currentStage + 1, format);
                playerStats.suspension.add(stage);
                playerStats.total_simple_injuries = currentStage
            }
            if (Number(stat.serious_injuries) > 0) {
                const stage = formatStage(currentStage + 1, format);
                playerStats.suspension.add(stage);
                const stages = formatStage(currentStage + 2, format);
                playerStats.suspension.add(stages);
                playerStats.total_serious_injuries = currentStage;
            }
            if (Number(stat.red_cards) > 0) {
                if (stat.direct_red == 'yes') {
                    const stage = formatStage(currentStage + 1, format);
                    playerStats.suspension.add(stage);
                    const stages = formatStage(currentStage + 2, format);
                    playerStats.suspension.add(stages);
                }
                const stage = formatStage(currentStage + 1, format);
                playerStats.suspension.add(stage);
                playerStats.total_red_cards = currentStage;
            }
        });

        Object.keys(tournaments).forEach(format => {
            Object.keys(tournaments[format]).forEach(playerId => {
                tournaments[format][playerId].suspension = Array.from(tournaments[format][playerId].suspension).sort((a, b) => a - b);
            });
        });

        setProcessedStats(tournaments);
    };

    return (
        <div className="p-5 overflow-x-auto">
            <h1 className="text-2xl font-extrabold mb-4 bg-black bg-opacity-70 p-5 rounded-lg text-white text-center">Estadísticas del Equipo</h1>
            {loading ? (
                <p>Cargando...</p>
            ) : (
                Object.entries(processedStats).map(([format, players]) => (
                    <div key={format} className="mb-6">
                        <h2 className="pl-5 my-1 bg-black bg-opacity-70 p-5 rounded-lg text-white font-semibold">{formatName(format)}</h2>
                        <table className="min-w-full bg-black bg-opacity-70 text-white border-gray-800 my-2">
                            <thead>
                                <tr>
                                    <th className="border px-4 py-2 bg-black text-white">Jugador</th>
                                    <th className="border px-4 py-2 bg-black text-white">Goles</th>
                                    <th className="border px-4 py-2 bg-black text-white">Asis.</th>
                                    <th className="border px-4 py-2 bg-black text-white">Ama.</th>
                                    <th className="border px-4 py-2 bg-black text-white">Fecha tarjeta roja</th>
                                    <th className="border px-4 py-2 bg-black text-white">Fecha de lesión</th>
                                    <th className="border px-4 py-2 bg-black text-white">Fecha de lesión grave</th>
                                    <th className="border px-4 py-2 bg-black text-white">Último Partido</th>
                                    <th className="border px-4 py-2 bg-black text-white">Inhabilitado para la fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.values(players).map(player => (
                                    <tr key={player.player}>
                                        <td className="border px-4 py-2">{player.player}</td>
                                        <td className="border px-4 py-2">{player.total_goals}</td>
                                        <td className="border px-4 py-2">{player.total_assists}</td>
                                        <td className="border px-4 py-2">{player.total_yellow_cards}</td>
                                        <td className="border px-4 py-2">{player.total_red_cards == 0 ? '' : player.total_red_cards}</td>
                                        <td className="border px-4 py-2">{player.total_simple_injuries == 0 ? '' : player.total_simple_injuries}</td>
                                        <td className="border px-4 py-2">{player.total_serious_injuries == 0 ? '' : player.total_serious_injuries}</td>
                                        <td className="border px-4 py-2">{'Fecha ' + player.last_stage}</td>
                                        <td className="border px-4 py-2">{player.suspension.length > 0 ? player.suspension.join(', ') : ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))
            )}
        </div>
    );
};

export default TeamStatistics;
