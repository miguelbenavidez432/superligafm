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
    const [ageRange, setAgeRange] = useState([0, 100]);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

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

    const handleAgeRangeChange = (e) => {
        const { name, value } = e.target;
        setAgeRange((prevRange) => ({
            ...prevRange,
            [name]: value
        }));
    };

    const handleTeamChange = (e) => {
        setSelectedTeam(e.target.value);
    };

    const handleSortChange = (field) => {
        const order = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(order);
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#333' }}>
            <div style={{ display: "flex", justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Jugadores</h1>
                <Link to='/players/new' className="btn-add">Agregar nuevo jugador</Link>
            </div>
            <div style={{ marginBottom: '20px' }}>
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        value={searchName}
                        onChange={handleSearchChange}
                        placeholder="Buscar por nombre"
                        style={{
                            padding: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            width: '200px'
                        }}
                    />
                    <button className="btn-add" type="submit">Buscar</button>
                </form>
            </div>
            <div style={{ marginBottom: '20px' }}>
                <button className="btn-add" onClick={filterPlayersByTeamDivision}>Filtrar por equipos fuera de Primera y Segunda</button>
            </div>
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                {currentPage > 1 && (
                    <button className="btn-add" onClick={handlePrevPage}>Página anterior</button>
                )}
                {currentPage < totalPages && (
                    <button className='btn-add' onClick={handleNextPage}>Página siguiente</button>
                )}
            </div>
            <div className="card animated fadeInDown" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ borderBottom: '2px solid #ccc', padding: '10px', textAlign: 'left' }}>NOMBRE</th>
                            <th style={{ borderBottom: '2px solid #ccc', padding: '10px', textAlign: 'left' }}>EDAD</th>
                            <th style={{ borderBottom: '2px solid #ccc', padding: '10px', textAlign: 'left' }}>CA</th>
                            <th style={{ borderBottom: '2px solid #ccc', padding: '10px', textAlign: 'left' }}>PA</th>
                            <th style={{ borderBottom: '2px solid #ccc', padding: '10px', textAlign: 'left' }}>EQUIPO</th>
                            <th style={{ borderBottom: '2px solid #ccc', padding: '10px', textAlign: 'left' }}>VALOR</th>
                            <th style={{ borderBottom: '2px solid #ccc', padding: '10px', textAlign: 'left' }}>ESTADO</th>
                            {
                                user.rol === 'Admin' &&
                                <th style={{ borderBottom: '2px solid #ccc', padding: '10px', textAlign: 'left' }}>ACCIONES</th>
                            }
                        </tr>
                    </thead>
                    {loading &&
                        <tbody>
                            <tr>
                                <td colSpan="10" className="text-center" style={{ padding: '20px', textAlign: 'center' }}>
                                    CARGANDO...
                                </td>
                            </tr>
                        </tbody>
                    }
                    {
                        !loading &&
                        <tbody>
                            {
                                players.map(p => {
                                    return (
                                        <tr key={p.id} style={{ borderBottom: '1px solid #ccc' }}>
                                            <td style={{ padding: '10px' }}>{p.name}</td>
                                            <td style={{ padding: '10px' }}>{p.age}</td>
                                            <td style={{ padding: '10px' }}>{p.ca}</td>
                                            <td style={{ padding: '10px' }}>{p.pa}</td>
                                            <td style={{ padding: '10px' }}>{p.id_team?.name}</td>
                                            <td style={{ padding: '10px' }}>{p.value}</td>
                                            <td style={{ padding: '10px' }}>{p.status}</td>
                                            {
                                                user.rol === 'Admin' ? (
                                                    <td style={{ padding: '10px' }}>
                                                        <Link className="btn-edit" to={'/players/' + p.id}>Editar</Link>
                                                        &nbsp;
                                                        <button onClick={() => onDelete(p)} className="btn-delete">Borrar</button>
                                                        &nbsp;
                                                        {(p.id_team?.division !== 'Primera' && p.id_team?.division !== 'Segunda') && (
                                                            <>
                                                                <Link className="btn-edit" to={'/subastas/' + p.id}>Ofertar</Link>
                                                                &nbsp;
                                                            </>
                                                        )}
                                                    </td>
                                                ) : (
                                                    (p.id_team?.division !== 'Primera' && p.id_team?.division !== 'Segunda') && (
                                                        <td style={{ padding: '10px' }}>
                                                            <Link className="btn-edit" to={'/subastas/' + p.id}>Ofertar</Link>
                                                            &nbsp;
                                                        </td>
                                                    )
                                                )
                                            }
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    }
                </table>
            </div>
        </div>
    );
}
