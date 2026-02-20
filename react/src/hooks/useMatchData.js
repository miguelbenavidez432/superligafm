import { useState, useEffect } from 'react';
import axiosClient from '../axios';

export const useMatchData = () => {
    const [tournaments, setTournaments] = useState([]);
    const [teams, setTeams] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState('');
    const [selectedHomeTeam, setSelectedHomeTeam] = useState('');
    const [selectedAwayTeam, setSelectedAwayTeam] = useState('');
    const [stage, setStage] = useState('');
    const [loadingData, setLoadingData] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoadingData(true);

            try {
                const responseTeams = await axiosClient.get('/teams');

                const arrayEquipos = responseTeams.data.data ? responseTeams.data.data : responseTeams.data;

                if (Array.isArray(arrayEquipos)) {
                    const filteredTeams = arrayEquipos.filter(
                        team => team.division === 'Primera' || team.division === 'Segunda'
                    );
                    setTeams(filteredTeams);
                } else {
                    console.error("❌ El formato de equipos no es un Array:", arrayEquipos);
                }
            } catch (error) {
                console.error("❌ Error en la petición de Equipos:", error);
            }

            try {
                const responseTournaments = await axiosClient.get('/tournaments');

                const arrayTorneos = responseTournaments.data.data ? responseTournaments.data.data : responseTournaments.data;

                if (Array.isArray(arrayTorneos)) {
                    setTournaments(arrayTorneos);
                } else {
                    console.error("❌ El formato de torneos no es un Array:", arrayTorneos);
                }
            } catch (error) {
                console.error("❌ Error en la petición de Torneos:", error);
            }
            setLoadingData(false);
        };

        fetchInitialData();
    }, []);

    return {
        tournaments,
        teams,
        selectedTournament, setSelectedTournament,
        selectedHomeTeam, setSelectedHomeTeam,
        selectedAwayTeam, setSelectedAwayTeam,
        stage, setStage,
        loadingData
    };
};
