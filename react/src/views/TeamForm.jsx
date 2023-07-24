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


    useEffect(() => {
        if (id) {
            setLoading(true);
            axiosClient
                .get(`/teams/${id}`)
                .then(({ data }) => {
                    console.log(data);
                    setLoading(false);
                    setTeam(data);
                    getPlayers();
                    getUsers();
                })
                .catch(() => {
                    setLoading(false);
                });
        } else {
            // En caso de que sea un equipo nuevo, puedes establecer un objeto vacío para el estado 'team'
            setTeam({
                name: '',
                division: '',
                id_user: '',
            });
        }
    }, [id]);

    useEffect(() => {
        getBestPlayersCA();
    }, [players, team]);

    const getPlayers = () => {
        setLoading(true)
        axiosClient.get('/players')
            .then(({ data }) => {
                setLoading(false)
                const playersFiltered = data.data.filter((p) => p.id_team === parseInt(id))
                console.log(playersFiltered)
                setPlayers(playersFiltered)
            })
            .catch(() => {
                setLoading(false)
            })
    }

    const getUsers = () => {
        setLoading(true)
        axiosClient.get('/users')
            .then(({ data }) => {
                setLoading(false)
                console.log(data)
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

    const handleUserChange = (e) => {
        const selectedUserId = e.target.value;
        setTeam((prevTeam) => ({ ...prevTeam, id_user: parseInt(selectedUserId) }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (team.id) {
            console.log(team)
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
            axiosClient.post(`/teams/`, team)
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
                    <ul>
                        {players.map(p => (
                            <li key={p.id}><strong>Jugador: </strong> {p.name} - <strong>CA:</strong> {p.ca}</li>
                        ))}
                    </ul>
                    <div>
                        {bestPlayersCA !== null && (
                            <p>Promedio de CA de los mejores 16 jugadores: <strong> {bestPlayersCA} </strong></p>
                        )}
                    </div>
                </form>
            </div>
        </>
    )
}
