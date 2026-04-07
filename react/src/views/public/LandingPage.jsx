import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axiosClient from '../../axios';

export default function LandingPage() {
    const [recentGames, setRecentGames] = useState([]);
    const [loadingGames, setLoadingGames] = useState(true);

    const publicFeatures = [
        { to: '/public/teams', icon: '🏆', title: 'Equipos', desc: 'Conoce todos los equipos participantes de la Primera y Segunda División.' },
        { to: '/public/players', icon: '⚽', title: 'Jugadores', desc: 'Jugadores con info completa de CA, PA, valores y estadísticas.' },
        { to: '/public/standings', icon: '📊', title: 'Tablas', desc: 'Sigue en vivo las posiciones de la liga, copas y competiciones internacionales.' },
        { to: '/public/statistics', icon: '📈', title: 'Estadísticas', desc: 'Revisa los goleadores, asistencias, tarjetas y el rendimiento global.' },
        { to: '/public/rules', icon: '📋', title: 'Reglamento', desc: 'Lee las reglas, el formato de la competición y el sistema de sanciones.' },
    ];

    useEffect(() => {
        const fetchRecentData = async () => {
            try {
                const resGames = await axiosClient.get('/games/public');
                let games = resGames.data.data || resGames.data;

                games = games
                    .filter(g => g.score_home !== null && g.score_away !== null)
                    .sort((a, b) => new Date(b.match_date) - new Date(a.match_date))
                    .slice(0, 4);

                const resStats = await axiosClient.get('/match-statistics/public');
                const stats = resStats.data.data || resStats.data;

                const gamesWithStats = games.map(game => {
                    const gameStats = stats.filter(s => s.match_id === game.id);
                    return { ...game, matchStats: gameStats };
                });

                setRecentGames(gamesWithStats);
            } catch (error) {
                console.error("Error cargando partidos públicos:", error);
            } finally {
                setLoadingGames(false);
            }
        };

        fetchRecentData();
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0f1c] relative overflow-hidden font-sans selection:bg-blue-500/30">

            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20 pb-24">

                <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in-down">
                    <span className="inline-block py-1.5 px-4 rounded-full bg-slate-800/80 border border-slate-700 text-blue-400 text-xs font-black tracking-widest uppercase mb-6 shadow-sm backdrop-blur-sm">
                        Temporada 61
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

                {/* ÚLTIMOS RESULTADOS (NUEVA SECCIÓN) */}
                <div className="mb-24">
                    <div className="text-center mb-10 flex items-center justify-center gap-4">
                        <div className="h-px w-8 sm:w-16 bg-slate-700"></div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <span className="text-emerald-400">⚡</span> Últimos Resultados
                        </h2>
                        <div className="h-px w-8 sm:w-16 bg-slate-700"></div>
                    </div>

                    {loadingGames ? (
                        <div className="flex justify-center py-12">
                            <div className="loader inline-block border-4 border-slate-600 border-t-emerald-500 rounded-full w-10 h-10 animate-spin"></div>
                        </div>
                    ) : recentGames.length === 0 ? (
                        <div className="text-center bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 max-w-2xl mx-auto">
                            <p className="text-slate-500 font-medium">Aún no hay resultados registrados en esta temporada.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {recentGames.map((game) => {
                                // Extraer goleadores si existen en las estadísticas
                                const homeScorers = game.matchStats?.filter(s => s.team_id === game.team_home?.id && s.goals > 0) || [];
                                const awayScorers = game.matchStats?.filter(s => s.team_id === game.team_away?.id && s.goals > 0) || [];
                                const mvp = game.matchStats?.find(s => s.rating == Math.max(...game.matchStats.map(m => m.rating)));

                                return (
                                    <div key={game.id} className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-3xl overflow-hidden hover:border-slate-500 transition-colors shadow-lg group">
                                        {/* Cabecera del partido */}
                                        <div className="bg-slate-950/50 px-6 py-3 border-b border-slate-800 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            <span>🏆 {game.tournament?.name || 'Liga'}</span>
                                            <span>📅 {game.match_date}</span>
                                        </div>

                                        {/* Marcador Principal */}
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-4 gap-4">
                                                {/* Local */}
                                                <div className="flex-1 text-right">
                                                    <h3 className="text-lg sm:text-xl font-black text-white truncate">{game.team_home?.name}</h3>
                                                </div>

                                                {/* Score */}
                                                <div className="flex-none bg-slate-950 px-4 py-2 rounded-xl border border-slate-700 shadow-inner group-hover:scale-105 transition-transform">
                                                    <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
                                                        {game.score_home} - {game.score_away}
                                                    </span>
                                                </div>

                                                {/* Visitante */}
                                                <div className="flex-1 text-left">
                                                    <h3 className="text-lg sm:text-xl font-black text-white truncate">{game.team_away?.name}</h3>
                                                </div>
                                            </div>

                                            {/* Si hubo penales */}
                                            {(game.penalties_home != null && game.penalties_away != null) && (
                                                <div className="text-center mb-4">
                                                    <span className="bg-yellow-900/30 text-yellow-500 border border-yellow-700/50 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                                                        Penales: {game.penalties_home} - {game.penalties_away}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Mini Estadísticas (Goleadores y MVP) */}
                                            <div className="mt-4 pt-4 border-t border-slate-800/50 flex flex-col sm:flex-row justify-between text-xs text-slate-400 gap-4">
                                                <div className="flex-1 text-right">
                                                    {homeScorers.map((s, i) => (
                                                        <div key={i} className="mb-1 text-green-400/90 font-medium">⚽ <Link to={`/players/${s.player_id?.id}`}>{s.player_id?.name}</Link> {s.goals > 1 && `(x${s.goals})`}</div>
                                                    ))}
                                                </div>

                                                {/* MVP en el centro */}
                                                {mvp && (
                                                    <div className="flex-none text-center px-4 border-x border-slate-800/50">
                                                        <div className="text-yellow-500/90 font-bold" title="Mejor Jugador del Partido">
                                                            ⭐ MVP: {mvp.player_id?.name}
                                                        </div>
                                                        <div className="text-slate-500 text-[10px] mt-0.5">Rating: {mvp.rating}</div>
                                                    </div>
                                                )}

                                                <div className="flex-1 text-left">
                                                    {awayScorers.map((s, i) => (
                                                        <div key={i} className="mb-1 text-green-400/90 font-medium">⚽ <Link to={`/players/${s.player_id?.id}`}>{s.player_id?.name}</Link> {s.goals > 1 && `(x${s.goals})`}</div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* 🔥 BOTÓN PARA VER TODO EL FIXTURE (Agrégalo aquí) */}
                    {!loadingGames && recentGames.length > 0 && (
                        <div className="mt-10 text-center">
                            <Link
                                to="/public/matches"
                                className="inline-flex items-center gap-3 border border-slate-600 hover:border-emerald-500 text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] group"
                            >
                                Ver Fixture y Resultados Completos
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                            </Link>
                        </div>
                    )}
                </div>

                {/* TÍTULO SECCIÓN DE EXPLORACIÓN */}
                <div className="text-center mb-12 flex items-center justify-center gap-4">
                    <div className="h-px w-12 bg-slate-700"></div>
                    <h2 className="text-xl font-black text-slate-300 uppercase tracking-widest">
                        Conoce todo sobre la SuperligaFM
                    </h2>
                    <div className="h-px w-12 bg-slate-700"></div>
                </div>

                {/* GRID DE CARACTERÍSTICAS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">

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

                    {/* Tarjeta 6: Call To Action (Únete) */}
                    <div className="bg-gradient-to-br from-blue-900/80 to-emerald-900/80 backdrop-blur-md p-8 rounded-3xl border border-emerald-700/50 text-center flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all">
                        <div className="text-5xl mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 drop-shadow-lg">
                            🎮
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2 tracking-wide">¡Demuestra tu nivel!</h3>
                        <p className="text-emerald-200/80 mb-6 text-sm font-medium">
                            Tu lugar en la liga te esta esperando.
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
