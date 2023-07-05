/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import { Link, Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import { useEffect } from "react";
import axiosClient from "../axios";


export default function DefaultLayout() {

    const { user, token, setUser, setToken, notification } = useStateContext();

    if (!token) {
        return <Navigate to='/login' />
    }


    const onLogout = (e) => {
        e.preventDefault();
        axiosClient.post('/logout')
            .then(() => {
                setUser({})
                setToken(null)
            })
    }

    useEffect(() => {
        axiosClient.get('/user')
            .then(({ data }) => {
                setUser(data)
            })
    }, [])

    return (
        <div id="defaultLayout">
            <aside className="">
                <Link to='/dashboard'>Dashboard</Link>
                <Link to='/users'>Users</Link>
                <Link to='/players'>Jugadores</Link>
                <Link to='/transfer'>Transferencia</Link>
            </aside>
            <div className="content">
                <header className="lg:flex lg:items-bottom lg:justify-between">
                    <div>
                        Header
                    </div>
                    <div className="flex min-h-full flex-3 flex-row justify-center px-3 py-8 lg:px-8">
                        <span className="mx-4 text-justify my-3"> {user.name}</span>                        
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>

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
