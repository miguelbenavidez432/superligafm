/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import axiosClient from '../axios';
import { useStateContext } from '../context/ContextProvider';

const CreatePrizes = () => {
    const [prizes, setPrizes] = useState([]);
    const { setNotification } = useStateContext();
    const [form, setForm] = useState({
        tournament_id: '',
        position: '',
        amount: '', // Cambié 'value' a 'amount' para que coincida con tu DB
        description: ''
    });

    useEffect(() => {
        fetchPrizes();
    }, []);

    const fetchPrizes = async () => {
        try {
            // Asumo que tu ruta de get es /prizes
            const response = await axiosClient.get('/prizes');
            setPrizes(response.data.data);
        } catch (error) {
            console.error('Error al obtener premios:', error);
            setNotification('Error al obtener los premios: ' + error.message);
        }
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Armamos el payload con la estructura que espera el Controller (un array 'prizes')
        const payload = {
            prizes: [
                {
                    tournament_id: parseInt(form.tournament_id),
                    position: parseInt(form.position),
                    amount: parseFloat(form.amount),
                    description: form.description || `Premio posición ${form.position}`
                }
            ]
        };

        try {
            await axiosClient.post('/prizes', payload);
            setNotification('¡Premio plantilla creado con éxito!');
            setForm({ tournament_id: form.tournament_id, position: '', amount: '', description: '' }); // Limpiar campos menos torneo
            fetchPrizes(); // Recargar la lista
        } catch (error) {
            console.error(error);
            setNotification('Error al crear el premio');
        }
    }

    return (
        <div className="container">
            <h1>Crear Plantilla de Premios</h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
                <select name="tournament_id" value={form.tournament_id} onChange={handleChange} required>
                    <option value="">Seleccionar Torneo</option>
                    {/* Asegúrate de usar los IDs reales de tu BD aquí */}
                    <option value="1">Primera División</option>
                    <option value="2">Segunda División</option>
                    <option value="3">Copa FM</option>
                </select>

                <input
                    type="number"
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    placeholder="Posición (ej: 1)"
                    required
                />

                <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="Monto del premio ($)"
                    required
                />

                <input
                    type="text"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Descripción (Opcional)"
                />

                <button type="submit">Guardar Premio en Plantilla</button>
            </form>

            {/* Opcional: Renderizar la lista de premios aquí abajo */}
        </div>
    )
}

export default CreatePrizes;
