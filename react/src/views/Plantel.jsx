/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useStateContext } from "../context/ContextProvider";
import axiosClient from "../axios";
import { Link } from "react-router-dom";
import { act } from "react";

export default function Plantel() {
    const { user, setNotification } = useStateContext();

    const [team, setTeam] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState();

    const [selectedPlayers, setSelectedPlayers] = useState([]); // Jugadores en la "caja"

    const bestPlayersCA = players.length > 0
        ? (players.slice().sort((a, b) => b.ca - a.ca).slice(0, 16).reduce((sum, p) => sum + p.ca, 0) / Math.min(players.length, 16)).toFixed(1)
        : null;
    const blockedPlayersCount = players.filter(p => p.status === "bloqueado").length;
    const playersOver20Count = players.filter(p => p.age > 20).length;
    const filterPlayersByRegister = players.filter(p => p.status === 'registrado').length;
    const filterPlayersOver20ByRegister = players.filter(p => p.status === 'registrado' && p.age > 20).length;

    useEffect(() => {
        if (user && user.id) {
            getTeam();
        }
    }, [user]);

    useEffect(() => { if (team) filterPlayersByTeam(); }, [team]);

    const getTeam = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/teams?all=true');
            const filteredTeam = response.data.data.find(t => t.user && t.user.id === user?.id);
            setTeam(filteredTeam);
        } catch (error) {
            setErrors('Error al obtener equipo.');
        } finally {
            setLoading(false);
        }
    };

    const filterPlayersByTeam = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get(`/players-teams?id_team=${team.id}&status=all`);
            setPlayers(response.data.data || response.data);
        } catch (error) {
            setErrors('Error al obtener jugadores.');
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (e, player) => {
        e.dataTransfer.setData("player", JSON.stringify(player));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const playerData = e.dataTransfer.getData("player");
        if (playerData) {
            const player = JSON.parse(playerData);
            if (!selectedPlayers.find(p => p.id === player.id)) {
                setSelectedPlayers([...selectedPlayers, player]);
            }
        }
    };

    const handleDragOver = (e) => e.preventDefault();

    const removeSelectedPlayer = (id) => {
        setSelectedPlayers(selectedPlayers.filter(p => p.id !== id));
    };

    const handleBulkAction = async (actionType) => {
        if (selectedPlayers.length === 0) {
            alert("No hay jugadores seleccionados en la caja.");
            return;
        }

        const actionText = actionType === 'register' ? 'REGISTRAR' : actionType === 'release' ? 'LIBERAR' : 'BLOQUEAR';

        if (!window.confirm(`¿Estás seguro de que deseas ${actionText} a estos ${selectedPlayers.length} jugadores?`)) return;
        setLoading(true);
        setErrors();
        try {
            const totalBlockedPlayersCount = blockedPlayersCount + selectedPlayers.length;

            const arrayDeIds = selectedPlayers.map(p => p.id);
            let message = '';

            // 1. BLOQUEAR
            if (actionType === 'block') {
                if (totalBlockedPlayersCount > 4) {
                    setErrors('El límite máximo de jugadores bloqueados en el equipo es de 4.');
                    setLoading(false);
                    return;
                }
                const response = await axiosClient.post(`/bloquear_jugador`, { ids: arrayDeIds });
                // Actualizamos estado y presupuesto
                setPlayers(players.map(p => selectedPlayers.find(sp => sp.id === p.id) ? { ...p, status: 'bloqueado' } : p));
                user.profits = response.data.nuevo_presupuesto;
                message = response.data.message;
            }

            // 2. REGISTRAR
            else if (actionType === 'register') {
                const response = await axiosClient.post(`/registrar_jugador`, { ids: arrayDeIds });
                setPlayers(players.map(p => selectedPlayers.find(sp => sp.id === p.id) ? { ...p, status: 'registrado' } : p));
                message = response.data.message;
            }

            // 3. LIBERAR
            else if (actionType === 'release') {
                const response = await axiosClient.post(`/liberar_jugador`, { ids: arrayDeIds });
                // OJO AQUÍ: En lugar de cambiar el status, los quitamos del arreglo local porque ya no son de nuestro equipo
                setPlayers(players.filter(p => !selectedPlayers.find(sp => sp.id === p.id)));
                message = response.data.message;
            }

            setNotification(`Jugadores procesados correctamente.`);
            setSelectedPlayers([]);
        } catch (error) {
            setErrors(`Error en la acción masiva: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const availablePlayers = players.filter(p => !selectedPlayers.find(sp => sp.id === p.id));

    return (
        <div className="p-4 max-w-7xl mx-auto">
            {/* ALERTAS */}
            {errors && (
                <div className="alert bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 shadow-lg">
                    <p>{typeof errors === 'string' ? errors : Object.keys(errors).map(k => errors[k][0]).join(' ')}</p>
                </div>
            )}

            {/* CABECERA */}
            <div className="flex justify-between items-center flex-wrap mb-6">
                <h1 className="text-3xl font-bold text-center bg-slate-800 rounded-lg text-white p-4 shadow-md w-full md:w-auto">
                    Plantel de {team?.name || 'Cargando...'}
                </h1>
                <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-colors mt-4 md:mt-0 shadow-md">
                    <Link to={`/app/estadisticas/${team?.id}`}>📊 Ver Estadísticas</Link>
                </button>
            </div>

            {/* INTERFAZ DRAG & DROP (2 Columnas) */}
            <div className="flex flex-col xl:flex-row gap-6">

                {/* COLUMNA IZQUIERDA: Lista de Jugadores */}
                <div className="flex-1 bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700">
                    <h2 className="text-xl font-bold text-blue-400 mb-4">⬇️ Arrastra los jugadores desde aquí</h2>
                    <div className="overflow-x-auto max-h-[450px] overflow-y-auto pr-2 custom-scrollbar lg:max-h-[650px]">
                        <table className="min-w-full text-white text-sm">
                            <thead className="bg-slate-900 sticky top-0 z-10 shadow-md text-black">
                                <tr>
                                    <th className="py-3 px-4 text-left">NOMBRE</th>
                                    <th className="py-3 px-2 text-center">EDAD</th>
                                    <th className="py-3 px-2 text-center">CA</th>
                                    <th className="py-3 px-2 text-center">PA</th>
                                    <th className="py-3 px-2 text-center">VALOR</th>
                                    <th className="py-3 px-4 text-left">ESTADO</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && <tr><td colSpan="6" className="text-center py-8 text-gray-400 font-bold animate-pulse">Cargando datos...</td></tr>}
                                {!loading && availablePlayers.length === 0 && <tr><td colSpan="6" className="text-center py-8 text-gray-400">No hay jugadores disponibles.</td></tr>}

                                {!loading && availablePlayers.map(p => (
                                    <tr
                                        key={p.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, p)}
                                        className="border-b border-slate-700 hover:bg-slate-700 cursor-grab active:cursor-grabbing transition-colors"
                                    >
                                        <td className="py-3 px-4 font-semibold relative group">
                                            <Link to={`/app/players/${p.id}`} className="hover:text-blue-400 transition-colors">
                                                {p.name}
                                            </Link>
                                            <span className="absolute left-10 -top-8 bg-gray-900 text-white text-xs font-normal px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                                                Ver datos del jugador
                                            </span>
                                        </td>
                                        <td className="py-3 px-2 text-center">{p.age}</td>
                                        <td className="py-3 px-2 text-center">{p.ca}</td>
                                        <td className="py-3 px-2 text-center">{p.pa}</td>
                                        <td className="py-3 px-2 text-center">${p.value}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'registrado' ? 'bg-green-600' : p.status === 'bloqueado' ? 'bg-red-600' : 'bg-gray-600'
                                                }`}>
                                                {/* Si p.status existe lo pone en mayúsculas, si es null pone 'SIN ESTADO' */}
                                                {p.status ? p.status.toUpperCase() : 'SIN ESTADO'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* COLUMNA DERECHA: Dropzone y Acciones */}
                <div className="xl:w-[450px] flex flex-col gap-6">

                    {/* DROPZONE (La Caja) */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className={`bg-slate-900 border-2 border-dashed rounded-xl p-6 flex flex-col transition-all min-h-[400px] shadow-xl
                        ${selectedPlayers.length > 0 ? 'border-blue-500 bg-slate-800' : 'border-slate-600 hover:border-gray-400'}`}
                    >
                        <h2 className="text-xl font-bold text-white mb-2 flex items-center justify-between">
                            <span>📦 Jugadores Seleccionados</span>
                            <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full">{selectedPlayers.length}</span>
                        </h2>

                        {selectedPlayers.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 opacity-70">
                                <span className="text-6xl mb-4">📥</span>
                                <p className="text-lg text-center font-medium">Suelta los jugadores aquí</p>
                            </div>
                        ) : (
                            <ul className="flex-1 overflow-y-auto mt-4 space-y-2 pr-2 custom-scrollbar">
                                {selectedPlayers.map(p => (
                                    <li key={p.id} className="bg-slate-700 flex justify-between items-center p-3 rounded-lg shadow-sm">
                                        <div>
                                            <p className="font-bold text-white">{p.name}</p>
                                            <p className="text-xs text-gray-400">CA: {p.ca} | Est: {p.status}</p>
                                        </div>
                                        <button
                                            onClick={() => removeSelectedPlayer(p.id)}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-900 hover:bg-opacity-50 p-2 rounded-full transition-colors"
                                            title="Quitar de la lista"
                                        >
                                            ✖
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* BOTONES DE ACCIÓN */}
                        <div className="mt-6 flex flex-col gap-3">
                            <button
                                onClick={() => handleBulkAction('register')}
                                disabled={selectedPlayers.length === 0}
                                className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-700 text-white font-bold py-3 rounded-lg shadow-md transition-all disabled:opacity-50"
                            >
                                ✅ REGISTRAR SELECCIONADOS
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleBulkAction('release')}
                                    disabled={selectedPlayers.length === 0}
                                    className="flex-1 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 text-white font-bold py-3 rounded-lg shadow-md transition-all disabled:opacity-50"
                                >
                                    🔓 LIBERAR
                                </button>
                                <button
                                    onClick={() => handleBulkAction('block')}
                                    disabled={selectedPlayers.length === 0}
                                    className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 text-white font-bold py-3 rounded-lg shadow-md transition-all disabled:opacity-50"
                                >
                                    🚫 BLOQUEAR
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ESTADÍSTICAS */}
                    <div className="bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700 text-gray-300 text-sm flex flex-col gap-2">
                        <h3 className="text-lg font-bold text-blue-400 mb-2 border-b border-slate-700 pb-2">📈 Resumen del Plantel</h3>
                        {bestPlayersCA !== null && (
                            <p className="flex justify-between"><span>Promedio Top 16 (CA):</span> <strong className="text-white text-base">{bestPlayersCA}</strong></p>
                        )}
                        <p className="flex justify-between"><span>Jugadores Bloqueados:</span> <strong className="text-white text-base">{blockedPlayersCount}</strong></p>
                        <p className="flex justify-between"><span>Jugadores Mayores (+20):</span> <strong className="text-white text-base">{playersOver20Count}</strong></p>
                        <p className="flex justify-between text-green-400 font-semibold mt-2"><span>Mayores Registrados:</span> <strong className="text-base">{filterPlayersOver20ByRegister}</strong></p>
                        <p className="flex justify-between text-green-400 font-semibold"><span>Total Registrados:</span> <strong className="text-base">{filterPlayersByRegister}</strong></p>
                        <div className="mt-2 pt-3 border-t border-slate-700">
                            <p className="flex justify-between text-yellow-400 text-lg"><span>Presupuesto:</span> <strong>${user.profits}</strong></p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
