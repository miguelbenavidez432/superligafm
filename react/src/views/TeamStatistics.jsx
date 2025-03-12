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

    const groupedByTournament = statistics.reduce((acc, stat) => {
        const tournamentId = stat.tournament_id.id;
        if (!acc[tournamentId]) {
            acc[tournamentId] = [];
        }
        acc[tournamentId].push(stat);
        return acc;
    }, {});

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Estadísticas del Equipo</h1>
            {loading ? (
                <p>Cargando...</p>
            ) : (
                Object.keys(groupedByTournament).map(tournamentId => {
                    const tournamentStats = groupedByTournament[tournamentId];
                    const stages = [...new Set(tournamentStats.map(stat => stat.match_id.stage))];
                    const maxStage = Math.max(...stages.map(stage => parseInt(stage, 10)));

                    return (
                        <div key={tournamentId} className="mb-8">
                            <h2 className="text-xl font-bold mb-4">Torneo {tournamentStats[0]?.tournament_id.name || tournamentId}</h2>
                            <table className="min-w-full bg-white">
                                <thead>
                                    <tr>
                                        <th className="py-2">Jugador</th>
                                        {Array.from({ length: maxStage }, (_, i) => (
                                            <th key={i + 1} className="py-2">Etapa {i + 1}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tournamentStats.map(stat => (
                                        <tr key={stat.player_id.id}>
                                            <td className="border px-4 py-2">{stat.player_id.name}</td>
                                            {Array.from({ length: maxStage }, (_, i) => (
                                                <td key={i + 1} className="border px-4 py-2">
                                                    {stat.match_id.stage === (i + 1).toString() ? (
                                                        <>
                                                            <p>Amarillas: {stat.yellow_cards}</p>
                                                            <p>Rojas: {stat.red_cards}</p>
                                                            <p>Lesiones Simples: {stat.simple_injuries}</p>
                                                            <p>Lesiones Graves: {stat.serious_injuries}</p>
                                                            <p>MVP: {stat.mvp}</p>
                                                        </>
                                                    ) : null}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default TeamStatistics;
