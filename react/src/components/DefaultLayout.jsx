/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import { Link, Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import { useEffect } from "react";
import axiosClient from "../axios";


export default function DefaultLayout() {

    const { user, token, setUser, setToken, notification} = useStateContext();

    if (!token) {
        return <Navigate to='/login' />
    }


    const onLogout = (e) => {
        e.preventDefault();
        axiosClient.post('/logout')
        .then(()=>{
            setUser({})
            setToken(null)
        })
    }

    useEffect(()=>{
        axiosClient.get('/user')
        .then(({data}) => {
            setUser(data)
        })
    },[])

    return (
        <div id="defaultLayout">
            <aside className="">
                <Link to='/dashboard'>Dashboard</Link>
                <Link to='/users'>Users</Link>
                <Link to='/players'>Jugadores</Link>
                <Link to='/transfer'>Transferencia</Link>
            </aside>
            <div className="content">
                <header>
                    <div>
                        Header
                    </div>
                    <div>
                        {user.name}
                        <a href="" className="btn-logout" onClick={onLogout}> Logout </a>
                    </div>
                </header>
                <main>
                    <Outlet />
                </main>
            {notification && <div className="notification">
                {notification}
            </div>}
            </div>
        </div>
    )
}
