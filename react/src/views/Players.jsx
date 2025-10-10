/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
// import React, { useState, useEffect } from 'react';
// import axiosClient from '../axios';
// import { Link } from 'react-router-dom';
// import { useStateContext } from '../context/ContextProvider';

// export default function Players() {
//     const [players, setPlayers] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const { user, setNotification } = useStateContext();
//     const [team, setTeam] = useState([]);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [totalPages, setTotalPages] = useState(1);
//     const [searchName, setSearchName] = useState('');
//     const [ageRange, setAgeRange] = useState([0, 100]);
//     const [selectedTeam, setSelectedTeam] = useState('');
//     const [sortField, setSortField] = useState('');
//     const [sortOrder, setSortOrder] = useState('asc');

//     useEffect(() => {
//         getPlayers();
//         getTeam();
//     }, [currentPage]);

//     const getPlayers = () => {
//         setLoading(true);
//         axiosClient.get(`/players?page=${currentPage}`)
//             .then(({ data }) => {
//                 setLoading(false);
//                 setPlayers(data.data);
//                 setTotalPages(data.meta.last_page);
//             })
//             .catch(() => {
//                 setLoading(false);
//             });
//     };

//     const getTeam = () => {
//         setLoading(true);
//         axiosClient.get('/teams')
//             .then(({ data }) => {
//                 setLoading(false);
//                 setTeam(data.data);
//             })
//             .catch(() => {
//                 setLoading(false);
//             });
//     };

//     const filterPlayersByTeamDivision = () => {
//         setLoading(true);
//         axiosClient.get('/players/filter-by-division')
//             .then(({ data }) => {
//                 setLoading(false);
//                 setPlayers(data);
//             })
//             .catch(() => {
//                 setLoading(false);
//                 setNotification('Error al filtrar jugadores por equipo');
//             });
//     };

//     const getPlayersName = (name) => {
//         setLoading(true);
//         axiosClient.get(`/players?name=${name}`)
//         .then(({ data }) => {
//             setLoading(false);
//             setPlayers(data.data);
//         })
//         .catch(() => {
//             setLoading(false);
//             setNotification('Error al buscar jugadores');
//         });
//     }

//     const handleNextPage = () => {
//         setCurrentPage((prevPage) => prevPage + 1);
//     };

//     const handlePrevPage = () => {
//         setCurrentPage((prevPage) => prevPage - 1);
//     };

//     const handleSearchChange = (e) => {
//         setSearchName(e.target.value);
//     };

//     const handleSearchSubmit = () => {
//         setCurrentPage(1);
//         getPlayersName(searchName);
//     };

//     const handleAgeRangeChange = (e) => {
//         const { name, value } = e.target;
//         setAgeRange((prevRange) => ({
//             ...prevRange,
//             [name]: value
//         }));
//     };

//     const handleTeamChange = (e) => {
//         setSelectedTeam(e.target.value);
//     };

//     const handleSortChange = (field) => {
//         const order = sortOrder === 'asc' ? 'desc' : 'asc';
//         setSortField(field);
//         setSortOrder(order);
//     };

