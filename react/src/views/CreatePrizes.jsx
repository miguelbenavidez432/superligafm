/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import axiosClient from '../axios';
import { Link, useNavigate } from 'react-router-dom';
import { useStateContext } from '../context/ContextProvider';

export default function CreatePrize() {
    const navigate = useNavigate();
    const { setNotification } = useStateContext();

    const [tournaments, setTournaments] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Arrancamos con 3 premios por defecto, pero sin posición ni status ni equipo
    const [prizes, setPrizes] = useState([
        { description: 'Campeón', amount: '' },
        { description: 'Subcampeón', amount: '' },
        { description: 'Premio por Participación', amount: '' }
    ]);

    useEffect(() => {
        axiosClient.get('/tournaments?active=1')
            .then(({ data }) => {
                setTournaments(data.data || data);
                setLoading(false);
            })
            .catch(() => {
                setNotification('Error al cargar los torneos');
                setLoading(false);
            });
    }, []);

    // Actualiza los valores de la fila
    const handlePrizeChange = (index, field, value) => {
        const newPrizes = [...prizes];
        newPrizes[index][field] = value;
        setPrizes(newPrizes);
    };

    // Agrega una nueva fila vacía
    const addPrizeRow = () => {
        setPrizes([...prizes, { description: '', amount: '' }]);
    };

    // Elimina una fila específica
    const removePrizeRow = (index) => {
        const newPrizes = prizes.filter((_, i) => i !== index);
        setPrizes(newPrizes);
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!selectedTournament) {
            setNotification('Debes seleccionar un torneo.');
            return;
        }

        // Filtramos premios vacíos (que no tengan monto ni descripción)
        const validPrizes = prizes.filter(p => p.amount !== '' && p.description.trim() !== '');

        if (validPrizes.length === 0) {
            setNotification('Debes completar al menos un premio válido (Monto y Descripción).');
            return;
        }

        setSaving(true);

        // Inyectamos el ID del torneo a cada premio válido
        const prizesWithTournament = validPrizes.map(prize => ({
            tournament_id: selectedTournament,
            description: prize.description,
            amount: prize.amount
        }));

        const payload = {
            prizes: prizesWithTournament
        };

        try {
            await axiosClient.post('/prizes', payload);
            setNotification('Bolsa de premios creada correctamente 💰');
            navigate('/app/premios');
        } catch (error) {
            console.error(error.response?.data?.errors);
            setNotification('Error al crear los premios.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in-down pb-20">

            <div className="mb-6">
                <Link to="/app/premios" className="inline-flex items-center gap-2 text-slate-400 hover:text-yellow-400 font-bold tracking-wide transition-colors bg-slate-800/50 hover:bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Volver a Premios
                </Link>
            </div>

            {loading ? (
                <div className="flex flex-col justify-center items-center py-32 bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-700 shadow-xl">
                    <div className="loader inline-block border-4 border-slate-600 border-t-yellow-500 rounded-full w-12 h-12 animate-spin mb-4"></div>
                    <p className="text-slate-400 font-bold animate-pulse tracking-wide text-lg">Cargando torneos...</p>
                </div>
            ) : (
                <div className="relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-10">

                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-600 via-amber-400 to-yellow-600"></div>
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-600/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="mb-10 text-center sm:text-left">
                        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider drop-shadow-lg flex items-center gap-3 justify-center sm:justify-start">
                            <span className="bg-yellow-900/40 text-yellow-400 p-2 rounded-xl border border-yellow-700/50">🏆</span>
                            Definir Catálogo de Premios
                        </h2>
                        <p className="text-slate-400 mt-2">Crea los premios disponibles para este torneo. Más adelante podrás asignárselos a múltiples equipos.</p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-6 relative z-10">

                        {/* SELECTOR DE TORNEO */}
                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Torneo Activo</label>
                            <select
                                value={selectedTournament}
                                onChange={(e) => setSelectedTournament(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors appearance-none"
                            >
                                <option value="">-- Selecciona un Torneo --</option>
                                {tournaments.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* LISTA DINÁMICA DE PREMIOS */}
                        <div className="space-y-4">
                            {prizes.map((prize, index) => (
                                <div key={index} className="flex flex-col sm:flex-row items-center gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700 hover:bg-slate-800/60 transition-colors group">

                                    <div className="flex-none w-12 h-12 flex items-center justify-center bg-slate-900 rounded-xl border border-slate-700 shadow-inner">
                                        <span className="text-slate-400 font-black">#{index + 1}</span>
                                    </div>

                                    <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Descripción */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Descripción del Premio</label>
                                            <input
                                                type="text"
                                                placeholder="Ej: Subcampeón, Premio Fair Play..."
                                                value={prize.description}
                                                onChange={(e) => handlePrizeChange(index, 'description', e.target.value)}
                                                className="w-full bg-slate-950/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                                            />
                                        </div>

                                        {/* Monto */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Monto ($)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 font-bold">$</span>
                                                <input
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={prize.amount}
                                                    onChange={(e) => handlePrizeChange(index, 'amount', e.target.value)}
                                                    className="w-full bg-slate-950/50 border border-slate-600 rounded-lg pl-8 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-green-500 transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botón Eliminar Fila */}
                                    {prizes.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removePrizeRow(index)}
                                            className="flex-none p-3 text-slate-500 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-colors border border-transparent hover:border-red-500/30 sm:mt-5"
                                            title="Eliminar premio"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* BOTÓN AÑADIR NUEVA FILA */}
                        <div className="flex justify-center sm:justify-start">
                            <button
                                type="button"
                                onClick={addPrizeRow}
                                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2.5 rounded-xl border border-blue-500/30 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                Agregar otro premio
                            </button>
                        </div>

                        {/* SUBMIT */}
                        <div className="flex justify-end pt-8 border-t border-slate-700/50">
                            <button
                                type="submit"
                                disabled={saving}
                                className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl font-black text-white uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(202,138,4,0.3)] ${
                                    saving ? 'bg-yellow-700 cursor-not-allowed opacity-70' : 'bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 hover:scale-105'
                                }`}
                            >
                                {saving ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        Crear Catálogo
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
