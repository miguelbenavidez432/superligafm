import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-900 text-white py-20 px-4 text-center rounded-lg">
                <h1 className="text-5xl font-bold mb-4">Bienvenido a Superliga FM</h1>
                <p className="text-xl mb-8">
                    La liga de Football Manager más competitiva y emocionante
                </p>
                <div className="flex justify-center gap-4">
                    <Link
                        to="/auth/login"
                        className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                    >
                        Iniciar Sesión
                    </Link>
                    <Link
                        to="/auth/signup"
                        className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                        Registrarse
                    </Link>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-16 px-4">
                <h2 className="text-3xl font-bold text-black text-center mb-12">
                    Explora la Liga
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <Link
                        to="/public/teams"
                        className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition text-center"
                    >
                        <div className="text-4xl mb-4">🏆</div>
                        <h3 className="text-xl font-semibold text-white mb-2">Equipos</h3>
                        <p className="text-gray-400">
                            Conoce todos los equipos participantes de Primera y Segunda División
                        </p>
                    </Link>

                    <Link
                        to="/public/players"
                        className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition text-center"
                    >
                        <div className="text-4xl mb-4">⚽</div>
                        <h3 className="text-xl font-semibold text-white mb-2">Jugadores</h3>
                        <p className="text-gray-400">
                            Explora la base de datos completa de jugadores
                        </p>
                    </Link>

                    <Link
                        to="/public/standings"
                        className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition text-center"
                    >
                        <div className="text-4xl mb-4">📊</div>
                        <h3 className="text-xl font-semibold text-white mb-2">Tablas</h3>
                        <p className="text-gray-400">
                            Consulta las posiciones de todos los torneos
                        </p>
                    </Link>

                    <Link
                        to="/public/statistics"
                        className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition text-center"
                    >
                        <div className="text-4xl mb-4">📈</div>
                        <h3 className="text-xl font-semibold text-white mb-2">Estadísticas</h3>
                        <p className="text-gray-400">
                            Revisa goleadores, asistencias y más estadísticas
                        </p>
                    </Link>

                    <Link
                        to="/public/rules"
                        className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition text-center"
                    >
                        <div className="text-4xl mb-4">📋</div>
                        <h3 className="text-xl font-semibold text-white mb-2">Reglamento</h3>
                        <p className="text-gray-400">
                            Lee las reglas y formato de la competición
                        </p>
                    </Link>

                    <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 rounded-lg text-center">
                        <div className="text-4xl mb-4">🎮</div>
                        <h3 className="text-xl font-semibold text-white mb-2">¡Únete!</h3>
                        <p className="text-white mb-4">
                            Regístrate para participar en la liga
                        </p>
                        <Link
                            to="/auth/signup"
                            className="bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
                        >
                            Crear Cuenta
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
