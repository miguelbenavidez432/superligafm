import { useState } from "react";
import axiosClient from "../axios";
import { useStateContext } from "../context/ContextProvider";

export default function ReverseOffer() {
    const [offerId, setOfferId] = useState('');
    const [playerId, setPlayerId] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, setNotification } = useStateContext();

    const handleReverse = async (e) => {
        e.preventDefault();

        if (!window.confirm(`¿Estás seguro de revertir la oferta ${offerId} del jugador ${playerId}?`)) {
            return;
        }

        setLoading(true);

        try {
            const response = await axiosClient.post('/rescission/reverse', {
                offer_id: parseInt(offerId),
                player_id: parseInt(playerId)
            });

            setNotification(response.data.message);
            setOfferId('');
            setPlayerId('');
        } catch (error) {
            setNotification(error.response?.data?.message || "Error al revertir la oferta");
        } finally {
            setLoading(false);
        }
    };

    if (user.rol !== 'Admin') {
        return <p>No tienes permisos para acceder a esta página.</p>;
    }

    return (
        <div className="p-6 bg-white shadow-md rounded-md">
            <h1 className="text-2xl font-bold mb-4">Revertir Oferta de Rescisión</h1>

            <form onSubmit={handleReverse} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">ID de la Oferta:</label>
                    <input
                        type="number"
                        value={offerId}
                        onChange={(e) => setOfferId(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">ID del Jugador:</label>
                    <input
                        type="number"
                        value={playerId}
                        onChange={(e) => setPlayerId(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-800 text-white px-4 py-2 rounded"
                >
                    {loading ? 'Revirtiendo...' : 'Revertir Oferta'}
                </button>
            </form>
        </div>
    );
}
