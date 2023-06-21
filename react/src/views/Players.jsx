/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react"
import axiosClient from "../axios";
import { Link } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";

export default function Players() {

    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { setNotification } = useStateContext();

    useEffect(() => {
        getPlayers()
    }, [])

    const getPlayers = () => {
        setLoading(true)
        axiosClient.get('/players')
            .then(({ data }) => {
                setLoading(false)
                setPlayers(data.data)
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

    return (
        <div>
            <div style={{ display: "flex", justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Jugadores</h1>
                <Link to='/players/new' className="btn-add">Agregar nuevo jugador</Link>
            </div>
            <div className="card animated fadeInDown">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
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
                    {
                        !loading &&
                        <tbody>
                            {
                                players.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.id}</td>
                                        <td>{p.name}</td>
                                        <td>{p.age}</td>
                                        <td>{p.ca}</td>
                                        <td>{p.pa}</td>
                                        <td>{p.nation}</td>
                                        <td>{p.team}</td>
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
                                            <Link className="btn-edit" to={'players/' + p.id}>Editar</Link>
                                            <button onClick={e => onDelete(p)} className="btn-delete">Borrar</button>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    }
                </table>
            </div>
        </div>
    )
}
