/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import axiosClient from "../axios";
import { Link } from "react-router-dom";

export default function Teams() {

    const [team, setTeam] = useState([]);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        getTeam();
        getPlayers();
    }, [])

    const cargarJugadores = () => {
        getPlayers()
        getTeam()
    }

    const getTeam = async () => {
        setLoading(true)
        await axiosClient.get('/teams')
            .then(({ data }) => {
                const teamFilter = data.data.filter((t) => t.division === 'Primera' || t.division === 'Segunda')
                setTeam(teamFilter)
            })
            .catch(() => {
                setLoading(false)
            })
    }

    const getPlayers = async () => {
        setLoading(true)
        await axiosClient.get('/players')
            .then(({ data }) => {
                setLoading(false)
                setPlayers(data.data)
            })
            .catch(() => {
                setLoading(false)
            })
    }

    return (
        <>
            <div style={{ display: 'flex', justifyContent: "space-between", alignItems: "center" }}>
                <div>Equipos</div>
                <button className="btn-add" onClick={cargarJugadores}>Cargar equipos</button>
            </div>
            <div className="card animated fadeInDown">
                <table>
                    <thead>
                        <tr>
                            <th>NOMBRE</th>
                            <th>DIVISIÓN</th>
                            <th>MANAGER</th>
                            <th>ACCIONES</th>
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
                                team.map(t => {

                                    return (
                                        <tr key={t.id}>
                                            <td>{t.name}</td>
                                            <td>{t.division}</td>
                                            <td>{t.id_user ? t.id_user.name : ''}</td>
                                            <td>
                                                <Link className="btn-edit" to={`/teams/${t.id}`}>Editar equipo</Link>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    }
                </table>
            </div >

        </>
    )
}
