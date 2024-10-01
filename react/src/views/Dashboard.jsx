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

export default function Dashboard() {
    const { user, setNotification } = useStateContext();
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
                setPendingTransfers(data.filter(t => t.id_season == seasons));
            })
            .catch(error => {
                console.error(error);
            });
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
                        {transfers.map(transfer => (
                            <li key={transfer.id}>
                                Jugador: {transfer.player_name}, Valor: {transfer.value}
                            </li>
                        ))}
                    </ul>

                    <h2>Subastas</h2>
                    <ul>
                        {auctions.map(auction => (
                            <li key={auction.id}>
                                Jugador: {auction.player_name}, Última oferta: {auction.last_offer}
                            </li>
                        ))}
                    </ul>

                    <h2>Cláusulas de rescisión ejecutadas</h2>
                    <ul>
                        {executedClauses.map(clause => (
                            <li key={clause.id}>
                                Jugador: {clause.player_name}, Valor total: {clause.total_value}
                            </li>
                        ))}
                    </ul>

                    <h2>Cláusulas recibidas en el equipo</h2>
                    <ul>
                        {receivedClauses.map(clause => (
                            <li key={clause.id}>
                                {console.log(clause)}
                            </li>
                        ))}
                    </ul>

                    <h2>Transferencias Pendientes</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Jugadores Transferidos</th>
                                <th>Equipo Desde</th>
                                <th>Equipo Hasta</th>
                                <th>Presupuesto</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingTransfers.map((transfer) => (
                                <tr key={transfer.id}>
                                    <td>{transfer.id}</td>
                                    <td>{transfer.transferred_players}</td>
                                    <td>{transfer.id_team_from ? transfer.id_team_from.name : ''}</td>
                                    <td>{transfer.id_team_to ? transfer.id_team_to.name : ''}</td>
                                    <td>{transfer.budget}</td>
                                    <td>
                                        <button className="btn-edit" onClick={() => confirmTransfer(transfer.id)}>
                                            Confirmar Transferencia
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <h2>Presupuesto gastado</h2>
                    <p>Total: {totalSpent}</p>
                </div>
            )}
        </div>
    );
}


