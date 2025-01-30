/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axiosClient from '../axiosClient';

export default function TournamentForm() {
    const [tournament, setTournament] = useState({
        name: '',
        start_date: '',
        end_date: '',
        season_id: '',
    });
    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axiosClient.get('/seasons')
            .then(({ data }) => {
                setSeasons(data);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    const onSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        axiosClient.post('/tournaments', tournament)
            .then(() => {
                setLoading(false);
                // Redirigir o mostrar notificación
            })
            .catch(() => {
                setLoading(false);
            });
    };

    return (
        <form onSubmit={onSubmit}>
            <input value={tournament.name} onChange={e => setTournament({ ...tournament, name: e.target.value })} placeholder="Nombre" type="text" />
            <input value={tournament.start_date} onChange={e => setTournament({ ...tournament, start_date: e.target.value })} placeholder="Fecha de inicio" type="date" />
            <input value={tournament.end_date} onChange={e => setTournament({ ...tournament, end_date: e.target.value })} placeholder="Fecha de fin" type="date" />
            <select value={tournament.season_id} onChange={e => setTournament({ ...tournament, season_id: e.target.value })}>
                <option value=''>Seleccionar Temporada</option>
                {seasons.map(season => (
                    <option key={season.id} value={season.id}>{season.name}</option>
                ))}
            </select>
            <button className="btn" type="submit" disabled={loading}>Guardar Torneo</button>
        </form>
    );
}
