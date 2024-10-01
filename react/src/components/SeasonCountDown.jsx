/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import axiosClient from "../axios"; // Asegúrate de que tu cliente axios esté configurado
//import Tempo from "@formkit/tempo";
import { useNavigate } from "react-router-dom";

const SeasonCountdown = () => {
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

                // Si ya pasó la fecha de inicio, redireccionar o permitir acceso
                if (new Date() >= seasonStart) {
                    navigate('/home'); // Cambia esto a la URL permitida después del inicio de temporada
                } else {
                    //startCountdown(seasonStart);
                }
            } catch (error) {
                console.error("Error al obtener la fecha de inicio de la temporada:", error);
            }
        };

        fetchSeasonStartDate();
    }, [navigate]);

    // const startCountdown = (seasonStart) => {
    //     const countdownElement = document.getElementById('season-countdown');

    //     const countdown = new Tempo({
    //         target: seasonStart,
    //         interval: 1000,
    //         onUpdate: (time) => {
    //             countdownElement.innerHTML = `${time.days}d ${time.hours}h ${time.minutes}m ${time.seconds}s`;
    //         },
    //         onFinish: () => {
    //             countdownElement.innerHTML = "¡La temporada ha comenzado!";
    //             navigate('/home'); // Redirigir al usuario cuando la temporada comience
    //         }
    //     });

    //     countdown.start();
    // };

    if (loading) {
        return <div>Cargando...</div>; // O muestra un spinner mientras se obtiene la fecha
    }

    return (
        <div>
            <h3>La temporada aún no ha comenzado</h3>
            <p>Tiempo restante:</p>
            <div id="season-countdown"></div>
        </div>
    );
};

export default SeasonCountdown;
