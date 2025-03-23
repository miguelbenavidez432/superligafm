/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axiosClient from "../axios";

// const TeamStatistics = () => {
//     const { team_id } = useParams();
//     const [statistics, setStatistics] = useState([]);
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         fetchStatistics();
//     }, [team_id]);

//     const fetchStatistics = async () => {
//         setLoading(true);
//         try {
//             const response = await axiosClient.get(`/match-statistics/team/${team_id}`);
//             setStatistics(response.data.data);
//         } catch (error) {
//             console.error('Error al obtener estadísticas:', error);
//         } finally {
//             setLoading(false);
//         }
//     };


//     const renderTable = (title, key) => (
//         <div>
//             <h3 className="text-lg font-bold">{title}</h3>
//             <table className="min-w-full bg-white">
//                 <thead>
//                     <tr>
//                         <th className="py-2">Jugador</th>
//                         <th className="py-2">{title}</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {statistics.filter(stat => stat[key] > 0).sort((a, b) => b[key] - a[key]).map(stat => (
//                         <tr key={stat.id}>
//                             <td className="border px-4 py-2">{stat.player_id.name}</td>
//                             <td className="border px-4 py-2">{stat[key]}</td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );

//     return (
//         <div className="p-4">
//             <h1 className="text-2xl font-bold mb-4">Estadísticas del Equipo</h1>
//             {loading ? (
//                 <p>Cargando...</p>
//             ) : (
//                 <div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                         {renderTable('Goles', 'goals')}
//                         {renderTable('Asistencias', 'assists')}
//                         {renderTable('MVP', 'mvp')}
//                         {/* Aquí puedes agregar más tablas según sea necesario */}
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

//                         {renderTable('Tarjetas Amarillas', 'yellow_cards')}
//                         {/* Aquí puedes agregar más tablas según sea necesario */}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default TeamStatistics;

/* eslint-disable react-hooks/exhaustive-deps */
// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axiosClient from "../axios";

// const TeamStatistics = () => {
//     const { team_id } = useParams();
//     const [statistics, setStatistics] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [enable, setEnable] = useState([]);

//     useEffect(() => {
//         fetchStatistics();
//         fetchYelloCards()
//     }, [team_id]);

//     const fetchStatistics = async () => {
//         setLoading(true);
//         try {
//             const response = await axiosClient.get(`/match-statistics/team/${team_id}`);
//             setStatistics(response.data.data);
//         } catch (error) {
//             console.error('Error al obtener estadísticas:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchYelloCards = async () => {
//         setLoading(true);
//         try {
//             const response = await axiosClient.get(`/yellow-statistics/team/${team_id}`);
//             console.log(response.data.data)
//             setEnable(response.data.data);
//         } catch (error) {
//             console.error('Error al obtener las amarillas', error)
//         }
//     }

//     const groupedByTournament = statistics.reduce((acc, stat) => {
//         const tournamentId = stat.tournament_id.id;
//         if (!acc[tournamentId]) {
//             acc[tournamentId] = [];
//         }
//         acc[tournamentId].push(stat);
//         return acc;
//     }, {});

//     const groupedByPlayer = statistics.reduce((acc, stat) => {
//         const PlayerId = stat.player_id.id;
//         if (!acc[PlayerId]) {
//             acc[PlayerId] = [];
//         }
//         acc[PlayerId].push(stat);
//         return acc;
//     }, {});

//     return (
//         <div className="p-4">
//             <h1 className="text-2xl font-bold mb-4">Estadísticas del Equipo</h1>
//             {loading ? (
//                 <p>Cargando...</p>
//             ) : (
//                 Object.keys(groupedByTournament).map(tournamentId => {
//                     const tournamentStats = groupedByTournament[tournamentId];
//                     const stages = [...new Set(tournamentStats.map(stat => stat.match_id?.stage))];
//                     const maxStage = Math.max(...stages.map(stage => parseInt(stage, 10)));

