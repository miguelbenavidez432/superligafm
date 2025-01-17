// react/src/views/Matches.jsx
import { useState, useEffect } from 'react';
import axiosClient from '../axiosClient';

export default function Matches() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosClient.get('/matches')
            .then(({ data }) => {
                setMatches(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    return (
        <div>
            <h1>Partidos</h1>
            {loading && <p>Cargando...</p>}
            {!loading && (
                <ul>
                    {matches.map(match => (
                        <li key={match.id}>
                            {match.team_home_id} vs {match.team_away_id} - {match.match_date}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
