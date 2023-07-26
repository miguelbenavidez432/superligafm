/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-debugger */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { useStateContext } from "../context/ContextProvider";
import axiosClient from "../axios";

export default function UserForm() {
    const [users, setUsers] = useState({
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
    const { user, setNotification } = useStateContext();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(null);

    if (id) {
        useEffect(() => {
            setLoading(true)
            axiosClient.get(`/users/${id}`)
                .then(({ data }) => {
                    setLoading(false)
                    setUsers(data)
                })
                .catch(() => {
                    setLoading(false)
                })
        }, [])
    }

    const onSubmit = (e) => {
        e.preventDefault();
        if (users.id) {
            axiosClient.put(`/users/${users.id}`, users)
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
            {users.id && <h1>ACTUALIZAR USUARIO: {users.name}</h1>}
            {!users.id && <h1>NUEVO USUARIO</h1>}

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
                        {user.rol === 'Admin' ?
                            (<>
                                <input value={users.name} onChange={e => setUsers({ ...users, name: e.target.value })} placeholder="Nombre" />
                                <input value={users.email} onChange={e => setUsers({ ...users, email: e.target.value })} placeholder="Email" type="email" />
                                <select name="" id="" onClick={e => setUsers({ ...users, rol: e.target.value })}>
                                    <option >{users.rol}</option>
                                    <option value="visitante">Otro</option>
                                    <option value="Manager Primera">Manager Primera</option>
                                    <option value="Manager Segunda">Manager Segunda</option>
                                    <option value="En lista de espera">Lista de espera</option>
                                </select>
                                <input hidden value={users.rol} onChange={e => setUsers({ ...users, rol: e.target.value })} placeholder="Email" />
                                <span><strong>Presupuesto</strong></span>
                                <input value={users.profits} onChange={e => setUsers({ ...users, profits: parseInt(e.target.value) })} placeholder="Ganancias" />
                                <span><strong>Agregar / Quitar presupuesto</strong></span>
                                <input onChange={e => setUsers({ ...users, profits: parseInt(users.profits) + parseInt(e.target.value) })} type="number" placeholder="Modificar presupuesto" />
                                <input onChange={e => setUsers({ ...users, password: e.target.value })} placeholder="Password" type="password" autoComplete="off" />
                                <input onChange={e => setUsers({ ...users, password_confirmation: e.target.value })} placeholder="Confirmar password" type="password" />
                                <button className="btn">Guardar cambios</button>
                            </>
                            )
                            : <>
                                <input onChange={e => setUsers({ ...users, password: e.target.value })} placeholder="Password" type="password" autoComplete="off" />
                                <input onChange={e => setUsers({ ...users, password_confirmation: e.target.value })} placeholder="Confirmar password" type="password" />
                                <button className="btn">Guardar cambios</button>
                            </>
                        }

                    </form>
                }
            </div>
        </>
    )
}
