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
        id_team: 61, // Equipo predeterminado
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

    // Si hay un ID, cargar el jugador y los equipos
    useEffect(() => {
        const fetchPlayers = () => {
            setLoading(true);
            axiosClient.get('/players?all=true')
                .then(({ data }) => {
                    setLoading(false);
                    // Aquí filtras el jugador por el id de los params
                    const filteredPlayer = data.data.find(player => player.id === parseInt(id));

                    if (filteredPlayer) {
                        setPlayers(filteredPlayer);
                        console.log(filteredPlayer); // Muestra el jugador encontrado
                    } else {
                        console.log('Jugador no encontrado');
                    }

                    getTeam(); // Llamas a getTeam después de obtener los datos
                })
                .catch(() => {
                    setLoading(false);
                    console.log('Error al obtener los jugadores');
                });
        };

        if (id) {
            fetchPlayers(); // Llamamos a la función que trae todos los jugadores y busca el que tiene el id
        } else {
            getTeam(); // Obtener equipos si no hay un jugador cargado
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

        // Si el jugador es liberado, asignarle el equipo predeterminado (id_team 61)
        if (players.status === 'liberado') {
            setPlayers({ ...players, id_team: 61 });
        }

        if (players.id) {
            // Actualizar jugador
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
            // Crear nuevo jugador
            axiosClient.post(`/players/`, players)
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
                        <h1>NO PUEDES ACTUALIZAR EL JUGADOR PORQUE NO TIENES UN EQUIPO ASIGNADO</h1>
                    </div>
                )}
            </div>
        </>
    );
}

