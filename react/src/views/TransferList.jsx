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
            <div className="mb-4">
                <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-2">Filtrar por temporada:</label>
                <select
                    id="season"
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(e.target.value)}
                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    <option value="">Todas las temporadas</option>
                    {Array.isArray(seasons) && seasons.map(season => (
                        <option key={season.id} value={season.id}>{season.name}</option>
                    ))}
                </select>
            </div>
            <div className="card animated fadeInDown overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JUGADORES TRANSFERIDOS</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EQUIPO DESDE - EQUIPO HASTA</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CREADO POR</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FECHA DE CREACIÓN</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VALOR</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CONFIRMADA?</th>
                        </tr>
                    </thead>
                    {loading &&
                        <tbody>
                            <tr>
                                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                    CARGANDO...
                                </td>
                            </tr>
                        </tbody>
                    }
                    {!loading &&
                        <tbody className="bg-white divide-y divide-gray-200">
                            {
                                Array.isArray(transfers) && transfers.length > 0 ? (
                                    transfers.map(p => {
                                        return (
                                            <tr key={p.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.transferred_players}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.team_from.name.substring(0, 10)} - {p.team_to.name.substring(0, 10)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.created_by.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.created_at}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.budget}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.confirmed}</td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
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
