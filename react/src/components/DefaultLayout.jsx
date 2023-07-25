/* eslint-disable react/no-unknown-property */
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
            <aside className="text-white">
                {
                    user.rol === 'Admin' || user.rol === 'Organizador' ?
                        <div className="flex flex-col  text-white">
                            <Link className="mt-4 hover:text-base" to='/dashboard'>Intercambios</Link>
                            <Link className="mt-4 hover:text-base" to='/offers'>Ofertas</Link>
                            <Link className="mt-4 hover:text-base" to='/plantel'>Plantel</Link>
                            <Link className="mt-4 hover:text-base" to='/subastas'>Subastas</Link>
                            <Link className="mt-4 hover:text-base" to='/users'>Users</Link>
                            <Link className="mt-4 hover:text-base" to='/players'>Jugadores</Link>
                            <Link className="mt-4 hover:text-base" to='/teams'>Equipos</Link>
                            <Link className="mt-4 hover:text-base" to='/transfer'>Transferencia</Link>
                            <Link className="mt-4 hover:text-base" to='/clausula_rescision'>Claúsula de rescisión</Link>
                            <Link className="mt-4 hover:text-base" to='/reglamento'>Reglamento</Link>
                            <Link className="mt-4 hover:text-base" to='/about'>Nosotros</Link>
                            <Link className="mt-4 hover:text-base" to='/prode'>Prode</Link>
                        </div>
                        :
                        user.rol === 'Manager Primera' || user.rol === 'Manager Segunda' ?
                            <div className="flex flex-col text-white">
                                <Link className="mt-4 hover:text-base" to='/dashboard'>Intercambios</Link>
                                <Link className="mt-4 hover:text-base" to='/offers'>Ofertas</Link>
                                <Link className="mt-4 hover:text-base" to='/plantel'>Plantel</Link>
                                <Link className="mt-4 hover:text-base" to='/users'>Users</Link>
                                <Link className="mt-4 hover:text-base" to='/players'>Jugadores</Link>
                                <Link className="mt-4 hover:text-base" to='/transfer'>Transferencia</Link>
                                <Link className="mt-4 hover:text-base" to='/clausula_rescision'>Claúsula de rescisión</Link>
                                <Link className="mt-4 hover:text-base" to='/reglamento'>Reglamento</Link>
                                <Link className="mt-4 hover:text-base" to='/about'>Nosotros</Link>
                                <Link className="mt-4 hover:text-base" to='/prode'>Prode</Link>
                            </div>
                            : user.rol === 'En lista de espera' || user.rol === 'Visitante' &&
                            <div className="flex flex-col text-white">
                                <Link className="mt-4 hover:text-base" to='/dashboard'>Intercambios</Link>
                                <Link className="mt-4 hover:text-base" to='/players'>Jugadores</Link>
                                <Link className="mt-4 hover:text-base" to='/reglamento'>Reglamento</Link>
                                <Link className="mt-4 hover:text-base" to='/about'>Nosotros</Link>
                            </div>
                }
            </aside>
            <div className="content">
                <header className="lg:flex lg:items-bottom lg:justify-between">
                    <div>
                        <a href="http://mpago.la/2NzBSxx" className="btn-edit">Aportar a la Superliga FM</a>
                    </div>
                    <div>
                        <a href="https://twitter.com/superligaFm" target="_blank" rel="noopener noreferrer">
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-brand-twitter" width="32" height="32" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M22 4.01c-1 .49 -1.98 .689 -3 .99c-1.121 -1.265 -2.783 -1.335 -4.38 -.737s-2.643 2.06 -2.62 3.737v1c-3.245 .083 -6.135 -1.395 -8 -4c0 0 -4.182 7.433 4 11c-1.872 1.247 -3.739 2.088 -6 2c3.308 1.803 6.913 2.423 10.034 1.517c3.58 -1.04 6.522 -3.723 7.651 -7.742a13.84 13.84 0 0 0 .497 -3.753c0 -.249 1.51 -2.772 1.818 -4.013z" />
                            </svg>
                            Twitter
                        </a>
                    </div>
                    <div>
                        <a href="https://www.twitch.tv/superligafm" target="_blank" rel="noopener noreferrer">
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-brand-twitch" width="32" height="32" viewBox="0 0 24 24" stroke-width="1.5" stroke="#6f32be" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M4 5v11a1 1 0 0 0 1 1h2v4l4 -4h5.584c.266 0 .52 -.105 .707 -.293l2.415 -2.414c.187 -.188 .293 -.442 .293 -.708v-8.585a1 1 0 0 0 -1 -1h-14a1 1 0 0 0 -1 1z" />
                                <path d="M16 8l0 4" />
                                <path d="M12 8l0 4" />
                            </svg>
                            Twitch
                        </a>
                    </div>
                    <div>
                        <a href="https://discord.gg/DXS2ZvpzQc" target="_blank" rel="noopener noreferrer">
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-brand-discord" width="32" height="32" viewBox="0 0 24 24" stroke-width="1.5" stroke="#597e8d" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M8 12a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
                                <path d="M14 12a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
                                <path d="M8.5 17c0 1 -1.356 3 -1.832 3c-1.429 0 -2.698 -1.667 -3.333 -3c-.635 -1.667 -.476 -5.833 1.428 -11.5c1.388 -1.015 2.782 -1.34 4.237 -1.5l.975 1.923a11.913 11.913 0 0 1 4.053 0l.972 -1.923c1.5 .16 3.043 .485 4.5 1.5c2 5.667 2.167 9.833 1.5 11.5c-.667 1.333 -2 3 -3.5 3c-.5 0 -2 -2 -2 -3" />
                                <path d="M7 16.5c3.5 1 6.5 1 10 0" />
                            </svg>
                            Discord
                        </a>
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
