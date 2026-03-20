/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import axiosClient from '../axios';
import { Link } from 'react-router-dom';
import { useStateContext } from '../context/ContextProvider';

export default function Players() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user, setNotification } = useStateContext();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchName, setSearchName] = useState('');

    useEffect(() => {
        getPlayers();
    }, [currentPage]);

    const getPlayers = () => {
        setLoading(true);
        axiosClient.get(`/players/public?page=${currentPage}`)
            .then(({ data }) => {
                setLoading(false);
                setPlayers(data.data);
                setTotalPages(data.meta.last_page);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const onDelete = (p) => {
        if (!window.confirm('¿Estás seguro que quieres borrar a este jugador?')) {
            return;
        }

        axiosClient.delete(`/players/${p.id}`)
            .then(() => {
                setNotification('Jugador eliminado satisfactoriamente');
                getPlayers();
            });
    };

    const filterPlayersByTeamDivision = async () => {
        setLoading(true);
        await axiosClient.get('/players/filter-by-division')
            .then(({ data }) => {
                setLoading(false);
                setPlayers(data.data);
            })
            .catch((error) => {
                setLoading(false);
                setNotification('Error al filtrar jugadores por equipo');
            });
    };

    const getPlayersName = (name) => {
        setLoading(true);
        axiosClient.get(`/playername?name=${name}`)
            .then(({ data }) => {
                setLoading(false);
                setPlayers(data.data);
            })
            .catch(() => {
                setLoading(false);
                setNotification('Error al buscar jugadores por nombre');
            });
    };

    const handleNextPage = () => setCurrentPage((prev) => prev + 1);
    const handlePrevPage = () => setCurrentPage((prev) => prev - 1);
    const handleSearchChange = (e) => setSearchName(e.target.value);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        getPlayersName(searchName);
    };

    // --- COMPONENTE DE ACCIONES (Para reutilizarlo en la tabla y en las tarjetas móviles) ---
    const PlayerActions = ({ p }) => {
        const isFirstOrSecond = p.id_team?.division === 'Primera' || p.id_team?.division === 'Segunda';

        return (
            <div className="flex items-center justify-end gap-2">
                {user?.rol === 'Admin' && (
                    <>
                        <Link
                            to={'/app/players/' + p.id}
                            className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
                            title="Editar"
                        >
                            👁
                        </Link>
                        <button
                            onClick={() => onDelete(p)}
                            className="bg-red-900/50 hover:bg-red-600 text-red-200 hover:text-white p-2 rounded-lg transition-colors border border-red-800 flex items-center justify-center"
                            title="Borrar"
                        >
                            🗑️
                        </button>
                    </>
                )}
                {!isFirstOrSecond ? (
                    <Link
                        to={'/app/crear_subasta/' + p.id}
                        className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-white text-sm font-bold transition-colors shadow-md text-center"
                    >
                        Subastar
                    </Link>
                ) : (
                    <Link
                        to={'/app/clausula_rescision/' + p.id}
                        className="bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg text-white text-sm font-bold transition-colors shadow-md text-center"
                    >
                        Cláusula
                    </Link>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto p-2 sm:p-4 animate-fade-in-down">

            {/* ENCABEZADO */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-white bg-slate-900 border border-slate-700 px-6 py-3 rounded-xl shadow-lg w-full sm:w-auto text-center">
                    🏃‍♂️ Base de Datos
                </h1>
                {user?.rol === 'Admin' && (
                    <Link
                        to="/players/new"
                        className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                        ➕ Agregar Jugador
                    </Link>
                )}
            </div>

            {/* PANEL DE CONTROLES (Responsivo) */}
            <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-lg mb-6 flex flex-col lg:flex-row justify-between items-center gap-4">
                <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 w-full lg:w-2/3">
                    <input
                        type="text"
                        value={searchName}
                        onChange={handleSearchChange}
                        placeholder="Buscar jugador por nombre..."
                        className="w-full p-3 border border-slate-600 rounded-lg text-white bg-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                    />
                    <button className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg text-white font-bold transition-colors shadow-md whitespace-nowrap" type="submit">
                        🔍 Buscar
                    </button>
                </form>

                <button
                    className="bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-lg text-white font-medium transition-colors border border-slate-500 w-full lg:w-auto whitespace-nowrap"
                    onClick={filterPlayersByTeamDivision}
                >
                    Filtro: Fuera de 1ra/2da
                </button>
            </div>

            {/* PAGINACIÓN SUPERIOR */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 text-sm text-gray-400 font-medium px-2 gap-3">
                <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-700 w-full sm:w-auto text-center">
                    Página <span className="text-white font-bold text-base">{currentPage}</span> de <span className="text-white font-bold text-base">{totalPages}</span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-bold transition-colors ${currentPage > 1 ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600' : 'bg-slate-900 text-slate-700 cursor-not-allowed border border-slate-800'}`}
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                    >
                        ◀ Anterior
                    </button>
                    <button
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-bold transition-colors ${currentPage < totalPages ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600' : 'bg-slate-900 text-slate-700 cursor-not-allowed border border-slate-800'}`}
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                    >
                        Siguiente ▶
                    </button>
                </div>
            </div>

            {/* ESTADOS DE CARGA / VACÍO */}
            {loading && (
                <div className="flex justify-center items-center py-20 bg-slate-900 border border-slate-700 rounded-xl shadow-lg mb-8">
                    <p className="font-bold text-gray-400 animate-pulse text-lg">Cargando jugadores...</p>
                </div>
            )}

            {!loading && players.length === 0 && (
                <div className="text-center py-20 bg-slate-900 border border-slate-700 rounded-xl shadow-lg mb-8">
                    <p className="text-gray-500 text-lg italic">No se encontraron jugadores.</p>
                </div>
            )}

            {!loading && players.length > 0 && (
                <>
                    {/* VISTA MÓVIL: TARJETAS (Oculto en pantallas medianas y grandes) */}
                    <div className="md:hidden flex flex-col gap-4 mb-8">
                        {players.map(p => (
                            <div key={p.id} className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-lg">
                                <div className="flex justify-between items-start border-b border-slate-700/50 pb-3 mb-3">
                                    <div>
                                        <h3 className="font-bold text-white text-lg">
                                            <Link to={`/app/players/${p.id}`}>{p.name}</Link>
                                            <span className="absolute left-10 -top-8 bg-gray-900 text-white text-xs font-normal px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                                                Ver datos del jugador
                                            </span>
                                        </h3>
                                        <p className="text-sm text-gray-400 mt-1">
                                            {p.id_team?.name || <span className="italic text-slate-500">Libre</span>}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase inline-block mb-2 ${p.status === 'bloqueado' ? 'bg-red-900/50 text-red-400 border border-red-800' : 'bg-green-900/50 text-green-400 border border-green-800'}`}>
                                            {p.status}
                                        </span>
                                        <p className="text-green-400 font-bold text-sm">
                                            ${Number(p.value).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 mb-4 bg-slate-800 p-2 rounded-lg text-center border border-slate-700">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold">Edad</p>
                                        <p className="text-white font-medium">{p.age}</p>
                                    </div>
                                    <div className="border-x border-slate-700">
                                        <p className="text-xs text-gray-500 uppercase font-bold">CA</p>
                                        <p className="text-blue-400 font-bold">{p.ca}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold">PA</p>
                                        <p className="text-purple-400 font-bold">{p.pa}</p>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <PlayerActions p={p} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* VISTA ESCRITORIO: TABLA (Oculto en celulares) */}
                    <div className="hidden md:block bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden mb-8">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left text-gray-300">
                                <thead className="!bg-[#0f172a] text-gray-300 uppercase text-xs font-bold tracking-wider border-b-2 border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4">Nombre</th>
                                        <th className="px-4 py-4 text-center">Edad</th>
                                        <th className="px-4 py-4 text-center">CA</th>
                                        <th className="px-4 py-4 text-center">PA</th>
                                        <th className="px-6 py-4">Equipo</th>
                                        <th className="px-6 py-4 text-right">Valor</th>
                                        <th className="px-4 py-4 text-center">Estado</th>
                                        <th className="px-6 py-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {players.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-800/80 transition-colors group">
                                            <td className="px-6 py-3 font-bold text-white whitespace-nowrap relative group">
                                                <Link to={`/app/players/${p.id}`} className="hover:text-blue-400 transition-colors">
                                                    {p.name}
                                                </Link>
                                                <span className="absolute left-10 -top-8 bg-gray-900 text-white text-xs font-normal px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                                                    Ver datos del jugador
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">{p.age}</td>
                                            <td className="px-4 py-3 text-center text-blue-400 font-bold bg-blue-900/10">{p.ca}</td>
                                            <td className="px-4 py-3 text-center text-purple-400 font-bold bg-purple-900/10">{p.pa}</td>
                                            <td className="px-6 py-3 font-medium text-gray-400">{p.id_team?.name || <span className="italic text-slate-500">Libre</span>}</td>
                                            <td className="px-6 py-3 text-right text-green-400 font-medium">
                                                ${Number(p.value).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${p.status === 'bloqueado' ? 'bg-red-900/50 text-red-400 border border-red-800' : 'bg-green-900/50 text-green-400 border border-green-800'}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <PlayerActions p={p} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
