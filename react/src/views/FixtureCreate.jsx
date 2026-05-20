import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../axios";
import { useStateContext } from "../context/ContextProvider";

export default function FixtureCreate() {
    const navigate = useNavigate();
    const { setNotification } = useStateContext();
    const [loading, setLoading] = useState(false);

    const [seasons, setSeasons] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [teams, setTeams] = useState([]);

    const [formData, setFormData] = useState({
        id_season: '',
        id_tournament: '',
        matchday: 1,
        home_team_id: '',
        away_team_id: '',
        due_date: '',
        status: 'pendiente'
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    // Cargar torneos cuando cambia la temporada seleccionada
    useEffect(() => {
        if (formData.id_season) {
            fetchTournaments(formData.id_season);
        } else {
            setTournaments([]);
            setFormData(prev => ({ ...prev, id_tournament: '' }));
        }
    }, [formData.id_season]);

    const fetchInitialData = async () => {
        try {
            const [seasonsRes, teamsRes] = await Promise.all([
                axiosClient.get('/season'),
                axiosClient.get('/teams') // Ajusta este endpoint a tu ruta real de equipos
            ]);

            const fetchedSeasons = seasonsRes.data.data || [];
            setSeasons(fetchedSeasons);
            setTeams(teamsRes.data.data || teamsRes.data || []);

            // Auto-seleccionar la última temporada
            if (fetchedSeasons.length > 0) {
                const activeSeason = fetchedSeasons.find(s => s.active === 'yes') || fetchedSeasons[0];
                setFormData(prev => ({ ...prev, id_season: activeSeason.id }));
            }
        } catch (error) {
            setNotification("Error al cargar datos iniciales");
        }
    };

    const fetchTournaments = async (seasonId) => {
        try {
            const response = await axiosClient.get('/tournaments', {
                params: { id_season: seasonId }
            });
            let fetchedTournaments = response.data.data || [];
            fetchedTournaments = Array.from(new Map(fetchedTournaments.map(t => [t.id, t])).values());
            fetchedTournaments.sort((a, b) => a.id - b.id);
            setTournaments(fetchedTournaments);

            if (fetchedTournaments.length > 0) {
                setFormData(prev => ({ ...prev, id_tournament: fetchedTournaments[0].id }));
            }
        } catch (error) {
            setNotification("Error al cargar torneos");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.home_team_id === formData.away_team_id) {
            setNotification("El equipo local y visitante no pueden ser el mismo.");
            return;
        }

        setLoading(true);
        try {
            await axiosClient.post('/fixtures', formData);
            setNotification("Partido programado con éxito");
            navigate('/app/fixtures'); // Ajusta a la ruta donde tienes tu FixturesList
        } catch (error) {
            setNotification(error.response?.data?.message || "Error al programar el partido");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-8 animate-fade-in-down pb-20">
            <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-700 shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="bg-slate-950 px-8 py-6 border-b border-slate-800 flex justify-between items-center">
                    <div>
                        <h1 className="font-black text-2xl text-white uppercase tracking-wider">Programar Partido</h1>
                        <p className="text-slate-400 text-sm mt-1">Carga un nuevo encuentro al calendario</p>
                    </div>
                    <Link to="/app/fixtures" className="text-slate-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </Link>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">

                    {/* FILA 1: Temporada y Torneo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Temporada</label>
                            <select
                                name="id_season"
                                value={formData.id_season}
                                onChange={handleChange}
                                required
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors"
                            >
                                <option value="">Seleccionar...</option>
                                {seasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Torneo</label>
                            <select
                                name="id_tournament"
                                value={formData.id_tournament}
                                onChange={handleChange}
                                required
                                disabled={!formData.id_season || tournaments.length === 0}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors disabled:opacity-50"
                            >
                                <option value="">Seleccionar...</option>
                                {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* FILA 2: Fecha (Matchday) y Vencimiento */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">N° de Fecha / Jornada</label>
                            <input
                                type="number"
                                name="matchday"
                                min="1"
                                value={formData.matchday}
                                onChange={handleChange}
                                required
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors"
                                placeholder="Ej: 1"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Vencimiento (Opcional)</label>
                            <input
                                type="datetime-local"
                                name="due_date"
                                value={formData.due_date}
                                onChange={handleChange}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    {/* FILA 3: Equipos */}
                    <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50 mt-8">
                        <div className="flex items-center justify-center gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-right">Equipo Local</label>
                                <select
                                    name="home_team_id"
                                    value={formData.home_team_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors text-right"
                                >
                                    <option value="">Seleccionar Local...</option>
                                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>

                            <div className="text-2xl font-black text-slate-600 px-4 mt-6">VS</div>

                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Equipo Visitante</label>
                                <select
                                    name="away_team_id"
                                    value={formData.away_team_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors"
                                >
                                    <option value="">Seleccionar Visitante...</option>
                                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex justify-end gap-4 pt-6 border-t border-slate-800">
                        <Link
                            to="/app/fixtures"
                            className="px-6 py-3 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/30 disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Programar Partido'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
