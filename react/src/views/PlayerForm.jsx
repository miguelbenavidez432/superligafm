/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import axiosClient from "../axios";

export default function PlayerForm() {
    const [players, setPlayers] = useState({
        name: '',
        id_team: 61,
        status: '',
        value: '',
        ca: '',
        pa: '',
        age: '',
    });
    const { id } = useParams();
    const navigate = useNavigate();
    const { setNotification } = useStateContext();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(null);
    const [team, setTeam] = useState([]);
    const { user } = useStateContext();


    useEffect(() => {
        const fetchPlayers = () => {
            setLoading(true);
            axiosClient.get('/players?all=true')
                .then(({ data }) => {
                    setLoading(false);
                    const filteredPlayer = data.data.find(player => player.id === parseInt(id));
                    if (filteredPlayer) {
                        getTeam();
                        setPlayers({
                            ...filteredPlayer,
                            id_team: filteredPlayer.id_team.id // Asegúrate de que id_team sea solo el ID
                        });
                    } else {
                        console.log('Jugador no encontrado');
                    }
                    getTeam();
                })
                .catch(() => {
                    setLoading(false);
                    console.log('Error al obtener los jugadores');
                });
        };

        if (id) {
            fetchPlayers();
            getTeam();
        } else {
            getTeam();
        }
    }, [id]);

    const getTeam = () => {
        setLoading(true);
        axiosClient.get('/teams?all=true')
            .then(({ data }) => {
                setLoading(false);
                setTeam(data.data);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const onSubmit = (e) => {
        e.preventDefault();

        if (players.status === 'liberado') {
            setPlayers({ ...players, id_team: 61 });
        }

        if (players.id) {
            axiosClient.put(`/players/${players.id}`, players)
                .then(() => {
                    setNotification('Jugador actualizado satisfactoriamente');
                    navigate('/plantel');
                })
                .catch(err => {
                    const response = err.response;
                    if (response && response.status === 422) {
                        setErrors(response.data.errors);
                    }
                });
        } else {
            axiosClient.post(`/players`, players)
                .then(() => {
                    setNotification('Jugador creado satisfactoriamente');
                    navigate('/plantel');
                })
                .catch(err => {
                    const response = err.response;
                    if (response && response.status === 422) {
                        setErrors(response.data.errors);
                    }
                });
        }
    };

    return (
        <>
            {players.id && <h1>ACTUALIZAR A: {players.name}</h1>}
            {!players.id && <h1>NUEVO JUGADOR</h1>}

            <div className="card animated fadeInDown">
                {loading && (<div className="text-center">CARGANDO...</div>)}

                {errors &&
                    <div className="alert">
                        {Object.keys(errors).map(key => (
                            <p key={key}>{errors[key][0]}</p>
                        ))}
                    </div>
                }

                {!loading && (user.rol === 'Admin' || user.rol === 'Organizador') ? (
                    <form onSubmit={onSubmit}>
                        <input
                            value={players.name}
                            onChange={e => setPlayers({ ...players, name: e.target.value })}
                            placeholder="Nombre"
                            type="text"
                        />
                        <select
                            value={players.id_team}
                            onChange={e => setPlayers({ ...players, id_team: parseInt(e.target.value) })}
                        >
                            {team.map((t, index) => (
                                <option value={t.id} key={index}>
                                    {t.name}
                                </option>
                            ))}
                        </select>

                        <span>Estado</span>
                        <select
                            value={players.status}
                            onChange={e => setPlayers({ ...players, status: e.target.value })}
                        >
                            <option value=''></option>
                            <option value="liberado">Liberado</option>
                            <option value="bloqueado">Bloqueado</option>
                            <option value="registrado">Registrado</option>
                            <option value="">Sin modificar</option>
                        </select>

                        <input
                            value={players.age}
                            onChange={e => setPlayers({ ...players, age: parseInt(e.target.value) })}
                            placeholder="Edad"
                            type="text"
                        />
                        <input
                            value={players.ca}
                            onChange={e => setPlayers({ ...players, ca: parseInt(e.target.value) })}
                            placeholder="CA"
                            type="text"
                        />
                        <input
                            value={players.pa}
                            onChange={e => setPlayers({ ...players, pa: parseInt(e.target.value) })}
                            placeholder="PA"
                            type="text"
                        />
                        <input
                            value={players.value}
                            onChange={e => setPlayers({ ...players, value: parseInt(e.target.value) })}
                            placeholder="Valor"
                            type="text"
                        />
                        <button className="btn">Guardar cambios</button>
                    </form>
                ) : (
                    <div>
                        <form onSubmit={onSubmit}>
                        <input
                            value={players.name}
                            onChange={e => setPlayers({ ...players, name: e.target.value })}
                            placeholder="Nombre"
                            type="text"
                            disabled
                        />
                        <select
                            value={players.id_team}
                            onChange={e => setPlayers({ ...players, id_team: parseInt(e.target.value) })}
                        >
                            {team.map((t, index) => (
                                <option value={t.id} key={index}>
                                    {t.name}
                                </option>
                            ))}
                        </select>

                        <span>Estado</span>
                        <select
                            value={players.status}
                            onChange={e => setPlayers({ ...players, status: e.target.value })}
                        >
                            <option value=''></option>
                            <option value="liberado">Liberado</option>
                            <option value="registrado">Registrado</option>
                            <option value="">Sin modificar</option>
                        </select>

                        <input
                            value={players.age}
                            onChange={e => setPlayers({ ...players, age: parseInt(e.target.value) })}
                            placeholder="Edad"
                            type="text"
                            disabled
                        />
                        <input
                            value={players.ca}
                            onChange={e => setPlayers({ ...players, ca: parseInt(e.target.value) })}
                            placeholder="CA"
                            type="text"
                            disabled
                        />
                        <input
                            value={players.pa}
                            onChange={e => setPlayers({ ...players, pa: parseInt(e.target.value) })}
                            placeholder="PA"
                            type="text"
                            disabled
                        />
                        <input
                            value={players.value}
                            onChange={e => setPlayers({ ...players, value: parseInt(e.target.value) })}
                            placeholder="Valor"
                            type="text"
                            disabled
                        />
                        <button className="btn">Guardar cambios</button>
                    </form>
                    </div>
                )}
            </div>
        </>
    );
}

