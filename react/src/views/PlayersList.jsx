/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import axiosClient from '../axios';
import { useStateContext } from '../context/ContextProvider';
import * as XLSX from 'xlsx';

export default function PlayersList() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { setNotification } = useStateContext();

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
        setLoading(true);
        try {
            // 1. Obtenemos la lista de todos los equipos
            const teamsResponse = await axiosClient.get('/teams'); // Usa tu ruta de equipos aquí
            const teamsList = teamsResponse.data.data || teamsResponse.data;
            const teamFilter = teamsList.filter((t) => t.division === 'Primera' || t.division === 'Segunda');

            // 2. Extraemos los IDs y los unimos en un string separado por comas (ej: "1,2,3,4")
            const teamIds = teamFilter.map(team => team.id).join(',');

            // 3. Llamamos a tu endpoint personalizado
            const response = await axiosClient.get(`/players-teams?id_team=${teamIds}&status=registrado`);

            const playersData = response.data.data || response.data;
            console.log("Jugadores obtenidos:", playersData);
            setPlayers(playersData);
        } catch (error) {
            console.error("Error al cargar jugadores:", error);
            setNotification('Error al cargar la lista de jugadores');
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = () => {
        if (players.length === 0) {
            setNotification('No hay datos para exportar');
            return;
        }

        const dataToExport = players.map(player => ({
            'Nombre': player.name || 'Desconocido',
            'CA': player.ca || 0,
            'PA': player.pa || 0,
            'Edad': player.age || '-',
            'Equipo': player.id_team ? player.id_team.name : (player.team_id || 'Sin Equipo'),
            'Valor (€)': player.value || 0
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Jugadores");

        XLSX.writeFile(workbook, "Lista_Jugadores_Superliga.xlsx");
        setNotification('✅ Archivo Excel descargado con éxito');
    };

    const filteredPlayers = players.filter(player => {
        const searchLower = searchTerm.toLowerCase();
        return (
            player.name?.toLowerCase().includes(searchLower) ||
            player.team?.name?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 animate-fade-in-down pb-20">

            <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-700 gap-6">
                <div className="text-center md:text-left">
                    <h1 className="font-black text-2xl sm:text-3xl text-white uppercase tracking-widest flex items-center justify-center md:justify-start gap-3">
                        <span className="text-4xl drop-shadow-lg">👥</span>
                        Jugadores Registrados
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium tracking-wide">Base de datos oficial de la Superliga</p>
                </div>

                <button
                    onClick={handleExportExcel}
                    disabled={loading || players.length === 0}
                    className="w-full md:w-auto px-6 py-3 rounded-xl font-black text-white uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    📊 Descargar Excel
                </button>
            </div>

            <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400">🔍</span>
                </div>
                <input
                    type="text"
                    placeholder="Buscar por nombre o equipo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 p-4 border border-slate-600 rounded-xl bg-slate-900/80 text-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-inner backdrop-blur-md"
                />
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto max-h-[600px]">
                    <table className="min-w-full text-sm text-left text-gray-300 relative">
                        <thead className="bg-[#0f172a] text-slate-400 uppercase text-xs font-bold tracking-wider sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="py-4 px-6">Nombre</th>
                                <th className="py-4 px-4 text-center">Edad</th>
                                <th className="py-4 px-4 text-center text-blue-400">CA</th>
                                <th className="py-4 px-4 text-center text-emerald-400">PA</th>
                                <th className="py-4 px-6">Equipo</th>
                                <th className="py-4 px-6 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center">
                                        <div className="loader inline-block border-4 border-slate-600 border-t-blue-500 rounded-full w-10 h-10 animate-spin"></div>
                                        <p className="text-slate-400 mt-4 font-bold animate-pulse">Consultando servidores...</p>
                                    </td>
                                </tr>
                            ) : filteredPlayers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-slate-500 font-medium text-lg">
                                        No se encontraron jugadores con ese criterio.
                                    </td>
                                </tr>
                            ) : (
                                filteredPlayers.map((player) => (
                                    <tr key={player.id} className="hover:bg-slate-800/80 transition-colors group">
                                        <td className="py-3 px-6 font-bold text-white group-hover:text-blue-300 transition-colors">
                                            {player.name}
                                        </td>
                                        <td className="py-3 px-4 text-center font-medium">
                                            {player.age || '-'}
                                        </td>
                                        <td className="py-3 px-4 text-center font-black text-blue-400 text-base">
                                            {player.ca}
                                        </td>
                                        <td className="py-3 px-4 text-center font-black text-emerald-400 text-base">
                                            {player.pa}
                                        </td>
                                        <td className="py-3 px-6">
                                            {player.id_team ? (
                                                <span className="bg-slate-700/50 text-slate-200 px-3 py-1 rounded-full text-xs font-bold border border-slate-600 shadow-sm">
                                                    {player.id_team.name}
                                                </span>
                                            ) : (
                                                <span className="text-slate-500 italic text-xs font-bold">Sin equipo asignado</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-6 text-right font-mono font-bold text-yellow-500">
                                            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(player.value || 0)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && (
                    <div className="bg-slate-800/50 border-t border-slate-700 p-4 text-center text-slate-400 text-sm font-medium">
                        Mostrando {filteredPlayers.length} {filteredPlayers.length === 1 ? 'jugador' : 'jugadores'}
                    </div>
                )}
            </div>

        </div>
    );
}
