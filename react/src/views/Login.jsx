/* eslint-disable no-unused-vars */
import { Link } from "react-router-dom";
import axiosClient from "../axios.js";
import { createRef } from "react";
import { useStateContext } from "../context/ContextProvider.jsx";
import { useState } from "react";


export default function Login() {

    const emailRef = createRef()
    const passwordRef = createRef()
    const { setUser, setToken } = useStateContext()
    const [message, setMessage] = useState(null)

    const onSubmit = ev => {
        ev.preventDefault()

        const payload = {
            email: emailRef.current.value,
            password: passwordRef.current.value,
        }
        axiosClient.post('/login', payload)
            .then(({ data }) => {
                setUser(data.user)
                setToken(data.token);
            })
            .catch((err) => {
                const response = err.response;
                if (response && response.status === 422) {
                    setMessage(response.data.message)
                }
            })
    }
    return (
        <div className="login-signup-form animated fadeInDown flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img
                    className="mx-auto my-5 h-20 w-auto"
                    src="public/logo_superligafm.png"
                    alt="Your Company"
                />
            </div>
            <div className="form">
                <form onSubmit={onSubmit}>
                    <h1 className="title">Conectate con tu cuenta </h1>
                    {message &&
                        <div className="alert">
                            <p>{message}</p>
                        </div>
                    }
                    <input ref={emailRef} type="email" placeholder="Email" />
                    <input ref={passwordRef} type="password" placeholder="Password" />
                    <button className="btn btn-block">Conectate</button>
                    <p className="message">
                        No estás registrado? <Link to='/signup'> Create una cuenta </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}
