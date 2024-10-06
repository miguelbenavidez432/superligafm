/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import axiosClient from '../axios';
import { Navigate } from 'react-router-dom';

const MarketProtectedRoute = ({ children }) => {
    const [marketActive, setMarketActive] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosClient.get('/seasons/start')
            .then(response => {
                const startDate = new Date(response.data.start_date);
                const marketEnd = new Date(startDate.getTime() + 4 * 60 * 60 * 1000);

                const now = new Date();
                if (now >= startDate && now <= marketEnd) {
                    setMarketActive(true);
                }
            })
            .catch(error => {
                console.error('Error fetching market data', error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!marketActive) {
        return <Navigate to="/season-countdown" />;
    }

    return children;
};

export default MarketProtectedRoute;
