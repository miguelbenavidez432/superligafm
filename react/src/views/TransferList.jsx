/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import axiosClient from "../axios";
import { useStateContext } from "../context/ContextProvider";

export default function TransferList() {
    const [transfers, setTransfers] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState('');
    const [loading, setLoading] = useState(true);
    const { setNotification } = useStateContext();

    useEffect(() => {
        getTransfers();
        getSeasons();
    }, []);

    useEffect(() => {
        if (selectedSeason) {
            filterTransfersBySeason(selectedSeason);
        } else {
            getTransfers();
        }
    }, [selectedSeason]);

    const getTransfers = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/traspasos');
            setTransfers(response.data.data || []);
        } catch (error) {
            setNotification('Error al obtener transferencias: ' + error);
        } finally {
            setLoading(false);
        }
    };

    const getSeasons = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/season');
            setSeasons(response.data.data || []);
        } catch (error) {
            setNotification('Error al obtener temporadas: ' + error);
        } finally {
            setLoading(false);
        }
    };

    const filterTransfersBySeason = async (seasonId) => {
        setLoading(true);
        try {
            const response = await axiosClient.get(`/traspasos?season=${seasonId}`);
            setTransfers(response.data.data || []);
        } catch (error) {
            setNotification('Error al filtrar transferencias por temporada: ' + error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="mb-4">
                <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-2">Filtrar por temporada:</label>
                <select
                    id="season"
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(e.target.value)}
                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    <option value="">Todas las temporadas</option>
                    {Array.isArray(seasons) && seasons.map(season => (
                        <option key={season.id} value={season.id}>{season.name}</option>
                    ))}
                </select>
            </div>
            <div className="card animated fadeInDown overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JUGADORES TRANSFERIDOS</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EQUIPO DESDE - EQUIPO HASTA</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CREADO POR</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FECHA DE CREACIÓN</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VALOR</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CONFIRMADA?</th>
                        </tr>
                    </thead>
                    {loading &&
                        <tbody>
                            <tr>
                                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                    CARGANDO...
                                </td>
                            </tr>
                        </tbody>
                    }
                    {!loading &&
                        <tbody className="bg-white divide-y divide-gray-200">
                            {
                                Array.isArray(transfers) && transfers.length > 0 ? (
                                    transfers.map(p => {
                                        const teamFromName = p.team_from?.name ? p.team_from.name.substring(0, 10) : 'Sin equipo';
                                        const teamToName = p.team_to?.name ? p.team_to.name.substring(0, 10) : 'Sin equipo';
                                        const createdByName = p.created_by?.name || 'Usuario desconocido';

                                        return (
                                            <tr key={p.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.transferred_players}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teamFromName} - {teamToName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{createdByName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.created_at}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.budget}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.confirmed}</td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                            No se encontraron transferencias
                                        </td>
                                    </tr>
                                )
                            }
                        </tbody>
                    }
                </table>
            </div>
        </>
    )
}
