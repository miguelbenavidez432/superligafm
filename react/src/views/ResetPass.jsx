import { Link } from "react-router-dom"


export default function Login() {

    const onSubmit = (e) => {
        e.preventDefault()
    }

    return (
        <div className="login-signup-form animated fadeInDown">
            <div className="form">
                <form onSubmit={onSubmit}>
                    <h1 className="title">Conectate con tu cuenta </h1>
                    <input type="email" placeholder="Email" />
                    <input type="password" placeholder="Password" />                    
                    <button className="btn btn-block">Conectate</button>
                    <p className="message">
                        No estás registrado? <Link to='/signup'> Create una cuenta </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}