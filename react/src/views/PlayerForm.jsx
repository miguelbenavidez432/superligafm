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
        id_external: 0,
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
            axiosClient.get('/players/public?all=true')
                .then(({ data }) => {
                    setLoading(false);
                    const filteredPlayer = data.data.find(player => player.id === parseInt(id));
                    if (filteredPlayer) {
                        getTeam();
                        setPlayers({
                            ...filteredPlayer,
                            id_team: filteredPlayer.id_team?.id
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
        axiosClient.get('/teams/public?all=true')
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
                    navigate('/players');
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
                    navigate('/players');
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
            <div style={{ display: 'flex', justifyContent: "space-between", alignItems: "center" }}>
                <div className="text-xl mt-2 font-semibold mb-2 text-center lg:text-left bg-black bg-opacity-70 rounded-lg text-white p-3">
                    {players.id ? `ACTUALIZAR: ${players.name}` : 'NUEVO JUGADOR'}
                </div>
            </div>

            {loading && (
                <div className="bg-black bg-opacity-70 p-5 rounded-lg text-white text-center mb-4">
                    CARGANDO...
                </div>
            )}

            {errors && (
                <div className="bg-red-600 bg-opacity-70 p-4 rounded-lg text-white mb-4">
                    {Object.keys(errors).map(key => (
                        <p key={key} className="mb-2">{errors[key][0]}</p>
                    ))}
                </div>
            )}

            {!loading && (
                <div className="bg-black bg-opacity-70 p-5 rounded-lg">
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label className="block text-white text-sm font-medium mb-2">Nombre</label>
                            <input
                                value={players.name}
                                onChange={e => setPlayers({ ...players, name: e.target.value })}
                                placeholder="Nombre"
                                type="text"
                                disabled={!(user.rol === 'Admin' || user.rol === 'Organizador')}
                                className={`block w-full p-2 border border-blue-700 rounded ${(user.rol === 'Admin' || user.rol === 'Organizador')
                                        ? 'text-white bg-slate-950'
                                        : 'text-gray-400 bg-gray-800'
                                    }`}
                            />
                        </div>

                        <div>
                            <label className="block text-white text-sm font-medium mb-2">Equipo</label>
                            <select
                                value={players.id_team}
                                onChange={e => setPlayers({ ...players, id_team: parseInt(e.target.value) })}
                                className="block w-full p-2 border border-blue-700 rounded text-white bg-slate-950"
                            >
                                {team.map((t, index) => (
                                    <option value={t.id} key={index}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-white text-sm font-medium mb-2">Estado</label>
                            <select
                                value={players.status}
                                onChange={e => setPlayers({ ...players, status: e.target.value })}
                                className="block w-full p-2 border border-blue-700 rounded text-white bg-slate-950"
                            >
                                <option value=''></option>
                                <option value="liberado">Liberado</option>
                                {(user.rol === 'Admin' || user.rol === 'Organizador') && (
                                    <option value="bloqueado">Bloqueado</option>
                                )}
                                <option value="registrado">Registrado</option>
                                <option value="">Sin modificar</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-white text-sm font-medium mb-2">Edad</label>
                                <input
                                    value={players.age}
                                    onChange={e => setPlayers({ ...players, age: parseInt(e.target.value) })}
                                    placeholder="Edad"
                                    type="text"
                                    disabled={!(user.rol === 'Admin' || user.rol === 'Organizador')}
                                    className={`block w-full p-2 border border-blue-700 rounded ${(user.rol === 'Admin' || user.rol === 'Organizador')
                                            ? 'text-white bg-slate-950'
                                            : 'text-gray-400 bg-gray-800'
                                        }`}
                                />
                            </div>
                            <div>
                                <label className="block text-white text-sm font-medium mb-2">Valor</label>
                                <input
                                    value={players.value}
                                    onChange={e => setPlayers({ ...players, value: parseInt(e.target.value) })}
                                    placeholder="Valor"
                                    type="text"
                                    disabled={!(user.rol === 'Admin' || user.rol === 'Organizador')}
                                    className={`block w-full p-2 border border-blue-700 rounded ${(user.rol === 'Admin' || user.rol === 'Organizador')
                                            ? 'text-white bg-slate-950'
                                            : 'text-gray-400 bg-gray-800'
                                        }`}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-white text-sm font-medium mb-2">CA</label>
                                <input
                                    value={players.ca}
                                    onChange={e => setPlayers({ ...players, ca: parseInt(e.target.value) })}
                                    placeholder="CA"
                                    type="text"
                                    disabled={!(user.rol === 'Admin' || user.rol === 'Organizador')}
                                    className={`block w-full p-2 border border-blue-700 rounded ${(user.rol === 'Admin' || user.rol === 'Organizador')
                                            ? 'text-white bg-slate-950'
                                            : 'text-gray-400 bg-gray-800'
                                        }`}
                                />
                            </div>
                            <div>
                                <label className="block text-white text-sm font-medium mb-2">PA</label>
                                <input
                                    value={players.pa}
                                    onChange={e => setPlayers({ ...players, pa: parseInt(e.target.value) })}
                                    placeholder="PA"
                                    type="text"
                                    disabled={!(user.rol === 'Admin' || user.rol === 'Organizador')}
                                    className={`block w-full p-2 border border-blue-700 rounded ${(user.rol === 'Admin' || user.rol === 'Organizador')
                                            ? 'text-white bg-slate-950'
                                            : 'text-gray-400 bg-gray-800'
                                        }`}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-white text-sm font-medium mb-2">ID FM</label>
                                <input
                                    value={players.id_external}
                                    onChange={e => setPlayers({ ...players, id_external: parseInt(e.target.value) })}
                                    placeholder="ID FM"
                                    type="text"
                                    disabled={!(user.rol === 'Admin' || user.rol === 'Organizador')}
                                    className={`block w-full p-2 border border-blue-700 rounded ${(user.rol === 'Admin' || user.rol === 'Organizador')
                                            ? 'text-white bg-slate-950'
                                            : 'text-gray-400 bg-gray-800'
                                        }`}
                                />
                            </div>
                            <div>
                            </div>
                        </div>

                        {(user.rol === 'Admin' || user.rol === 'Organizador') && (
                            <button className="bg-green-600 hover:bg-green-800 p-3 rounded text-white w-full">
                                Guardar cambios
                            </button>
                        )}
                    </form>
                </div>
            )}
        </>
    );
}

