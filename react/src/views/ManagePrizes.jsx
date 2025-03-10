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

    useEffect(() => {
        fetchPrizes();
        fetchCompetitions();
        fetchTeams();
    }, []);

    const fetchPrizes = async () => {
        const response = await axiosClient.get('/prizes');
        setPrizes(response.data);
    };

    const fetchCompetitions = async () => {
        const response = await axiosClient.get('/tournaments');
        setTournaments(response.data);
    };

    const fetchTeams = async () => {
        const response = await axiosClient.get('/teams');
        setTeams(response.data);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axiosClient.post('/prizes', form);
        fetchPrizes();
    };

    return (
        <div>
            <h1>Manage Prizes</h1>
            <form onSubmit={handleSubmit}>
                <select name="tournament_id" value={form.tournament_id} onChange={handleChange}>
                    <option value="">Select Competition</option>
                    {tournaments.map(comp => (
                        <option key={comp.id} value={comp.id}>{comp.name}</option>
                    ))}
                </select>
                <select name="team_id" value={form.team_id} onChange={handleChange}>
                    <option value="">Select Team</option>
                    {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                </select>
                <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="Amount"
                />
                <button type="submit">Add Prize</button>
            </form>
            <ul>
                {prizes.map(prize => (
                    <li key={prize.id}>
                        {prize.tournament.name} - {prize.team.name} - {prize.amount}
                    </li>
                ))}
            </ul>
        </div>
    );
}
