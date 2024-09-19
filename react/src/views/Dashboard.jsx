/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useStateContext } from "../context/ContextProvider"
import axiosClient from "../axios";

export default function Dashboard() {

    const [team, setTeam] = useState([]);
    const [transfer, setTransfer] = useState([]);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        getTeam()
        getTransfers()
        getUsers()
    }, [])

    const cargarJugadores = () => {
        getTransfers()
    }

    const getUsers = () => {
        axiosClient.get('/users')
            .then(({ data }) => {
                setUsers(data.data);
            })
            .catch(() => {
            });
    };

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

    const getTransfers = () => {
        setLoading(true)
        axiosClient.get('/traspasos')
            .then(({ data }) => {
                setLoading(false)
                setTransfer(data.data)
            })
            .catch(() => {
                setLoading(false)
            })
    }

    return (
        <>
            <div style={{ display: 'flex', justifyContent: "space-between", alignItems: "center" }}>
                <div>Plantel</div>
                <button className="btn-add" onClick={cargarJugadores}>Cargar plantel</button>
            </div>
            <div className="card animated fadeInDown">
                <table>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>JUGADORES TRANSFERIDOS</th>
                            <th>EQUIPOS ORIGEN/DESTINO</th>
                            <th>REALIZADA POR</th>
                            <th>HORA</th>
                            <th>VALOR</th>
                        </tr>
                    </thead>
                    {loading &&
                        <tbody>
                            <tr>
                                <td colSpan="10" className="text-center">
                                    CARGANDO...
                                </td>
                            </tr>
                        </tbody>
                    }
                    {!loading &&
                        <tbody>
                            {
                                transfer && transfer.map(p => {
                                    const teamName = team.find(t => t.id === p.id_team_from);
                                    const secondTeamName = team.find(t => t.id === p.id_team_to);
                                    const teamNameToShow = teamName ? teamName.name : '';
                                    const showSecondTeamName = secondTeamName ? secondTeamName.name : ''
                                    const userCreated = users.find(u => u.id === p.created_by)
                                    const shoeUserName = userCreated ? userCreated.name : ''
                                    return (
                                        <tr key={p.id}>
                                            <td>{p.id}</td>
                                            <td>{p.transferred_players}</td>
                                            <td>{teamNameToShow + ' - ' + showSecondTeamName}</td>
                                            <td>{shoeUserName}</td>
                                            <td>{p.created_at}</td>
                                            <td>
                                                {p.budget}
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    }
                </table>
            </div >
        </>
    )
}
