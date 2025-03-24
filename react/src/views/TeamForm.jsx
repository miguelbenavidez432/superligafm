/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
                    if(players.lenght > 0){
                        getUsers();
                        countBlockedPlayers();
                        countPlayersOver20();
                        getBestPlayersCA();
                        countRegisterAndOver20();
                        countRegistered();
                    }
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

    const getPlayers = () => {
        setLoading(true)
        axiosClient.get('/players?all=true')
            .then(({ data }) => {
                setLoading(false)
                const playersFiltered = data.data.filter((p) => p.id_team ? p.id_team.id === parseInt(id) : '')
                setPlayers(playersFiltered)
            })
            .catch(() => {
                setLoading(false)
            })
    }

    useEffect(() => {
        if (team) {
            countBlockedPlayers();
            countPlayersOver20();
            getBestPlayersCA();
            countRegisterAndOver20();
            countRegistered();
        }
    }, [team]);

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
            {team.id && <h1>ACTUALIZAR A: {team.name}</h1>}
            {!team.id && <h1>NUEVO EQUIPO</h1>}

            <div className="card animated fadeInDown">
                {loading &&
                    (<div className="text-center">CARGANDO...</div>)
                }
                {errors &&
                    <div className="alert">
                        {Object.keys(errors).map(key => (
                            <p key={key}>{errors[key][0]}</p>
                        ))}
                    </div>
                }

                <form onSubmit={onSubmit}>
                    <input value={team.name} onChange={e => setTeam({ ...team, name: e.target.value })} placeholder="Nombre" type="text" />
                    <select onChange={handleUserChange}>
                        <option value=''></option>
                        {
                            users.map((u, index) => {
                                return (
                                    <option value={u.id} key={index}>{u.name}</option>
                                )
                            })
                        }
                    </select>
                    <span>División</span>
                    <select onChange={e => setTeam({ ...team, division: e.target.value })} placeholder="Estado">
                        <option value=' '></option>
                        <option value="Primera">Primera</option>
                        <option value="Segunda">Segunda</option>
                    </select>
                    <button className="btn">Guardar cambios</button>
                    <br />
                    <table>
                        <thead>
                            <tr>
                                <th>NOMBRE</th>
                                <th>CA</th>
                                <th>EDAD</th>
                                <th>ESTADO</th>
                                <th>VALOR</th>
                                {/* <th>GOLES</th>
                                    <th>ASISTENCIAS</th>
                                    <th>AMARILLAS</th>
                                    <th>ROJA</th>
                                    <th>ROJA DIRECTA</th>
                                    <th>LESIONES LEVES</th>
                                    <th>LESIONES GRAVES</th>
                                    <th>MVP</th> */}
                            </tr>
                        </thead>



                        {players.map(p => (
                            <tbody key={p.id}>

                                <tr key={p.id}>
                                    <td>{p.name}</td>
                                    <td>{p.ca}</td>
                                    <td>{p.age}</td>
                                    <td>{p.status}</td>
                                    <td>{p.value}</td>
                                </tr>

                            </tbody>


                        ))}</table>
                    <div>
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
