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
        position: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCompetitions();
        fetchTeams();
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

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAddPrize = () => {
        if (prizes.length >= 14) {
            alert('No puedes agregar más de 14 premios.');
            return;
        }

        if (!form.tournament_id || !form.team_id || !form.amount || !form.position) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }

        setPrizes([...prizes, { ...form }]);
        setForm({ tournament_id: '', team_id: '', amount: '', position: '', description: '' });
    };

    const handleSubmit = async () => {
        if (prizes.length === 0) {
            alert('No hay premios para enviar.');
            return;
        }

        try {
            setLoading(true);
            await axiosClient.post('/prizes/', { prizes });
            alert('Premios enviados correctamente.');
            setPrizes([]);
        } catch (error) {
            console.error('Error al enviar premios:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className='font-black text-2xl text-center mb-2'>Carga de Premios</h1>
            <form className="mx-2 bg-slate-300 rounded-md p-4" onSubmit={(e) => e.preventDefault()}>
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
                <input
                    type="text"
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    placeholder="Posición"
                />
                <input
                    type="text"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Descripción (opcional)"
                />
                <button className='bg-green-700 text-white rounded px-4 py-2' type="button" onClick={handleAddPrize}>Agregar Premio</button>
            </form>

            <h2 className='mt-4 font-semibold'>Lista de Premios</h2>
            <ul className='mx-2'>
                {prizes.map((prize, index) => (
                    <li key={index}>
                        Torneo: {tournaments.find(t => t.id === parseInt(prize.tournament_id))?.name || 'N/A'} -
                        Equipo: {teams.find(t => t.id === parseInt(prize.team_id))?.name || 'N/A'} -
                        Monto: {prize.amount} -
                        Posición: {prize.position} -
                        Descripción: {prize.description || 'N/A'}
                    </li>
                ))}
            </ul>

            <button className='bg-blue-600 text-white px-4 py-2 rounded' onClick={handleSubmit} disabled={loading || prizes.length === 0}>
                {loading ? 'Enviando...' : 'Enviar Premios'}
            </button>
        </div>
    );
}
