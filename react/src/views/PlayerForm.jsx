/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useStateContext } from "../context/ContextProvider";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../axios";

export default function PlayerForm() {
    const [players, setPlayers] = useState({
        name: '',
        team: '',
        value: '',
        ca: '',
        pa: '',
        age: '',
    });
    const [loading, setLoading] = useState(false);
    const { setNotification } = useStateContext();
    const [errors, setErrors] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    if (id) {
        useEffect(() => {
            setLoading(true)
            axiosClient.get(`/players/${id}`)
                .then(({ data }) => {
                    console.log(data)
                    setLoading(false)
                    setPlayers(data)
                })
                .catch(() => {
                    setLoading(false)
                })
        }, [])
    }


    const onSubmit = (e) => {
        e.preventDefault();
        if (players.id) {
            axiosClient.put(`/players/${players.id}`, players)
                .then(() => {
                    setNotification('Jugador actualizado satisfactoriamente')
                    navigate('/players')
                })
                .catch(err => {
                    const response = err.response;
                    if (response && response.status === 422) {
                        setErrors(response.data.errors)
                    }
                })
        } else {
            axiosClient.post(`/players/`, players)
                .then(() => {
                    setNotification('Players creado satisfactoriamente')
                    navigate('/players')
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
            {players.id && <h1>ACTUALIZAR A: {players.name}</h1>}
            {!players.id && <h1>NUEVO JUGADOR</h1>}

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
                {!loading &&
                    <form onSubmit={onSubmit}>
                        <input value={players.name} onChange={e => setPlayers({ ...players, name: e.target.value })} placeholder="Nombre" type="text" />
                        <input value={players.team} onChange={e => setPlayers({ ...players, team: e.target.value })} placeholder="Equipo" type="text" />
                        <input value={players.age} onChange={e => setPlayers({ ...players, age: e.target.value })} placeholder="Edad" type="text" />
                        <input value={players.ca} onChange={e => setPlayers({ ...players, ca: e.target.value })} placeholder="CA" type="text" />
                        <input value={players.pa} onChange={e => setPlayers({ ...players, pa: e.target.value })} placeholder="PA" type="text" />
                        <input value={players.value} onChange={e => setPlayers({ ...players, value: e.target.value })} placeholder="Valor" type="text" />
                        <button className="btn">Guardar cambios</button>
                    </form>
                }
            </div>
        </>
    )
}
