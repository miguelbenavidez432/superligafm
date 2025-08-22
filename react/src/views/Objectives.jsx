/* eslint-disable no-unused-vars */
import PropTypes from "prop-types";

const Objectives = ({ teams }) => {

    const primera = teams.filter(team => team.division === "Primera");
    const segunda = teams.filter(team => team.division === "Segunda");

    console.log("Primera División Teams:", primera);
    console.log("Segunda División Teams:", segunda);

    const getBestPlayersCA = () => {
        if (players.length > 0) {
            const sortedPlayers = players.slice().sort((a, b) => b.ca - a.ca);
            const bestPlayers = sortedPlayers.slice(0, 16);
            const averageCA = bestPlayers.reduce((sum, player) => sum + player.ca, 0) / bestPlayers.length;
            setBestPlayersCA(averageCA);
        }
    };

    return (
        <div className="my-8">
            <h2 className="text-xl font-bold mb-2">Objetivos de la Temporada</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Primera División</h3>
                    <ul className="list-disc pl-5">
                        {primera.map(team => (
                            <li key={team.id}>
                                <strong>{team.name}</strong>: {team.objective || "Sin objetivo asignado"}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2">Segunda División</h3>
                    <ul className="list-disc pl-5">
                        {segunda.map(team => (
                            <li key={team.id}>
                                <strong>{team.name}</strong>: {team.objective || "Sin objetivo asignado"}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
Objectives.propTypes = {
    teams: PropTypes.array.isRequired
};

export default Objectives;
