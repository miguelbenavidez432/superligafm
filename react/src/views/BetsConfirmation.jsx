/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react"
import axiosClient from "../axios"
import { useStateContext } from "../context/ContextProvider"

export default function BetsConfirmation() {
    const [betMatch, setBetMatch] = useState([])
    const { user, setNotification } = useStateContext()
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bets, setBets] = useState([]);
    const [updateUserData, setUpdateUserData] = useState({
        id: '',
        name: '',
        rol: '',
        email: '',
        profits: 0
    }) 

    useEffect(() => {
        Promise.all([axiosClient.get('/bet_user'), getUsers(), getBets()])
            .then(([betUserData]) => {
                setBetMatch(betUserData.data.data);
                console.log(betUserData.data.data);
            })
            .catch((error) => {
                console.error("Error al obtener las filas de la tabla intermedia:", error);
            });
    }, []);

    const getBets = () => {
        return axiosClient.get('/bets')
            .then(({ data }) => {
                setLoading(true);
                setBets(data.data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const getUsers = () => {
        return axiosClient.get('/users')
            .then(({ data }) => {
                setLoading(true);
                setUsers(data.data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const onSubmit = async (betId, userId, selected_option, amount) => {

        const updateProfits = selected_option * amount;
        const userData = users.find(u=>u.id===userId)

        const userDataUpdated = {
            ...updateUserData,
            id: userData.id,
            name: userData.name,
            rol: userData.rol,
            email: userData.email,
            profits: updateUserData.profits + parseInt(updateProfits)
        }
        
        setUpdateUserData(userDataUpdated)
        console.log(userDataUpdated)
        try {
            await axiosClient.put(`/apuesta/usuario/${betId}/${userId}`);
            await axiosClient.put(`/users/${userId}`, updateUserData)
            setNotification('Apuesta confirmada correctamente');
        } catch (error) {
            setNotification("Error al confirmar la apuesta:", error);
        }
    }
    return (
        <>
            <div>
                {betMatch.map(b => {
                    const username = users.find(u => u.id === b.id_user)
                    const bet = bets.find(bet => bet.id === b.id_bet)
                    return (
                        <>
                            <span key={b.betId}>{username.name}</span> /
                            <span>{bet.match}</span> /
                            <span>{b.amount}</span> /
                            <span>{parseFloat(b.selected_option)}</span> /
                            <button className="btn-add" 
                            onClick={() => onSubmit(parseInt(b.id_bet), 
                            parseInt(b.id_user),
                            parseFloat(b.selected_option), 
                            parseInt(b.amount))}>Confirmar</button>
                            <br />
                            194514103
                        </>

                    )
                })}
            </div>
        </>
    )
}