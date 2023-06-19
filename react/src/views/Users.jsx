/* eslint-disable no-undef */
/* eslint-disable react/jsx-key */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react"
import axiosClient from "../axios";
import { Link } from "react-router-dom";

export default function Users() {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getUsers();
    }, [])

    const onDelete = (u) => {
        if (!window.confirm('Estás seguro que quieres borrar este usuario??')) {
            return
        }

        axiosClient.delete(`/users/${u.id}`)
            .then(() => {
                getUsers()
            })
    }

    const getUsers = () => {
        setLoading(true)
        axiosClient.get('/users')
            .then(({ data }) => {
                setLoading(false)
                console.log(data)
                setUsers(data.data)
            })
            .catch(() => {
                setLoading(false)
            })}

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: "space-between", alignItems: "center" }}>
                <h1>USUARIOS</h1>
                <Link to='/users/new' className="btn-add">Nuevo Usuario</Link>
            </div>
            <div className="card animated fadeInDown">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Equipo</th>
                            <th>Rol</th>
                            <th>Gastos</th>
                            <th>Ganancias</th>
                            <th>Create Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    {loading &&
                        <tbody>
                            <tr>
                                <td colSpan="9" className="text-center">
                                    CARGANDO...
                                </td>
                            </tr>
                        </tbody>
                    }
                    {!loading &&
                        <tbody>
                            {
                                users.map(u => (
                                    <tr key={u.id}>
                                        <th>{u.id}</th>
                                        <th>{u.name}</th>
                                        <th>{u.email}</th>
                                        <th>{u.equipo}</th>
                                        <th>{u.rol}</th>
                                        <th>{u.gastos}</th>
                                        <th>{u.ganancias}</th>
                                        <th>{u.created_at}</th>
                                        <th>
                                            <Link to={'/users/' + u.id} className="btn-edit">Editar</Link>
                                            &nbsp;
                                            <button onClick={e => onDelete(u)} className="btn-delete">Borrar</button>
                                        </th>
                                    </tr>
                                ))}
                        </tbody>
                    }
                </table>
            </div>
        </div>
    )
}
