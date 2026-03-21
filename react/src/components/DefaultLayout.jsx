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

    // 1. ESTADO INTELIGENTE: Detecta el ancho de la pantalla al cargar
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

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
    }, []);

    // 2. LISTENER DE REDIMENSIÓN: Ajusta el menú si el usuario gira el celular o achica la ventana
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Función para cerrar el sidebar en móviles al hacer clic en un enlace
    const closeSidebarOnMobile = () => {
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <div id="defaultLayout" className="flex min-h-screen font-sans selection:bg-blue-500/30">

            {/* OVERLAY PARA MÓVILES (Fondo oscuro al abrir el menú) */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl border-r border-slate-700/50
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="p-6 flex items-center justify-between border-b border-slate-800">
                    <h1 className="text-2xl font-black text-white tracking-wider uppercase">
                        Superliga FM
                    </h1>
                    {/* Botón de cerrar solo en móvil */}
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
                    <Link onClick={closeSidebarOnMobile} className="block py-3 px-6 hover:bg-slate-800 hover:text-blue-400 font-medium transition-colors" to='/app/dashboard'>Mi estado</Link>
                    <Link onClick={closeSidebarOnMobile} className="block py-3 px-6 hover:bg-slate-800 hover:text-blue-400 font-medium transition-colors" to='/app/tablas'>Tablas</Link>
                    <Link onClick={closeSidebarOnMobile} className="block py-3 px-6 hover:bg-slate-800 hover:text-blue-400 font-medium transition-colors" to='/app/estadisticas'>Estadísticas</Link>

                    {/* DROPDOWN FIXTURE */}
                    <div className="group relative">
                        <button className="flex w-full items-center justify-between py-3 px-6 hover:bg-slate-800 hover:text-blue-400 font-medium transition-colors">
                            <span>Fixture</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                        <div className="hidden group-hover:block bg-slate-950 border-y border-slate-800">
                            <Link onClick={closeSidebarOnMobile} className="block py-2.5 pl-10 pr-4 text-sm hover:text-blue-400 transition-colors" to='/app/fixture_primera'>Fixture Primera</Link>
                            <Link onClick={closeSidebarOnMobile} className="block py-2.5 pl-10 pr-4 text-sm hover:text-blue-400 transition-colors" to='/app/fixture_segunda'>Fixture Segunda</Link>
                            <Link onClick={closeSidebarOnMobile} className="block py-2.5 pl-10 pr-4 text-sm hover:text-blue-400 transition-colors" to='/app/levantar-sancion'>Apelación de sanciones</Link>
                        </div>
                    </div>

                    <Link onClick={closeSidebarOnMobile} className="block py-3 px-6 hover:bg-slate-800 hover:text-blue-400 font-medium transition-colors" to='/app/plantel'>Plantel</Link>
                    <Link onClick={closeSidebarOnMobile} className="block py-3 px-6 hover:bg-slate-800 hover:text-blue-400 font-medium transition-colors" to='/app/players'>Jugadores</Link>
                    <Link onClick={closeSidebarOnMobile} className="block py-3 px-6 hover:bg-slate-800 hover:text-blue-400 font-medium transition-colors" to='/app/users'>Managers</Link>
                    <Link onClick={closeSidebarOnMobile} className="block py-3 px-6 hover:bg-slate-800 hover:text-blue-400 font-medium transition-colors" to='/app/teams'>Equipos</Link>

                    {/* DROPDOWN APUESTAS */}
                    <div className="group relative">
                        <button className="flex w-full items-center justify-between py-3 px-6 hover:bg-slate-800 hover:text-blue-400 font-medium transition-colors">
                            <span>Apuestas</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                        <div className="hidden group-hover:block bg-slate-950 border-y border-slate-800">
                            <Link onClick={closeSidebarOnMobile} className="block py-2.5 pl-10 pr-4 text-sm hover:text-blue-400 transition-colors" to='/app/apuestas'>Apuestas</Link>
                            <Link onClick={closeSidebarOnMobile} className="block py-2.5 pl-10 pr-4 text-sm hover:text-blue-400 transition-colors" to='/app/apuestas/new'>Crear apuestas</Link>
                            {user.rol === 'Admin' && (
                                <Link onClick={closeSidebarOnMobile} className="block py-2.5 pl-10 pr-4 text-sm text-emerald-400 hover:text-emerald-300 transition-colors" to='/app/apuestas/usuarios'>Confirmar apuestas ganadas</Link>
                            )}
                        </div>
                    </div>

                    <Link onClick={closeSidebarOnMobile} className="block py-3 px-6 hover:bg-slate-800 hover:text-blue-400 font-medium transition-colors" to='/app/reglamento'>Reglamento</Link>
                    <Link onClick={closeSidebarOnMobile} className="block py-3 px-6 hover:bg-slate-800 hover:text-blue-400 font-medium transition-colors" to='/app/partidos'>Partidos</Link>

                    {user.rol === 'Admin' && (
                        <Link onClick={closeSidebarOnMobile} className="block py-3 px-6 hover:bg-slate-800 hover:text-emerald-400 font-medium transition-colors text-emerald-500" to='/app/torneos'>Cargar Torneo</Link>
                    )}

                    {/* DROPDOWN MERCADO */}
                    <div className="group relative">
                        <button className="flex w-full items-center justify-between py-3 px-6 hover:bg-slate-800 hover:text-blue-400 font-medium transition-colors">
                            <span>Mercado</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                        <div className="hidden group-hover:block bg-slate-950 border-y border-slate-800">
                            <Link onClick={closeSidebarOnMobile} className="block py-2.5 pl-10 pr-4 text-sm hover:text-blue-400 transition-colors" to='/app/misofertas'>Mis ofertas</Link>
                            <Link onClick={closeSidebarOnMobile} className="block py-2.5 pl-10 pr-4 text-sm hover:text-blue-400 transition-colors" to='/app/offers'>Ofertas</Link>
                            <Link onClick={closeSidebarOnMobile} className="block py-2.5 pl-10 pr-4 text-sm hover:text-blue-400 transition-colors" to='/app/transferencias'>Intercambios</Link>
                            <Link onClick={closeSidebarOnMobile} className="block py-2.5 pl-10 pr-4 text-sm hover:text-blue-400 transition-colors" to='/app/crear_subasta'>Crear Subasta</Link>
                            <Link onClick={closeSidebarOnMobile} className="block py-2.5 pl-10 pr-4 text-sm hover:text-blue-400 transition-colors" to='/app/subastas'>Lista de Subastas</Link>
                            <Link onClick={closeSidebarOnMobile} className="block py-2.5 pl-10 pr-4 text-sm hover:text-blue-400 transition-colors" to='/app/clausula_rescision'>Claúsula de rescisión</Link>
                            <Link onClick={closeSidebarOnMobile} className="block py-2.5 pl-10 pr-4 text-sm hover:text-blue-400 transition-colors" to='/app/transfer'>Transferencia</Link>
                            {user.rol === 'Admin' && (
                                <>
                                    <Link onClick={closeSidebarOnMobile} className="block py-2.5 pl-10 pr-4 text-sm text-emerald-400 hover:text-emerald-300 transition-colors" to='/app/ofertas-confirmadas'>Traspasos confirmados</Link>
                                    <Link onClick={closeSidebarOnMobile} className="block py-2.5 pl-10 pr-4 text-sm text-red-400 hover:text-red-300 transition-colors" to='/app/reverse-offer'>Revertir Oferta</Link>
                                </>
                            )}
                        </div>
                    </div>

                    {user.rol === 'Admin' && (
                        <>
                        <Link onClick={closeSidebarOnMobile} className="block py-3 px-6 hover:bg-slate-800 hover:text-emerald-400 text-emerald-500 font-medium transition-colors" to='/app/premios'>Premios</Link>
                        <Link onClick={closeSidebarOnMobile} className="block py-3 px-6 hover:bg-slate-800 hover:text-emerald-400 text-emerald-500 font-medium transition-colors" to='/app/jugadores-registrados'>Jugadores Registrados</Link>
                        </>
                    )}

                    <Link onClick={closeSidebarOnMobile} className="block py-3 px-6 hover:bg-slate-800 hover:text-blue-400 font-medium transition-colors" to='/app/about'>Nosotros</Link>
                </nav>

                {/* FOOTER DEL SIDEBAR */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-colors border border-red-500/20"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'lg:ml-56' : 'ml-0'}`}>

                {/* TOP HEADER */}
                <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-30">
                    <button onClick={toggleSidebar} className="text-slate-600 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-slate-100">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>

                    {/* REDES SOCIALES */}
                    <div className="flex items-center space-x-32 pr-4">
                        <a href="https://twitter.com/superligaFm" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                            <svg width="24" height="24" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="#1DA1F2" d="M459.37 151.716c.325 4.548.325 9.097.325 13.645c0 138.72-105.583 298.558-298.558 298.558c-59.452 0-114.68-17.219-161.137-47.106c8.447.974 16.568 1.299 25.34 1.299c49.055 0 94.213-16.568 130.274-44.832c-46.132-.975-84.792-31.188-98.112-72.772c6.498.974 12.995 1.624 19.818 1.624c9.421 0 18.843-1.3 27.614-3.573c-48.081-9.747-84.143-51.98-84.143-102.4v-1.299c14.182 7.896 30.355 12.67 47.431 13.319c-28.264-18.843-46.781-51.005-46.781-87.391c0-19.492 5.197-37.36 14.294-52.954c51.655 63.675 129.3 105.258 216.365 109.807c-1.624-7.896-2.599-16.243-2.599-24.591c0-59.452 48.081-107.533 107.533-107.533c30.855 0 58.824 12.67 78.431 33.137c24.591-4.872 47.431-13.894 68.044-26.362c-8.123 25.34-25.34 46.456-47.431 59.452c21.817-2.273 42.734-8.447 61.927-16.893c-14.294 21.817-32.161 41.007-52.628 56.451z" /></svg>
                        </a>
                        <a href="https://www.twitch.tv/superligafm" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                            <svg width="24" height="24" viewBox="0 0 256 268" xmlns="http://www.w3.org/2000/svg"><path fill="#9146FF" d="M17.458 0L0 46.556v186.201h63.983v34.934h34.931l34.898-34.934h52.36L256 162.954V0H17.458Zm23.259 23.263H232.73v128.029l-40.739 40.741H128L93.113 226.92v-34.886H40.717V23.263Zm64.008 116.405H128V69.844h-23.275v69.824Zm63.997 0h23.27V69.844h-23.27v69.824Z" /></svg>
                        </a>
                        <a href="https://discord.gg/DXS2ZvpzQc" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                            <svg width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path fill="#6366f1" d="M13.553 3.016A13.233 13.233 0 0 0 10.253 2a9.068 9.068 0 0 0-.423.86a12.293 12.293 0 0 0-3.664 0A9.112 9.112 0 0 0 5.744 2A13.358 13.358 0 0 0 2.44 3.018C.351 6.108-.215 9.123.068 12.094a13.306 13.306 0 0 0 4.048 2.033a9.78 9.78 0 0 0 .867-1.399a8.605 8.605 0 0 1-1.365-.652c.115-.083.227-.168.335-.251a9.51 9.51 0 0 0 8.094 0c.11.09.222.175.335.251a8.648 8.648 0 0 1-1.368.654a9.7 9.7 0 0 0 .867 1.396a13.248 13.248 0 0 0 4.051-2.03c.332-3.446-.568-6.433-2.379-9.08Zm-8.21 7.25c-.79 0-1.442-.715-1.442-1.596c0-.881.63-1.603 1.439-1.603s1.456.722 1.442 1.603c-.014.88-.636 1.597-1.44 1.597Zm5.315 0c-.79 0-1.44-.715-1.44-1.596c0-.881.63-1.603 1.44-1.603c.81 0 1.452.722 1.438 1.603c-.014.88-.634 1.597-1.438 1.597Z" /></svg>
                        </a>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
                    <Outlet />
                </main>

                <footer className="bg-gray-800 border-t border-slate-200 mt-auto">
                    <div className="container mx-auto px-4 py-6 text-center text-slate-500 text-sm font-medium">
                        <p>&copy; 2018-2026 Superliga FM. Todos los derechos reservados.</p>
                    </div>
                </footer>

                {notification && (
                    <div className="fixed bottom-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-2xl animate-fade-in-up z-50 font-bold flex items-center gap-2">
                        <span>✅</span> {notification}
                    </div>
                )}
            </div>
        </div>
    )
}
