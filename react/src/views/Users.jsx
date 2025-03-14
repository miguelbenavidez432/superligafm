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
        <div className="p-6">
            <div className="flex justify-between items-center mb-4 mx-8">
                <h1 className="text-2xl font-bold">USUARIOS</h1>
                <Link to='/users/new' className="btn-add bg-blue-500 text-white px-4 py-2 rounded">Nuevo Usuario</Link>
            </div>
            <div className="mb-4">
                {currentPage > 1 && (
                    <button className="btn-add bg-blue-500 text-white px-4 py-2 rounded mr-2" onClick={handlePrevPage}>Página anterior</button>
                )}
                {currentPage < totalPages && (
                    <button className='btn-add bg-blue-500 text-white px-4 py-2 rounded' onClick={handleNextPage}>Página siguiente</button>
                )}
            </div>
            <div className="card animated fadeInDown bg-white shadow-md rounded p-4">
                <table className="min-w-fit bg-white">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">Nombre</th>
                            <th className="py-2 px-4 border-b">Rol</th>
                            <th className="py-2 px-4 border-b">Presupuesto</th>
                            <th className="py-2 px-4 border-b">Acciones</th>
                        </tr>
                    </thead>
                    {loading &&
                        <tbody>
                            <tr>
                                <td colSpan="5" className="text-center py-4">CARGANDO...</td>
                            </tr>
                        </tbody>
                    }
                    {!loading &&
                        <tbody>
                            {
                                users.map(u => (
                                    <tr key={u.id}>
                                        <td className="py-2 px-4 border-b">{u.name}</td>
                                        <td className="py-2 px-4 border-b">{u.rol}</td>
                                        <td className="py-2 px-4 border-b">{u.profits}</td>
                                        <td className="py-2 px-4 border-b">
                                            {user.rol === 'Admin' ? (
                                                <>
                                                    <Link to={'/users/' + u.id} className="btn-edit bg-green-500 text-white px-4 py-2 rounded mr-2">Editar</Link>
                                                    <button onClick={e => onDelete(u)} className="btn-delete bg-red-500 text-white px-4 py-2 rounded">Borrar</button>
                                                </>
                                            ) : user.id === u.id && (
                                                <Link to={'/users/' + u.id} className="btn-edit bg-green-500 text-white px-4 py-2 rounded">Editar</Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    }
                </table>
            </div>
        </div>
    )
}
