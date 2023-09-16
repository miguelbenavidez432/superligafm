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
    const [currentPageSingleBets, setCurrentPageSingleBets] = useState(1);
    const [totalPagesSingleBets, setTotalPagesSingleBets] = useState(1);
    const [currentPageBets, setCurrentPageBets] = useState(1);
    const [totalPagesBets, setTotalPagesBets] = useState(1);
    const [errors, setErrors] = useState(null);

    useEffect(() => {
        axiosClient.get(`/bets?page=${currentPageBets}`)
            .then(({ data }) => {
                setLoading(true);
                setBets(data.data);
                setTotalPagesBets(data.meta.last_page);
            })
            .catch(() => {
                setLoading(false);
            });

        axiosClient.get(`/singlebet?page=${currentPageSingleBets}`)
            .then(({ data }) => {
                setLoading(true);
                setSingleBets(data.data);
                setTotalPagesSingleBets(data.meta.last_page);
                // ...rest of the code...
            });
    }, [currentPageBets, currentPageSingleBets]);

    const onClick = async (betId) => {
        const id = parseInt(betId)
        const betUpdated = { active: 'off' }
        try {
            await axiosClient.put(`/bets/${id}`, betUpdated)
                .then(() => {
                    console.log()
                    setNotification('Apuesta eliminada correctamente');
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
                {currentPageBets > 1 && (
                    <button className="btn-add" onClick={() => setCurrentPageBets(prevPage => prevPage - 1)}>Página anterior</button>
                )}&nbsp;&nbsp;&nbsp;&nbsp;
                {currentPageBets < totalPagesBets && (
                    <button className='btn-add' onClick={() => setCurrentPageBets(prevPage => prevPage + 1)}>Página siguiente</button>
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
                            <th>Under</th>
                            <th>Over</th>
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
                                bets.filter(b => b.active === 'on')
                                    .map(b => (
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
                                                            &nbsp;
                                                            {
                                                                user.rol === 'Admin' &&
                                                                <button className="btn-edit" onClick={() => onClick(b.id)}>Desactivar</button>
                                                            }
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