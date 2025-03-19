import { useState, useEffect } from 'react';
import axiosClient from '../axios';

export default function ManagePrizes() {
    const [prizes, setPrizes] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [teams, setTeams] = useState([]);
    const [form, setForm] = useState({
        tournament_id: '',
        team_id: '',
        amount: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPrizes();
        fetchCompetitions();
        fetchTeams();
    }, []);

    const fetchPrizes = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/prizes');
            setPrizes(response.data || []); // Asegúrate de que sea un array
        } catch (error) {
            console.error('Error al obtener premios:', error);
            setPrizes([]); // Manejo de errores
        } finally {
            setLoading(false);
        }
    };

    const fetchCompetitions = async () => {
        try {
            const response = await axiosClient.get('/tournaments');
            setTournaments(response.data || []);
        } catch (error) {
            console.error('Error al obtener torneos:', error);
        }
    };

    const fetchTeams = async () => {
        try {
            const response = await axiosClient.get('/teams');
            setTeams(response.data || []);
        } catch (error) {
            console.error('Error al obtener equipos:', error);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.tournament_id || !form.team_id || !form.amount) {
            alert('Por favor, completa todos los campos antes de enviar.');
            return;
        }

        try {
            await axiosClient.post('/prizes', form);
            fetchPrizes();
            setForm({ tournament_id: '', team_id: '', amount: '' });
        } catch (error) {
            console.error('Error al guardar el premio:', error);
        }
    };

    return (
        <div>
            <h1>Gestión de Premios</h1>
            <form onSubmit={handleSubmit}>
                <select name="tournament_id" value={form.tournament_id} onChange={handleChange}>
                    <option value="">Seleccionar Torneo</option>
                    {tournaments.map(comp => (
                        <option key={comp.id} value={comp.id}>{comp.name}</option>
                    ))}
                </select>
                <select name="team_id" value={form.team_id} onChange={handleChange}>
                    <option value="">Seleccionar Equipo</option>
                    {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                </select>
                <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="Monto"
                />
                <button type="submit">Agregar Premio</button>
            </form>

            {loading ? (
                <p>Cargando premios...</p>
            ) : (
                <ul>
                    {Array.isArray(prizes) && prizes.map(prize => (
                        <li key={prize.id}>
                            Torneo: {prize.tournament?.name || 'N/A'} - Equipo: {prize.team?.name || 'N/A'} - Monto: {prize.amount || 0}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
