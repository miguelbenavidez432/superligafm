/* eslint-disable no-unused-vars */
import { createRef, useState } from "react"
import { Link } from "react-router-dom"
import { useStateContext } from "../context/ContextProvider"
import axiosClient from "../axios"

export default function Signup() {

    const nameRef = createRef()
    const emailRef = createRef()
    const passwordRef = createRef()
    const passwordConfirmationRef = createRef()
    const { setUser, setToken } = useStateContext()
    const [errors, setErrors] = useState(null)

    const onSubmit = (e) => {
        e.preventDefault();

        const payload = {
            name: nameRef.current.value,
            email: emailRef.current.value,
            password: passwordRef.current.value,
            password_confirmation: passwordConfirmationRef.current.value,
        }
        axiosClient.post('/signup', payload)
            .then(({ data }) => {
                setUser(data.user)
                setToken(data.token);
            })
            .catch(err => {
                const response = err.response;
                if (response && response.status === 422) {
                    setErrors(response.data.errors)
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
                    <h1 className="title"> Registrate </h1>
                    {errors &&
                        <div className="alert">
                            {Object.keys(errors).map(key => (
                                <p key={key}>{errors[key][0]}</p>
                            ))}
                        </div>
                    }
                    <input ref={nameRef} type="name" placeholder="Nombre de usuario" />
                    <input ref={emailRef} type="email" placeholder="Email" />
                    <input ref={passwordRef} type="password" placeholder="Password" />
                    <input ref={passwordConfirmationRef} type="password" placeholder="Confirma tu password" />
                    <button className="btn btn-block">Registrate</button>
                    <p className="message">
                        Ya estás registrado? <Link to='/login'> Conectate con tu cuenta </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}