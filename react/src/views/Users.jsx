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
    const [message, setMessage] = useState(null);

    useEffect(() => {
        getUsers();
    }, [currentPage])

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
        axiosClient.get('/users', {
            params: {
                page: currentPage,
            },
        })
            .then(({ data }) => {
                setLoading(false)
                setUsers(data.data || [])
                setTotalPages(data.meta?.last_page || 1);
            })
            .catch(() => {
                setLoading(false)
            })
    }

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prevPage) => prevPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
        }
    };

    const getDiscordAuthorizeUrl = async () => {
        try {
            const userId = user.id;
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

    const getDiscordDmUrl = (discordId) => `https://discord.com/users/${discordId}`;

    const getRoleBadgeClass = (role) => {
        if (role === 'Admin' || role === 'Organizador') {
            return 'bg-red-900/50 text-red-300 border-red-800';
        }

        if (String(role).includes('Manager')) {
            return 'bg-blue-900/50 text-blue-300 border-blue-800';
        }

        return 'bg-slate-800 text-slate-300 border-slate-700';
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 animate-fade-in-down pb-20">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6 bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-700 shadow-xl">
                <div>
                    <h1 className="font-black text-2xl sm:text-3xl text-white uppercase tracking-wider">Managers y usuarios</h1>
                    <p className="text-slate-400 mt-1">Gestion y contacto directo por Discord</p>
                </div>

                {user.rol === 'Admin' && (
                    <Link
                        to='/app/users/new'
                        className="w-full lg:w-auto bg-emerald-600 hover:bg-emerald-500 px-5 py-3 rounded-xl text-white font-bold transition-colors text-center"
                    >
                        Nuevo Usuario
                    </Link>
                )}
            </div>

            {message && (
                <div className="bg-emerald-600/80 p-3 rounded-lg text-white mb-4 font-medium">
                    {message}
                </div>
            )}

            <div className="mb-4 flex items-center gap-3">
                {currentPage > 1 && (
                    <button
                        className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-white font-semibold"
                        onClick={handlePrevPage}
                    >
                        Anterior
                    </button>
                )}
                <span className="text-slate-300 text-sm font-medium">Pagina {currentPage} de {totalPages}</span>
                {currentPage < totalPages && (
                    <button
                        className='bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-white font-semibold'
                        onClick={handleNextPage}
                    >
                        Siguiente
                    </button>
                )}
            </div>

            <div className="bg-slate-900/80 border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-slate-200">
                        <thead className="bg-slate-950 text-slate-400 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Nombre</th>
                                <th className="px-6 py-4">Rol</th>
                                <th className="px-6 py-4">Presupuesto</th>
                                <th className="px-6 py-4">Discord</th>
                                <th className="px-6 py-4">Acciones</th>
                            </tr>
                        </thead>
                        {loading &&
                            <tbody>
                                <tr>
                                    <td colSpan="5" className="text-center py-10 text-slate-400 font-semibold">
                                        Cargando usuarios...
                                    </td>
                                </tr>
                            </tbody>
                        }
                        {!loading &&
                            <tbody className="divide-y divide-slate-700/50">
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-10 text-slate-500">
                                            No hay usuarios para mostrar.
                                        </td>
                                    </tr>
                                )}
                                {users.map(u => {
                                    const discordId = u.discord_user?.discord_id;
                                    const discordUsername = u.discord_user?.discord_username;

                                    return (
                                        <tr key={u.id} className="hover:bg-slate-800/70 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-white">{u.name}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadgeClass(u.rol)}`}>
                                                    {u.rol}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-emerald-400">{u.profits}</td>
                                            <td className="px-6 py-4">
                                                {discordId ? (
                                                    <div className="flex flex-col gap-1">
                                                        {/* <span className="text-xs text-slate-300">{discordUsername || `ID ${discordId}`}</span> */}
                                                        <a
                                                            href={getDiscordDmUrl(discordId)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center justify-center px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold w-fit"
                                                        >
                                                            Mensaje Discord
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-500 italic">No vinculado</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {user.rol === 'Admin' ? (
                                                        <>
                                                            <Link
                                                                to={'/app/users/' + u.id}
                                                                className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg text-white text-xs font-bold"
                                                            >
                                                                Editar
                                                            </Link>
                                                            <button
                                                                onClick={() => onDelete(u)}
                                                                className="bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-lg text-white text-xs font-bold"
                                                            >
                                                                Borrar
                                                            </button>
                                                        </>
                                                    ) : user.id === u.id && (
                                                        <Link
                                                            to={'/app/users/' + u.id}
                                                            className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg text-white text-xs font-bold"
                                                        >
                                                            Editar
                                                        </Link>
                                                    )}

                                                    {user.id === u.id && !discordId && (
                                                        <button
                                                            onClick={getDiscordAuthorizeUrl}
                                                            className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg text-white text-xs font-bold"
                                                        >
                                                            Vincular Discord
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        }
                    </table>
                </div>
            </div>
        </div>
    )
}
