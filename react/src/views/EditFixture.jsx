import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosClient from "../axios";
import { useStateContext } from "../context/ContextProvider";
import moment from "moment";

export default function EditFixture() {
    const { id } = useParams(); // Obtenemos el ID de la URL
    const navigate = useNavigate();
    const { setNotification } = useStateContext();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [teams, setTeams] = useState([]);

    const [fixture, setFixture] = useState({
        matchday: '',
        home_team_id: '',
        away_team_id: '',
        due_date: '',
        status: 'pendiente'
    });

    useEffect(() => {
        fetchFixtureAndTeams();
    }, []);

    const fetchFixtureAndTeams = async () => {
        setLoading(true);
        try {
            // 1. Traemos los datos del partido
            const { data } = await axiosClient.get(`/fixtures/${id}`);
            const fixtureData = data.data;

            // Formateamos la fecha para el input type="datetime-local" (YYYY-MM-DDTHH:mm)
            const formattedDate = fixtureData.due_date
                ? moment(fixtureData.due_date).format('YYYY-MM-DDTHH:mm')
                : '';
            console.log("Fecha formateada:", fixtureData);

            setFixture({
                matchday: fixtureData.matchday || '',
                home_team_id: fixtureData.home_team_id || '',
                away_team_id: fixtureData.away_team_id || '',
                due_date: formattedDate,
                status: fixtureData.status || 'pendiente'
            });

            // Si traes todos, usa '/teams'. Ajusta la URL según tu backend.
            const teamsResponse = await axiosClient.get('/teams');
            const teamsData = teamsResponse.data.data || teamsResponse.data || [];
            console.log("Equipos obtenidos:", teamsData);
            const filteredTeams = teamsData.filter(t => t.division === "Primera" || t.division === "Segunda");
            setTeams(filteredTeams);
        } catch (error) {
            console.error("Error cargando datos:", error);
            setNotification("Error al cargar la información del partido");
            navigate('/app/fixture'); // Volver si hay error
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFixture({ ...fixture, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Formatear la fecha para MySQL (YYYY-MM-DD HH:mm:ss)
            const payloadDate = fixture.due_date
                ? moment(fixture.due_date).format('YYYY-MM-DD HH:mm:ss')
                : null;

            const payload = {
                ...fixture,
                due_date: payloadDate
            };

            await axiosClient.put(`/fixtures/${id}`, payload);
            setNotification("Partido actualizado correctamente");
            //navigate('/app/fixture'); // Redirigir a tu lista de fixtures
        } catch (error) {
            console.error(error);
            setNotification("Hubo un error al actualizar el partido");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen pb-20">
                <span className="text-slate-400 font-bold animate-pulse text-xl">Cargando datos del partido...</span>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8 animate-fade-in-down pb-20">

            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-black text-indigo-400 tracking-widest uppercase">
                    Editar Partido
                </h1>
                <Link
                    to="/app/partidos" // Cambia a la ruta donde tengas tu FixtureList
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 font-bold bg-slate-800 px-4 py-2 rounded-lg border border-slate-700"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Volver
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="bg-slate-900/40 p-6 sm:p-8 rounded-3xl border border-slate-700/50 shadow-xl space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* JORNADA / FECHA */}
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            Jornada / Fecha
                        </label>
                        <input
                            type="number"
                            name="matchday"
                            min="1"
                            value={fixture.matchday}
                            onChange={handleChange}
                            required
                            className="w-full h-11 px-4 rounded-lg bg-[#0a0f1d] border border-slate-700 text-white font-bold text-sm outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>

                    {/* ESTADO */}
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            Estado
                        </label>
                        <select
                            name="status"
                            value={fixture.status}
                            onChange={handleChange}
                            className="w-full h-11 px-4 rounded-lg bg-[#0a0f1d] border border-slate-700 text-white font-bold text-sm outline-none focus:border-indigo-500 transition-colors appearance-none"
                        >
                            <option value="pendiente">Pendiente</option>
                            <option value="jugado">Jugado</option>
                            <option value="aplazado">Aplazado</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    {/* EQUIPO LOCAL */}
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            Equipo Local
                        </label>
                        <select
                            name="home_team_id"
                            value={fixture.home_team_id}
                            onChange={handleChange}
                            required
                            className="w-full h-11 px-4 rounded-lg bg-[#0a0f1d] border border-slate-700 text-white font-bold text-sm outline-none focus:border-indigo-500 transition-colors appearance-none"
                        >
                            <option value="">Seleccione Local...</option>
                            {teams.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* EQUIPO VISITANTE */}
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            Equipo Visitante
                        </label>
                        <select
                            name="away_team_id"
                            value={fixture.away_team_id}
                            onChange={handleChange}
                            required
                            className="w-full h-11 px-4 rounded-lg bg-[#0a0f1d] border border-slate-700 text-white font-bold text-sm outline-none focus:border-indigo-500 transition-colors appearance-none"
                        >
                            <option value="">Seleccione Visitante...</option>
                            {teams.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* VENCIMIENTO */}
                <div className="flex flex-col w-full md:w-1/2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                        Fecha Límite
                    </label>
                    <input
                        type="datetime-local"
                        name="due_date"
                        value={fixture.due_date}
                        onChange={handleChange}
                        className="w-full h-11 px-4 rounded-lg bg-[#0a0f1d] border border-slate-700 text-slate-300 font-bold text-sm outline-none focus:border-indigo-500 transition-colors"
                    />
                </div>

                {/* BOTÓN GUARDAR */}
                <div className="pt-6 flex justify-end border-t border-slate-700/50 mt-8">
                    <button
                        type="submit"
                        disabled={saving}
                        className="h-12 px-8 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                Guardando...
                            </>
                        ) : (
                            '💾 Guardar Cambios'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
