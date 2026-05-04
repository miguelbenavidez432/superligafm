import { useState, useEffect } from 'react';
import axiosClient from '../axios';

export default function ManagePrizes() {
    const [tournaments, setTournaments] = useState([]);
    const [teams, setTeams] = useState([]);
    const [allPrizes, setAllPrizes] = useState([]); // Todos los premios de la BD
    const [selectedTournament, setSelectedTournament] = useState('');
    const [assignments, setAssignments] = useState({}); // Guardará { "1": team_id, "2": team_id... }
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCompetitions();
        fetchTeams();
        fetchPrizes();
    }, []);

    const fetchCompetitions = async () => {
        try {
            const response = await axiosClient.get('/tournaments');
            setTournaments(response.data.data);
        } catch (error) {
            console.error('Error al obtener torneos:', error);
        }
    };

    const fetchTeams = async () => {
        try {
            const response = await axiosClient.get('/teams');
            const filteredTeams = response.data.data.filter(team => team.division === 'Primera' || team.division === 'Segunda');
            setTeams(filteredTeams);
        } catch (error) {
            console.error('Error al obtener equipos:', error);
        }
    };

    const fetchPrizes = async () => {
        try {
            const response = await axiosClient.get('/prizes');
            setAllPrizes(response.data.data);
        } catch (error) {
            console.error('Error al obtener los premios:', error);
        }
    };

    // Filtramos solo los premios pendientes del torneo seleccionado
    const pendingPrizes = allPrizes.filter(
        prize => prize.tournament_id === parseInt(selectedTournament) && prize.status === 'pendiente'
    );

    const handleTournamentChange = (e) => {
        setSelectedTournament(e.target.value);
        setAssignments({}); // Limpiamos las selecciones si cambia de torneo
    };

    const handleAssignmentChange = (position, teamId) => {
        setAssignments({
            ...assignments,
            [position]: teamId
        });
    };

    const handleSubmit = async () => {
        // Validamos que se haya asignado al menos un equipo
        if (Object.keys(assignments).length === 0) {
            alert('Debes asignar al menos un equipo a una posición.');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                tournament_id: selectedTournament,
                assignments: assignments
            };

            await axiosClient.post('/prizes/assign', payload);
            alert('Premios asignados y presupuestos actualizados correctamente.');

            // Limpiamos y recargamos para actualizar el estado a "pagado"
            setAssignments({});
            setSelectedTournament('');
            fetchPrizes();
        } catch (error) {
            console.error('Error al asignar premios:', error);
            alert('Hubo un error al procesar los premios.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className='font-black text-2xl text-center mb-2'>Asignación de Premios</h1>

            <div className="mx-2 bg-slate-300 rounded-md p-4 mb-4 flex flex-col gap-4">
                <select
                    className="p-2 rounded"
                    name="tournament_id"
                    value={selectedTournament}
                    onChange={handleTournamentChange}
                >
                    <option value="">Seleccionar Torneo a Finalizar</option>
                    {tournaments.map(comp => (
                        <option key={comp.id} value={comp.id}>{comp.name}</option>
                    ))}
                </select>
            </div>

            {selectedTournament && pendingPrizes.length === 0 && (
                <p className="mx-2 text-red-600 font-semibold">
                    No hay premios configurados o pendientes para este torneo. Ve a Crear Premios primero.
                </p>
            )}

            {selectedTournament && pendingPrizes.length > 0 && (
                <>
                    <h2 className='mt-4 font-semibold mx-2'>Asignar Posiciones</h2>
                    <div className="mx-2 bg-slate-200 rounded-md p-4 flex flex-col gap-3">
                        {/* Ordenamos las posiciones de menor a mayor */}
                        {pendingPrizes.sort((a, b) => a.position - b.position).map((prize) => (
                            <div key={prize.id} className="flex items-center gap-4 bg-white p-2 rounded shadow-sm">
                                <div className="w-1/3 font-bold text-gray-700">
                                    Posición {prize.position} <br/>
                                    <span className="text-sm font-normal text-green-700">${prize.amount}</span>
                                </div>
                                <div className="w-2/3">
                                    <select
                                        className="w-full p-2 border rounded"
                                        value={assignments[prize.position] || ''}
                                        onChange={(e) => handleAssignmentChange(prize.position, e.target.value)}
                                    >
                                        <option value="">-- Seleccionar Equipo --</option>
                                        {teams.map(team => (
                                            <option key={team.id} value={team.id}>{team.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mx-2 mt-4">
                        <button
                            className='bg-blue-600 text-white px-4 py-2 rounded w-full font-bold disabled:bg-blue-300'
                            onClick={handleSubmit}
                            disabled={loading || Object.keys(assignments).length === 0}
                        >
                            {loading ? 'Procesando Pagos...' : 'Confirmar Asignaciones y Pagar'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
