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

    useEffect(() => {
        getPlayers()
        getTeam()
    }, [currentPage])

    const getPlayers = () => {
        setLoading(true)
        axiosClient.get(`/players?page=${currentPage}&name=${searchName}`)
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
            <div>
                    {currentPage > 1 && (
                        <button className="btn-add" onClick={handlePrevPage}>Página anterior</button>
                    )}
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
                                            <td>{teamNameToShow}</td>
                                            <td>{p.value}</td>
                                            <td>{p.status}</td>
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
