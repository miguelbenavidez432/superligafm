import { useState, useEffect } from 'react';
import axiosClient from '../axios';
import { Link } from 'react-router-dom';
import { useStateContext } from '../context/ContextProvider';

export default function ManagePrizes() {
    const { setNotification } = useStateContext();

    const [tournaments, setTournaments] = useState([]);
    const [teams, setTeams] = useState([]);
    const [allPrizes, setAllPrizes] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState('');

    const [assignments, setAssignments] = useState({});
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);

    useEffect(() => {
        Promise.all([
            axiosClient.get('/tournaments?status=active'),
            axiosClient.get('/teams'),
            axiosClient.get('/prizes')
        ]).then(([resTournaments, resTeams, resPrizes]) => {
            setTournaments(resTournaments.data.data || resTournaments.data);

            const filteredTeams = (resTeams.data.data || resTeams.data).filter(
                team => team.division === 'Primera' || team.division === 'Segunda'
            );
            setTeams(filteredTeams);

            setAllPrizes(resPrizes.data.data || resPrizes.data);
            console.log('Torneos:', resTournaments.data.data || resTournaments.data);
            setFetchingData(false);
        }).catch(error => {
            console.error('Error cargando datos:', error);
            setNotification('Error al cargar la información inicial.');
            setFetchingData(false);
        });
    }, []);

    // Filtramos los premios que pertenecen al torneo seleccionado
    // Ya no buscamos "status" porque eso ahora pertenece a la tabla pivot
    const currentPrizes = allPrizes.filter(
        prize => prize.tournament == parseInt(selectedTournament)
    );

    const handleTournamentChange = (e) => {
        setSelectedTournament(e.target.value);
        setAssignments({});
    };

    // Agregar un equipo a un premio específico
    const addTeamToPrize = (prizeId, teamId) => {
        if (!teamId) return;
        const currentTeams = assignments[prizeId] || [];

        // Evitamos duplicados
        if (!currentTeams.includes(parseInt(teamId))) {
            setAssignments({
                ...assignments,
                [prizeId]: [...currentTeams, parseInt(teamId)]
            });
        }
    };

    // Quitar un equipo de un premio específico
    const removeTeamFromPrize = (prizeId, teamId) => {
        const currentTeams = assignments[prizeId] || [];
        setAssignments({
            ...assignments,
            [prizeId]: currentTeams.filter(id => id !== teamId)
        });
    };

    const handleSubmit = async () => {
        if (Object.keys(assignments).length === 0) {
            setNotification('Debes asignar al menos un equipo a un premio.');
            return;
        }

        setLoading(true);

        // El payload envía un objeto estructurado: { tournament_id: 1, assignments: { "1": [14, 9], "2": [5] } }
        const payload = {
            tournament_id: selectedTournament,
            assignments: assignments
        };

        try {
            await axiosClient.post('/prizes/assign', payload);
            setNotification('Premios asignados y presupuestos actualizados 🏆💰');

            setAssignments({});
            setSelectedTournament('');

            // Recargar premios si tu backend devuelve el status pivot
            // const resPrizes = await axiosClient.get('/prizes');
            // setAllPrizes(resPrizes.data.data || resPrizes.data);

        } catch (error) {
            console.error('Error al asignar premios:', error);
            setNotification('Hubo un error al procesar los pagos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in-down pb-20">

            <div className="mb-6 flex gap-4">
                <Link to="/app/premios" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 font-bold tracking-wide transition-colors bg-slate-800/50 hover:bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Volver a Premios
                </Link>
            </div>

            {fetchingData ? (
                <div className="flex flex-col justify-center items-center py-32 bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-700 shadow-xl">
                    <div className="loader inline-block border-4 border-slate-600 border-t-blue-500 rounded-full w-12 h-12 animate-spin mb-4"></div>
                    <p className="text-slate-400 font-bold animate-pulse tracking-wide text-lg">Cargando información...</p>
                </div>
            ) : (
                <div className="relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-10">

                    {/* Glows de fondo */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="mb-10 text-center sm:text-left">
                        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider drop-shadow-lg flex items-center gap-3 justify-center sm:justify-start">
                            <span className="bg-blue-900/40 text-blue-400 p-2 rounded-xl border border-blue-700/50">🏅</span>
                            Asignación y Pago de Premios
                        </h2>
                        <p className="text-slate-400 mt-2">Selecciona un torneo y elige a qué equipos se les pagará cada premio del catálogo.</p>
                    </div>

                    <div className="space-y-8 relative z-10">

                        {/* SELECTOR DE TORNEO */}
                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Torneo a Finalizar</label>
                            <select
                                value={selectedTournament}
                                onChange={handleTournamentChange}
                                className="w-full bg-slate-950/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none"
                            >
                                <option value="">-- Selecciona el Torneo --</option>
                                {tournaments.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        {selectedTournament && currentPrizes.length === 0 && (
                            <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-2xl text-center">
                                <p className="text-red-400 font-bold flex items-center justify-center gap-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                    No hay un catálogo de premios creado para este torneo.
                                </p>
                                <Link to="/app/premios/crear-premios" className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300 underline underline-offset-4">Ir a Crear Catálogo de Premios</Link>
                            </div>
                        )}

                        {selectedTournament && currentPrizes.length > 0 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-300 uppercase tracking-widest border-b border-slate-700 pb-2">Catálogo Disponible</h3>

                                {currentPrizes.map((prize) => (
                                    <div key={prize.id} className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700 flex flex-col md:flex-row gap-6 hover:bg-slate-800/60 transition-colors">

                                        {/* Info del Premio */}
                                        <div className="flex-none md:w-1/3">
                                            <h4 className="font-black text-white text-lg">{prize.description}</h4>
                                            <p className="text-green-400 font-bold text-xl mt-1 flex items-center gap-1">
                                                <span className="text-sm text-slate-500">Monto:</span> ${Number(prize.amount).toLocaleString()}
                                            </p>
                                        </div>

                                        {/* Asignación (Multi-select visual) */}
                                        <div className="flex-1 w-full space-y-4 border-t md:border-t-0 md:border-l border-slate-700 pt-4 md:pt-0 md:pl-6">

                                            {/* Select (Funciona como un botón de "Agregar") */}
                                            <div>
                                                <select
                                                    className="w-full bg-slate-950/50 border border-slate-600 rounded-lg px-3 py-2.5 text-slate-300 focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
                                                    onChange={(e) => {
                                                        addTeamToPrize(prize.id, e.target.value);
                                                        e.target.value = ""; // Resetea el select
                                                    }}
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>+ Añadir equipo ganador a este premio</option>
                                                    {teams
                                                        // Filtramos los equipos que ya están seleccionados para este premio
                                                        .filter(t => !(assignments[prize.id] || []).includes(t.id))
                                                        .map(team => (
                                                            <option key={team.id} value={team.id}>{team.name}</option>
                                                        ))
                                                    }
                                                </select>
                                            </div>

                                            {/* Etiquetas (Chips) de equipos seleccionados */}
                                            {(assignments[prize.id] || []).length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {(assignments[prize.id] || []).map(teamId => {
                                                        const team = teams.find(t => t.id === teamId);
                                                        return (
                                                            <div key={teamId} className="flex items-center gap-2 bg-emerald-900/30 text-emerald-300 border border-emerald-700/50 px-3 py-1.5 rounded-full text-sm font-bold animate-fade-in">
                                                                <span>{team?.name || 'Equipo Desconocido'}</span>
                                                                <button
                                                                    onClick={() => removeTeamFromPrize(prize.id, teamId)}
                                                                    className="text-emerald-500 hover:text-emerald-300 bg-emerald-900/50 hover:bg-emerald-800 p-1 rounded-full transition-colors"
                                                                    title="Quitar equipo"
                                                                >
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* SUBMIT */}
                                <div className="flex justify-end pt-8 border-t border-slate-700/50">
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={loading || Object.keys(assignments).length === 0}
                                        className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl font-black text-white uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] ${
                                            loading || Object.keys(assignments).length === 0
                                            ? 'bg-slate-700 cursor-not-allowed opacity-50 shadow-none'
                                            : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 hover:scale-105'
                                        }`}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Procesando Pagos...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                Confirmar y Pagar
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
