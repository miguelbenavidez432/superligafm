/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useStateContext } from "../context/ContextProvider"
import axiosClient from "../axios";
import { Link } from "react-router-dom";

export default function Bets() {

    const { user, setNotification } = useStateContext();
    const [loading, setLoading] = useState(false);
    const [bets, setBets] = useState([]);
    const [singleBets, setSingleBets] = useState([])
    const [sendBet, setSendBet] = useState({
        id_bet: '',
        id_user: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [errors, setErrors] = useState(null);

    useEffect(() => {
        axiosClient.get('/bets')
            .then(({ data }) => {
                setLoading(true);
                console.log(data)
                setBets(data.data)
                setTotalPages(data.meta.last_page);
                setSendBet({
                    ...sendBet,
                    id_user: user.id
                })
            })
            .catch(() => {
                setLoading(false)
            })
        axiosClient.get('/singlebet')
            .then(({ data }) => {
                setLoading(true);
                console.log(data)
                setSingleBets(data.data)
                setTotalPages(data.meta.last_page);
            })
    }, [])

    const handleNextPage = () => {
        setCurrentPage((prevPage) => prevPage + 1);
    };

    const handlePrevPage = () => {
        setCurrentPage((prevPage) => prevPage - 1);
    };


    const onSubmit = async (betId) => {
        setSendBet({
            ...sendBet,
            id_bet: parseInt(betId)
        })
        try {
            await axiosClient.put('/apuesta/usuario', sendBet)
                .then(() => {
                    setNotification('Apuesta agregada correctamente');
                    setSendBet({
                        id_bet: ''
                    })
                })
        } catch (error) {
            setNotification("Error al confirmar la oferta:", error);
            const response = error.response;
            if (response && response.status === 422) {
                setErrors(response.data.errors);
            }
        }
    }


    return (
        <>
            <div style={{ display: 'flex', justifyContent: "space-between", alignItems: "center" }}>
                <h1><strong>APUESTAS</strong></h1>

            </div>
            <div>
                {currentPage > 1 && (
                    <button className="btn-add" onClick={handlePrevPage}>Página anterior</button>
                )}&nbsp;&nbsp;&nbsp;&nbsp;
                {currentPage < totalPages && (
                    <button className='btn-add' onClick={handleNextPage}>Página siguiente</button>
                )}
            </div>
            <div className="card animated fadeInDown">
                <table>
                    <thead>
                        <tr>
                            <th>Partido</th>
                            <th>Descripción</th>
                            <th>Cuota Local</th>
                            <th>Cuota Visitante</th>
                            <th>Cuota empate</th>
                            <th>Over</th>
                            <th>Under</th>
                            <th>Apostar</th>
                        </tr>
                    </thead>
                    {!loading &&
                        <tbody>
                            <tr>
                                <td colSpan="9" className="text-center">
                                    CARGANDO...
                                </td>
                            </tr>
                        </tbody>
                    }
                    {loading &&
                        <tbody>
                            {
                                bets.map(b => (
                                    <tr key={b.id}>
                                        <th>{b.match}</th>
                                        <th>{b.description}</th>
                                        <th>{b.home_odd}</th>
                                        <th>{b.away_odd}</th>
                                        <th>{b.draw_odd}</th>
                                        <th>{b.under}</th>
                                        <th>{b.over}</th>
                                        {
                                            user ?
                                                (<>
                                                    <th>
                                                        <Link className="btn-add" to={`/apuestas/${b.id}`}>Apostar</Link>
                                                    </th>
                                                </>
                                                ) :
                                                <th>

                                                </th>
                                        }
                                    </tr>
                                ))}
                        </tbody>
                    }
                </table>
                <br />
                <br />
                <table>
                    <thead>
                        <tr>
                            <th>Jugador</th>
                            <th>Descripción</th>
                            <th>Cuota goles</th>
                            <th>Cuota tarjetas</th>
                            <th>Apostar</th>
                        </tr>
                    </thead>
                    {!loading &&
                        <tbody>
                            <tr>
                                <td colSpan="9" className="text-center">
                                    CARGANDO...
                                </td>
                            </tr>
                        </tbody>
                    }
                    {loading &&
                        <tbody>
                            {
                                singleBets.map(b => (
                                    <tr key={b.id}>
                                        <th>{b.name}</th>
                                        <th>{b.description}</th>
                                        <th>{b.goal_odd}</th>
                                        <th>{b.card_odd}</th>
                                        {
                                            user ?
                                                (<>
                                                    <th>
                                                    <Link className="btn-add" to={`/apuestas/${b.id}`}>Apostar</Link>
                                                    </th>
                                                </>
                                                ) :
                                                <th>

                                                </th>
                                        }
                                    </tr>
                                ))}
                        </tbody>
                    }
                </table>
            </div>

        </>
    )
}