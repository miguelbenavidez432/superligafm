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
    const [transfers, setTransfers] = useState([]);
    const [auctions, setAuctions] = useState([]);
    const [executedClauses, setExecutedClauses] = useState([]);
    const [receivedClauses, setReceivedClauses] = useState([]);
    const [totalSpent, setTotalSpent] = useState(0);
    const [seasons, setSeasons] = useState([]);
    const [pendingTransfers, setPendingTransfers] = useState([]);

    useEffect(() => {
        fetchPendingTransfers(); // Llamar a la función para obtener transferencias pendientes
        getCdr();
        getAuctions();
        getUsers();
    }, [seasonId]); // Cambia esta línea a seasonId para que se ejecute cada vez que cambie la temporada

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
        <div className="dashboard">
            <h1>Dashboard de Temporada</h1>

            <select onChange={e => setSeasonId(e.target.value)}>
                <option value="">Seleccione una temporada</option>
                {seasons.map(season => (
                    <option key={season.id} value={season.id}>
                        {season.name}
                    </option>
                ))}
            </select>

            {seasonId && (
                <div>
                    <h2>Transferencias</h2>
                    <ul>
                        {pendingTransfers.map(transfer => (
                            <li key={transfer.id}>
                                Jugador: {transfer.transferred_players}, Valor: {transfer.budget}
                            </li>
                        ))}
                    </ul>
                    <br />
                    <br />
                    <h2>Subastas</h2>
                    <br />
                    <ul>
                        {auctions
                            .filter(auction => auction.creator && auction.creator.id == user.id)
                            .map(auction => (
                                <li key={auction.id}>
                                    Jugador: {auction.player?.name || 'Sin jugador'}, Última oferta: {auction.amount || 'Sin oferta'}
                                </li>
                            ))}
                    </ul>

                    <br />
                    <br />
                    <h2>Clausulas ejecutadas</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Jugadores Transferidos</th>
                                <th>Equipo Desde</th>
                                <th>Presupuesto</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {executedClauses.map((transfer) => {
                                const teamName = teams.find(t => t.id === transfer.id_team)
                                const teamNameToShow = teamName ? teamName.name : " ";
                                return (
                                    <tr key={transfer.id}>
                                        <td>{transfer.id}</td>
                                        <td>{transfer.name}</td>
                                        <td>{teamNameToShow}</td>
                                        <td>{transfer.total_value}</td>
                                        <td>
                                            <Link className="btn-edit my-1" to={`/offers/${transfer.id_player}`}>Ofertas</Link>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    <br />
                    <br />
                    <h2>Cláusulas recibidas en el equipo</h2>
                    <br />
                    <ul>
                        {receivedClauses.map(clause => {
                            const teamName = teams.find(t => t.id === transfer.id_team)
                            const teamNameToShow = teamName ? teamName.name : " ";
                            return (
                                <li key={clause.id}>
                                    {console.log(clause)}
                                </li>
                            )
                        })}
                    </ul>
                    <br /><br />
                    <h2>Transferencias Pendientes</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>N°</th>
                                <th>Jugadores Transferidos</th>
                                <th>Equipo Desde</th>
                                <th>Equipo Hasta</th>
                                <th>Presupuesto</th>
                                <th>Acciones</th>
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
                                        <td>{transfer.id}</td>
                                        <td>{transfer.transferred_players}</td>
                                        <td>{teamNameToShowFrom}</td>
                                        <td>{teamNameToShow}</td>
                                        <td>{transfer.budget}</td>
                                        <td>
                                            <button className="btn-edit" onClick={() => confirmTransfer(transfer.id)}>
                                                Confirmar Transferencia
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>

                    <h2>Presupuesto gastado</h2>
                    <p>Total: {totalSpent}</p>
                </div>
            )}
        </div>
    );
}


