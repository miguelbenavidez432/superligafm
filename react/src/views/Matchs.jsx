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
    const { setNotification, user } = useStateContext();
    const [tournaments, setTournaments] = useState([]);
    const [tournamentId, setTournamentId] = useState('');
    const [stage, setStage] = useState('');
    const [scoreHome, setScoreHome] = useState('');
    const [scoreAway, setScoreAway] = useState('');
    const [message, setMessage] = useState(null);

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
        setMessage(null);
        setCreating(true);
        if (!stage) {
            setNotification('Tienes que cargar Fecha o Ronda')
            setCreating(false);
            return;
        }
        if (!teamHomeId || !teamAwayId) {
            setNotification('Tienes que cargar los equipos')
            setCreating(false);
            return;
        }
        if (!scoreAway || !scoreHome) {
            setNotification('Tienes que cargar los goles')
            setCreating(false);
            return;
        }
        if (!tournamentId) {
            setNotification('Tienes que cargar el torneo')
            setCreating(false);
            return;
        }
        if (teamHomeId && teamAwayId && scoreAway && scoreHome && tournamentId && stage) {
            const homeTeamName = teams.find(team => team.id == parseInt(teamHomeId))?.name;
            const awayTeamName = teams.find(team => team.id == parseInt(teamAwayId))?.name;
            const userConfirmed = confirm(`¿Estás seguro de que quieres crear el partido entre ${homeTeamName} y ${awayTeamName} con resultado ${scoreHome} - ${scoreAway}?`);
            setMessage(null);
            if (!userConfirmed) {
                setTeamHomeId('');
                setTeamAwayId('');
                setStage('');
                setTournamentId('');
                setScoreAway('');
                setScoreHome('');
                setNotification('Carga de partido cancelada');
                setCreating(false);
                return;
            }
            setNotification('Creando partido...') &&
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
                    if (error && error.status === 422) {
                        setMessage(error.response.data.message)
                    }
                    setCreating(false);
                });
        }
    };

    const onUpdate = (match) => {
        if (!window.confirm('Estás seguro que quieres editar este partido??')) {
            return
        }

        axiosClient.put(`/games/${match}/enable-edit`)
            .then(() => {
                setNotification('Partido habilitado para editar');
                axiosClient.get('/matches?all=true')
                    .then(({ data }) => {
                        setMatches(data.data);
                    });
                setCreating(false);
            })
            .catch(err => {
                const response = err.response;
                if (response && response.status === 422) {
                    setMessage(response.data.errors);
                }
                setCreating(false);
            });
    }

    const formatStage = (currentStage, format) => {
        if (format === 'PD') {
            switch (currentStage) {
                case 14: return "Playin";
                case 15: return "Cuartos de Final";
                case 16: return "Semifinal";
                case 17: return "Final";
                default: return currentStage;
            }
        }

        if (format === 'SD') {
            switch (currentStage) {
                case 14: return "Cuartos de Final";
                case 15: return "Semifinal";
                case 18: return "Final";
                default: return currentStage;
            }
        }

        if (format === 'UCL') {
            switch (currentStage) {
                case 4: return "Cuartos de Final";
                case 5: return "Semifinal";
                case 6: return "Semifinal";
                case 7: return "Final";
                default: return currentStage;
            }
        }

        if (format === 'UEL') {
            switch (currentStage) {
                case 1: return "Octavos de Final";
                case 2: return "Cuartos de Final";
                case 3: return "Semifinal";
                case 4: return "Final";
                default: return currentStage;
            }
        }

        if (format === 'CFM') {
            switch (currentStage) {
                case 1: return "1° Ronda";
                case 2: return "Octavos de Final";
                case 3: return "Cuartos de Final";
                case 4: return "Semifinal";
                case 5: return "Final";
                default: return currentStage;
            }
        }
    };

    return (
        <div className="container mx-auto p-4">
            {loading && <p className="text-gray-500">Cargando...</p>}
            {!loading && (
                <>
                    {message &&
                        <div className="alert">
                            <p>{message}</p>
                        </div>
                    }
                    <div className="-mt-2 bg-black bg-opacity-70 p-5 rounded-lg">
                        <h2 className="text-xl font-semibold mb-2 text-white">Crear un nuevo partido</h2>
                        <div className="mb-4 flex flex-wrap -mx-2">
                            <div className="w-full md:w-1/2 px-2 mb-4 md:mb-0">
                                <select
                                    className="block w-full p-2 border border-blue-700 rounded text-white bg-slate-950"
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
                                    className="block w-full p-2 border border-blue-700 rounded text-white bg-slate-950"
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
                                    className="block w-full p-2 border border-blue-700 rounded text-white bg-slate-950"
                                    placeholder='Cantidad de goles del local'
                                    value={scoreHome}
                                    onChange={(e) => setScoreHome(e.target.value)}
                                />
                            </div>
                            <div className="w-full md:w-1/2 px-2">
                                <input
                                    type="number"
                                    className="block w-full p-2 border border-blue-700 rounded text-white bg-slate-950"
                                    placeholder='Cantidad de goles del visitante'
                                    value={scoreAway}
                                    onChange={(e) => setScoreAway(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <select
                                className="block w-full p-2 border border-blue-700 rounded text-white bg-slate-950"
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
                                className="block w-full p-2 border border-blue-700 rounded text-white bg-slate-950"
                                placeholder='Fecha o número de ronda (1,2,3, etc)'
                                value={stage}
                                onChange={(e) => setStage(e.target.value)}
                            />
                        </div>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleCreateMatch} disabled={creating}>
                            {creating ? 'Creando...' : 'Crear Partido'}
                        </button>
                    </div>
                    <br />
                    <h1 className="text-2xl font-bold mb-4 bg-black bg-opacity-70 p-5 rounded-lg text-white text-center">Partidos</h1>
                    {tournaments.map(tournament => {
                        const tournamentMatches = matches
                            .filter(match => match.tournament?.id == tournament.id)
                            .sort((a, b) => b.stage - a.stage);

                        return (
                            <details key={tournament.id} className="mb-4">
                                <summary className="cursor-pointer text-lg font-semibold bg-black bg-opacity-70 p-2 rounded-lg text-white">
                                    {tournament.name}
                                </summary>
                                <ul className="list-disc pl-5 mt-1 bg-black bg-opacity-70 p-5 rounded-lg text-white">
                                    {tournamentMatches.length > 0 ? (
                                        tournamentMatches.map(match => (
                                            <li key={match.id} className="mb-2">
                                                {match.team_home?.name} vs {match.team_away?.name} - Ronda {formatStage(Number(match.stage), tournament.format)} -{' '}
                                                {match.status === 'completed' ? (
                                                    <Link className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-800" to={`/partidos/${match.id}`}>
                                                        <span className='font-semibold'> Resultado: {' '}
                                                            {match.score_home} - {match.score_away}
                                                        </span>
                                                    </Link>
                                                ) : (
                                                    <Link className="bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-700" to={`/partidos/${match.id}`}>
                                                        Cargar datos
                                                    </Link>
                                                )}
                                                {user.rol === 'Admin' && (
                                                    <button className='bg-red-500 text-white px-1 py-1 rounded hover:bg-red-700 ml-4' onClick={() => onUpdate(match.id)}>
                                                        Habilitar edición
                                                    </button>
                                                )}
                                            </li>
                                        ))
                                    ) : (
                                        <p className="bg-black bg-opacity-70 p-5 rounded-lg text-white">No hay partidos disponibles para este torneo.</p>
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
