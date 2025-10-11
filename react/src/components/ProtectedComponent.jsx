/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axiosClient from "../axios";
import SeasonCountdown from './SeasonCountDown';

const ProtectedComponent = ({ children }) => {
    const [seasonActive, setSeasonActive] = useState(false);
    const [seasonStart, setSeasonStart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axiosClient.get('/seasons/start')
            .then(response => {
                const startDateString = response.data.start_date;
                const startDateUTC = new Date(startDateString + 'Z')

                setSeasonStart(startDateUTC);

                const nowUTC = new Date().getTime();
                const startTimeUTC = startDateUTC.getTime();

                if (nowUTC >= startTimeUTC) {
                    setSeasonActive(true);
                }
            })
            .catch(error => {
                console.error("Error fetching season data", error);
                setError("Error al cargar la información de la temporada");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <p>Cargando...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!seasonActive) {
        return <SeasonCountdown startDate={seasonStart} />;
    }

    return <>{children}</>;
};

export default ProtectedComponent;

