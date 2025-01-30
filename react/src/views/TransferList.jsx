/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
// import { useEffect, useState } from "react";
// import { useStateContext } from "../context/ContextProvider"
// import axiosClient from "../axios";

// export default function TransferList() {

//     const [team, setTeam] = useState([]);
//     const [transfer, setTransfer] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [users, setUsers] = useState([]);

//     useEffect(() => {
//         getTeam()
//         getTransfers()
//         getUsers()
//     }, [])

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
//                             <th>CONFIRMADA?</th>
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
//                                     return (
//                                         <tr key={p.id}>
//                                             <td>{p.id}</td>
//                                             <td>{p.transferred_players}</td>
//                                             <td>{p.team_from.name} - {p.team_to.name}</td>
//                                             <td>{p.created_by.name}</td>
//                                             <td>{p.created_at}</td>
//                                             <td>{p.budget}</td>
//                                             <td>{p.confirmed}</td>
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
import { useEffect, useState } from "react";
import axiosClient from "../axios";
import { useStateContext } from "../context/ContextProvider";

export default function TransferList() {
    const [transfers, setTransfers] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState('');
    const [loading, setLoading] = useState(true);
    const { setNotification } = useStateContext();

    useEffect(() => {
        getTransfers();
        getSeasons();
    }, []);

    useEffect(() => {
        if (selectedSeason) {
            filterTransfersBySeason(selectedSeason);
        } else {
            getTransfers();
        }
    }, [selectedSeason]);

    const getTransfers = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/traspasos');
            setTransfers(response.data.data || []);
        } catch (error) {
            setNotification('Error al obtener transferencias: ' + error);
        } finally {
            setLoading(false);
        }
    };

    const getSeasons = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/season');
            setSeasons(response.data.data || []);
        } catch (error) {
            setNotification('Error al obtener temporadas: ' + error);
        } finally {
            setLoading(false);
        }
    };

    const filterTransfersBySeason = async (seasonId) => {
        setLoading(true);
        try {
            const response = await axiosClient.get(`/traspasos?season=${seasonId}`);
            setTransfers(response.data.data || []);
        } catch (error) {
            setNotification('Error al filtrar transferencias por temporada: ' + error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div>
                <label htmlFor="season">Filtrar por temporada:</label>
                <select id="season" value={selectedSeason} onChange={(e) => setSelectedSeason(e.target.value)}>
                    <option value="">Todas las temporadas</option>
                    {Array.isArray(seasons) && seasons.map(season => (
                        <option key={season.id} value={season.id}>{season.name}</option>
                    ))}
                </select>
            </div>
            <div className="card animated fadeInDown">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>JUGADORES TRANSFERIDOS</th>
                            <th>EQUIPO DESDE - EQUIPO HASTA</th>
                            <th>CREADO POR</th>
                            <th>FECHA DE CREACIÓN</th>
                            <th>VALOR</th>
                            <th>CONFIRMADA?</th>
                        </tr>
                    </thead>
                    {loading &&
                        <tbody>
                            <tr>
                                <td colSpan="10" className="text-center">
                                    CARGANDO...
                                </td>
                            </tr>
                        </tbody>
                    }
                    {!loading &&
                        <tbody>
                            {
                                Array.isArray(transfers) && transfers.length > 0 ? (
                                    transfers.map(p => {
                                        return (
                                            <tr key={p.id}>
                                                <td>{p.id}</td>
                                                <td>{p.transferred_players}</td>
                                                <td>{p.team_from.name} - {p.team_to.name}</td>
                                                <td>{p.created_by.name}</td>
                                                <td>{p.created_at}</td>
                                                <td>{p.budget}</td>
                                                <td>{p.confirmed}</td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="text-center">
                                            No se encontraron transferencias
                                        </td>
                                    </tr>
                                )
                            }
                        </tbody>
                    }
                </table>
            </div>
        </>
    )
}
