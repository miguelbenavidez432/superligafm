/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-debugger */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { useStateContext } from "../context/ContextProvider";
import axiosClient from "../axios";

export default function UserForm() {
    const [user, setUser] = useState({
        id: null,
        name: '',
        email: '',
        rol: '',
        profits: 0,
        costs: 0,
        password: '',
        password_confirmation: '',
    });
    const { id } = useParams();
    const navigate = useNavigate();
    const { setNotification } = useStateContext();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(null);

    if (id) {
        useEffect(() => {
            setLoading(true)
            axiosClient.get(`/users/${id}`)
                .then(({ data }) => {
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
        if (user.id) {
            axiosClient.put(`/users/${user.id}`, user)
                .then(() => {
                    setNotification('Usuario actualizado satisfactoriamente')
                    navigate('/users')
                })
                .catch(err => {
                    const response = err.response;
                    if (response && response.status === 422) {
                        setErrors(response.data.errors)
                    }
                })
        } else {
            axiosClient.post(`/users/`, user)
                .then(() => {
                    setNotification('Usuario creado satisfactoriamente')
                    navigate('/users')
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
                        <input value={user.email} onChange={e => setUser({ ...user, email: e.target.value })} placeholder="Email" type="email" />
                        <select name="" id="" onClick={e => setUser({ ...user, rol: e.target.value })}>
                            <option >{user.rol}</option>
                            <option value="visitante">Otro</option>
                            <option value="Manager Primera">Manager Primera</option>
                            <option value="Manager Segunda">Manager Segunda</option>
                            <option value="En lista de espera">Lista de espera</option>
                        </select>
                        <input hidden value={user.rol} onChange={e => setUser({ ...user, rol: e.target.value })} placeholder="Email" />
                        <input value={user.profits} onChange={e => setUser({ ...user, profits: e.target.value })} placeholder="Ganancias" />
                        <input value={user.costs} onChange={e => setUser({ ...user, costs: e.target.value })} placeholder="Gastos" />
                        <input onChange={e => setUser({ ...user, password: e.target.value })} placeholder="Password" type="password" autoComplete="off"/>
                        <input onChange={e => setUser({ ...user, password_confirmation: e.target.value })} placeholder="Confirmar password" type="password" />
                        <button className="btn">Guardar cambios</button>
                    </form>
                }
            </div>
        </>
    )
}
