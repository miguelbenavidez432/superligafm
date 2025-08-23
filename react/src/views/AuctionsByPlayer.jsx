/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
// import { useEffect, useState } from "react";
// import axiosClient from "../axios";
// import { useParams, useNavigate } from "react-router-dom";
// import { useStateContext } from "../context/ContextProvider";


// export default function PlayerAuctions() {

//     const { id } = useParams();
//     const [name, setName] = useState([]);
//     const [auctions, setAuctions] = useState([]);
//     const [newBid, setNewBid] = useState(0);
//     const [teams, setTeams] = useState([]);
//     const navigate = useNavigate();
//     const { user, setNotification } = useStateContext();


//     useEffect(() => {
//         getAuctionsByPlayer();
//         getTeam();
//     }, []);

//     const getTeam = async () => {
//         await axiosClient.get('/teams?all=true')
//             .then(({ data }) => {
//                 const teamFilter = data.data.filter((t) => t.division === 'Primera' || t.division === 'Segunda')
//                 setTeams(teamFilter)
//             })
//             .catch(() => {
//                 setLoading(false)
//             })
//     }

//     const getAuctionsByPlayer = async () => {
//         try {
//             const response = await axiosClient.get(`/auctions/player/${id}`);
//             setAuctions(response.data);
//             if (response.data.length > 0) {
//                 setName(response.data[0].player.name);
//             }
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     const handleNewBidSubmit = async (e) => {
//         e.preventDefault();
//         const lastAuction = auctions[0];

//         if (!lastAuction) {
//             alert('No hay subastas disponibles para este jugador.');
//             return;
//         }

//         if (newBid < (lastAuction.amount + 1000000)) {
//             alert('La oferta debe ser mayor que la oferta anterior.');
//             return;
//         }

//         const updatedAuctionData = {
//             id_player: parseInt(id),
//             id_team: lastAuction.id_team,
//             amount: newBid,
//             created_by: user.id,
//             auctioned_by: user.id,
//             status: 'active',
//         };

//         try {
//             const response = await axiosClient.post('/auctions', updatedAuctionData);
//             setNotification('Subasta creada exitosamente');

//             const auctionCreatedTime = new Date(response.data.created_at).getTime();
//             const endTime = auctionCreatedTime + (12 * 60 * 60 * 1000);
//             setAuctionEndTime(endTime);

//             localStorage.setItem('auctionEndTime', endTime);

//             setNewBid(0);
//             getAuctionsByPlayer();
//         } catch (error) {
//             if (error.response && error.response.data.message) {
//                 setNotification(error.response.data.message);
//             } else {
//                 setNotification("Error al crear la subasta: " + error.response.data.error);
//                 const response = error.response;
//                 if (response && response.status === 422) {
//                     setErrors(response.data.errors);
//                 }
//             }
//             console.error(error);
//         }
//     };

//     const formatDate = (dateString) => {
//         const options = {
//             year: 'numeric',
//             month: '2-digit',
//             day: '2-digit',
//             hour: '2-digit',
//             minute: '2-digit',
//             second: '2-digit',
//             hour12: false,
//         };
//         const date = new Date(dateString);
//         return date.toLocaleString('es-ES', options);
//     };

//     const confirmAuction = async (auctionId, id_player, id_auctioned, id_team) => {

//         try {
//             const response = await axiosClient.post(`/auction/confirm/${auctionId}`, {
//                 id_team,
//                 id_player,
//                 id_auctioned,
//             });

//             if (response.status === 200) {
//                 alert('Subasta confirmada y jugador transferido.');
//                 getAuctionsByPlayer();
//                 navigate('/subastas');
//             } else {
//                 alert('Error al confirmar la subasta.');
//             }
//         } catch (error) {
//             console.error(error);
//             alert('Error al confirmar la subasta.');
//         }
//     };

//     return (
//         <div className="player-auctions">
//             {name ? `Subastas del jugador: ${name}` : 'Cargando nombre del jugador...'}
//             <ul>
//                 {auctions.map(auction => {
//                     const id_auctioner = auction.auctioneer && auction.auctioneer.id
//                     const filteredTeam = teams.find(team => team.user && team.user.id == id_auctioner)
//                     const id_team = filteredTeam ? filteredTeam.id : ''
//                     return (
//                         <li key={auction.id}>
//                             <strong>{auction.amount}</strong> - Subastado por: {auction.auctioneer && auction.auctioneer.name} - Hora: {formatDate(auction.created_at)}<strong> </strong>
//                             {user.rol === 'Admin' && (
//                                 <button
//                                     onClick={() => confirmAuction(auction.id, auction.player && auction.player.id, auction.auctioneer && auction.auctioneer.id, id_team)}
//                                     className="btn-add mr-2 mb-1">
//                                     Confirmar Ganador
//                                 </button>
//                             )}
//                         </li>
//                     )
//                 })}
//             </ul>

//             <form onSubmit={handleNewBidSubmit}>
//                 <label htmlFor="bid">Nueva oferta:</label>
//                 <input
//                     type="number"
//                     min={auctions.length ? auctions[0].amount + 1000000 : 0}
//                     value={newBid}
//                     onChange={(e) => setNewBid(parseInt(e.target.value))}
//                 />
//                 <button className="btn-add" type="submit">Enviar Oferta</button>
//             </form>
//         </div>
//     );
// }
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../axios";
import { useStateContext } from "../context/ContextProvider";
import { el } from "date-fns/locale";

const PlayerAuctions = () => {
    const { id } = useParams();
    const [name, setName] = useState([]);
    const [auctions, setAuctions] = useState([]);
    const [newBid, setNewBid] = useState(0);
    const [teams, setTeams] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState('');
    const navigate = useNavigate();
    const { user, setNotification } = useStateContext();

    useEffect(() => {
        getSeasons();
        getAuctionsByPlayer();
        getTeam();
    }, []);

    useEffect(() => {
        getAuctionsByPlayer();
    }, [selectedSeason]);

    const getSeasons = async () => {
        await axiosClient.get('/season')
            .then(({ data }) => {
                setSeasons(data.data);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const getTeam = async () => {
        await axiosClient.get('/teams?all=true')
            .then(({ data }) => {
                const teamFilter = data.data.filter((t) => t.division === 'Primera' || t.division === 'Segunda');
                setTeams(teamFilter);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const getAuctionsByPlayer = async () => {
        try {
            const response = await axiosClient.get(`/auctions/player/${id}`, {
                params: {
                    season: selectedSeason
                }
            });
            if (response) {
                setAuctions(response.data);
            }
            else {
                const fetchPlayers = () => {
                    setLoading(true);
                    axiosClient.get('/players?all=true')
                        .then(({ data }) => {
                            setLoading(false);
                            const filteredPlayer = data.data.find(player => player.id === parseInt(id));
                            if (filteredPlayer) {
                                setName({
                                    ...filteredPlayer,
                                    name: filteredPlayer.name
                                });
                            } else {
                                console.log('Jugador no encontrado');
                            }
                            getTeam();
                        })
                        .catch(() => {
                            setLoading(false);
                            console.log('Error al obtener los jugadores');
                        });
                };
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSeasonChange = (e) => {
        setSelectedSeason(e.target.value);
    };

    const handleNewBidSubmit = async (e) => {
        e.preventDefault();

        const lastAuction = auctions[auctions.length - 1];
        if (!lastAuction) {
            alert('No hay subastas disponibles para este jugador.');
            return;
        }

        if (newBid < (lastAuction.amount + 1000000)) {
            alert('La oferta debe ser mayor que la oferta anterior.');
            return;
        }

        const updatedAuctionData = {
            id_player: parseInt(id),
            id_team: lastAuction.id_team,
            amount: newBid,
            created_by: user.id,
            auctioned_by: user.id,
            status: 'active',
            id_season: 58,
        };

        try {
            const response = await axiosClient.post('/auctions', updatedAuctionData);
            setNotification('Subasta creada exitosamente');

            const auctionCreatedTime = new Date(response.data.created_at).getTime();
            const endTime = auctionCreatedTime + (12 * 60 * 60 * 1000);
            setAuctionEndTime(endTime);

            localStorage.setItem('auctionEndTime', endTime);

            setNewBid(0);
            getAuctionsByPlayer();
        } catch (error) {
            if (error.response && error.response.data.message) {
                setNotification(error.response.data.message);
            } else {
                setNotification("Error al crear la subasta: " + error.response.data.error);
                const response = error.response;
                if (response && response.status === 422) {
                    setErrors(response.data.errors);
                }
            }
            console.error(error);
        }
    };

    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        };
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', options);
    };

    const confirmAuction = async (auctionId, id_player, id_auctioned, id_team) => {
        try {
            const response = await axiosClient.post(`/auction/confirm/${auctionId}`, {
                id_team,
                id_player,
                id_auctioned,
            });

            if (response.status === 200) {
                alert('Subasta confirmada y jugador transferido.');
                getAuctionsByPlayer();
                navigate('/subastas');
            } else {
                alert('Error al confirmar la subasta.');
            }
        } catch (error) {
            console.error(error);
            alert('Error al confirmar la subasta.');
        }
    };

    return (
        <div className="player-auctions p-6 bg-gray-100 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">
                {name ? `Subastas del jugador: ${name}` : 'Cargando nombre del jugador...'}
            </h1>
            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Temporada:</label>
                <select
                    value={selectedSeason}
                    onChange={handleSeasonChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Todas las temporadas</option>
                    {seasons.map(season => (
                        <option key={season.id} value={season.id}>{season.name}</option>
                    ))}
                </select>
            </div>
            <ul className="space-y-4">
                {auctions.map(auction => {
                    const id_auctioner = auction.auctioneer && auction.auctioneer.id;
                    const filteredTeam = teams.find(team => team.user && team.user.id == id_auctioner);
                    const id_team = filteredTeam ? filteredTeam.id : '';
                    return (
                        <li key={auction.id} className="p-4 bg-white rounded-lg shadow-md">
                            <p className="text-lg font-semibold text-gray-800">
                                <strong>{auction.amount}</strong> - Subastado por: {auction.auctioneer && auction.auctioneer.name}
                            </p>
                            <p className="text-sm text-gray-600">Hora: {formatDate(auction.created_at)}</p>
                            {user.rol === 'Admin' && (
                                <button
                                    onClick={() => confirmAuction(auction.id, auction.player && auction.player.id, auction.auctioneer && auction.auctioneer.id, id_team)}
                                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    Confirmar Ganador
                                </button>
                            )}
                        </li>
                    );
                })}
            </ul>

            <form onSubmit={handleNewBidSubmit} className="mt-6">
                <label htmlFor="bid" className="block text-gray-700 font-medium mb-2">Nueva oferta:</label>
                <input
                    type="number"
                    min={auctions.length ? auctions[0].amount + 1000000 : 0}
                    value={newBid}
                    onChange={(e) => setNewBid(parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    className="mt-4 px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                    type="submit"
                >
                    Enviar Oferta
                </button>
            </form>
        </div>
    );
};

export default PlayerAuctions;
