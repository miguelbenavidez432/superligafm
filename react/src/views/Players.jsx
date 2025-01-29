/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react"
import axiosClient from "../axios";
import { Link } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";

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
        getPlayers()
        getTeam()
    }, [currentPage])

    const getPlayers = () => {
        setLoading(true)
        axiosClient.get(`/players?page=${currentPage}`)
            .then(({ data }) => {
                setLoading(false)
                setPlayers(data.data)
                setTotalPages(data.meta.last_page);
            })
            .catch(() => {
                setLoading(false)
            })
    }

    const getPlayersName = async (searchName) => {
        setLoading(true);
        await axiosClient.get(`/playername?name=${searchName}`)
            .then(({ data }) => {
                setLoading(false);
                setPlayers(data.data);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const getTeam = () => {
        setLoading(true)
        axiosClient.get('/teams')
            .then(({ data }) => {
                setLoading(false)
                setTeam(data.data)
            })
            .catch(() => {
                setLoading(false)
            })
    }

    const onDelete = (p) => {
        if (!window.confirm('Estas seguro de quitar al jugador?')) {
            return
        }
        axiosClient.delete(`/players/${p.id}`)
            .then(() => {
                setNotification('Jugador eliminado satisfactoriamente');
                getPlayers();
            })
            .catch(() => {

            })
    }

    const handleNextPage = () => {
        setCurrentPage((prevPage) => prevPage + 1);
    };

    const handlePrevPage = () => {
        setCurrentPage((prevPage) => prevPage - 1);
    };


    const handleSearchChange = (e) => {
        setSearchName(e.target.value);
    };

    const handleSearchSubmit = () => {
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

    // const filterPlayers = () => {
    //     setLoading(true);
    //     axiosClient.get('/players/filter', {
    //         params: {
    //             name: searchName,
    //             min_age: ageRange[0],
    //             max_age: ageRange[1],
    //             id_team: selectedTeam,
    //             no_league: true,
    //             sort_field: sortField,
    //             sort_order: sortOrder
    //         }
    //     })
    //     .then(({ data }) => {
    //         setLoading(false);
    //         setPlayers(data.data);
    //     })
    //     .catch(() => {
    //         setLoading(false);
    //     });
    // };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: 'space-between', alignItems: 'center' }}>
                <h1><strong> Jugadores</strong></h1>
                <Link to='/players/new' className="btn-add">Agregar nuevo jugador</Link>
            </div>
            <br />
            <div>
                <input
                    type="text"
                    value={searchName}
                    onChange={handleSearchChange}
                    placeholder="Buscar por nombre"
                />
                <button className="btn-add" onClick={handleSearchSubmit}>Buscar</button>
            </div>
            <br />
            {/* <div>
                <label>Edad mínima:</label>
                <input
                    type="number"
                    name="min"
                    value={ageRange[0]}
                    onChange={handleAgeRangeChange}
                />
                <label>Edad máxima:</label>
                <input
                    type="number"
                    name="max"
                    value={ageRange[1]}
                    onChange={handleAgeRangeChange}
                />
            </div>
            <br />
            <div>
                <label>Equipo:</label>
                <select value={selectedTeam} onChange={handleTeamChange}>
                    <option value="">Todos los equipos</option>
                    {team.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
            </div>
            <br />
            <div>
                <button className="btn-add" onClick={() => handleSortChange('ca')}>Ordenar por CA</button>
                <button className="btn-add" onClick={() => handleSortChange('pa')}>Ordenar por PA</button>
            </div>
            <br /> */}
            <div>
                {currentPage > 1 && (
                    <button className="btn-add" onClick={handlePrevPage}>Página anterior</button>
                )}&nbsp;&nbsp;
                {currentPage < totalPages && (
                    <button className='btn-add' onClick={handleNextPage}>Página siguiente</button>
                )}
            </div>
            <div className="card animated fadeInDown">
                <table>
                    <thead>
                        <tr>
                            <th>NOMBRE</th>
                            <th>EDAD</th>
                            <th>CA</th>
                            <th>PA</th>
                            <th>EQUIPO</th>
                            <th>VALOR</th>
                            <th>ESTADO</th>
                            {
                                user.rol === 'Admin' &&
                                <th>ACCIONES</th>
                            }
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
                    {
                        !loading &&
                        <tbody>
                            {
                                players.map(p => {
                                    const teamName = team.find(t => t.id === p.id_team);
                                    const teamNameToShow = teamName ? teamName.name : '';
                                    return (
                                        <tr key={p.id}>
                                            <td>{p.name}</td>
                                            <td>{p.age}</td>
                                            <td>{p.ca}</td>
                                            <td>{p.pa}</td>
                                            <td>{p.id_team ? p.id_team.name : ''}</td>
                                            <td>{p.value}</td>
                                            <td>{p.status === 'restringido' ? '' : p.status}</td>
                                            {
                                                user.rol === 'Admin' &&
                                                <td>
                                                    <Link className="btn-edit" to={'/players/' + p.id}>Editar</Link>
                                                    &nbsp;
                                                    <button onClick={e => onDelete(p)} className="btn-delete">Borrar</button>
                                                </td>
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
    )
}
