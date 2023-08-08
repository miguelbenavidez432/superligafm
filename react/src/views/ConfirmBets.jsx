/* eslint-disable no-unused-vars */
import { useNavigate, useParams } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider"
import { useEffect, useState } from "react";
import axiosClient from "../axios";

export default function ConfirmBets() {
    const { user, setNotification } = useStateContext();
    const [bet, setBet] = useState([]);
    const [singleBet, setSingleBet] = useState([]);
    const { id } = useParams();
    const [errors, setErrors] = useState(null);
    const navigate = useNavigate();
    const [profits, setProfits] = useState('')
    const [sendData, setSendData] = useState({
        id_user: user.id,
        id_bet: parseInt(id),
        amount: 0,
        selected_option: '',
        id_playerbet: parseInt(id),
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const betResponse = await axiosClient.get(`/bets/${id}`);
                setBet(betResponse.data.data);
                console.log(betResponse.data.data);

                const singleBetResponse = await axiosClient.get(`/singlebet/${id}`);
                setSingleBet(singleBetResponse.data.data);
                console.log(singleBetResponse.data.data);

                setProfits(user.profits);
            } catch (error) {
                console.log(error)
            }
        };

        fetchData();
    }, [id, user.profits]);

    const onSubmit = async (e) => {
        e.preventDefault();
        const data ={
            ...sendData,
            amount: profits
        }
        try {
            console.log(data)
            await axiosClient.post('/apuesta/usuario', data)
                .then(() => {
                    setNotification('Apuesta agregada correctamente');
                    setSendData({
                        id_bet: '',
                        id_playerbet: '',
                    })
                    navigate('/apuestas')
                })
        } catch (error) {
            setNotification("Error al confirmar la oferta:", error);
            const response = error.response;
            if (response && response.status === 422) {
                setErrors(response.data.errors);
            }
        }
    }

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        console.log(sendData)
        const data ={
            ...sendData,
            amount: profits
        }
        try {
            console.log(data)
            await axiosClient.post('/apuesta/jugador', data)
                .then(() => {
                    setNotification('Apuesta agregada correctamente');
                    setSendData({
                        id_bet: '',
                        id_playerbet: '',
                    })
                    navigate('/apuestas')
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
            <div>
                <h1>{bet.match ? <p>Apuesta en {bet.match}</p> : <p>Apuesta no encontrada</p>}</h1>
                <select onChange={e => setSendData({ ...sendData, selected_option: parseFloat(e.target.value) })}>
                    <option value="">Selecciona UN tipo de apuesta</option>
                    <option value={bet.home_odd}>Home</option>
                    <option value={bet.away_odd}>Away</option>
                    <option value={bet.draw_odd}>Draw</option>
                    <option value={bet.over}>Over</option>
                    <option value={bet.under}>Under</option>
                </select>
                <input type="range"
                    min='1000000'
                    max='15000000'
                    step="any"
                    onChange={e => setProfits(parseInt(e.target.value))}
                />
                <span><strong>Cantidad a apostar: </strong>{profits}</span>
                <br />
                <br />
                <button className="btn-add" onClick={onSubmit}>Confirmar apuesta</button>
            </div>
            <br />
            <hr />
            <hr />
            <hr />
            <hr />
            <hr />
            <hr />
            <hr />
            <br />
            <br />
            {/* <div>
                <h1>{singleBet.name ? <p>Apuesta por {singleBet.name}</p> : <p>Apuesta no encontrada</p>}</h1>
                <select name="" id="">
                    <option value="">Selecciona UN tipo de apuesta</option>
                    <option value={singleBet.goal_odd}>Goles</option>
                    <option value={singleBet.card_odd}>Tarjetas</option>
                </select>
                <input type="range"
                    min='1000000'
                    max='15000000'
                    step="any"
                    value={profits}
                    onChange={e => setProfits(parseInt(e.target.value))}
                />
                <span>{profits}</span>
                <br />
                <br />
                <button className="btn-add" onClick={handleOnSubmit}>Confirmar apuesta</button>
            </div> */}
        </>
    )
}