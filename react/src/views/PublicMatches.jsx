/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import axiosClient from '../axios';
import { Link } from 'react-router-dom';

export default function PublicMatches() {
    const [games, setGames] = useState([]);
    const [stats, setStats] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const resTournaments = await axiosClient.get('/tournaments/public');
                setTournaments(resTournaments.data.data || resTournaments.data);

                const resGames = await axiosClient.get('/games/public');
                let allGames = resGames.data.data || resGames.data;

                const resStats = await axiosClient.get('/match-statistics/public');
                const allStats = resStats.data.data || resStats.data;

                setStats(allStats);

                allGames.sort((a, b) => new Date(b.match_date) - new Date(a.match_date));
                setGames(allGames);
            } catch (error) {
                console.error("Error cargando el fixture:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const filteredGames = selectedTournament
        ? games.filter(g => {
            const gameTournamentId = g.tournament_id || (g.tournament && g.tournament.id);
            return gameTournamentId == selectedTournament;
        })
        : games;

    return (
        <div className="min-h-screen bg-[#0a0f1c] relative overflow-hidden font-sans selection:bg-blue-500/30 pb-24">
            {/* Background Glows */}
            <div className="absolute top-0 left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-10">

                {/* Cabecera y Botón Volver */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                    <div>
                        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 font-bold tracking-wide transition-colors mb-4">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            Volver al Inicio
                        </Link>
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight">
                            Fixture y Resultados
                        </h1>
                    </div>

                    {/* Filtro de Torneos */}
                    <div className="w-full md:w-auto bg-slate-900/80 backdrop-blur-md p-2 rounded-xl border border-slate-700 shadow-xl">
                        <select
                            value={selectedTournament}
                            onChange={(e) => setSelectedTournament(e.target.value)}
                            className="w-full md:w-64 p-3 border border-slate-600 rounded-lg bg-slate-800 text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                        >
                            <option value="">🏆 Todas las Competiciones</option>
                            {tournaments.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-32">
                        <div className="loader inline-block border-4 border-slate-600 border-t-emerald-500 rounded-full w-12 h-12 animate-spin"></div>
                    </div>
                ) : filteredGames.length === 0 ? (
                    <div className="text-center bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-12 max-w-2xl mx-auto shadow-xl">
                        <span className="text-5xl block mb-4">🏟️</span>
                        <h3 className="text-2xl font-black text-white mb-2">No hay partidos</h3>
                        <p className="text-slate-400 font-medium">No se encontraron resultados para esta competición.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
                        {filteredGames.map((game) => {
                            // Extraer estadísticas del partido
                            const gameStats = stats.filter(s => s.match_id === game.id);
                            const homeScorers = gameStats.filter(s => s.team_id === game.team_home?.id && s.goals > 0);
                            const awayScorers = gameStats.filter(s => s.team_id === game.team_away?.id && s.goals > 0);
                            const mvp = gameStats.find(s => s.rating == Math.max(...gameStats.map(m => m.rating)));

                            const isPlayed = game.score_home !== null && game.score_away !== null;

                            return (
                                <div key={game.id} className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-3xl overflow-hidden hover:border-slate-500 transition-all shadow-lg group">
                                    <div className="bg-slate-950/80 px-6 py-3 border-b border-slate-800 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        <span>🏆 {game.tournament?.name}</span>
                                        <span className={isPlayed ? "text-emerald-400" : "text-yellow-500"}>
                                            {isPlayed ? `📅 ${game.match_date}` : '⏳ Pendiente'}
                                        </span>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4 gap-4">
                                            <div className="flex-1 text-right">
                                                <h3 className="text-xl font-black text-white truncate">{game.team_home?.name}</h3>
                                            </div>

                                            <div className={`flex-none px-4 py-2 rounded-xl border ${isPlayed ? 'bg-slate-950 border-slate-700 shadow-inner' : 'bg-slate-800/50 border-slate-700 border-dashed'}`}>
                                                <span className={`text-2xl sm:text-3xl font-black tracking-tighter ${isPlayed ? 'text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400' : 'text-slate-500'}`}>
                                                    {isPlayed ? `${game.score_home} - ${game.score_away}` : 'VS'}
                                                </span>
                                            </div>

                                            <div className="flex-1 text-left">
                                                <h3 className="text-xl font-black text-white truncate">{game.team_away?.name}</h3>
                                            </div>
                                        </div>

                                        {isPlayed && (game.penalties_home != null) && (
                                            <div className="text-center mb-4">
                                                <span className="bg-yellow-900/30 text-yellow-500 border border-yellow-700/50 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                                                    Penales: {game.penalties_home} - {game.penalties_away}
                                                </span>
                                            </div>
                                        )}

                                        {isPlayed && gameStats.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-slate-800/50 flex flex-col sm:flex-row justify-between text-xs text-slate-400 gap-4">
                                                <div className="flex-1 text-right">
                                                    {homeScorers.map((s, i) => (
                                                        <div key={i} className="mb-1 text-green-400/90 font-medium">⚽ {s.player_id?.name} {s.goals > 1 && `(x${s.goals})`}</div>
                                                    ))}
                                                </div>

                                                {mvp && (
                                                    <div className="flex-none text-center px-4 border-x border-slate-800/50">
                                                        <div className="text-yellow-500/90 font-bold">⭐ MVP: {mvp.player_id?.name}</div>
                                                    </div>
                                                )}

                                                <div className="flex-1 text-left">
                                                    {awayScorers.map((s, i) => (
                                                        <div key={i} className="mb-1 text-green-400/90 font-medium">⚽ {s.player_id?.name} {s.goals > 1 && `(x${s.goals})`}</div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
