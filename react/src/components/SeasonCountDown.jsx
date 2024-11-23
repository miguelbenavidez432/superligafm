/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';

const SeasonCountdown = ({ startDate }) => {
    const [timeLeft, setTimeLeft] = useState({});

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const timeDifference = startDate - now;

            if (timeDifference <= 0) {
                return {};
            }

            return {
                days: Math.floor(timeDifference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((timeDifference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((timeDifference / (1000 * 60)) % 60),
                seconds: Math.floor((timeDifference / 1000) % 60),
            };
        };

        const interval = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(interval);
    }, [startDate]);

    if (!timeLeft.days && !timeLeft.hours && !timeLeft.minutes && !timeLeft.seconds) {
        return <p className="text-green-500 font-bold text-lg">El mercado acaba de iniciar!</p>;
    }

    return (
        <div className="flex flex-col items-center p-6 bg-gray-900 text-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">El mercado de pases inicia en:</h2>
            <p className="text-xl">
                <span className="font-mono text-yellow-400">{timeLeft.days}</span> days,{' '}
                <span className="font-mono text-yellow-400">{timeLeft.hours}</span> hours,{' '}
                <span className="font-mono text-yellow-400">{timeLeft.minutes}</span> minutes,{' '}
                <span className="font-mono text-yellow-400">{timeLeft.seconds}</span> seconds
            </p>
        </div>
    );
};

export default SeasonCountdown;
