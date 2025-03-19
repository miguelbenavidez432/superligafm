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
    const [stage, setStage] = useState('');
    const [scoreHome, setScoreHome] = useState('');
    const [scoreAway, setScoreAway] = useState('');

    useEffect(() => {
        axiosClient.get('/matches')
            .then(({ data }) => {
                setMatches(data.data);
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
            tournament_id: tournamentId,
            score_home: scoreHome,
            score_away: scoreAway,
            stage: stage
        })
            .then(({ data }) => {
                setMatches([...matches, data]);
                setTeamHomeId('');
                setTeamAwayId('');
                setStage('');
                setTournamentId('');
                setScoreAway('');
                setScoreHome('');
                setNotification('Partido creado correctamente');
                setCreating(false);
            })
            .catch((error) => {
                setNotification('Error al crear el partido ' + error.response.data.message);
                setCreating(false);
            });
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Partidos</h1>
            {loading && <p className="text-gray-500">Cargando...</p>}
            {!loading && (
                <>
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold mb-2">Crear un nuevo partido</h2>
                        <div className="mb-4 flex flex-wrap -mx-2">
                            <div className="w-full md:w-1/2 px-2 mb-4 md:mb-0">
                                <select
                                    className="block w-full p-2 border border-gray-300 rounded"
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
                            </div>
                            <div className="w-full md:w-1/2 px-2">
                                <select
                                    className="block w-full p-2 border border-gray-300 rounded"
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
                            </div>
                        </div>
                        <div className="mb-4 flex flex-wrap -mx-2">
                            <div className="w-full md:w-1/2 px-2 mb-4 md:mb-0">
                                <input
                                    type="number"
                                    className="block w-full p-2 border border-gray-300 rounded"
                                    placeholder='Cantidad de goles del local'
                                    value={scoreHome}
                                    onChange={(e) => setScoreHome(e.target.value)}
                                />
                            </div>
                            <div className="w-full md:w-1/2 px-2">
                                <input
                                    type="number"
                                    className="block w-full p-2 border border-gray-300 rounded"
                                    placeholder='Cantidad de goles del visitante'
                                    value={scoreAway}
                                    onChange={(e) => setScoreAway(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <select
                                className="block w-full p-2 border border-gray-300 rounded"
                                value={tournamentId}
                                onChange={(e) => setTournamentId(e.target.value)}
                            >
                                <option value="">Selecciona el torneo</option>
                                {tournaments.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <input
                                type="number"
                                className="block w-full p-2 border border-gray-300 rounded"
                                placeholder='Fecha o número de ronda (1,2,3, etc)'
                                value={stage}
                                onChange={(e) => setStage(e.target.value)}
                            />
                        </div>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" onClick={handleCreateMatch} disabled={creating}>
                            {creating ? 'Creando...' : 'Crear Partido'}
                        </button>
                    </div>
                    <br />
                    {tournaments.map(tournament => {
                        const tournamentMatches = matches
                            .filter(match => match.tournament?.id == tournament.id)
                            .sort((a, b) => b.stage - a.stage);

                        return (
                            <details key={tournament.id} className="mb-4">
                                <summary className="cursor-pointer text-lg font-semibold">
                                    {tournament.name}
                                </summary>
                                <ul className="list-disc pl-5 mt-2">
                                    {tournamentMatches.length > 0 ? (
                                        tournamentMatches.map(match => (
                                            <li key={match.id} className="mb-2">
                                                {match.team_home?.name} vs {match.team_away?.name} - Ronda {match.stage} -{' '}
                                                {match.status === 'completed' ? (
                                                    <Link className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600" to={`/partidos/${match.id}`}>
                                                        <span className='font-semibold'> Resultado: {' '}
                                                            {match.score_home} - {match.score_away}
                                                        </span>
                                                    </Link>
                                                ) : (
                                                    <Link className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600" to={`/partidos/${match.id}`}>
                                                        Cargar datos
                                                    </Link>
                                                )}
                                            </li>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">No hay partidos disponibles para este torneo.</p>
                                    )}
                                </ul>
                            </details>
                        );
                    })}
                </>
            )}
        </div>
    );
}
