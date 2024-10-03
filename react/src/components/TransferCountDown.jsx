/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axiosClient from './axiosClient'; // Asegúrate de importar axiosClient

const TransferCountDown = ({ children }) => {
    const [timeLeft, setTimeLeft] = useState({});
    const [marketEndTime, setMarketEndTime] = useState(null);
    const [marketActive, setMarketActive] = useState(false); // Estado para controlar si el mercado está activo
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosClient.get('/seasons/start')
            .then(response => {
                const startDate = new Date(response.data.start_date);

                // Calcula la fecha de finalización añadiendo 4 horas
                const marketEnd = new Date(startDate.getTime() + 4 * 60 * 60 * 1000);
                setMarketEndTime(marketEnd);

                const now = new Date();
                if (now >= startDate) {
                    setMarketActive(true); // Marca el mercado como activo si la fecha actual es después del inicio
                }
            })
            .catch(error => {
                console.error("Error fetching season data", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (marketEndTime) {
            const interval = setInterval(() => {
                const now = new Date();
                const timeDifference = marketEndTime - now;

                if (timeDifference <= 0) {
                    clearInterval(interval);
                    setMarketActive(false); // Desactiva el mercado cuando el contador llegue a 0
                } else {
                    setTimeLeft({
                        hours: Math.floor((timeDifference / (1000 * 60 * 60)) % 24),
                        minutes: Math.floor((timeDifference / (1000 * 60)) % 60),
                        seconds: Math.floor((timeDifference / 1000) % 60),
                    });
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [marketEndTime]);

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="flex flex-col items-center p-6 bg-gray-900 text-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Countdown to market closure:</h2>
            <p className="text-xl">
                <span className="font-mono text-yellow-400">{timeLeft.hours}</span> hours,{' '}
                <span className="font-mono text-yellow-400">{timeLeft.minutes}</span> minutes,{' '}
                <span className="font-mono text-yellow-400">{timeLeft.seconds}</span> seconds
            </p>

            {/* Renderiza los hijos solo si el mercado está activo */}
            {marketActive ? (
                children // Renderiza las vistas o componentes hijos si el mercado está activo
            ) : (
                <p className="text-red-500 font-bold">El mercado está cerrado, no puedes realizar acciones.</p>
            )}
        </div>
    );
};

export default TransferCountDown;

