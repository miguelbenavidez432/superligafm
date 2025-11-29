import { Outlet, Link } from "react-router-dom";
import { useState } from "react";

export default function PublicLayout() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="bg-[#040270] shadow-lg">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between py-4">
                        <Link to="/" className="text-2xl font-bold text-white">
                            Superliga FM
                        </Link>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden text-white focus:outline-none"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex space-x-6">
                            <Link to="/public/teams" className="text-white hover:text-blue-400 transition">
                                Equipos
                            </Link>
                            <Link to="/public/players" className="text-white hover:text-blue-400 transition">
                                Jugadores
                            </Link>
                            <Link to="/public/standings" className="text-white hover:text-blue-400 transition">
                                Tablas
                            </Link>
                            <Link to="/public/statistics" className="text-white hover:text-blue-400 transition">
                                Estadísticas
                            </Link>
                            <Link to="/public/rules" className="text-white hover:text-blue-400 transition">
                                Reglamento
                            </Link>
                            <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition">
                                Iniciar Sesión
                            </Link>
                            <Link to="/signup" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition">
                                Registrarse
                            </Link>
                        </nav>
                    </div>

                    {/* Mobile Navigation */}
                    {isMenuOpen && (
                        <nav className="md:hidden pb-4 space-y-2">
                            <Link
                                to="/public/teams"
                                className="block text-white hover:bg-gray-700 px-4 py-2 rounded"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Equipos
                            </Link>
                            <Link
                                to="/public/players"
                                className="block text-white hover:bg-gray-700 px-4 py-2 rounded"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Jugadores
                            </Link>
                            <Link
                                to="/public/standings"
                                className="block text-white hover:bg-gray-700 px-4 py-2 rounded"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Tablas
                            </Link>
                            <Link
                                to="/public/statistics"
                                className="block text-white hover:bg-gray-700 px-4 py-2 rounded"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Estadísticas
                            </Link>
                            <Link
                                to="/public/rules"
                                className="block text-white hover:bg-gray-700 px-4 py-2 rounded"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Reglamento
                            </Link>
                            <Link
                                to="/login"
                                className="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-center"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Iniciar Sesión
                            </Link>
                            <Link
                                to="/signup"
                                className="block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-center"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Registrarse
                            </Link>
                        </nav>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 mt-12">
                <div className="container mx-auto px-4 py-6 text-center text-gray-400">
                    <p>&copy; 2025 Superliga FM. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}
