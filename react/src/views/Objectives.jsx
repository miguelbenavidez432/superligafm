import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axiosClient from "../axios";

const Objectives = ({ teams }) => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [teamObjectives, setTeamObjectives] = useState({});

    useEffect(() => {
        getPlayers();
    }, []);

    useEffect(() => {
        if (players.length > 0 && teams.length > 0) {
            calculateObjectives();
        }
    }, [players, teams]);

    const getPlayers = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/players/public?all=true');
            // Filtrar solo jugadores registrados
            const registeredPlayers = response.data.data.filter(player =>
                player.status === 'registrado' && player.id_team
            );
            setPlayers(registeredPlayers);
        } catch (error) {
            console.error('Error al obtener jugadores:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateObjectives = () => {
    const objectives = {};
    const teamsWithCA = [];

    teams.forEach(team => {
        const teamPlayers = players.filter(player =>
            player.id_team && player.id_team.id === team.id
        );

        if (teamPlayers.length > 0) {
            const sortedPlayers = teamPlayers
                .slice()
                .sort((a, b) => b.ca - a.ca)
                .slice(0, 16);

            const averageCA = sortedPlayers.reduce((sum, player) => sum + player.ca, 0) / sortedPlayers.length;

            const bestPlayerCA = sortedPlayers.length > 0 ? sortedPlayers[0].ca : 0;

            teamsWithCA.push({
                ...team,
                averageCA: averageCA,
                bestPlayerCA: bestPlayerCA, // Agregar el CA del mejor jugador
                registeredPlayers: teamPlayers.length
            });
        } else {
            teamsWithCA.push({
                ...team,
                averageCA: 0,
                bestPlayerCA: 0, // Sin jugadores, CA más alto es 0
                registeredPlayers: 0
            });
        }
    });

    const primera = teamsWithCA
        .filter(team => team.division === "Primera")
        .sort((a, b) => {
            if (b.averageCA !== a.averageCA) {
                return b.averageCA - a.averageCA;
            }
            return b.bestPlayerCA - a.bestPlayerCA;
        });

    const segunda = teamsWithCA
        .filter(team => team.division === "Segunda")
        .sort((a, b) => {
            if (b.averageCA !== a.averageCA) {
                return b.averageCA - a.averageCA;
            }
            return b.bestPlayerCA - a.bestPlayerCA;
        });

    primera.forEach((team, index) => {
        let objective = "";
        const position = index + 1;

        if (position <= 2) {
            objective = "Salir campeón";
        } else if (position <= 4) {
            objective = "Clasificar a la final";
        } else if (position <= 6) {
            objective = `Finalizar ${position}° posición`;
        } else if (position <= 8) {
            objective = "Clasificar a playoff";
        } else if (position <= 10) {
            objective = "Clasificar a play-in";
        } else if (position <= 12) {
            objective = "Evitar final de playout";
        } else {
            objective = "Evitar el descenso";
        }

        objectives[team.id] = {
            objective,
            averageCA: team.averageCA.toFixed(1),
            bestPlayerCA: team.bestPlayerCA,
            registeredPlayers: team.registeredPlayers,
            position: position
        };
    });

    segunda.forEach((team, index) => {
        let objective = "";
        const position = index + 1;

        if (position <= 2) {
            objective = "Salir campeón";
        } else if (position <= 4) {
            objective = "Clasificar a la final";
        } else if (position <= 6) {
            objective = `Finalizar ${position}° posición`;
        } else if (position <= 8) {
            objective = `Ubicarse entre las posiciones 7° y 8°`;
        } else if (position <= 10) {
            objective = "Clasificar a play-in";
        } else if (position <= 12) {
            objective = "Evitar final de playout";
        } else {
            objective = "Evitar el descenso";
        }

        objectives[team.id] = {
            objective,
            averageCA: team.averageCA.toFixed(1),
            bestPlayerCA: team.bestPlayerCA, // Incluir el CA del mejor jugador
            registeredPlayers: team.registeredPlayers,
            position: position
        };
    });

    setTeamObjectives(objectives);
};

    const primera = teams.filter(team => team.division === "Primera");
    const segunda = teams.filter(team => team.division === "Segunda");

    if (loading) {
        return (
            <div className="my-8 text-center">
                <p className="text-white">Cargando objetivos...</p>
            </div>
        );
    }

    const primeraOrdenada = primera
        .map(team => ({ ...team, ...teamObjectives[team.id] }))
        .sort((a, b) => (b.averageCA || 0) - (a.averageCA || 0));

    const segundaOrdenada = segunda
        .map(team => ({ ...team, ...teamObjectives[team.id] }))
        .sort((a, b) => (b.averageCA || 0) - (a.averageCA || 0));

    return (
        <div className="my-8">
            <div className="text-xl mt-2 font-semibold mb-4 text-center lg:text-left bg-black bg-opacity-70 rounded-lg text-white p-3">
                Objetivos de la Temporada (Basados en Promedio CA)
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-black bg-opacity-70 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-white border-b border-gray-600 pb-2">
                        Primera División
                    </h3>
                    <div className="space-y-3">
    {primeraOrdenada.map((team, index) => {
        const teamData = teamObjectives[team.id] || {};
        return (
            <div key={team.id} className="bg-gray-800 p-3 rounded">
                <div className="flex justify-between items-center">
                    <div className="text-white font-medium">
                        {index + 1}° - {team.name}
                    </div>
                    <div className="text-yellow-400 text-sm font-bold">
                        CA: {teamData.averageCA || '0.0'}
                    </div>
                </div>
                <div className="text-gray-300 text-sm mt-1">
                    Objetivo: {teamData.objective || "Calculando..."}
                </div>
                <div className="text-gray-400 text-xs mt-1">
                    Jugadores registrados: {teamData.registeredPlayers || 0} |
                    Mejor jugador: {teamData.bestPlayerCA || 0} CA
                </div>
            </div>
        );
    })}
</div>
                </div>

                <div className="bg-black bg-opacity-70 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-white border-b border-gray-600 pb-2">
                        Segunda División
                    </h3>
                    <div className="space-y-3">
    {segundaOrdenada.map((team, index) => {
        const teamData = teamObjectives[team.id] || {};
        return (
            <div key={team.id} className="bg-gray-800 p-3 rounded">
                <div className="flex justify-between items-center">
                    <div className="text-white font-medium">
                        {index + 1}° - {team.name}
                    </div>
                    <div className="text-yellow-400 text-sm font-bold">
                        CA: {teamData.averageCA || '0.0'}
                    </div>
                </div>
                <div className="text-gray-300 text-sm mt-1">
                    Objetivo: {teamData.objective || "Calculando..."}
                </div>
                <div className="text-gray-400 text-xs mt-1">
                    Jugadores registrados: {teamData.registeredPlayers || 0} |
                    Mejor jugador: {teamData.bestPlayerCA || 0} CA
                </div>
            </div>
        );
    })}
</div>
                </div>
            </div>

            <div className="mt-6 bg-black bg-opacity-70 p-4 rounded-lg text-white text-sm">
                <h4 className="font-semibold mb-2">📋 Explicación de objetivos:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <strong>Primera División:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Posiciones 1-2: Salir campeón</li>
                            <li>Posiciones 3-4: Clasificar a la final</li>
                            <li>Posiciones 5-6: Finalizar en su posición exacta</li>
                            <li>Posiciones 7-8: Clasificar a playoff</li>
                            <li>Posiciones 9-10: Clasificar a play-in</li>
                            <li>Posiciones 11-12: Evitar final de playout</li>
                            <li>Posiciones 13-14: Evitar el descenso</li>
                        </ul>
                    </div>
                    <div>
                        <strong>Segunda División:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Posiciones 1-2: Salir campeón</li>
                            <li>Posiciones 3-4: Clasificar a la final</li>
                            <li>Posiciones 5-6: Finalizar en su posición exacta</li>
                            <li>Posiciones 7-8: Ubicarse entre 7° y 8° posición</li>
                            <li>Posiciones 9-14: Objetivos de mantenimiento</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

Objectives.propTypes = {
    teams: PropTypes.array.isRequired
};

export default Objectives;
