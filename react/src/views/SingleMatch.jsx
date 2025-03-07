import { useState, useEffect } from 'react';
import axiosClient from '../axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useStateContext } from '../context/ContextProvider';

export default function SingleMatch() {
    const [match, setMatch] = useState({});
    const [loading, setLoading] = useState(true);
    const { user, setNotification } = useStateContext();
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        axiosClient.get(`/matches/${id}`)
        .then(({ data }) => {
                console.log('data: ', data)
                setMatch(data.data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [id]);

    const deleteMatch = () => {
        setLoading(true);
        axiosClient.delete(`/matches/${id}`)
            .then(() => {
                setNotification('Partido eliminado correctamente');
                navigate('/partidos');
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const updateMatch = () => {

    };

    return (
        <div>
            {loading ? 'Cargando...' : (
                <div>
                    <h1>{match.team_home} vs {match.team_away}</h1>
                    <p>{match.date}</p>
                    <p>{match.status}</p>
                    {user && (
                        <div>
                            <button onClick={deleteMatch}>Eliminar</button>
                            <button onClick={updateMatch}>Editar</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
