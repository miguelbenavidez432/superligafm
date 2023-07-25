/* eslint-disable no-undef */
/* eslint-disable react/jsx-key */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react"
import axiosClient from "../axios";
import { Link } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";

export default function Users() {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user, setNotification } = useStateContext();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        getUsers();
    }, [currentPage])

    const onDelete = (u) => {
        if (!window.confirm('Estás seguro que quieres borrar este usuario??')) {
            return
        }

        axiosClient.delete(`/users/${u.id}`)
            .then(() => {
                setNotification('Usuario eliminado satisfactoriamente')
                getUsers()
            })
    }

    const getUsers = () => {
        setLoading(true)
        axiosClient.get('/users')
            .then(({ data }) => {
                setLoading(false)
                setUsers(data.data)
                setTotalPages(data.meta.last_page);
            })
            .catch(() => {
                setLoading(false)
            })
    }

    const handleNextPage = () => {
        setCurrentPage((prevPage) => prevPage + 1);
    };

    const handlePrevPage = () => {
        setCurrentPage((prevPage) => prevPage - 1);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: "space-between", alignItems: "center" }}>
                <h1>USUARIOS</h1>
                <Link to='/users/new' className="btn-add">Nuevo Usuario</Link>
            </div>
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
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Presupuesto</th>
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
                                        <th>{u.rol}</th>
                                        <th>{u.profits}</th>
                                        <th>{u.created_at}</th>
                                        {
                                            user.rol === 'Admin' ?
                                                (<>
                                                    <th>
                                                        <Link to={'/users/' + u.id} className="btn-edit">Editar</Link>
                                                        &nbsp;
                                                        <button onClick={e => onDelete(u)} className="btn-delete">Borrar</button>
                                                    </th>
                                                </>
                                                ) :
                                                user.id === u.id  &&
                                                <th>
                                                    <Link to={'/users/' + u.id} className="btn-edit">Editar</Link>
                                                    &nbsp;
                                                    <button onClick={e => onDelete(u)} className="btn-delete">Borrar</button>
                                                </th>
                                        }
                                    </tr>
                                ))}
                        </tbody>
                    }
                </table>
            </div>
        </div>
    )
}
