/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import axiosClient from "../axios";

const DelayedProtectedComponent = ({ children, delay }) => {
    const [isActive, setIsActive] = useState(false);
    const [seasonStart, setSeasonStart] = useState(null);
    const [timeLeft, setTimeLeft] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axiosClient.get('/seasons/start')
            .then(response => {
                const startDateString = response.data.start_date;
                const startDateUTC = new Date(startDateString + 'Z');

                setSeasonStart(startDateUTC);

                const adjustedStartTime = startDateUTC.getTime() + (delay * 60 * 60 * 1000);
                const adjustedStartDate = new Date(adjustedStartTime);

                calculateTimeLeft(adjustedStartDate);

                const nowUTC = new Date().getTime();
                if (nowUTC >= adjustedStartDate.getTime()) {
                    setIsActive(true);
                } else {
                    const interval = setInterval(() => calculateTimeLeft(adjustedStartDate), 1000);
                    return () => clearInterval(interval);
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

    const calculateTimeLeft = (adjustedStartDate) => {
        const nowUTC = new Date().getTime();
        const targetTime = adjustedStartDate.getTime();
        const timeDifference = targetTime - nowUTC;

        if (timeDifference <= 0) {
            setIsActive(true);
            setTimeLeft({});
            return;
        }

        setTimeLeft({
            days: Math.floor(timeDifference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((timeDifference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((timeDifference / (1000 * 60)) % 60),
            seconds: Math.floor((timeDifference / 1000) % 60),
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center p-6 bg-gray-900 text-white rounded-lg shadow-lg">
                <p className="text-xl font-bold animate-pulse">Cargando...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center p-6 bg-gray-900 text-white rounded-lg shadow-lg">
                <p className="text-red-500 font-bold">{error}</p>
            </div>
        );
    }

    if (!isActive) {
        return (
            <div className="flex flex-col items-center p-6 bg-gray-900 text-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Acceso restringido. El contenido estará disponible en:</h2>
                <p className="text-xl">
                    <span className="font-mono text-yellow-400">{timeLeft.days}</span> days,{' '}
                    <span className="font-mono text-yellow-400">{timeLeft.hours}</span> hours,{' '}
                    <span className="font-mono text-yellow-400">{timeLeft.minutes}</span> minutes,{' '}
                    <span className="font-mono text-yellow-400">{timeLeft.seconds}</span> seconds
                </p>
            </div>
        );
    }

    return <>{children}</>;
};

export default DelayedProtectedComponent;
