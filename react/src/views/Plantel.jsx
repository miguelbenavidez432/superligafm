import { useEffect, useState } from "react";
import { useStateContext } from "../context/ContextProvider";
import axiosClient from "../axios";
import { Link } from "react-router-dom";

export default function Plantel() {
    const [team, setTeam] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useStateContext();
    const [bestPlayersCA, setBestPlayersCA] = useState(null);
    const [blockedPlayersCount, setBlockedPlayersCount] = useState(0);
    const [playersOver20Count, setPlayersOver20Count] = useState(0);
    const [filterPlayersOver20ByRegister, setFilterPlayersOver20ByRegister] = useState(0);
    const [filterPlayersByRegister, setFilterPlayersByRegister] = useState(0);

    useEffect(() => {
        getTeam();
    }, []);

    useEffect(() => {
        if (players.length > 0) {
            getBestPlayersCA();
            countBlockedPlayers();
            countPlayersOver20();
            countRegisterAndOver20();
            countRegistered();
        }
    }, [players]);

    useEffect(() => {
        if (team) {
            filterPlayersByTeam();
        }
    }, [team]);

    const cargarJugadores = () => {
        filterPlayersByTeam();
    };

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
            const response = await axiosClient.get('/teams');
            setLoading(false);
            const allTeams = response.data.data;
            const filteredTeam = allTeams.find(team => team.id_user === user.id);

            console.log('Equipo filtrado:', filteredTeam);
            setTeam(filteredTeam);
        } catch {
            setLoading(false);
        }
    };

    const filterPlayersByTeam = async () => {
        if (team) {
            try {
                setLoading(true);
                const response = await axiosClient.get('/plantel');
                const allPlayers = response.data.data;
                const filteredPlayers = allPlayers.filter(p =>  p.id_team === team.id);
                setPlayers(filteredPlayers);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching players:", error);
                setLoading(false);
            }
        }
    };

    const getBestPlayersCA = () => {
        if (players.length > 0) {
            const sortedPlayers = players.slice().sort((a, b) => b.ca - a.ca);
            const bestPlayers = sortedPlayers.slice(0, 16);
            const averageCA =
                bestPlayers.reduce((sum, player) => sum + player.ca, 0) / bestPlayers.length;
            setBestPlayersCA(averageCA);
        }
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: "space-between", alignItems: "center" }}>
                <div>Plantel</div>
                <button className="btn-add" onClick={cargarJugadores}>Cargar plantel</button>
            </div>
            <div className="card animated fadeInDown">
                <table>
                    <thead>
                        <tr>
                            <th>NOMBRE</th>
                            <th>EDAD</th>
                            <th>CA</th>
                            <th>PA</th>
                            <th>NACIONALIDAD</th>
                            <th>VALOR</th>
                            <th>ESTADO</th>
                            <th>ACCIONES</th>
                        </tr>
                    </thead>
                    {loading &&
                        <tbody>
                            <tr>
                                <td colSpan="8" className="text-center">
                                    CARGANDO...
                                </td>
                            </tr>
                        </tbody>
                    }
                    {!loading &&
                        <tbody>
                            {
                                team ? players.length > 0 ? players.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.name}</td>
                                        <td>{p.age}</td>
                                        <td>{p.ca}</td>
                                        <td>{p.pa}</td>
                                        <td>{p.nation}</td>
                                        <td>{p.value}</td>
                                        <td>{p.status}</td>
                                        <td>
                                            <Link className="btn-edit" to={`/players/${p.id}`}>Editar estado</Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="8" className="text-center">
                                            <strong>No hay jugadores para mostrar.</strong>
                                        </td>
                                    </tr>
                                )
                                    :
                                    <tr>
                                        <td colSpan="8" className="text-center">
                                            <strong>No tienes equipo asignado. Prueba presionando el botón Cargar plantel</strong>
                                        </td>
                                    </tr>
                            }
                        </tbody>
                    }
                </table>
                <div>
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
