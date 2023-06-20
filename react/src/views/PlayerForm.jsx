/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useStateContext } from "../context/ContextProvider";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../axios";

export default function PlayerForm() {
    const [players, setPlayers] = useState({
        team: '',
        status: ''
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
                        <input value={players.status} onChange={e => setPlayers({ ...players, status: e.target.value })} placeholder="Nombre" />
                        <input value={players.team} onChange={e => setPlayers({ ...players, team: e.target.value })} placeholder="Email" type="email" />

                        <button className="btn">Guardar cambios</button>
                    </form>
                }
            </div>
        </>
    )
}
