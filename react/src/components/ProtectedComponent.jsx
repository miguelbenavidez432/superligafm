/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axiosClient from "../axios";
import SeasonCountdown from './SeasonCountDown';

const ProtectedComponent = ({ children }) => {
    const [seasonActive, setSeasonActive] = useState(false);
    const [seasonStart, setSeasonStart] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosClient.get('/seasons/start')
            .then(response => {
                const startDate = new Date(response.data.start_date);
                setSeasonStart(startDate);

                const now = new Date();
                if (now >= startDate) {
                    setSeasonActive(true);
                }
            })
            .catch(error => {
                console.error("Error fetching season data", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <p>Cargando...</p>;
    }

    if (!seasonActive) {
        return <SeasonCountdown startDate={seasonStart} />;
    }

    return <>{children}</>;
};

export default ProtectedComponent;
