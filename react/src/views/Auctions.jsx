/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import axiosClient from '../axios';

const Auctions = () => {

    const [auctions, setAuctions] = useState('');
    const [loading, setLoading] = useState(false);

    const getAuctions = async () => {
        setLoading(true);
        await axiosClient.get('/auctions/last')
            .then((response) => {
                setAuctions(response.data);
            })
            .catch(() => {
                setLoading(false)
            })
    }

    useEffect(() => {
        getAuctions();
    }, [auctions])

    return (
        <>
            Auctions
        </>
    )
}

export default Auctions
