/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import axiosClient from "../axios";
import { Link } from "react-router-dom";
import Objectives from "./Objectives";
import { useStateContext } from "../context/ContextProvider";

export default function Teams() {

    const { user } = useStateContext();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        getTeam();
        getPlayers();
    }, [])

    const getTeam = async () => {
        await axiosClient.get('/teams?all=true')
            .then(({ data }) => {
                const teamFilter = data.data.filter((t) => t.division === 'Primera' || t.division === 'Segunda')
                setTeams(teamFilter)
            })
            .catch(() => {
                setLoading(false)
            })
    }
    const getPlayers = async () => {
        setLoading(true);
        await axiosClient.get('/players?all=true')
            .then(({ data }) => {
                setPlayers(data.data)
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
            })
    }

    return (
        <>
            <div style={{ display: 'flex', justifyContent: "space-between", alignItems: "center" }}>
                <div className="text-xl mt-2 font-semibold mb-2 text-center lg:text-left bg-black bg-opacity-70 rounded-lg text-white p-3">Equipos</div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-black bg-opacity-70 text-white border-gray-800 my-2">
                    <thead>
                        <tr>
                            <th className="border px-4 py-2 bg-black text-white">NOMBRE</th>
                            <th className="border px-4 py-2 bg-black text-white">DIVISIÓN</th>
                            <th className="border px-4 py-2 bg-black text-white">MANAGER</th>
                            <th className="border px-4 py-2 bg-black text-white">ACCIONES</th>
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
                                            <td className="border px-4 py-2">{t.name}</td>
                                            <td className="border px-4 py-2">{t.division}</td>
                                            <td className="border px-4 py-2">{t.user ? t.user.name : 'Equipo sin manager asignado'}</td>
                                            <td className="border px-4 py-2">
                                                <Link className="p-2 bg-violet-600 hover:bg-violet-800 rounded" to={`/teams/${t.id}`}>Ver equipo</Link>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    }
                </table>
            </div >
            <div className="header" style={{ display: 'flex', justifyContent: "space-between", alignItems: "center", flexWrap: 'wrap', marginBottom: '20px' }}>
                <h1 className="text-2xl font-bold mb-4 text-center bg-black bg-opacity-70 rounded-lg text-white p-3">Objetivos</h1>
                {!loading && teams.length > 0 && (
                    <Objectives teams={teams} />
                )}
            </div>
        </>
    )
}
