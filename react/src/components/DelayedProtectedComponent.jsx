/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import axiosClient from "../axios";

const DelayedProtectedComponent = ({ children, delay }) => {
    const [isActive, setIsActive] = useState(false);
    const [seasonStart, setSeasonStart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axiosClient.get('/seasons/start')
            .then(response => {
                const startDate = new Date(response.data.start_date);
                setSeasonStart(startDate);

                const now = new Date();
                const adjustedStartDate = new Date(startDate.getTime() + delay * 60 * 60 * 1000);

                if (now >= adjustedStartDate) {
                    setIsActive(true);
                }
            })
            .catch(error => {
                console.error("Error fetching season data", error);
                setError("Error al cargar la información de la temporada");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [delay]);

    if (loading) {
        return <p>Cargando...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!isActive) {
        return <p>El acceso a este contenido se habilitará a las {new Date(seasonStart.getTime() + delay * 60 * 60 * 1000).toLocaleTimeString()}.</p>;
    }

    return <>{children}</>;
};

export default DelayedProtectedComponent;