//     return (
//         <div>
//             <div style={{ display: "flex", justifyContent: 'space-between', alignItems: 'center' }}>
//                 <h1><strong> Jugadores</strong></h1>
//                 <Link to='/players/new' className="btn-add">Agregar nuevo jugador</Link>
//             </div>
//             <br />
//             <div>
//                 <input
//                     type="text"
//                     value={searchName}
//                     onChange={handleSearchChange}
//                     placeholder="Buscar por nombre"
//                 />
//                 <button className="btn-add" onClick={handleSearchSubmit}>Buscar</button>
//             </div>
//             <br />
//             <div>
//                 <button className="btn-add" onClick={filterPlayersByTeamDivision}>Filtrar por equipos fuera de Primera y Segunda</button>
//             </div>
//             <br />
//             <div>
//                 {currentPage > 1 && (
//                     <button className="btn-add" onClick={handlePrevPage}>Página anterior</button>
//                 )}&nbsp;&nbsp;
//                 {currentPage < totalPages && (
//                     <button className='btn-add' onClick={handleNextPage}>Página siguiente</button>
//                 )}
//             </div>
//             <div className="card animated fadeInDown">
//                 <table>
//                     <thead>
//                         <tr>
//                             <th>NOMBRE</th>
//                             <th>EDAD</th>
//                             <th>CA</th>
//                             <th>PA</th>
//                             <th>EQUIPO</th>
//                             <th>VALOR</th>
//                             <th>ESTADO</th>
//                             {
//                                 user.rol === 'Admin' &&
//                                 <th>ACCIONES</th>
//                             }
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
//                     {
//                         !loading &&
//                         <tbody>
//                             {
//                                 players.map(p => {
//                                     const teamName = team.find(t => t.id === p.id_team);
//                                     const teamNameToShow = teamName ? teamName.name : '';
//                                     return (
//                                         <tr key={p.id}>
//                                             <td>{p.name}</td>
//                                             <td>{p.age}</td>
//                                             <td>{p.ca}</td>
//                                             <td>{p.pa}</td>
//                                             <td>{teamNameToShow}</td>
//                                             <td>{p.value}</td>
//                                             <td>{p.status}</td>
//                                             {
//                                                 user.rol === 'Admin' &&
//                                                 <td>
//                                                     <Link className="btn-edit" to={'/players/' + p.id}>Editar</Link>
//                                                     &nbsp;
//                                                     <button onClick={e => onDelete(p)} className="btn-delete">Borrar</button>
//                                                 </td>
//                                             }
//                                         </tr>
//                                     )
//                                 })
//                             }
//                         </tbody>
//                     }
//                 </table>
//             </div>
//         </div>
//     );
// }


import React, { useState, useEffect } from 'react';
import axiosClient from '../axios';
import { Link } from 'react-router-dom';
import { useStateContext } from '../context/ContextProvider';

