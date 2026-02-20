/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useStateContext } from "../context/ContextProvider"
import axiosClient from "../axios";
import { useNavigate } from "react-router-dom";

export default function CreateBets() {
    const { user, setNotification } = useStateContext();
    const [bet, setBet] = useState({
        match: '',
        description: '',
        home_odd: 0,
        away_odd: 0,
        draw_odd: 0,
        under: 0,
        over: 0,
        created_by: user.id
    });
    const [singleBet, setSingleBet] = useState({
        name: '',
        description: '',
        goal_odd: 0,
        card_odd: 0,
        created_by: user.id
    });
    const navigate = useNavigate();
    const [errors, setErrors] = useState(null);

    const handlerDescriptionChange = (e) => {
        const description = e.target.value;
        setBet({
            ...bet,
            description: description
        });
    }

    const handlerSingleDescriptionChange = (e) => {
        const description = e.target.value;
        setSingleBet({
            ...singleBet,
            description: description
        });
    }

    const onSubmit = (e) => {
        e.preventDefault()
        axiosClient.post('/bets', bet)
            .then(() => {
                setNotification('Apuesta de partido creada correctamente')
                navigate('/app/apuestas')
            })
            .catch(err => {
                setNotification('Error al cargar la apuesta'+ errors)
                const response = err.response;
                if (response && response.status === 422) {
                    setErrors(response.data.errors)
                }
            })
    }

    const handlerOnSubmit = (e) => {
        e.preventDefault()
        const data = {
            ...singleBet,
            created_by: user.id,
        };
        axiosClient.post('/singlebet', data)
            .then(() => {
                setNotification('Apuesta de jugador creada correctamente')
                navigate('/app/apuestas')
            })
            .catch(err => {
                setNotification('Error al cargar la apuesta')
                const response = err.response;
                if (response && response.status === 422) {
                    setErrors(response.data.errors)
                }
            })
    }

    return (
        <>
            <div>
                <h1><strong>Crear apuesta por partido</strong></h1>
            </div>
            <form onSubmit={onSubmit}>
                <span>Partido:<input type="text"
                    onChange={e => setBet({ ...bet, match: e.target.value })} /></span>
                <span>Descripción: </span>
                <br />
                <textarea
                    cols="120"
                    rows="10"
                    onBlur={handlerDescriptionChange}
                    placeholder="Colocar el valor para under/over"></textarea>
                <br />
                <span>Cuota local</span>
                <input type="text"
                    placeholder="Colocar cuota con el formato x.xx"
                    onChange={e => setBet({ ...bet, home_odd: parseFloat(e.target.value) })} />
                <br />
                <span>Cuota visitante</span>
                <input type="text"
                    placeholder="Colocar cuota con el formato x.xx"
                    onChange={e => setBet({ ...bet, away_odd: parseFloat(e.target.value) })} />
                <br />
                <span>Cuota igualdad</span>
                <input type="text"
                    placeholder="Colocar cuota con el formato x.xx"
                    onChange={e => setBet({ ...bet, draw_odd: parseFloat(e.target.value) })} />
                <br />
                <span>Cuota under</span>
                <input type="text"
                    placeholder="Colocar cuota con el formato x.xx"
                    onChange={e => setBet({ ...bet, under: parseFloat(e.target.value) })} />
                <br />
                <span>Cuota over</span>
                <input type="text"
                    placeholder="Colocar cuota con el formato x.xx"
                    onChange={e => setBet({ ...bet, over: parseFloat(e.target.value) })} />
                <button className="btn-add" type="submit">Confirmar Apuesta</button>
            </form>
            <br />
            <hr />
            <hr />
            <hr />
            <hr />
            <hr />
            <br />
            <div>
                <h1><strong>Crear apuesta por jugador</strong></h1>
            </div>
            <form >
                <span>Partido:<input type="text"
                    onChange={e => setSingleBet({ ...singleBet, name: e.target.value })} /></span>
                <span>Descripción: </span>
                <br />
                <textarea
                    cols="120"
                    rows="10"
                    onBlur={handlerSingleDescriptionChange}
                    placeholder="Colocar el valor cantidad de goles o tipo de tarjeta"></textarea>
                <br />
                <span>Cuota goles</span>
                <input type="text"
                    placeholder="Colocar cuota con el formato x.xx"
                    onChange={e => setSingleBet({ ...singleBet, goal_odd: parseFloat(e.target.value) })} />
                <br />
                <span>Cuota tarjetas</span>
                <input type="text"
                    placeholder="Colocar cuota con el formato x.xx"
                    onChange={e => setSingleBet({ ...singleBet, card_odd: parseFloat(e.target.value) })} />
                <br />
                <button
                className="btn-add"
                type="submit"
                onClick={handlerOnSubmit}>Confirmar Apuesta</button>
            </form>
        </>
    )
}
