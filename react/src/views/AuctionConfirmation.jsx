/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import axiosClient from "../axios";

const AuctionConfirmation = () => {
    const [players, setPlayers] = useState([]);
    const [leagueTeams, setLeagueTeams] = useState([]);
    const [otherTeams, setOtherTeams] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState({
        name: '',
        id_team: '',
        status: '',
        value: '',
        ca: '',
        pa: '',
        age: '',
    });
    const [selectedTeam, setSelectedTeam] = useState({});

    useEffect(() => {
        getTeam()
        getPlayers()
    }, [])

    useEffect(() => {
        if (otherTeams) {
            getPlayers();
        }
    }, [otherTeams]);

    const getTeam = () => {
        axiosClient.get('/teams')
            .then(({ data }) => {
                const leagueTeamsFilter = data.data.filter((t) => t.division === 'Primera' || t.division === 'Segunda')
                const otherTeamsFilter = data.data.filter((t) => t.division === '')
                setLeagueTeams(leagueTeamsFilter)
                setOtherTeams(otherTeamsFilter)
            })
            .catch(() => {
            })
    }

    const getPlayers = () => {
        axiosClient.get('/players')
            .then(({ data }) => {
                setPlayers(data.data)
            })
            .catch(() => {
            })
    }


    const handlePlayerSelection = (player) => {
        setSelectedPlayer(player);
    };

    const handleTeamSelection = (team) => {
        setSelectedPlayer({
            ...selectedPlayer,
            id_team: team
        });
        const otherTeamsFilter = otherTeams.find((t) => t.id === parseFloat(team))
        setSelectedTeam(parseInt(team));
    };

    const handleAuctionConfirmation = () => {
        if (selectedPlayer && selectedTeam) {
            const auctionData = {
                playerId: selectedPlayer.id,
                teamId: selectedTeam.id
            };

            axiosClient.post("/confirm-auction", auctionData)
                .then((response) => {
                    console.log("Subasta confirmada:", response.data);
                })
                .catch((error) => {
                    console.error("Error al confirmar la subasta:", error);
                });
        }
    };

    return (
        <div>
            <h1>Confirmar Subasta</h1>
            <div>
                <h2>Equipo disponibles:</h2>
                <select name="" id="" onChange={handleTeamSelection}>
                    {otherTeams.map((team) => (
                        <option key={team.id} value={team.id}>
                            {team.name} - Equipo: {team.id_team}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                {selectedTeam  && <select>
                    <option value="">Seleccione un jugador</option>
                                {players
                                    .filter(p =>
                                        p.id_team == selectedTeam)
                                    .map(jugador => (
                                        <option key={jugador.id}
                                            value={jugador.id}
                                        >{jugador.name}</option>
                                    ))}
                    </select>}
            </div>
            <div>
                <h2>Equipos de destino:</h2>
                <ul>
                    {leagueTeams.map((team) => (
                        <li key={team.id} onClick={() => handleTeamSelection(team)}>
                            {team.name} - División: {team.division}
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                {selectedTeam && (
                    <div>
                        <h2>Equipo de destino seleccionado:</h2>
                        <p>{selectedTeam.name} - División: {selectedTeam.division}</p>
                    </div>
                )}
            </div>
            <div>
                {selectedPlayer && selectedTeam && (
                    <button onClick={handleAuctionConfirmation}>Confirmar Subasta</button>
                )}
            </div>
        </div>
    );
};

export default AuctionConfirmation;
