import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axiosClient from "../axios";

const Objectives = ({ teams }) => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [teamObjectives, setTeamObjectives] = useState({});

    // 1. Escuchamos cambios en 'teams'. Si tenemos equipos, pedimos sus jugadores.
    useEffect(() => {
        if (teams && teams.length > 0) {
            getPlayers();
        } else {
            setLoading(false); // Si no hay equipos por alguna razón, quitamos el loading
        }
    }, [teams]); // Dependemos de teams ahora

    // 2. Calculamos objetivos solo cuando ya tenemos los jugadores listos
    useEffect(() => {
        if (players.length > 0 && teams.length > 0) {
            calculateObjectives();
        }
    }, [players, teams]);

    const getPlayers = async () => {
        try {
            setLoading(true);

            // Extraemos todos los IDs de los equipos y los unimos con comas (ej: "1,4,7,9")
            const teamIds = teams.map(team => team.id).join(',');

            // Hacemos la llamada al endpoint optimizado
            const response = await axiosClient.get(`/players-teams?id_team=${teamIds}&status=registrado`);

            // Como el backend ya debería devolver data, la guardamos directamente
            // Si tu endpoint devuelve `response.data.data`, usa eso. Si devuelve `response.data`, ajustalo.
            const fetchedPlayers = response.data.data || response.data;

            // Ya no hace falta el .filter() pesado en React si usamos status=registrado en la URL,
            // pero lo dejamos por seguridad en caso de que el backend mande de más.
            const registeredPlayers = fetchedPlayers.filter(player =>
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
                player.id_team && (player.id_team.id === team.id || player.id_team === team.id)
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
                    bestPlayerCA: bestPlayerCA,
                    registeredPlayers: teamPlayers.length
                });
            } else {
                teamsWithCA.push({
                    ...team,
                    averageCA: 0,
                    bestPlayerCA: 0,
                    registeredPlayers: 0
                });
            }
        });

        const primera = teamsWithCA
            .filter(team => team.division === "Primera")
            .sort((a, b) => {
                if (b.averageCA !== a.averageCA) return b.averageCA - a.averageCA;
                return b.bestPlayerCA - a.bestPlayerCA;
            });

        const segunda = teamsWithCA
            .filter(team => team.division === "Segunda")
            .sort((a, b) => {
                if (b.averageCA !== a.averageCA) return b.averageCA - a.averageCA;
                return b.bestPlayerCA - a.bestPlayerCA;
            });

        primera.forEach((team, index) => {
            let objective = "";
            const position = index + 1;

            if (position <= 2) objective = "Salir campeón";
            else if (position <= 4) objective = "Clasificar a la final";
            else if (position <= 6) objective = `Finalizar ${position}° posición`;
            else if (position <= 8) objective = "Clasificar a playoff";
            else if (position <= 10) objective = "Clasificar a play-in";
            else if (position <= 12) objective = "Evitar final de playout";
            else objective = "Evitar el descenso";

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

            if (position <= 2) objective = "Salir campeón";
            else if (position <= 4) objective = "Clasificar a la final";
            else if (position <= 6) objective = `Finalizar ${position}° posición`;
            else if (position <= 8) objective = `Ubicarse entre las posiciones 7° y 8°`;
            else if (position <= 10) objective = "Clasificar a play-in";
            else if (position <= 12) objective = "Evitar final de playout";
            else objective = "Evitar el descenso";

            objectives[team.id] = {
                objective,
                averageCA: team.averageCA.toFixed(1),
                bestPlayerCA: team.bestPlayerCA,
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
            <div className="my-8 flex justify-center py-10">
                <p className="text-gray-400 font-bold animate-pulse">Calculando promedios de plantilla...</p>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* PRIMERA DIVISIÓN */}
                <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-blue-400 border-b border-slate-700 pb-2">
                        🏆 Primera División
                    </h3>
                    <div className="space-y-3">
                        {primeraOrdenada.map((team, index) => {
                            const teamData = teamObjectives[team.id] || {};
                            return (
                                <div key={team.id} className="bg-slate-800 border border-slate-700 p-3 rounded-lg hover:bg-slate-700 transition-colors">
                                    <div className="flex justify-between items-center border-b border-slate-600/50 pb-2 mb-2">
                                        <div className="text-white font-bold text-lg">
                                            <span className="text-gray-400 mr-2">{index + 1}°</span>
                                            {team.name}
                                        </div>
                                        <div className="bg-slate-900 px-3 py-1 rounded border border-slate-600 text-yellow-400 text-sm font-black tracking-widest">
                                            CA: {teamData.averageCA || '0.0'}
                                        </div>
                                    </div>
                                    <div className="text-blue-300 font-medium text-sm">
                                        🎯 Objetivo: <span className="text-white">{teamData.objective || "Calculando..."}</span>
                                    </div>
                                    <div className="text-gray-400 text-xs mt-2 flex justify-between">
                                        <span>Plantilla: <strong>{teamData.registeredPlayers || 0}</strong> reg.</span>
                                        <span>Mejor jugador: <strong>{teamData.bestPlayerCA || 0} CA</strong></span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* SEGUNDA DIVISIÓN */}
                <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-green-400 border-b border-slate-700 pb-2">
                        🥈 Segunda División
                    </h3>
                    <div className="space-y-3">
                        {segundaOrdenada.map((team, index) => {
                            const teamData = teamObjectives[team.id] || {};
                            return (
                                <div key={team.id} className="bg-slate-800 border border-slate-700 p-3 rounded-lg hover:bg-slate-700 transition-colors">
                                    <div className="flex justify-between items-center border-b border-slate-600/50 pb-2 mb-2">
                                        <div className="text-white font-bold text-lg">
                                            <span className="text-gray-400 mr-2">{index + 1}°</span>
                                            {team.name}
                                        </div>
                                        <div className="bg-slate-900 px-3 py-1 rounded border border-slate-600 text-yellow-400 text-sm font-black tracking-widest">
                                            CA: {teamData.averageCA || '0.0'}
                                        </div>
                                    </div>
                                    <div className="text-green-300 font-medium text-sm">
                                        🎯 Objetivo: <span className="text-white">{teamData.objective || "Calculando..."}</span>
                                    </div>
                                    <div className="text-gray-400 text-xs mt-2 flex justify-between">
                                        <span>Plantilla: <strong>{teamData.registeredPlayers || 0}</strong> reg.</span>
                                        <span>Mejor jugador: <strong>{teamData.bestPlayerCA || 0} CA</strong></span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* LEYENDA */}
            <div className="mt-8 bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-lg text-gray-300 text-sm">
                <h4 className="font-bold text-white text-lg border-b border-slate-700 pb-2 mb-4">📋 Explicación de objetivos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <strong className="text-blue-400 block mb-2 uppercase tracking-wide">Primera División:</strong>
                        <ul className="space-y-1 ml-4 border-l-2 border-slate-700 pl-4">
                            <li><span className="text-white font-bold">1-2:</span> Salir campeón</li>
                            <li><span className="text-white font-bold">3-4:</span> Clasificar a la final</li>
                            <li><span className="text-white font-bold">5-6:</span> Finalizar en su posición exacta</li>
                            <li><span className="text-white font-bold">7-8:</span> Clasificar a playoff</li>
                            <li><span className="text-white font-bold">9-10:</span> Clasificar a play-in</li>
                            <li><span className="text-white font-bold">11-12:</span> Evitar final de playout</li>
                            <li><span className="text-white font-bold">13-14:</span> Evitar el descenso</li>
                        </ul>
                    </div>
                    <div>
                        <strong className="text-green-400 block mb-2 uppercase tracking-wide">Segunda División:</strong>
                        <ul className="space-y-1 ml-4 border-l-2 border-slate-700 pl-4">
                            <li><span className="text-white font-bold">1-2:</span> Salir campeón</li>
                            <li><span className="text-white font-bold">3-4:</span> Clasificar a la final</li>
                            <li><span className="text-white font-bold">5-6:</span> Finalizar en su posición exacta</li>
                            <li><span className="text-white font-bold">7-8:</span> Ubicarse entre 7° y 8°</li>
                            <li><span className="text-white font-bold">9-14:</span> Objetivos de mantenimiento</li>
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
