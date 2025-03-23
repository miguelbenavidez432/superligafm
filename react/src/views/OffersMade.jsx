/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// import { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import axiosClient from "../axios";
// import moment from "moment";
// import { useStateContext } from "../context/ContextProvider";

// const OffersMade = () => {
//     const [offers, setOffers] = useState([]);
//     const [users, setUsers] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [teams, setTeams] = useState([]);
//     const { user } = useStateContext();
//     const userId = user.id;
//     const filteredOffers = offers.filter(oferta => oferta.created_by === userId);

//     useEffect(() => {
//         axiosClient.get('/clausula_rescision?all=true')
//             .then(({ data }) => {
//                 setOffers(data.data);
//             })
//             .catch((error) => {
//             });
//         getUsers();
//         getTeam()
//     }, []);

//     const getTeam = async () => {
//         setLoading(true)
//         await axiosClient.get('/teams?all=true')
//             .then(({ data }) => {
//                 const teamFilter = data.data.filter((t) => t.division === 'Primera' || t.division === 'Segunda')
//                 setTeams(teamFilter)
//             })
//             .catch(() => {
//                 setLoading(false)
//             })
//     }

//     const getUsers = () => {
//         setLoading(true);
//         axiosClient.get('/users')
//             .then(({ data }) => {
//                 setLoading(false);
//                 setUsers(data.data);
//             })
//             .catch(() => {
//                 setLoading(false);
//             });
//     };

//     return (
//         <div>
//             <div style={{ display: 'flex', justifyContent: "space-between", alignItems: "center" }}>
//                 <h1><strong>CLÁUSULAS DE RESCISIÓN REALIZADAS</strong></h1>
//                 <Link to={`/clausula_rescision`} className="btn-add">Nueva oferta</Link>
//             </div>
//             <br />
//             {loading &&
//                 <tbody>
//                     <tr>
//                         <td colSpan="9" className="text-center">
//                             CARGANDO...
//                         </td>
//                     </tr>
//                 </tbody>
//             }
//             <div className="card animated fadeInDown">
//                 <table>
//                     <thead>
//                         <tr>
//                             <th>Jugador</th>
//                             <th>Equipo</th>
//                             <th>Valor</th>
//                             <th>Valor extra</th>
//                             <th>Valor Total</th>
//                             <th>Realizado por</th>
//                             <th>Horario</th>
//                             <th>Actions</th>
//                         </tr>
//                     </thead>
//                     {!loading &&
//                         <tbody>
//                             {filteredOffers.map((oferta) => {
//                                 const userName = users.find(u => u.id === oferta.created_by);
//                                 const teamName = teams.find(t => t.id === oferta.id_team)
//                                 const userNameToShow = userName ? userName.name : "Usuario no encontrado";
//                                 const teamNameToShow = teamName ? teamName.name : " ";
//                                 const formattedDate = moment(oferta.created_at).format('DD-MM-YYYY HH:mm:ss');
//                                 return (
//                                     <tr key={oferta.id}>
//                                         <th >{oferta.name}</th>
//                                         <th >{teamNameToShow}</th>
//                                         <th>{oferta.value}</th>
//                                         <th>{oferta.other_players}</th>
//                                         <th>{oferta.total_value}</th>
//                                         <th>{userNameToShow}</th>
//                                         <th>{formattedDate}</th>
//                                         <th className="mt-1">
//                                             <Link className="btn-edit my-1" to={`/offers/${oferta.id_player}`}>Ofertas</Link>
//                                             <br />
//                                         </th>
//                                     </tr>
//                                 )
//                             })}
//                         </tbody>
//                     }
//                 </table>
//             </div>
//         </div>
//     );
// };
// export default OffersMade;
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../axios";
import moment from "moment";
import { useStateContext } from "../context/ContextProvider";

const OffersMade = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState('');
    const { user } = useStateContext();
    const userId = user.id;

    useEffect(() => {
        getOffers();
        getSeasons()
    }, [selectedSeason]);

    const getOffers = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/clausula_rescision', {
                params: {
                    all: true,
                    season: selectedSeason
                }
            });
            setOffers(response.data.data);
        } catch (error) {
            console.error('Error al obtener ofertas:', error);
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
            console.error('Error al obtener temporadas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSeasonChange = (e) => {
        setSelectedSeason(e.target.value);
    };

    const filteredOffers = offers.filter(oferta => oferta.created_by.id === userId);

    return (
        <div className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">CLÁUSULAS DE RESCISIÓN REALIZADAS</h1>
                <Link to={`/clausula_rescision`} className="btn-add bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Nueva oferta
                </Link>
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Temporada:</label>
                <select
                    value={selectedSeason}
                    onChange={handleSeasonChange}
                    className="w-full md:w-1/3 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Todas las temporadas</option>
                    {seasons.map(season => (
                        <option key={season.id} value={season.id}>{season.name}</option>
                    ))}
                </select>
            </div>
            {loading && (
                <div className="text-center text-gray-500">CARGANDO...</div>
            )}
            <div className="card bg-white shadow-md rounded p-4 overflow-x-auto">
                <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr className="bg-gray-200 text-gray-700">
                            <th className="p-2 border">Jugador</th>
                            <th className="p-2 border">Equipo</th>
                            <th className="p-2 border">Valor</th>
                            <th className="p-2 border">Valor extra</th>
                            <th className="p-2 border">Valor Total</th>
                            <th className="p-2 border">Realizado por</th>
                            <th className="p-2 border">Horario</th>
                            <th className="p-2 border">Acciones</th>
                        </tr>
                    </thead>
                    {!loading && (
                        <tbody>
                            {filteredOffers.map((oferta) => {
                                const formattedDate = moment(oferta.created_at).format('DD-MM-YYYY HH:mm:ss');
                                return (
                                    <tr key={oferta.id} className="hover:bg-gray-100">
                                        <td className="p-2 border text-center">{oferta.name}</td>
                                        <td className="p-2 border text-center">{oferta.id_team && oferta.id_team.name}</td>
                                        <td className="p-2 border text-center">{oferta.value}</td>
                                        <td className="p-2 border text-center">{oferta.other_players}</td>
                                        <td className="p-2 border text-center">{oferta.total_value}</td>
                                        <td className="p-2 border text-center">{oferta.created_by && oferta.created_by.name}</td>
                                        <td className="p-2 border text-center">{formattedDate}</td>
                                        <td className="p-2 border text-center">
                                            <Link
                                                className="btn-edit bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                                                to={`/offers/${oferta.id_player}`}
                                            >
                                                Ofertas
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    )}
                </table>
            </div>
        </div>
    );
};

export default OffersMade;
