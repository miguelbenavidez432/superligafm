/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axiosClient from '../axios';
import { useStateContext } from '../context/ContextProvider';

export default function TournamentForm() {
    const [tournament, setTournament] = useState({
        name: '',
        start_date: '',
        end_date: '',
        season_id: '',
        type: '',
    });
    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(false);
    const { setNotification } = useStateContext();

    useEffect(() => {
        axiosClient.get('/season')
            .then(({ data }) => {
                setSeasons(data.data);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [tournament]);

    const onSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        axiosClient.post('/tournaments', tournament)
            .then(() => {
                setLoading(false);
                setNotification('Torneo creado correctamente');
                setTournament({
                    name: '',
                    start_date: '',
                    end_date: '',
                    season_id: '',
                    type: '',
                });
            })
            .catch(() => {
                setLoading(false);
            });
    };

    return (
        <form onSubmit={onSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 max-w-7xl mx-auto">
            <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Nombre</label>
                <input id="name" value={tournament.name} onChange={e => setTournament({ ...tournament, name: e.target.value })} placeholder="Nombre" type="text" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline sm:w-1/2" />
            </div>
            <div className="mb-4">
                <label htmlFor="start_date" className="block text-gray-700 text-sm font-bold mb-2">Fecha de inicio</label>
                <input id="start_date" value={tournament.start_date} onChange={e => setTournament({ ...tournament, start_date: e.target.value })} placeholder="Fecha de inicio" type="date" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline sm:w-1/2" />
            </div>
            <div className="mb-4">
                <label htmlFor="end_date" className="block text-gray-700 text-sm font-bold mb-2">Fecha de fin</label>
                <input id="end_date" value={tournament.end_date} onChange={e => setTournament({ ...tournament, end_date: e.target.value })} placeholder="Fecha de fin" type="date" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline sm:w-1/2" />
            </div>
            <div className="mb-4">
                <label htmlFor="type" className="block text-gray-700 text-sm font-bold mb-2">Tipo</label>
                <select id="type" value={tournament.type} onChange={e => setTournament({ ...tournament, type: e.target.value })} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline sm:w-1/2">
                    <option value=''>Seleccionar Tipo</option>
                    <option value='PD'>Liga o Playoff de Primera</option>
                    <option value='SD'>Liga o Playoff de Segunda</option>
                    <option value='UCL'>Liga o Playoff UCL</option>
                </select>
            </div>
            <div className="mb-4">
                <label htmlFor="season_id" className="block text-gray-700 text-sm font-bold mb-2">Temporada</label>
                <select id="season_id" value={tournament.season_id} onChange={e => setTournament({ ...tournament, season_id: e.target.value })} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline sm:w-1/2">
                    <option value=''>Seleccionar Temporada</option>
                    {seasons ? seasons.map(season => (
                        <option key={season.id} value={season.id}>{season.name}</option>
                    )) : 'No hay temporadas'}
                </select>
            </div>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit" disabled={loading}>Guardar Torneo</button>
        </form>
    );
}
