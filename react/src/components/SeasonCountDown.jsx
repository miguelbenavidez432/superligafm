/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';

const SeasonCountdown = ({ startDate }) => {
    const [timeLeft, setTimeLeft] = useState({});

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const timeDifference = startDate - now;

            if (timeDifference <= 0) {
                clearInterval(interval);
            } else {
                setTimeLeft({
                    days: Math.floor(timeDifference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((timeDifference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((timeDifference / (1000 * 60)) % 60),
                    seconds: Math.floor((timeDifference / 1000) % 60),
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [startDate]);

    if (timeLeft.days <= 0 && timeLeft.hours <= 0 && timeLeft.minutes <= 0 && timeLeft.seconds <= 0) {
        return <p>The season has started!</p>;
    }

    return (
        <div>
            <h2>Countdown to season start:</h2>
            <p>{timeLeft.days} days, {timeLeft.hours} hours, {timeLeft.minutes} minutes, {timeLeft.seconds} seconds</p>
        </div>
    );
};

export default SeasonCountdown;