export default function Players() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user, setNotification } = useStateContext();
    const [team, setTeam] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchName, setSearchName] = useState('');

    useEffect(() => {
        getPlayers();
        getTeam();
    }, [currentPage]);

    const getPlayers = () => {
        setLoading(true);
        axiosClient.get(`/players?page=${currentPage}`)
            .then(({ data }) => {
                setLoading(false);
                setPlayers(data.data);
                setTotalPages(data.meta.last_page);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const getTeam = () => {
        setLoading(true);
        axiosClient.get('/teams')
            .then(({ data }) => {
                setLoading(false);
                setTeam(data.data);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const onDelete = (p) => {
        if (!window.confirm('Estás seguro que quieres borrar este jugador??')) {
            return
        }

        axiosClient.delete(`/players/${p.id}`)
            .then(() => {
                setNotification('Jugador eliminado satisfactoriamente')
                getPlayers()
            })
    }

    const filterPlayersByTeamDivision = async () => {
        setLoading(true);
        await axiosClient.get('/players/filter-by-division')
            .then(({ data }) => {
                setLoading(false);
                setPlayers(data.data);
            })
            .catch((error) => {
                setLoading(false);
                setNotification('Error al filtrar jugadores por equipo');
            });
    };

    const getPlayersName = (name) => {
        setLoading(true);
        axiosClient.get(`/playername?name=${name}`)
            .then(({ data }) => {
                setLoading(false);
                setPlayers(data.data);
            })
            .catch(() => {
                setLoading(false);
                setNotification('Error al buscar jugadores por nombre');
            });
    };

    const handleNextPage = () => {
        setCurrentPage((prevPage) => prevPage + 1);
    };

    const handlePrevPage = () => {
        setCurrentPage((prevPage) => prevPage - 1);
    };

    const handleSearchChange = (e) => {
        setSearchName(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        getPlayersName(searchName);
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: "space-between", alignItems: "center" }}>
                <div className="text-xl mt-2 font-semibold mb-2 text-center lg:text-left bg-black bg-opacity-70 rounded-lg text-white p-3">
                    Jugadores
                </div>
                {user.rol === 'Admin' && (
                    <Link to='/players/new' className="bg-green-600 hover:bg-green-800 p-3 rounded text-white">
                        Agregar Jugador
                    </Link>
                )}
            </div>

            {/* Buscador */}
            <div className="bg-black bg-opacity-70 p-4 rounded-lg mb-4">
                <form onSubmit={handleSearchSubmit} className="flex gap-3">
                    <input
                        type="text"
                        value={searchName}
                        onChange={handleSearchChange}
                        placeholder="Buscar por nombre"
                        className="block w-full p-2 border border-blue-700 rounded text-white bg-slate-950"
                    />
                    <button className="bg-blue-600 hover:bg-blue-800 p-3 rounded text-white" type="submit">
                        Buscar
                    </button>
                </form>
            </div>

            {/* Filtros */}
            <div className="mb-4 flex gap-2 flex-wrap">
                <button
                    className="bg-blue-600 hover:bg-blue-800 p-3 rounded text-white"
                    onClick={filterPlayersByTeamDivision}
                >
                    Filtrar equipos fuera de Primera/Segunda
                </button>
            </div>

            {/* Paginación */}
            <div className="mb-4 flex gap-2">
                {currentPage > 1 && (
                    <button
                        className="bg-blue-600 hover:bg-blue-800 p-3 rounded text-white"
                        onClick={handlePrevPage}
                    >
                        Página anterior
                    </button>
                )}
                {currentPage < totalPages && (
                    <button
                        className='bg-blue-600 hover:bg-blue-800 p-3 rounded text-white'
                        onClick={handleNextPage}
                    >
                        Página siguiente
                    </button>
                )}
            </div>

            {/* Tabla con estilo Teams.jsx */}
            <div>
                <table className="min-w-full bg-black bg-opacity-70 text-white border-gray-800 my-2">
                    <thead>
                        <tr>
                            <th className="border px-4 py-2 bg-black text-white">NOMBRE</th>
                            <th className="border px-4 py-2 bg-black text-white">EDAD</th>
                            <th className="border px-4 py-2 bg-black text-white">CA</th>
                            <th className="border px-4 py-2 bg-black text-white">PA</th>
                            <th className="border px-4 py-2 bg-black text-white">EQUIPO</th>
                            <th className="border px-4 py-2 bg-black text-white">VALOR</th>
                            <th className="border px-4 py-2 bg-black text-white">ESTADO</th>
                            {user.rol === 'Admin' && (
                                <th className="border px-4 py-2 bg-black text-white">ACCIONES</th>
                            )}
                        </tr>
                    </thead>
                    {loading &&
                        <tbody>
                            <tr>
                                <td colSpan="8" className="border px-4 py-2 text-center">
                                    CARGANDO...
                                </td>
                            </tr>
                        </tbody>
                    }
                    {!loading &&
                        <tbody>
                            {players.map(p => (
                                <tr key={p.id}>
                                    <td className="border px-4 py-2">{p.name}</td>
                                    <td className="border px-4 py-2">{p.age}</td>
                                    <td className="border px-4 py-2">{p.ca}</td>
                                    <td className="border px-4 py-2">{p.pa}</td>
                                    <td className="border px-4 py-2">{p.id_team?.name}</td>
                                    <td className="border px-4 py-2">{p.value}</td>
                                    <td className="border px-4 py-2">{p.status}</td>
                                    {user.rol === 'Admin' ? (
                                        <td className="border px-4 py-2">
                                            <div className="flex gap-2 flex-wrap">
                                                <Link
                                                    className="bg-green-600 hover:bg-green-800 p-2 rounded text-white text-sm"
                                                    to={'/players/' + p.id}
                                                >
                                                    Editar
                                                </Link>
                                                <button
                                                    onClick={() => onDelete(p)}
                                                    className="bg-red-600 hover:bg-red-800 p-2 rounded text-white text-sm"
                                                >
                                                    Borrar
                                                </button>
                                                {p.id_team?.division !== 'Primera' && p.id_team?.division !== 'Segunda' ?
                                                    <Link
                                                        className="bg-blue-600 hover:bg-blue-800 p-2 rounded text-white text-sm"
                                                        to={'/crear_subasta/' + p.id}
                                                    >
                                                        Ofertar
                                                    </Link>
                                                 : <Link
                                                    className="bg-blue-600 hover:bg-blue-800 p-2 rounded text-white text-sm"
                                                    to={'/clausula_rescision/' + p.id}
                                                >
                                                    Ofertar
                                                </Link>}
                                            </div>
                                        </td>
                                    ) : (
                                        (p.id_team?.division !== 'Primera' && p.id_team?.division !== 'Segunda') && (
                                            <td className="border px-4 py-2">
                                                <Link
                                                    className="bg-blue-600 hover:bg-blue-800 p-2 rounded text-white text-sm"
                                                    to={'/crear_subasta/' + p.id}
                                                >
                                                    Ofertar
                                                </Link>
                                            </td>
                                        )
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    }
                </table>
            </div>
        </>
    );
}
