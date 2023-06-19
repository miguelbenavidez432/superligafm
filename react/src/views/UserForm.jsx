/* eslint-disable no-debugger */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import axiosClient from "../axios";

export default function UserForm() {

    const {id} = useParams();
    const [user, setUser] = useState({
        id: null,
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);

    if (id) {
        useEffect(() => {
            setLoading(true)
            axiosClient.get(`/users/${id}`)
                .then(({data}) => {
                    console.log(data)
                    setLoading(false)
                    setUser(data)
                })
                .catch(() => {
                    setLoading(false)
                })
        }, [])
    }

    const onSubmit = (e) => {
        e.preventDefault();

    }
    return (
        <>
            {user.id && <h1>ACTUALIZAR USUARIO: {user.name}</h1>}
            {!user.id && <h1>NUEVO USUARIO</h1>}

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
                        <input value={user.name} onChange={e => setUser({ ...user, name: e.target.value })} placeholder="Nombre" />
                        <input value={user.email} onChange={e => setUser({ ...user, email: e.target.value })} placeholder="Email" />
                        <input onChange={e => setUser({ ...user, password: e.target.value })} placeholder="Password" />
                        <input onChange={e => setUser({ ...user, password_confirmation: e.target.value })} placeholder="Confirmar password" />
                        <button className="btn">Guardar cambios</button>
                    </form>
                }
            </div>
        </>
    )
}