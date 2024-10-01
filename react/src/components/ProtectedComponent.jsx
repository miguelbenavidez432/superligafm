import { useEffect, useState } from "react";
import axiosClient from "../axios"; // Asegúrate de que tu cliente axios esté configurado
import { useNavigate } from "react-router-dom";

const ProtectedComponent = () => {
    // eslint-disable-next-line no-unused-vars
    const [startDate, setStartDate] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Obtener la fecha de inicio de la temporada desde el backend
        const fetchSeasonStartDate = async () => {
            try {
                const response = await axiosClient.get('/season/start');
                const seasonStart = new Date(response.data.start_date); // Fecha de inicio de temporada
                setStartDate(seasonStart);
                setLoading(false);

                // Si la temporada no ha comenzado, redirige al countdown
                if (new Date() < seasonStart) {
                    navigate('/season-countdown'); // Redirigir a la página de countdown
                }
            } catch (error) {
                console.error("Error al obtener la fecha de inicio de la temporada:", error);
            }
        };

        fetchSeasonStartDate();
    }, [navigate]);

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <div>
            <h3>Este es un contenido protegido</h3>
        </div>
    );
};

export default ProtectedComponent;
