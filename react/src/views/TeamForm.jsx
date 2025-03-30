/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import axiosClient from "../axios";

export default function TeamForm() {

    const [team, setTeam] = useState({
        name: '',
        division: '',
        id_user: '',
    });
    const [players, setPlayers] = useState([])
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, setNotification } = useStateContext();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(null);
    const [users, setUsers] = useState([]);
    const [idUser, setIdUser] = useState()
    const [bestPlayersCA, setBestPlayersCA] = useState(null);
    const [blockedPlayersCount, setBlockedPlayersCount] = useState(0);
    const [playersOver20Count, setPlayersOver20Count] = useState(0);
    const [filterPlayersOver20ByRegister, setFilterPlayersOver20ByRegister] = useState(0);
    const [filterPlayersByRegister, setFilterPlayersByRegister] = useState(0);

    useEffect(() => {
        if (id) {
            setLoading(true);
            axiosClient
                .get(`/teams/${id}`)
                .then(({ data }) => {
                    setLoading(false);
                    setTeam(data);
                    getPlayers();
                    getUsers();
                })
                .catch(() => {
                    setLoading(false);
                });
        } else {
            setTeam({
                name: '',
                division: '',
                user: '',
            });
        }
    }, [id]);

    useEffect(() => {
        if (players.length > 0) {
            countBlockedPlayers();
            countPlayersOver20();
            getBestPlayersCA();
            countRegisterAndOver20();
            countRegistered();
        }
    }, [players]);

    const getPlayers = () => {
        setLoading(true);
        axiosClient.get('/players?all=true')
            .then(({ data }) => {
                setLoading(false);
                const playersFiltered = data.data.filter((p) => p.id_team && p.id_team.id === parseInt(id));
                setPlayers(playersFiltered);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const getUsers = () => {
        setLoading(true)
        axiosClient.get('/users')
            .then(({ data }) => {
                setLoading(false)
                setUsers(data.data)
            })
            .catch(() => {
                setLoading(false)
            })
    }

    const getBestPlayersCA = () => {
        if (players.length > 0) {
            const sortedPlayers = players.slice().sort((a, b) => b.ca - a.ca);
            const bestPlayers = sortedPlayers.slice(0, 16);
            const averageCA =
                bestPlayers.reduce((sum, player) => sum + player.ca, 0) / bestPlayers.length;
            setBestPlayersCA(averageCA);
        }
    };

    const countPlayersOver20 = () => {
        const playersOver20 = players.filter((player) => player.age > 20);
        setPlayersOver20Count(playersOver20.length);
    };

    const countBlockedPlayers = () => {
        const blockedPlayers = players.filter((player) => player.status === "bloqueado");
        setBlockedPlayersCount(blockedPlayers.length);
    };

    const countRegisterAndOver20 = () => {
        const filterPlayers = players.filter(p => p.status === 'registrado' && p.age > 20);
        setFilterPlayersOver20ByRegister(filterPlayers.length);
    }

    const countRegistered = () => {
        const filterPlayers = players.filter(p => p.status === 'registrado');
        setFilterPlayersByRegister(filterPlayers.length);
    }

    const handleUserChange = (e) => {
        const selectedUserId = e.target.value;
        setTeam((prevTeam) => ({ ...prevTeam, id_user: parseInt(selectedUserId) }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (team.id) {
            setTeam({
                ...team,
                id_user: parseInt(idUser)
            })
            axiosClient.put(`/teams/${team.id}`, team)
                .then(() => {
                    setNotification('Equipo actualizado satisfactoriamente')
                    navigate('/teams')
                })
                .catch(err => {
                    const response = err.response;
                    if (response && response.status === 422) {
                        setErrors(response.data.errors)
                    }
                })
        } else {
            axiosClient.post(`/teams`, team)
                .then(() => {
                    setNotification('Equipo creado satisfactoriamente')
                    navigate('/teams')
                })
                .catch(err => {
                    const response = err.response;
                    if (response && response.status === 422) {
                        setErrors(response.data.errors)
                    }
                })
        }
    }

    return (
        <>
            {team.id && <h1 className="text-xl mt-2 font-semibold mb-2 text-center lg:text-left bg-black bg-opacity-70 rounded-lg text-white p-3">ACTUALIZAR A: {team.name}</h1>}
            {!team.id && <h1 className="text-xl mt-2 font-semibold mb-2 text-center lg:text-left bg-black bg-opacity-70 rounded-lg text-white p-3">NUEVO EQUIPO</h1>}

            <div className="overflow-x-auto">
                {loading &&
                    (<div className="text-center font-semibold text-black">CARGANDO...</div>)
                }
                {errors &&
                    <div className="alert">
                        {Object.keys(errors).map(key => (
                            <p key={key}>{errors[key][0]}</p>
                        ))}
                    </div>
                }

                <form onSubmit={onSubmit} className="mt-0 bg-black bg-opacity-70 p-5 rounded-lg">
                    <input
                        className="block w-full p-2 border border-blue-700 rounded text-white bg-slate-950"
                        value={team.name}
                        onChange={e => setTeam({ ...team, name: e.target.value })}
                        placeholder="Nombre"
                        type="text"
                        disabled={user.rol !== 'Admin'} />
                    <select
                        className="block w-full p-2 border border-blue-700 rounded text-white bg-slate-950"
                        onChange={handleUserChange}>
                        <option
                            value=''>
                            Seleccione el manager
                        </option>
                        {
                            users.map((u, index) => {
                                return (
                                    <option value={u.id} key={index}>{u.name}</option>
                                )
                            })
                        }
                    </select>
                    <span className="text-white font-medium pl-2">División</span>
                    <select
                        onChange={e => setTeam({ ...team, division: e.target.value })}
                        placeholder="Estado"
                        className="block w-full p-2 border border-blue-700 rounded text-white bg-slate-950"
                    >
                        <option value=''>Seleccionar división</option>
                        <option value="Primera">Primera</option>
                        <option value="Segunda">Segunda</option>
                    </select>
                    <div className="py-2">

                    {
                        user.rol == 'Admin' &&
                        <button className="bg-green-600 hover:bg-green-800 p-3 rounded text-white">Guardar cambios</button>
                    }
                    {
                        <Link className="bg-violet-600 hover:bg-violet-800 p-4 rounded text-white mx-2" to={`/estadisticas/${id}`}>Ver estadísticas</Link>
                    }
                    </div>
                    <br />
                    <table className="min-w-full bg-black bg-opacity-70 text-white border-gray-800 my-2">
                        <thead>
                            <tr>
                                <th className="border px-4 py-2 bg-black text-white">NOMBRE</th>
                                <th className="border px-4 py-2 bg-black text-white">CA</th>
                                <th className="border px-4 py-2 bg-black text-white">EDAD</th>
                                <th className="border px-4 py-2 bg-black text-white">ESTADO</th>
                                <th className="border px-4 py-2 bg-black text-white">VALOR</th>
                            </tr>
                        </thead>
                        {players.map(p => (
                            <tbody key={p.id}>
                                <tr key={p.id}>
                                    <td className="border px-4 py-2">{p.name}</td>
                                    <td className="border px-4 py-2">{p.ca}</td>
                                    <td className="border px-4 py-2">{p.age}</td>
                                    <td className="border px-4 py-2">{p.status}</td>
                                    <td className="border px-4 py-2">{p.value}</td>
                                </tr>
                            </tbody>
                        ))}</table>
                    <div className="container mx-auto p-4 mt-2 bg-black bg-opacity-70 rounded-lg text-white">
                        {bestPlayersCA !== null && (
                            <p>Promedio de CA de los mejores 16 jugadores: <strong> {bestPlayersCA} </strong></p>
                        )}
                        <p>Cantidad de jugadores bloqueados: <strong>{blockedPlayersCount}</strong></p>
                        <p>Cantidad de jugadores mayores a 20 años: <strong>{playersOver20Count}</strong> </p>
                        <p>Cantidad de mayores registrados mayores: <strong>{filterPlayersOver20ByRegister}</strong></p>
                        <p>Cantidad de registrados: <strong>{filterPlayersByRegister}</strong></p>

                    </div>
                </form>
            </div>
        </>
    )
}
