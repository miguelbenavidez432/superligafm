/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
// import { useEffect, useState } from "react";
// import { useStateContext } from "../context/ContextProvider"
// import axiosClient from "../axios";

// export default function Dashboard() {

//     const [team, setTeam] = useState([]);
//     const [transfer, setTransfer] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [users, setUsers] = useState([]);

//     useEffect(() => {
//         getTeam()
//         getTransfers()
//         getUsers()
//     }, [])

//     const cargarJugadores = () => {
//         getTransfers()
//     }

//     const getUsers = () => {
//         axiosClient.get('/users')
//             .then(({ data }) => {
//                 setUsers(data.data);
//             })
//             .catch(() => {
//             });
//     };

//     const getTeam = () => {
//         setLoading(true)
//         axiosClient.get('/teams')
//             .then(({ data }) => {
//                 setLoading(false)
//                 setTeam(data.data)
//             })
//             .catch(() => {
//                 setLoading(false)
//             })
//     }

//     const getTransfers = () => {
//         setLoading(true)
//         axiosClient.get('/traspasos')
//             .then(({ data }) => {
//                 setLoading(false)
//                 setTransfer(data.data)
//             })
//             .catch(() => {
//                 setLoading(false)
//             })
//     }

//     return (
//         <>
//             <div style={{ display: 'flex', justifyContent: "space-between", alignItems: "center" }}>
//                 <div>Plantel</div>
//                 <button className="btn-add" onClick={cargarJugadores}>Cargar plantel</button>
//             </div>
//             <div className="card animated fadeInDown">
//                 <table>
//                     <thead>
//                         <tr>
//                             <th>N°</th>
//                             <th>JUGADORES TRANSFERIDOS</th>
//                             <th>EQUIPOS ORIGEN/DESTINO</th>
//                             <th>REALIZADA POR</th>
//                             <th>HORA</th>
//                             <th>VALOR</th>
//                         </tr>
//                     </thead>
//                     {loading &&
//                         <tbody>
//                             <tr>
//                                 <td colSpan="10" className="text-center">
//                                     CARGANDO...
//                                 </td>
//                             </tr>
//                         </tbody>
//                     }
//                     {!loading &&
//                         <tbody>
//                             {
//                                 transfer && transfer.map(p => {
//                                     const teamName = team.find(t => t.id === p.id_team_from);
//                                     const secondTeamName = team.find(t => t.id === p.id_team_to);
//                                     const teamNameToShow = teamName ? teamName.name : '';
//                                     const showSecondTeamName = secondTeamName ? secondTeamName.name : ''
//                                     const userCreated = users.find(u => u.id === p.created_by)
//                                     const shoeUserName = userCreated ? userCreated.name : ''
//                                     return (
//                                         <tr key={p.id}>
//                                             <td>{p.id}</td>
//                                             <td>{p.transferred_players}</td>
//                                             <td>{teamNameToShow + ' - ' + showSecondTeamName}</td>
//                                             <td>{shoeUserName}</td>
//                                             <td>{p.created_at}</td>
//                                             <td>
//                                                 {p.budget}
//                                             </td>
//                                         </tr>
//                                     )
//                                 })
//                             }
//                         </tbody>
//                     }
//                 </table>
//             </div >
//         </>
//     )
// }
import { useState, useEffect } from 'react';
import axiosClient from "../axios";
import { useStateContext } from "../context/ContextProvider";
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const { user, setNotification } = useStateContext();
    const [team, setTeam] = useState(null);
    const [users, setUsers] = useState(null);
    const [teams, setTeams] = useState(null);
    const [seasonId, setSeasonId] = useState(null);
    const [auctions, setAuctions] = useState([]);
    const [executedClauses, setExecutedClauses] = useState([]);
    const [receivedClauses, setReceivedClauses] = useState([]);
    const [totalSpent, setTotalSpent] = useState(0);
    const [seasons, setSeasons] = useState([]);
    const [pendingTransfers, setPendingTransfers] = useState([]);

    useEffect(() => {
        fetchPendingTransfers();
        getCdr();
        getAuctions();
        getUsers();
    }, [seasonId]);

    useEffect(() => {
        fetchSeasons();
    }, []);

    const fetchSeasons = () => {
        axiosClient.get('/season')
            .then(({ data }) => {
                setSeasons(data.data);
            })
            .catch(error => console.log(error));
    };

    const fetchPendingTransfers = () => {
        axiosClient.get('/transferencia_pendiente')
            .then(({ data }) => {
                setPendingTransfers(data);
            })
            .catch(error => {
                console.error(error);
            });
    };

    const getUsers = () => {
        axiosClient.get('/users')
            .then(({ data }) => {
                setUsers(data.data);
            })
            .catch(error => {
                console.error(error);
            });
    };

    const getCdr = async () => {
        const response = await axiosClient.get('/teams?all=true');
        const allTeams = response.data.data;
        const teamFilter = allTeams.filter((t) => t.division === 'Primera' || t.division === 'Segunda')
        setTeams(teamFilter);
        const filteredTeam = allTeams.find(team => {
            return team.user && team.user.id === user.id;
        });
        setTeam(filteredTeam);
        axiosClient.get('/clausula_rescision?all=true')
            .then(({ data }) => {
                const filteredExecutedClauses = data.data.filter(cdr => cdr.confirmed === 'no' && cdr.created_by === user.id)
                const filteredReceivedClauses = data.data.filter(cdr => cdr.confirmed === 'no' && cdr.id_team && cdr.id_team.id_user === user.id)
                setExecutedClauses(filteredExecutedClauses);
                setReceivedClauses(filteredReceivedClauses);
            })
            .catch((error) => {
            });
    }

    const getAuctions = async () => {
        try {
            const response = await axiosClient.get('/auction/last');
            setAuctions(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const confirmTransfer = (transferId) => {
        axiosClient.post(`/transferencia_confirmada/${transferId}`)
            .then(({ data }) => {
                setNotification(data.message);
                setPendingTransfers(pendingTransfers.filter(transfer => transfer.id !== transferId));
            })
            .catch(error => {
                console.error(error);
            });
    };



    return (
        <div className="dashboard p-8 mx-8">
            <h1 className="text-2xl font-bold mb-4">Dashboard de Temporada</h1>

            <select
                className="p-2 border rounded mb-4"
                onChange={e => setSeasonId(e.target.value)}
            >
                <option value="">Seleccione una temporada</option>
                {seasons.map(season => (
                    <option key={season.id} value={season.id}>
                        {season.name}
                    </option>
                ))}
            </select>

            {seasonId && (
                <div>
                    <h2 className="text-xl font-semibold mb-2">Transferencias</h2>
                    <ul className="list-disc pl-5 mb-4">
                        {pendingTransfers.map(transfer => (
                            <li key={transfer.id} className="mb-2">
                                Jugador: {transfer.transferred_players}, Valor: {transfer.budget}
                            </li>
                        ))}
                    </ul>

                    <h2 className="text-xl font-semibold mb-2">Subastas</h2>
                    <ul className="list-disc pl-5 mb-4">
                        {auctions
                            .filter(auction => auction.creator && auction.creator.id == user.id)
                            .map(auction => (
                                <li key={auction.id} className="mb-2">
                                    Jugador: {auction.player?.name || 'Sin jugador'}, Última oferta: {auction.amount || 'Sin oferta'}
                                </li>
                            ))}
                    </ul>

                    <h2 className="text-xl font-semibold mb-2">Clausulas ejecutadas</h2>
                    <table className="min-w-full bg-white border border-gray-200 mb-4">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">ID</th>
                                <th className="py-2 px-4 border-b">Jugadores Transferidos</th>
                                <th className="py-2 px-4 border-b">Equipo Desde</th>
                                <th className="py-2 px-4 border-b">Presupuesto</th>
                                <th className="py-2 px-4 border-b">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {executedClauses.map((transfer) => {
                                const teamName = teams.find(t => t.id === transfer.id_team)
                                const teamNameToShow = teamName ? teamName.name : " ";
                                return (
                                    <tr key={transfer.id}>
                                        <td className="py-2 px-4 border-b">{transfer.id}</td>
                                        <td className="py-2 px-4 border-b">{transfer.name}</td>
                                        <td className="py-2 px-4 border-b">{teamNameToShow}</td>
                                        <td className="py-2 px-4 border-b">{transfer.total_value}</td>
                                        <td className="py-2 px-4 border-b">
                                            <Link className="btn-edit my-1 text-blue-500" to={`/offers/${transfer.id_player}`}>Ofertas</Link>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>

                    <h2 className="text-xl font-semibold mb-2">Cláusulas recibidas en el equipo</h2>
                    <ul className="list-disc pl-5 mb-4">
                        {receivedClauses.map(clause => {
                            const teamName = teams.find(t => t.id === clause.id_team)
                            const teamNameToShow = teamName ? teamName.name : " ";
                            return (
                                <li key={clause.id} className="mb-2">
                                    Jugador: {clause.name}, Equipo: {teamNameToShow}, Valor: {clause.total_value}
                                </li>
                            )
                        })}
                    </ul>

                    <h2 className="text-xl font-semibold mb-2">Transferencias Pendientes</h2>
                    <table className="min-w-full bg-white border border-gray-200 mb-4">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">N°</th>
                                <th className="py-2 px-4 border-b">Jugadores Transferidos</th>
                                <th className="py-2 px-4 border-b">Equipo Desde</th>
                                <th className="py-2 px-4 border-b">Equipo Hasta</th>
                                <th className="py-2 px-4 border-b">Presupuesto</th>
                                <th className="py-2 px-4 border-b">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingTransfers.map((transfer) => {
                                const teamNameTo = teams.find(t => t.id === transfer.id_team_to)
                                const teamNameToShow = teamNameTo ? teamNameTo.name : " ";
                                const teamNamefrom = teams.find(t => t.id === transfer.id_team_from)
                                const teamNameToShowFrom = teamNamefrom ? teamNamefrom.name : " ";
                                return (
                                    <tr key={transfer.id}>
                                        <td className="py-2 px-4 border-b">{transfer.id}</td>
                                        <td className="py-2 px-4 border-b">{transfer.transferred_players}</td>
                                        <td className="py-2 px-4 border-b">{teamNameToShowFrom}</td>
                                        <td className="py-2 px-4 border-b">{teamNameToShow}</td>
                                        <td className="py-2 px-4 border-b">{transfer.budget}</td>
                                        <td className="py-2 px-4 border-b">
                                            <button className="btn-edit text-blue-500" onClick={() => confirmTransfer(transfer.id)}>
                                                Confirmar Transferencia
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>

                    <h2 className="text-xl font-semibold mb-2">Presupuesto gastado</h2>
                    <p className="text-lg">Total: {totalSpent}</p>
                </div>
            )}
        </div>
    );
}


