/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react"
import axiosClient from "../axios"
import { useStateContext } from "../context/ContextProvider";

export default function TransferForm() {

    const [loading, setLoading] = useState(false);
    const [manager, setManager] = useState();
    const { setNotification, user } = useStateContext();
    const [players, setPlayers] = useState([]);
    const [team, setTeam] = useState([])


    useEffect(() => {
        //getUsers();
        setManager(user);
    }, [])

    const cargarJugadores = () => {
        getTeam();
        getPlayers();
    }
    const getTeam = () => {
        setLoading(true)
        axiosClient.get('/teams')
            .then(({ data }) => {
                setLoading(false)
                setTeam(data.data)
            })
            .catch(() => {
                setLoading(false)
            })
    }

    const getPlayers = () => {
        setLoading(true)
        axiosClient.get('/players')
            .then(({ data }) => {
                setLoading(false)
                setPlayers(data.data)
            })
            .catch(() => {
                setLoading(false)
            })
    }

    const handlerChange = (e) => {
        setTeam(e.target.value)
    }

    return (
        <>  
            <button className="btn-add" onClick={cargarJugadores}> comenzar transferencia</button>
            <select name="" id=""
                onClick={e => setTeam({ ...team, name: e.target.value })}
                onChange={handlerChange}
            >
                {
                    team.map((t, index) => {
                        return (
                            <option value={t.id} key={index}>{t.name}</option>
                        )
                    })
                }
            </select>
            {
                console.log(team)
            }
        </>
    )
}
