/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useStateContext } from "../context/ContextProvider"
import axiosClient from "../axios";
import { Link } from "react-router-dom";

export default function Dashboard() {

    const [team, setTeam] = useState([]);
    const [transfer, setTransfer] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useStateContext();

    useEffect(() => {
        getTeam()
        getTransfers()
    }, [])

    const cargarJugadores = () => {
        getTransfers()
    }

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

    const getTransfers = () => {
        setLoading(true)
        axiosClient.get('/traspasos')
            .then(({ data }) => {
                setLoading(false)
                console.log(data)
                const transfersFiltered = data.data.filter((t) => t.buy_by === user.id || t.sold_by === user.id)
                console.log(transfersFiltered)
                setTransfer(transfersFiltered)
            })
            .catch(() => {
                setLoading(false)
            })
    }

    return (
        <>

            <div style={{ display: 'flex', justifyContent: "space-between", alignItems: "center" }}>
                <div>Plantel</div>
                <button className="btn-add" onClick={cargarJugadores}>Cargar plantel</button>
            </div>
            <div className="card animated fadeInDown">
                <table>
                    <thead>
                        <tr>
                            <th>JUGADORES TRANSFERIDOS</th>
                            <th>EQUIPOS ORIGEN/DESTINO</th>
                            <th>CA</th>
                            <th>PA</th>
                            <th>NACIONALIDAD</th>
                            <th>VALOR</th>
                            <th>ESTADO</th>
                            {/* <th>GOLES</th>
                            <th>ASISTENCIAS</th>
                            <th>AMARILLAS</th>
                            <th>ROJA</th>
                            <th>ROJA DIRECTA</th>
                            <th>LESIONES LEVES</th>
                            <th>LESIONES GRAVES</th>
                            <th>MVP</th> */}
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
                                transfer && transfer.map(p => {
                                    const teamName = team.find(t => t.id === p.id_team_from);
                                    const teamNameToShow = teamName ? teamName.name : '';
                                    return (
                                        <tr key={p.id}>
                                            <td>{p.transferred_players}</td>
                                            <td>{teamNameToShow}</td>
                                            <td>{p.ca}</td>
                                            <td>{p.pa}</td>
                                            <td>{p.nation}</td>
                                            <td>{p.value}</td>
                                            <td>{p.status}</td>
                                            {/* <td>{p.goal}</td>
                                    <td>{p.assistance}</td>
                                    <td>{p.yellow_card}</td>
                                   <td>{p.double_yellow_card}</td>
                                    <td>{p.red_card}</td>
                                   <td>{p.injured}</td>
                                    <td>{p.heavy_injured}</td>
                                   <td>{p.mvp}</td> */}
                                            <td>
                                                <Link className="btn-edit" to={`/traspasos/${p.id}`}>Editar estado</Link>
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