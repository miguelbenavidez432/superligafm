/* eslint-disable no-unused-vars */
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

    useEffect(() => {
        getTeam();
    }, [])

    const getTeam = async () => {
        setLoading(true);
        await axiosClient.get('/teams/public?all=true')
            .then(({ data }) => {
                // Si el backend devuelve data.data, lo usamos, si no, probamos con data directamente.
                const equipos = data.data || data;
                const teamFilter = equipos.filter((t) => t.division === 'Primera' || t.division === 'Segunda');
                setTeams(teamFilter);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            })
    }

    return (
        <div className="max-w-7xl mx-auto p-4 animate-fade-in-down">

            {/* ENCABEZADO Y BOTÓN NUEVO EQUIPO */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-white bg-slate-900 border border-slate-700 px-6 py-3 rounded-xl shadow-lg w-full sm:w-auto text-center">
                    🛡️ Equipos Registrados
                </h1>
                {user?.rol === 'Admin' && (
                    <Link
                        to="/app/teams/new"
                        className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                        <span>➕ Nuevo Equipo</span>
                    </Link>
                )}
            </div>

            {/* CONTENEDOR DE LA TABLA */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-lg overflow-hidden mb-12">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-300">
                        <thead className="bg-slate-950 text-slate-300 uppercase text-xs font-bold tracking-wider border-b-2 border-slate-700">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Nombre del Equipo</th>
                                <th className="px-6 py-4 text-center font-semibold">División</th>
                                <th className="px-6 py-4 font-semibold">Manager Asignado</th>
                                <th className="px-6 py-4 text-center font-semibold">Acciones</th>
                            </tr>
                        </thead>

                        {loading ? (
                            <tbody>
                                <tr>
                                    <td colSpan="4" className="text-center py-10">
                                        <p className="font-bold text-gray-400 animate-pulse text-lg">Cargando lista de equipos...</p>
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody className="divide-y divide-slate-700/50">
                                {teams.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-8 text-gray-500">
                                            No hay equipos registrados en Primera o Segunda División.
                                        </td>
                                    </tr>
                                ) : (
                                    teams.map(t => (
                                        <tr key={t.id} className="hover:bg-slate-800/80 transition-colors group">
                                            {/* COLUMNA NOMBRE */}
                                            <td className="px-6 py-4 font-bold text-white text-base">
                                                {t.name}
                                            </td>

                                            {/* COLUMNA DIVISIÓN */}
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${
                                                    t.division === 'Primera'
                                                    ? 'bg-blue-900/50 text-blue-400 border-blue-800'
                                                    : 'bg-green-900/50 text-green-400 border-green-800'
                                                }`}>
                                                    {t.division.toUpperCase()}
                                                </span>
                                            </td>

                                            {/* COLUMNA MANAGER */}
                                            <td className="px-6 py-4 font-medium text-gray-300">
                                                {t.user ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-gray-300">
                                                            {t.user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span>{t.user.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-500 italic">Sin asignar</span>
                                                )}
                                            </td>

                                            {/* COLUMNA ACCIONES */}
                                            <td className="px-6 py-4 text-center">
                                                <Link
                                                    to={`/app/teams/${t.id}`}
                                                    className="inline-block px-4 py-2 font-bold bg-slate-700 text-white hover:bg-violet-600 rounded-lg transition-all shadow-md group-hover:shadow-violet-900/50"
                                                >
                                                    Gestionar
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        )}
                    </table>
                </div>
            </div>

            {/* SECCIÓN DE OBJETIVOS */}
            <div className="mt-10 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-white bg-slate-900 border border-slate-700 px-6 py-3 rounded-xl shadow-lg w-full lg:w-auto text-center">
                    🎯 Objetivos de Temporada
                </h2>
            </div>

            {/* Solo pasamos los equipos al componente Objectives, él se encargará de buscar a los jugadores una sola vez */}
            {!loading && teams.length > 0 && (
                <Objectives teams={teams} />
            )}

        </div>
    )
}
