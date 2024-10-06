/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import axiosClient from "../axios";
import { Link } from "react-router-dom";

export default function Teams() {

    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getTeam();
    }, [])

    const getTeam = async () => {
        //setLoading(true)
        await axiosClient.get('/teams?all=true')
            .then(({ data }) => {
                const teamFilter = data.data.filter((t) => t.division === 'Primera' || t.division === 'Segunda')
                setTeams(teamFilter)
            })
            .catch(() => {
                setLoading(false)
            })
    }

    return (
        <>
            <div style={{ display: 'flex', justifyContent: "space-between", alignItems: "center" }}>
                <div>Equipos</div>
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
                                teams.map(t => {
                                    return (
                                        <tr key={t.id}>
                                            <td>{t.name}</td>
                                            <td>{t.division}</td>
                                            <td>{t.user ? t.user.name : 'Equipo sin manager asignado'}</td>
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
