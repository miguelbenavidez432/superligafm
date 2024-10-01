/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import axiosClient from '../axios';

const Season = () => {

    const [season, setSeason] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(()=>{
        getSeason();
    })

    const getSeason = async() =>{
        setLoading(true);
        await axiosClient.get('/season')
        .then(({ data }) => {
            setSeason(data.data)
        })
        .catch(() => {
            setLoading(false)
        })
    }

  return (
    <div>Season</div>
  )
}

export default Season
