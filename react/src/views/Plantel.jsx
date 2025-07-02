/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useStateContext } from "../context/ContextProvider";
import axiosClient from "../axios";
import { Link } from "react-router-dom";

export default function Plantel() {
    const [team, setTeam] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user, setNotification } = useStateContext();
    const [bestPlayersCA, setBestPlayersCA] = useState(null);
    const [blockedPlayersCount, setBlockedPlayersCount] = useState(0);
    const [playersOver20Count, setPlayersOver20Count] = useState(0);
    const [filterPlayersOver20ByRegister, setFilterPlayersOver20ByRegister] = useState(0);
    const [filterPlayersByRegister, setFilterPlayersByRegister] = useState(0);
    const [errors, setErrors] = useState();

    useEffect(() => {
        getTeam();
    }, []);

    useEffect(() => {
        getBestPlayersCA();
        countBlockedPlayers();
        countPlayersOver20();
        countRegisterAndOver20();
        countRegistered();
    }, [players]);

    useEffect(() => {
        if (team) {
            filterPlayersByTeam();
        }
    }, [team]);

    const countBlockedPlayers = () => {
        const blockedPlayers = players.filter((player) => player.status === "bloqueado");
        setBlockedPlayersCount(blockedPlayers.length);
    };

    const countPlayersOver20 = () => {
        const playersOver20 = players.filter((player) => player.age > 20);
        setPlayersOver20Count(playersOver20.length);
    };

    const countRegisterAndOver20 = () => {
        const filterPlayers = players.filter(p => p.status === 'registrado' && p.age > 20);
        setFilterPlayersOver20ByRegister(filterPlayers.length);
    };

    const countRegistered = () => {
        const filterPlayers = players.filter(p => p.status === 'registrado');
        setFilterPlayersByRegister(filterPlayers.length);
    };

    const getTeam = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/teams?all=true');
            const allTeams = response.data.data;
            const filteredTeam = allTeams.find(team => {
                return team.user && team.user.id === user.id;
            });
            setTeam(filteredTeam);
        } catch (error) {
            console.error();
            setNotification('Error al obtener equipo:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterPlayersByTeam = async () => {
        if (team) {
            try {
                setLoading(true);
                const response = await axiosClient.get('/players?all=true');
                const filteredPlayers = response.data.data.filter(player => player.id_team ? player.id_team.id === team.id : '');
                setPlayers(filteredPlayers);
            } catch (error) {
                console.error('Error al obtener jugadores:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const getBestPlayersCA = () => {
        if (players.length > 0) {
            const sortedPlayers = players.slice().sort((a, b) => b.ca - a.ca);
            const bestPlayers = sortedPlayers.slice(0, 16);
            const averageCA = bestPlayers.reduce((sum, player) => sum + player.ca, 0) / bestPlayers.length;
            setBestPlayersCA(averageCA);
        }
    };

    const handleBlockPlayer = async (player) => {
        setLoading(true);
        try {
            await axiosClient.post(`/bloquear_jugador`, { id: player.id });
            setPlayers((prevPlayers) => prevPlayers.map(p => p.id === player.id ? { ...p, status: "bloqueado" } : p));
            countBlockedPlayers();
        } catch (error) {
            setErrors('Error al bloquear jugador: ' + error.response.data.error);
        } finally {
            setLoading(false);
        }
    };

    const handleReleasePlayer = async (player) => {
        setLoading(true);
        try {
            await axiosClient.post(`/liberar_jugador`, { id: player.id });
            setPlayers((prevPlayers) => prevPlayers.map(p => p.id === player.id ? { ...p, status: "liberado" } : p));
            countBlockedPlayers();
        } catch (error) {
            setNotification('Error al liberar jugador: ' + error);
            console.error('Error al bloquear jugador:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleListPlayer = async (player) => {
        setLoading(true);
        try {
            await axiosClient.post(`/registrar_jugador`, { id: player.id });
            setPlayers((prevPlayers) => prevPlayers.map(p => p.id === player.id ? { ...p, status: "registrado" } : p));
        } catch (error) {
            console.error('Error al registrar jugador:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {errors &&
                <div className="alert">
                    <p>
                        {typeof errors === 'string'
                            ? errors
                            : Object.keys(errors).map(key => errors[key][0]).join(' ')}
                    </p>
                </div>
            }
            <div className="header" style={{ display: 'flex', justifyContent: "space-between", alignItems: "center", flexWrap: 'wrap', marginBottom: '20px' }}>
                <h1 className="text-2xl font-bold mb-4 text-center bg-black bg-opacity-70 rounded-lg text-white p-3">Plantel</h1>
                <button className="btn btn-primary"><Link to={`/estadisticas/${team?.id}`} style={{ color: 'white', textDecoration: 'none' }}>Ver Estadísticas</Link></button>
            </div>
            <div className="card animated fadeInDown" style={{ padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-black bg-opacity-70 text-white border-gray-800 mb-4" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}>
                            <tr>
                                <th className="py-1 px-1 border-b bg-black text-white">NOMBRE</th>
                                <th className="py-1 px-1 border-b bg-black text-white">EDAD</th>
                                <th className="py-1 px-1 border-b bg-black text-white">CA</th>
                                <th className="py-1 px-1 border-b bg-black text-white">PA</th>
                                <th className="py-1 px-1 border-b bg-black text-white">VALOR</th>
                                <th className="py-1 px-1 border-b bg-black text-white">ESTADO</th>
                                <th className="py-1 px-1 border-b bg-black text-white">ACCIONES</th>
                            </tr>
                        </thead>
                        {loading &&
                            <tbody>
                                <tr>
                                    <td colSpan="8" className="text-center" style={{ padding: '20px', fontStyle: 'italic' }}>
                                        CARGANDO...
                                    </td>
                                </tr> bg-black bg-opacity-70
                            </tbody>
                        }
                        {!loading &&
                            <tbody>
                                {
                                    team ? players.map(p => (
                                        <tr key={p.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                            <td className="border px-4 py-2 bg-black bg-opacity-70">{p.name}</td>
                                            <td className="border px-4 py-2 bg-black bg-opacity-70">{p.age}</td>
                                            <td className="border px-4 py-2 bg-black bg-opacity-70">{p.ca}</td>
                                            <td className="border px-4 py-2 bg-black bg-opacity-70">{p.pa}</td>
                                            <td className="border px-4 py-2 bg-black bg-opacity-70">{p.value}</td>
                                            <td className="border px-4 py-2 bg-black bg-opacity-70">{p.status}</td>
                                            <td className="border px-4 py-2 bg-black bg-opacity-70">
                                                {p.status !== 'nada' && (
                                                    <>
                                                        <button className="btn-edit mx-1" onClick={() => {
                                                            if (window.confirm(`¿Estás seguro de que deseas bloquear a ${p.name}`)) {
                                                                handleBlockPlayer(p);
                                                            }
                                                        }}>Bloquear</button>
                                                        <button className="btn-delete mx-1" onClick={() => {
                                                            if (window.confirm(`¿Estás seguro de que deseas liberar a ${p.name}`)) {
                                                                handleReleasePlayer(p);
                                                            }
                                                        }}>Liberar</button>
                                                        <button className="btn-add mx-1" onClick={() => {
                                                            if (window.confirm(`¿Estás seguro de que deseas registrar a ${p.name} Una vez registrado no se puede quitar`)) {
                                                                handleListPlayer(p);
                                                            }
                                                        }}>Registrar</button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    )) :
                                        <tr>
                                            <td colSpan="8" className="text-center" style={{ padding: '20px', fontWeight: 'bold' }}>
                                                No tienes equipo asignado. Prueba presionando el botón Cargar plantel
                                            </td>
                                        </tr>
                                }
                            </tbody>
                        }
                    </table>
                </div>
                <div className="stats" style={{ marginTop: '20px', lineHeight: '1.6' }}>
                    {bestPlayersCA !== null && (
                        <p>Promedio de CA de los mejores 16 jugadores: <strong>{bestPlayersCA}</strong></p>
                    )}
                    <p>Cantidad de jugadores bloqueados: <strong>{blockedPlayersCount}</strong></p>
                    <p>Cantidad de jugadores mayores a 20 años: <strong>{playersOver20Count}</strong></p>
                    <p>Cantidad de mayores registrados mayores: <strong>{filterPlayersOver20ByRegister}</strong></p>
                    <p>Cantidad de registrados: <strong>{filterPlayersByRegister}</strong></p>
                    <p>Presupuesto: <strong>{user.profits}</strong></p>
                </div>
            </div>
        </>
    );
}
