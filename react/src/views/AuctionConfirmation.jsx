/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import axiosClient from "../axios";
import { useStateContext } from "../context/ContextProvider";
import { useNavigate } from "react-router-dom";

const AuctionConfirmation = () => {
    const { setNotification } = useStateContext();
    const navigate = useNavigate();
    const [players, setPlayers] = useState([]);
    const [users, setUsers] = useState([]);
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
    const [secondTeam, setSecondTeam] = useState()
    const [teamPlayers, setTeamPlayers] = useState([]);
    const [userProfit, setUserProfit] = useState({
        id: '',
        name: '',
        rol: '',
        email: '',
        profits: 0
    });

    useEffect(() => {
        getTeam()
        getPlayers()
        getUsers()
    }, [selectedTeam])

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
                const filteredPlayers = data.data.filter(p => p.id_team === selectedTeam)
                setTeamPlayers(filteredPlayers)
            })
            .catch(() => {
            })
    }

    const getUsers = () => {
        axiosClient.get('/users')
            .then(({ data }) => {
                setUsers(data.data)
            })
            .catch(() => {
            })
    }

    const handlePlayer = (e) => {
        const playerSelected = players.find(p => p.id === parseInt(e.target.value))
        setSelectedPlayer({
            ...selectedPlayer,
            name: playerSelected.name,
            status: 'bloqueado',
            ca: playerSelected.ca,
            pa: playerSelected.pa,
            age: playerSelected.age,
            value: playerSelected.value
        })

    }

    const onSubmit = () => {
        const filteredTeam = leagueTeams.find(t => t.id === secondTeam)
        const userFiltered = users.find(u => u.id === filteredTeam.id_user)
        setUserProfit({
            ...userProfit,
            id: userFiltered.id,
            name: userFiltered.name,
            rol: userFiltered.rol,
            email: userFiltered.email,
            profits: userFiltered.profits + selectedPlayer.value
        })
        setSelectedPlayer({
            ...selectedPlayer,
            id_team: parseInt(secondTeam)
        })
        axiosClient.put(`/users/${userFiltered.id}`, userProfit);
        axiosClient.put(`/players/${selectedPlayer.id}`, selectedPlayer)
            .then(() => {
                setNotification('Subasta actualizada')
                navigate('/plantel')
            });



    }

    return (
        <div>
            <label htmlFor="equipo">Seleccionar equipo:</label>
            <select id="equipo" onChange={e => setSelectedTeam(parseInt(e.target.value))}>
                <option value="">Seleccione un equipo del jugador</option>
                {
                    otherTeams.map(equipo => (
                        <option key={equipo.id} value={equipo.id}>{equipo.name}</option>
                    ))}
            </select>

            <select id="equipo" onChange={e => setSecondTeam(parseInt(e.target.value))}>
                <option value="">Seleccione un equipo de destino</option>
                {
                    leagueTeams.map(equipo => (
                        <option key={equipo.id} value={equipo.id}>{equipo.name}</option>
                    ))}
            </select>

            <select id="equipo" onChange={handlePlayer}>
                <option value="">Seleccione el jugador subastado</option>
                {
                    teamPlayers.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
            </select>

            <input type="number" value={selectedPlayer.value} onChange={e => setSelectedPlayer((prevSelectedPlayer)=>({...prevSelectedPlayer, value: e.target.value}))} />

            <button type="submit" onClick={onSubmit} className="btn-add" > Confirmar Subasta</button>

        </div>
    )
};

export default AuctionConfirmation;
