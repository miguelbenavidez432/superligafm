/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useStateContext } from "../context/ContextProvider"
import axiosClient from "../axios";
import { Link } from "react-router-dom";

export default function Dashboard() {

    const [manager, setManager] = useState([]);
    const [team, setTeam] = useState([]);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user, setNotification } = useStateContext();

    useEffect(() => {
        //getUsers();
        setManager(user);
    }, [])

    const cargarJugadores = () => {
        getTeam();
        getPlayers();
    }

    const release = (e) => {
        e.preventDefault()
        if (players.id) {
            setLoading(true)
            axiosClient.put(`/players/${players.id}`)
                .then(({ data }) => {
                    setLoading(false)
                    console.log(data)
                    setManager(data.data)
                })
                .catch(() => {
                    setLoading(false)
                })
        }
    }

    const getTeam = () => {
        setLoading(true)
        axiosClient.get('/teams')
            .then(({ data }) => {
                setLoading(false)
                const teamFilter = data.data.find((t) => t.id_user === manager.id)
                console.log(teamFilter)
                setTeam(teamFilter)
            })
            .catch(() => {
                setLoading(false)
            })
    }

    const getPlayers = () => {
        setLoading(true)
        axiosClient.get('/players')
            .then(({ data }) => {
                setLoading(false)
                const playersFiltered = data.data.filter((p) => p.id_team === team.id)
                console.log(playersFiltered)
                setPlayers(playersFiltered)
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
                            <th>NOMBRE</th>
                            <th>EDAD</th>
                            <th>CA</th>
                            <th>PA</th>
                            <th>NACIONALIDAD</th>
                            <th>EQUIPO</th>
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
                                team ? players && players.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.name}</td>
                                        <td>{p.age}</td>
                                        <td>{p.ca}</td>
                                        <td>{p.pa}</td>
                                        <td>{p.nation}</td>
                                        <td>{p.id_team}</td>
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
                                            <Link className="btn-edit" to={`/players/${p.id}`}>Editar</Link>
                                            <button onClick={e => onDelete(p)} className="btn-delete">Borrar</button>
                                        </td>
                                    </tr>
                                ))
                                    :
                                    <tr>
                                        <td colSpan="10" className="text-center">
                                          <strong>  No tienes equipo asignado  </strong> 
                                        </td>
                                    </tr>
                            }
                        </tbody>
                    }
                </table>
            </div >
        </>
    )
}