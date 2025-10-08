/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react'
import axiosClient from '../axios';
//import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useStateContext } from '../context/ContextProvider';

const CreatePrizes = () => {

    const [prizes, setPrizes] = useState([]);
    const { setNotification } = useStateContext();
    const [form, setForm] = useState({
        tournament: '',
        position: '',
        value: '',
    });

    useEffect(() => {
        fetchPrizes();
    }, []);

    const fetchPrizes = async () => {
        try {
            const response = await axiosClient.get('/create-prizes');
            setPrizes(response.data.data);
        }
        catch (error) {
            console.log('Error al obtener premios;', error);
            setNotification('Error al obtener los premios ' + error.message);
        }
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    }

    return (
        <>
            <div>
                <h1>Crear Premios</h1>
            </div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    placeholder="Posición"
                />
                <input
                    type="number"
                    name="value"
                    value={form.value}
                    onChange={handleChange}
                    placeholder="Valor del premio"
                />
                <select name="tournament_id" value={form.tournament_id} onChange={handleChange}>
                    <option value="">Seleccionar Torneo</option>
                    <option value="primera">Primera División</option>
                    <option value="segunda">Segunda División</option>
                    <option value="copa">Copa FM</option>
                    <option value="ucl">UCL</option>
                    <option value="uel">UEL</option>
                </select>
                <button type="submit">Agregar Premio</button>
            </form>
        </>
    )
}

export default CreatePrizes
