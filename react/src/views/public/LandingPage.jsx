import { Link } from 'react-router-dom';

export default function LandingPage() {
    // Array con las secciones para renderizar las tarjetas dinámicamente y mantener el código limpio
    const publicFeatures = [
        { to: '/public/teams', icon: '🏆', title: 'Equipos', desc: 'Conoce todos los equipos participantes de la Primera y Segunda División.' },
        { to: '/public/players', icon: '⚽', title: 'Jugadores', desc: 'Jugadores con info completa de CA, PA, valores y estadísticas.' },
        { to: '/public/standings', icon: '📊', title: 'Tablas', desc: 'Sigue en vivo las posiciones de la liga, copas y competiciones internacionales.' },
        { to: '/public/statistics', icon: '📈', title: 'Estadísticas', desc: 'Revisa los goleadores, asistencias, tarjetas y el rendimiento global.' },
        { to: '/public/rules', icon: '📋', title: 'Reglamento', desc: 'Lee las reglas, el formato de la competición y el sistema de sanciones.' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0f1c] relative overflow-hidden font-sans selection:bg-blue-500/30">

            {/* EFECTOS DE FONDO (Ambient Glows) */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20 pb-24">

                {/* HERO SECTION */}
                <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in-down">
                    <span className="inline-block py-1.5 px-4 rounded-full bg-slate-800/80 border border-slate-700 text-blue-400 text-xs font-black tracking-widest uppercase mb-6 shadow-sm backdrop-blur-sm">
                        Temporada Oficial
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-teal-400 drop-shadow-lg tracking-tight">
                        Superliga FM
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 mb-10 font-medium tracking-wide leading-relaxed">
                        La liga de Football Manager más competitiva, realista y emocionante de la comunidad. Gestiona, compite y alcanza la gloria.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
                        <Link
                            to="/auth/login"
                            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-white uppercase tracking-wider transition-all shadow-lg border border-slate-600 bg-slate-800 hover:bg-slate-700 hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            🔐 Iniciar Sesión
                        </Link>
                        <Link
                            to="/auth/signup"
                            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-white uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            ✍️ Registrarse
                        </Link>
                    </div>
                </div>

                {/* TÍTULO SECCIÓN DE EXPLORACIÓN */}
                <div className="text-center mb-12 flex items-center justify-center gap-4">
                    <div className="h-px w-12 bg-slate-700"></div>
                    <h2 className="text-xl font-black text-slate-300 uppercase tracking-widest">
                        Explora nuestras secciones de la temporada
                    </h2>
                    <div className="h-px w-12 bg-slate-700"></div>
                </div>

                {/* GRID DE CARACTERÍSTICAS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">

                    {/* Mapeo de las 5 tarjetas principales */}
                    {publicFeatures.map((feature, index) => (
                        <Link
                            key={index}
                            to={feature.to}
                            className="bg-slate-900/60 backdrop-blur-md p-8 rounded-3xl border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all duration-300 group hover:-translate-y-2 hover:shadow-[0_10px_30px_-10px_rgba(59,130,246,0.2)] text-center flex flex-col items-center"
                        >
                            <div className="bg-slate-800 border border-slate-600 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-black text-white mb-3 tracking-wide">{feature.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                        </Link>
                    ))}

                    {/* Tarjeta 6: Call To Action (Únete) destacada */}
                    <div className="bg-gradient-to-br from-blue-900/80 to-emerald-900/80 backdrop-blur-md p-8 rounded-3xl border border-emerald-700/50 text-center flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all">
                        <div className="text-5xl mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 drop-shadow-lg">
                            🎮
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2 tracking-wide">¡Demuestra tu nivel!</h3>
                        <p className="text-emerald-200/80 mb-6 text-sm font-medium">
                            Te esperamos para participar en la Superliga.
                        </p>
                        <Link
                            to="/auth/signup"
                            className="bg-white text-emerald-900 px-8 py-3 rounded-xl font-bold uppercase tracking-wider hover:bg-slate-100 transition-colors shadow-lg w-full sm:w-auto"
                        >
                            Crear Cuenta
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}
