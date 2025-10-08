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

    const [message, setMessage] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const successMessage = urlParams.get('message');
        if (successMessage) {
            setMessage(successMessage);
        }
    }, []);

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

    const getDiscordAuthorizeUrl = async () => {
        try {
            const userId = user.id;
            console.log("ID de usuario:", userId);
            const response = await axiosClient.get(`discord/redirect`, { params: { userId } });

            if (response.data.url) {
                 window.open(response.data.url, '_blank');
            } else {
                console.error("No se recibió la URL de Discord.");
            }
        } catch (error) {
            console.error("Error al obtener la URL de Discord:", error.response ? error.response.data : error.message);
        }
    };

    return (
        <>
            {/* Header estilo Teams.jsx */}
            <div style={{ display: 'flex', justifyContent: "space-between", alignItems: "center" }}>
                <div className="text-xl mt-2 font-semibold mb-2 text-center lg:text-left bg-black bg-opacity-70 rounded-lg text-white p-3">
                    USUARIOS
                </div>
                {user.rol === 'Admin' && (
                    <Link to='/users/new' className="bg-green-600 hover:bg-green-800 p-3 rounded text-white">
                        Nuevo Usuario
                    </Link>
                )}
            </div>

            {/* Mensaje de éxito */}
            {message &&
                <div className="bg-green-600 bg-opacity-70 p-3 rounded-lg text-white mb-4">
                    {message}
                </div>
            }

            {/* Paginación */}
            <div className="mb-4 flex gap-2">
                {currentPage > 1 && (
                    <button
                        className="bg-blue-600 hover:bg-blue-800 p-3 rounded text-white"
                        onClick={handlePrevPage}
                    >
                        Página anterior
                    </button>
                )}
                {currentPage < totalPages && (
                    <button
                        className='bg-blue-600 hover:bg-blue-800 p-3 rounded text-white'
                        onClick={handleNextPage}
                    >
                        Página siguiente
                    </button>
                )}
            </div>

            {/* Tabla con estilo Teams.jsx */}
            <div>
                <table className="min-w-full bg-black bg-opacity-70 text-white border-gray-800 my-2">
                    <thead>
                        <tr>
                            <th className="border px-4 py-2 bg-black text-white">Nombre</th>
                            <th className="border px-4 py-2 bg-black text-white">Rol</th>
                            <th className="border px-4 py-2 bg-black text-white">Presupuesto</th>
                            <th className="border px-4 py-2 bg-black text-white">Acciones</th>
                        </tr>
                    </thead>
                    {loading &&
                        <tbody>
                            <tr>
                                <td colSpan="4" className="border px-4 py-2 text-center">
                                    CARGANDO...
                                </td>
                            </tr>
                        </tbody>
                    }
                    {!loading &&
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td className="border px-4 py-2">{u.name}</td>
                                    <td className="border px-4 py-2">{u.rol}</td>
                                    <td className="border px-4 py-2">{u.profits}</td>
                                    <td className="border px-4 py-2">
                                        {user.rol === 'Admin' ? (
                                            <>
                                                <Link
                                                    to={'/users/' + u.id}
                                                    className="bg-green-600 hover:bg-green-800 p-2 rounded text-white mr-2"
                                                >
                                                    Editar
                                                </Link>
                                                <button
                                                    onClick={e => onDelete(u)}
                                                    className="bg-red-600 hover:bg-red-800 p-2 rounded text-white"
                                                >
                                                    Borrar
                                                </button>
                                            </>
                                        ) : user.id === u.id && (
                                            <Link
                                                to={'/users/' + u.id}
                                                className="bg-green-600 hover:bg-green-800 p-2 rounded text-white"
                                            >
                                                Editar
                                            </Link>
                                        )}

                                        {user.id === u.id && u.discord_user === null && (
                                            <button
                                                onClick={getDiscordAuthorizeUrl}
                                                className="bg-blue-600 hover:bg-blue-800 p-2 rounded text-white ml-2"
                                            >
                                                Vincula Discord
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    }
                </table>
            </div>
        </>
    )
}