//                     return (
//                         <div key={tournamentId} className="mb-8">
//                             <h2 className="text-xl font-bold mb-4">Torneo {tournamentStats[0]?.tournament_id.name || tournamentId}</h2>
//                             <table className="min-w-full bg-white">
//                                 <thead>
//                                     <tr>
//                                         <th className="py-2">Jugador</th>
//                                         {Array.from({ length: maxStage }, (_, i) => (
//                                             <th key={i + 1} className="py-2">Fecha {i + 1}</th>
//                                         ))}
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {tournamentStats.map(stat => (
//                                         <tr key={stat.player_id.id}>
//                                             <td className="border px-4 py-2">{stat.player_id.name}</td>
//                                             {Array.from({ length: maxStage }, (_, i) => (
//                                                 <td key={i + 1} className="border px-4 py-2">
//                                                     {stat.match_id.stage === (i + 1).toString() ? (
//                                                         <>
//                                                             {stat.yellow_cards == 0 ? null : <p>Amarillas: {stat.yellow_cards}</p>}
//                                                             {stat.red_cards == 0 ? null : <p>Rojas: {stat.red_cards}</p>}
//                                                             {stat.simple_injuries == 0 ? null : <p>Lesiones Simples: {stat.simple_injuries}</p>}
//                                                             {stat.serious_injuries == 0 ? null : <p>Lesiones Graves: {stat.serious_injuries}</p>}
//                                                             {stat.mvp == 0 ? null : <p>MVP: {stat.mvp}</p>}
//                                                         </>
//                                                     ) : null}
//                                                 </td>
//                                             ))}
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>

//                             <h1 className="text-2xl font-bold mb-4">Sancionado</h1>
//                             {
//                                 enable.filter(stat => stat.tournament_id.id == tournamentId).map(stat => (
//                                     <div key={stat.player_id.id}>
//                                         <p>{stat.player_id.name} - {stat.total_yellow_cards} Amarillas </p>
//                                     </div>
//                                 ))
//                             }
//                         </div>

//                     );
//                 })
//             )}
//         </div>
//     );
// };

// export default TeamStatistics;

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../axios";

const TeamStatistics = () => {
    const { team_id } = useParams();
    const [statistics, setStatistics] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStatistics();
    }, [team_id]);

    const fetchStatistics = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get(`/match-statistics/team/${team_id}`);
            setStatistics(response.data.data);
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
        } finally {
            setLoading(false);
        }
    };

    const groupedStatistics = statistics.reduce((acc, stat) => {
        const playerId = stat.player_id.id;
        const tournamentId = stat.tournament_id.id;

        if (!acc[playerId]) {
            acc[playerId] = { player: stat.player_id, tournaments: {} };
        }

        if (!acc[playerId].tournaments[tournamentId]) {
            acc[playerId].tournaments[tournamentId] = [];
        }

        acc[playerId].tournaments[tournamentId].push(stat);
        return acc;
    }, {});

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Estadísticas del Equipo</h1>
            {loading ? (
                <p>Cargando...</p>
            ) : (
                Object.values(groupedStatistics).map(({ player, tournaments }) => (
                    <div key={player.id} className="mb-8">
                        <h2 className="text-xl font-bold mb-4">{player.name}</h2>
                        {Object.entries(tournaments).map(([tournamentId, stats]) => {
                            const stages = [...new Set(stats.map(stat => stat.match_id?.stage))];
                            const maxStage = Math.max(...stages.map(stage => parseInt(stage, 10)));

                            return (
                                <div key={tournamentId} className="mb-4">
                                    <h3 className="text-lg font-bold">Torneo {stats[0]?.tournament_id.name || tournamentId}</h3>
                                    <table className="min-w-full bg-white">
                                        <thead>
                                            <tr>
                                                <th className="py-2">Jugador</th>
                                                {Array.from({ length: maxStage }, (_, i) => (
                                                    <th key={i + 1} className="py-2">Fecha {i + 1}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="border px-4 py-2">{player.name}</td>
                                                {Array.from({ length: maxStage }, (_, i) => (
                                                    <td key={i + 1} className="border px-4 py-2">
                                                        {stats.map(stat => stat.match_id?.stage === (i + 1).toString()) ? (
                                                            <>
                                                                {stats.map(stat => stat.match_id?.stage === (i + 1).toString()).yellow_cards > 0 && (
                                                                    <p>Amarillas: {stats.find(stat => stat.match_id?.stage === (i + 1).toString()).yellow_cards}</p>
                                                                )}
                                                                {stats.map(stat => stat.match_id?.stage === (i + 1).toString()).red_cards > 0 && (
                                                                    <p>Rojas: {stats.find(stat => stat.match_id?.stage === (i + 1).toString()).red_cards}</p>
                                                                )}
                                                                {stats.map(stat => stat.match_id?.stage === (i + 1).toString()).mvp > 0 && (
                                                                    <p>MVP: {stats.find(stat => stat.match_id?.stage === (i + 1).toString()).mvp}</p>
                                                                )}
                                                            </>
                                                        ) : null}
                                                    </td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })}
                    </div>
                ))
            )}
        </div>
    );
};

export default TeamStatistics;
