/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import axiosClient from '../axios';
import { useStateContext } from '../context/ContextProvider';

export default function CancelSuspensionForm() {
    const { user, setNotification } = useStateContext();
    const [loading, setLoading] = useState(false);

    // Listas para los selects
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [penaltyCosts, setPenaltyCosts] = useState([]);

    // Estado del formulario
    const [formData, setFormData] = useState({
        team_id: '',
        rival_team_id: '',
        player_id: '',
        penalty_cost_id: ''
    });

    useEffect(() => {
        // Cargar Equipos y Costos iniciales
        axiosClient.get('/teams').then(({ data }) => {
            const teamsList = data.data || data;
            const teamFilter = teamsList.filter((t) => t.division === 'Primera' || t.division === 'Segunda');
            setTeams(teamFilter);
        });
        axiosClient.get('/penalty-costs').then(({ data }) => setPenaltyCosts(data));
    }, []);

    // Cargar jugadores cuando se selecciona un equipo
    useEffect(() => {
        if (formData.team_id) {
            axiosClient.get(`/players-teams?id_team=${formData.team_id}&status=registrado`)
                .then(({ data }) => setPlayers(data.data || data))
                .catch(() => setNotification('Error al cargar jugadores del equipo'));
        } else {
            setPlayers([]);
        }
    }, [formData.team_id]);

    const getSelectedCost = () => {
        const cost = penaltyCosts.find(p => p.id === parseInt(formData.penalty_cost_id));
        return cost ? cost.cost : 0;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (!formData.team_id || !formData.rival_team_id || !formData.player_id || !formData.penalty_cost_id) {
            setNotification('Por favor, completa todos los campos.');
            return;
        }

        if (!window.confirm(`Estás por descontar ${formatCurrency(getSelectedCost())} del presupuesto. ¿Confirmar?`)) return;

        setLoading(true);
        axiosClient.post('/penalty-cancellations', formData)
            .then(({ data }) => {
                setNotification('✅ ' + data.message);
                setFormData({ team_id: '', rival_team_id: '', player_id: '', penalty_cost_id: '' });
            })
            .catch((error) => {
                const errorMsg = error.response?.data?.message || 'Error al procesar el pago';
                setNotification(`❌ ${errorMsg}`);
            })
            .finally(() => setLoading(false));
    };

    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-8 animate-fade-in-down">

            <div className="flex flex-col items-center justify-center mb-8 bg-slate-900/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-slate-700 text-center">
                <span className="text-5xl mb-4 drop-shadow-lg">⚖️</span>
                <h1 className="font-black text-3xl text-white uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                    Levantar Sanción
                </h1>
                <p className="text-slate-400 mt-2 font-medium">Paga para habilitar a un jugador suspendido o lesionado.</p>
            </div>

            <form onSubmit={onSubmit} className="bg-slate-900/80 backdrop-blur-md shadow-2xl rounded-2xl p-6 sm:p-10 border border-slate-700">
                <div className="space-y-6">

                    {/* EQUIPO */}
                    <div>
                        <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Equipo</label>
                        <select
                            value={formData.team_id}
                            onChange={e => setFormData({ ...formData, team_id: e.target.value, player_id: '' })}
                            className="w-full p-3 border border-slate-600 rounded-lg bg-slate-800 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        >
                            <option value="">Selecciona un equipo...</option>
                            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>

                    {/* JUGADOR */}
                    <div>
                        <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Jugador Sancionado</label>
                        <select
                            value={formData.player_id}
                            onChange={e => setFormData({ ...formData, player_id: e.target.value })}
                            className="w-full p-3 border border-slate-600 rounded-lg bg-slate-800 text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                            disabled={!formData.team_id || players.length === 0}
                            required
                        >
                            <option value="">{formData.team_id ? 'Selecciona un jugador...' : 'Primero selecciona un equipo'}</option>
                            {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    {/* EQUIPO RIVAL (NUEVO) */}
                    <div>
                        <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Próximo Rival</label>
                        <select
                            value={formData.rival_team_id}
                            onChange={e => setFormData({ ...formData, rival_team_id: e.target.value })}
                            className="w-full p-3 border border-slate-600 rounded-lg bg-slate-800 text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                            disabled={!formData.team_id}
                            required
                        >
                            <option value="">{formData.team_id ? 'Selecciona contra quién juegas...' : 'Primero selecciona tu equipo'}</option>
                            {/* Mapeamos los equipos, excluyendo el equipo propio del manager */}
                            {teams.filter(t => t.id !== parseInt(formData.team_id)).map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* TIPO DE SANCIÓN */}
                    <div>
                        <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Sanción a Levantar</label>
                        <select
                            value={formData.penalty_cost_id}
                            onChange={e => setFormData({ ...formData, penalty_cost_id: e.target.value })}
                            className="w-full p-3 border border-slate-600 rounded-lg bg-slate-800 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        >
                            <option value="">Selecciona el tipo de sanción...</option>
                            {penaltyCosts.map(cost => (
                                <option key={cost.id} value={cost.id}>
                                    {cost.description} - {formatCurrency(cost.cost)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* TARJETA DE COSTO DINÁMICO */}
                    {formData.penalty_cost_id && (
                        <div className="mt-6 bg-red-950/40 border border-red-800/50 p-6 rounded-xl text-center shadow-inner">
                            <span className="text-slate-400 text-sm font-bold uppercase tracking-widest block mb-1">Total a descontar</span>
                            <span className="text-4xl font-black text-red-400">{formatCurrency(getSelectedCost())}</span>
                        </div>
                    )}
                </div>

                <div className="mt-8 border-t border-slate-700 pt-6">
                    <button
                        type="submit"
                        disabled={loading || !formData.penalty_cost_id}
                        className="w-full px-8 py-4 rounded-xl font-black text-white uppercase tracking-wider transition-all bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 hover:-translate-y-1 shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center gap-2"
                    >
                        {loading ? 'Procesando Pago...' : '💸 Confirmar Pago y Habilitar'}
                    </button>
                </div>
            </form>
        </div>
    );
}
