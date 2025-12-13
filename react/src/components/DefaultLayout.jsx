/* eslint-disable react/no-unknown-property */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */

import { Link, Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import { useEffect, useState } from "react";
import axiosClient from "../axios";

export default function DefaultLayout() {
    const { user, token, setUser, setToken, notification } = useStateContext();

    if (!token) {
        return <Navigate to='/' />
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

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div id="defaultLayout" className="flex min-h-screen">
            <aside className={`w-72 bg-gray-800 text-white flex flex-col transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-3/4'}`}>
                <div className="p-4">
                    <h1 className="text-2xl font-bold">Superliga FM</h1>
                </div>
                <nav className="flex-1">
                    <Link className="block py-2.5 px-4 hover:bg-gray-700" to='/dashboard'>Mi estado</Link>
                    <Link className="block py-2.5 px-4 hover:bg-gray-700" to='/tablas'>Tablas</Link>
                    <Link className="block py-2.5 px-4 hover:bg-gray-700" to='/estadisticas'>Estadísticas</Link>
                    <div className="group relative">
                        <button className="block w-full text-left py-2.5 px-4 hover:bg-gray-700">Fixture</button>
                        <div className="absolute left-0 hidden w-full bg-gray-800 group-hover:block">
                            <Link className="block py-2.5 px-4 hover:bg-gray-700" to='/fixture_primera'>Fixture Primera</Link>
                            <Link className="block py-2.5 px-4 hover:bg-gray-700" to='/fixture_segunda'>Fixture Segunda</Link>
                        </div>
                    </div>
                    <Link className="block py-2.5 px-4 hover:bg-gray-700" to='/plantel'>Plantel</Link>
                    <Link className="block py-2.5 px-4 hover:bg-gray-700" to='/players'>Jugadores</Link>
                    <Link className="block py-2.5 px-4 hover:bg-gray-700" to='/users'>Managers</Link>
                    <Link className="block py-2.5 px-4 hover:bg-gray-700" to='/teams'>Equipos</Link>
                    <div className="group relative">
                        <button className="block w-full text-left py-2.5 px-4 hover:bg-gray-700">Apuestas</button>
                        <div className="absolute left-0 hidden w-full bg-gray-800 group-hover:block">
                            <Link className="block py-2.5 px-4 hover:bg-gray-700" to='/apuestas'>Apuestas</Link>
                            <Link className="block py-2.5 px-4 hover:bg-gray-700" to='/apuestas/new'>Crear apuestas</Link>
                            {user.rol === 'Admin' && (
                                <>
                                    <Link className="block py-2.5 px-4 hover:bg-gray-700" to='/apuestas/usuarios'>Confirmar apuestas ganadas</Link>
                                </>
                            )}
                        </div>
                    </div>
                    <Link className="block py-2.5 px-4 hover:bg-gray-700" to='/reglamento'>Reglamento</Link>
                    <Link className="block py-2.5 px-4 hover:bg-gray-700" to='/partidos'>Partidos</Link>
                    {user.rol === 'Admin' && (
                        <>
                            <Link className="block py-2.5 px-4 hover:bg-gray-700" to='/torneos'>Cargar Torneo</Link>
                        </>
                    )}
                    <div className="group relative">
                        <button className="block w-full text-left py-2.5 px-4 hover:bg-gray-700">Mercado</button>
                        <div className="absolute left-0 hidden w-full bg-gray-800 group-hover:block">
                            <Link className="block py-2.5 px-4 hover:bg-gray-700" to='/app/misofertas'>Mis ofertas</Link>
                            <Link className="block py-2.5 px-4 hover:bg-gray-700" to='/app/offers'>Ofertas</Link>
                            <Link className="block py-2.5 px-4 hover:bg-gray-700" to='/app/transferencias'>Intercambios</Link>
                            <Link className="block py-2.5 px-4 hover:bg-gray-700" to='/app/crear_subasta'>Crear Subasta</Link>
                            <Link className="block py-2.5 px-4 hover:bg-gray-700" to='/app/subastas'>Lista de Subastas</Link>
                            <Link className="block py-2.5 px-4 hover:bg-gray-700" to='/app/clausula_rescision'>Claúsula de rescisión</Link>
                            <Link className="block py-2.5 px-4 hover:bg-gray-700" to='/app/transfer'>Transferencia</Link>
                            {user.rol === 'Admin' && (
                                <>
                                    <Link className="block py-2.5 px-4 hover:bg-gray-700" to='/app/ofertas-confirmadas'>Traspasos confirmados</Link>
                                    <Link className="block py-2.5 px-4 hover:bg-gray-700" to='/app/reverse-offer'>Revertir Oferta </Link>
                                </>
                            )}
                        </div>
                    </div>
                    {user.rol === 'Admin' && (
                        <>
                        <Link className="block py-2.5 px-4 hover:bg-gray-700" to='/premios'>Premios</Link>
                        </>
                    )}
                    <Link className="block py-2.5 px-4 hover:bg-gray-700" to='/about'>Nosotros</Link>
                </nav>
                <div className="p-4">
                    <a href="" className="block py-2.5 px-4 bg-red-600 hover:bg-red-700 text-center rounded" onClick={onLogout}>Logout</a>
                </div>
            </aside>
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-0' : '-ml-52'}`}>
                <header className="bg-white shadow p-4 flex justify-between items-center">
                    <button onClick={toggleSidebar} className="sm:mx-12 md:mx-8 min-[290px]:mx-16">
                    {isSidebarOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white hover:text-zinc-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5l-7.5-7.5 7.5-7.5" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white hover:text-zinc-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        )}
                    </button>
                    {/* <div>
                        <a href="http://mpago.la/2NzBSxx" className="btn-edit">Aportar a la Superliga FM</a>
                    </div> */}
                    <div className="flex space-x-4">
                        <a href="https://twitter.com/superligaFm" target="_blank" rel="noopener noreferrer">
                            <svg width="32" height="32" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                                <path fill="#1DA1F2" d="M459.37 151.716c.325 4.548.325 9.097.325 13.645c0 138.72-105.583 298.558-298.558 298.558c-59.452 0-114.68-17.219-161.137-47.106c8.447.974 16.568 1.299 25.34 1.299c49.055 0 94.213-16.568 130.274-44.832c-46.132-.975-84.792-31.188-98.112-72.772c6.498.974 12.995 1.624 19.818 1.624c9.421 0 18.843-1.3 27.614-3.573c-48.081-9.747-84.143-51.98-84.143-102.4v-1.299c14.182 7.896 30.355 12.67 47.431 13.319c-28.264-18.843-46.781-51.005-46.781-87.391c0-19.492 5.197-37.36 14.294-52.954c51.655 63.675 129.3 105.258 216.365 109.807c-1.624-7.896-2.599-16.243-2.599-24.591c0-59.452 48.081-107.533 107.533-107.533c30.855 0 58.824 12.67 78.431 33.137c24.591-4.872 47.431-13.894 68.044-26.362c-8.123 25.34-25.34 46.456-47.431 59.452c21.817-2.273 42.734-8.447 61.927-16.893c-14.294 21.817-32.161 41.007-52.628 56.451z" />
                            </svg>
                        </a>
                    </div>
                    <div className="flex space-x-4">
                        <a href="https://www.twitch.tv/superligafm" target="_blank" rel="noopener noreferrer">
                            <svg width="32" height="32" viewBox="0 0 256 268" xmlns="http://www.w3.org/2000/svg">
                                <path fill="#9146FF" d="M17.458 0L0 46.556v186.201h63.983v34.934h34.931l34.898-34.934h52.36L256 162.954V0H17.458Zm23.259 23.263H232.73v128.029l-40.739 40.741H128L93.113 226.92v-34.886H40.717V23.263Zm64.008 116.405H128V69.844h-23.275v69.824Zm63.997 0h23.27V69.844h-23.27v69.824Z" />
                            </svg>
                        </a>
                    </div>
                    <div>
                        <a href="https://discord.gg/DXS2ZvpzQc" target="_blank" rel="noopener noreferrer">
                            <svg width="32" height="32" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                <path fill="#6366f1" d="M13.553 3.016A13.233 13.233 0 0 0 10.253 2a9.068 9.068 0 0 0-.423.86a12.293 12.293 0 0 0-3.664 0A9.112 9.112 0 0 0 5.744 2A13.358 13.358 0 0 0 2.44 3.018C.351 6.108-.215 9.123.068 12.094a13.306 13.306 0 0 0 4.048 2.033a9.78 9.78 0 0 0 .867-1.399a8.605 8.605 0 0 1-1.365-.652c.115-.083.227-.168.335-.251a9.51 9.51 0 0 0 8.094 0c.11.09.222.175.335.251a8.648 8.648 0 0 1-1.368.654a9.7 9.7 0 0 0 .867 1.396a13.248 13.248 0 0 0 4.051-2.03c.332-3.446-.568-6.433-2.379-9.08Zm-8.21 7.25c-.79 0-1.442-.715-1.442-1.596c0-.881.63-1.603 1.439-1.603s1.456.722 1.442 1.603c-.014.88-.636 1.597-1.44 1.597Zm5.315 0c-.79 0-1.44-.715-1.44-1.596c0-.881.63-1.603 1.44-1.603c.81 0 1.452.722 1.438 1.603c-.014.88-.634 1.597-1.438 1.597Z" />
                            </svg>
                        </a>
                    </div>
                </header>
                <main className="flex-1 p-4">
                    <Outlet />
                </main>
                <footer className="bg-gray-800 mt-12">
                                <div className="container mx-auto px-4 py-6 text-center text-gray-400">
                                    <p>&copy; 2025 Superliga FM. Todos los derechos reservados.</p>
                                </div>
                            </footer>
                {notification && <div className="notification">
                    {notification}
                </div>}
            </div>
        </div>
    )
}
