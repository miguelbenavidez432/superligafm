import { useState, useEffect } from 'react';
import axiosClient from '../axios';
import { Link } from 'react-router-dom';
import { useStateContext } from '../context/ContextProvider';

export default function Matches() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [teamHomeId, setTeamHomeId] = useState('');
    const [teamAwayId, setTeamAwayId] = useState('');
    const [teams, setTeams] = useState([]);
    const [creating, setCreating] = useState(false);
    const { setNotification } = useStateContext();
    const [tournaments, setTournaments] = useState([]);
    const [tournamentId, setTournamentId] = useState('');

    useEffect(() => {
        axiosClient.get('/matches')
            .then(({ data }) => {
                const filteredMatches = data.data.filter(match => match.status !== 'completed');
                setMatches(filteredMatches);
                //setMatches(data.data);
                setLoading(false);
                getTeams();
                getTournaments();
            })
            .catch(() => {
                setLoading(false);
            });
    }, [creating]);

    const getTeams = () => {
        axiosClient.get('/teams')
            .then(({ data }) => {
            const filteredTeams = data.data.filter(team => team.division === 'Primera' || team.division === 'Segunda');
            setTeams(filteredTeams);
            })
            .catch(() => {
            setLoading(false);
            });
    };

    const getTournaments = () => {
        axiosClient.get('/tournaments')
            .then(({ data }) => {
                setTournaments(data.data);
            })
            .catch(() => {
                setLoading(false);
            });
    }

    const handleCreateMatch = () => {
        setCreating(true);
        axiosClient.post('/matches', {
            team_home_id: teamHomeId,
            team_away_id: teamAwayId,
            tournament_id: tournamentId
        })
        .then(({ data }) => {
            setMatches([...matches, data]);
            setTeamHomeId('');
            setTeamAwayId('');
            setNotification('Partido creado correctamente');
            setCreating(false);
        })
        .catch((error) => {
            setNotification('Error al crear el partido ' + error.response.data.message);
            setCreating(false);
        });
    };

    return (
        <div>
            <h1>Partidos</h1>
            {loading && <p>Cargando...</p>}
            {!loading && (
                <>
                    <ul>
                        {matches ? matches.map(match => (
                            <li key={match.id}>
                                {match.team_home.name} vs {match.team_away.name} - {<Link className="btn-edit" to={`/partidos/${match.id}`}>Cargar datos</Link>}
                            </li>
                        )) :
                            <p>No hay partidos disponibles.</p>
                        }
                    </ul>
                    <br />
                    <div>
                        <h2>Crear un nuevo partido</h2>
                        <select
                            value={teamHomeId}
                            onChange={(e) => setTeamHomeId(e.target.value)}
                        >
                            <option value="">Selecciona el equipo local</option>
                            {teams.map(team => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={teamAwayId}
                            onChange={(e) => setTeamAwayId(e.target.value)}
                        >
                            <option value="">Selecciona el equipo visitante</option>
                            {teams.map(team => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                        <br />
                        <select
                            value={tournaments.id}
                            onChange={(e) => setTournamentId(e.target.value)}
                        >
                            <option value="">Selecciona el torneo</option>
                            {tournaments.map(t => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                        <button className="btn-add" onClick={handleCreateMatch} disabled={creating}>
                            {creating ? 'Creando...' : 'Crear Partido'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
