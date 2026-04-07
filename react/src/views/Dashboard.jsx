/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import axiosClient from "../axios";
import { useStateContext } from "../context/ContextProvider";
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const { user, setNotification } = useStateContext();
    const [teams, setTeams] = useState([]);
    const [seasonId, setSeasonId] = useState('');
    const [auctions, setAuctions] = useState([]);
    const [performedAuctionsCount, setPerformedAuctionsCount] = useState(0);
    const [executedClauses, setExecutedClauses] = useState([]);
    const [receivedClauses, setReceivedClauses] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [pendingTransfers, setPendingTransfers] = useState([]);
    const [confirmedTransfers, setConfirmedTransfers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [transfersTab, setTransfersTab] = useState('pending');

    useEffect(() => {
        fetchSeasons();
    }, []);

    useEffect(() => {
        if (!seasonId) {
            setAuctions([]);
            setPerformedAuctionsCount(0);
            setExecutedClauses([]);
            setReceivedClauses([]);
            setPendingTransfers([]);
            setConfirmedTransfers([]);
            return;
        }

        setLoading(true);
        Promise.all([
            fetchPendingTransfers(),
            fetchConfirmedTransfers(),
            fetchClausesAndTeams(),
            fetchAuctions(),
            fetchPerformedAuctionsCount()
        ]).finally(() => {
            setLoading(false);
        });
    }, [seasonId, user?.id]);

    const selectedSeasonId = Number(seasonId);

    const formatCurrency = (value) => {
        const amount = Number(value) || 0;
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const fetchSeasons = () => {
        axiosClient.get('/season')
            .then(({ data }) => {
                setSeasons(data.data || []);
            })
            .catch(error => console.log(error));
    };

    const fetchAuctions = async () => {
        try {
            const response = await axiosClient.get('/auction/last', {
                params: { id_season: selectedSeasonId }
            });

            const auctionsData = Array.isArray(response.data) ? response.data : (response.data?.data || []);

            const filtered = auctionsData.filter((auction) => {
                const creatorId = Number(auction?.creator?.id || auction?.created_by?.id || auction?.created_by);
                const auctionSeasonId = Number(auction?.id_season?.id || auction?.id_season);

                return creatorId === Number(user?.id) && auctionSeasonId === selectedSeasonId;
            });

            setAuctions(filtered);
        } catch (error) {
            console.error(error);
            setAuctions([]);
        }
    };

    const fetchPendingTransfers = async () => {
        try {
            const { data } = await axiosClient.get('/transferencia_pendiente', {
                params: { season: selectedSeasonId }
            });

            const transfersData = Array.isArray(data) ? data : (data?.data || []);
            setPendingTransfers(transfersData);
        } catch (error) {
            console.error(error);
            setPendingTransfers([]);
        }
    };

    const fetchConfirmedTransfers = async () => {
        try {
            const { data } = await axiosClient.get('/transferencia_confirmada', {
                params: { season: selectedSeasonId }
            });

            const transfersData = Array.isArray(data) ? data : (data?.data || []);
            setConfirmedTransfers(transfersData);
        } catch (error) {
            console.error(error);
            setConfirmedTransfers([]);
        }
    };

    const fetchPerformedAuctionsCount = async () => {
        try {
            const response = await axiosClient.get('/auctions', {
                params: {
                    all: true,
                    season: selectedSeasonId,
                }
            });

            const auctionsData = response.data?.data || [];

            const count = auctionsData.filter((auction) => {
                const createdById = Number(auction?.created_by?.id || auction?.created_by);
                const auctionedById = Number(auction?.auctioned_by?.id || auction?.auctioned_by);
                return createdById === Number(user?.id) || auctionedById === Number(user?.id);
            }).length;

            setPerformedAuctionsCount(count);
        } catch (error) {
            console.error(error);
            setPerformedAuctionsCount(0);
        }
    };

    const fetchClausesAndTeams = async () => {
        try {
            const [teamsResponse, rescissionResponse] = await Promise.all([
                axiosClient.get('/teams?all=true'),
                axiosClient.get('/clausula_rescision', {
                    params: { all: true, season: selectedSeasonId }
                })
            ]);

            const allTeams = teamsResponse.data?.data || [];
            const teamFilter = allTeams.filter((t) => t.division === 'Primera' || t.division === 'Segunda');
            setTeams(teamFilter);

            const rescissionsData = rescissionResponse.data?.data || [];

            const filteredExecutedClauses = rescissionsData.filter((clause) => {
                const clauseSeasonId = Number(clause?.id_season?.id || clause?.id_season);
                const clauseCreatorId = Number(clause?.created_by?.id || clause?.created_by);
                return clause.confirmed === 'yes' && clauseCreatorId === Number(user?.id) && clauseSeasonId === selectedSeasonId;
            });

            const filteredReceivedClauses = rescissionsData.filter((clause) => {
                const clauseSeasonId = Number(clause?.id_season?.id || clause?.id_season);
                const teamOwnerId = Number(clause?.team?.user?.id || clause?.team?.id_user);
                return clause.confirmed === 'yes' && teamOwnerId === Number(user?.id) && clauseSeasonId === selectedSeasonId;
            });

            setExecutedClauses(filteredExecutedClauses);
            setReceivedClauses(filteredReceivedClauses);
        } catch (error) {
            console.error(error);
            setTeams([]);
            setExecutedClauses([]);
            setReceivedClauses([]);
        }
    };

    const confirmTransfer = (transferId) => {
        axiosClient.post(`/transferencia_confirmada/${transferId}`)
            .then(({ data }) => {
                setNotification(data.message);
                fetchPendingTransfers();
            })
            .catch(error => {
                console.error(error);
            });
    };

    const totalSpent = auctions.reduce((acc, auction) => acc + (Number(auction.amount) || 0), 0)
        + executedClauses.reduce((acc, clause) => acc + (Number(clause.total_value) || 0), 0)
        + pendingTransfers
            .filter((transfer) => Number(transfer.buy_by) === Number(user?.id))
            .reduce((acc, transfer) => acc + (Number(transfer.budget) || 0), 0);

    const teamNameById = teams.reduce((acc, team) => {
        acc[team.id] = team.name;
        return acc;
    }, {});

    const auctionsByPlayer = auctions.reduce((acc, auction) => {
        const playerName = auction.player?.name || 'Sin jugador';
        if (!acc[playerName]) {
            acc[playerName] = [];
        }
        acc[playerName].push(auction);
        return acc;
    }, {});


    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 animate-fade-in-down pb-20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-700 shadow-xl">
                <div>
                    <h1 className="font-black text-2xl sm:text-3xl text-white uppercase tracking-wider">Dashboard de temporada</h1>
                    <p className="text-slate-400 mt-1">Resumen de movimientos, subastas y clausulas pendientes</p>
                </div>

                <div className="w-full md:w-80">
                    <label className="block text-sm font-semibold text-slate-200 mb-2">Temporada</label>
                    <select
                        value={seasonId}
                        className="w-full p-3 border border-slate-600 rounded-xl bg-slate-950/80 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        onChange={e => setSeasonId(e.target.value)}
                    >
                        <option value="">Seleccione una temporada</option>
                        {seasons.map(season => (
                            <option key={season.id} value={season.id}>
                                {season.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {!seasonId && (
                <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-8 text-center text-slate-300 font-medium shadow-lg">
                    Seleccione una temporada para visualizar informacion del dashboard.
                </div>
            )}

            {seasonId && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-5 shadow-lg">
                            <p className="text-slate-400 text-xs uppercase tracking-widest">Transferencias pendientes</p>
                            <p className="text-2xl font-black text-white mt-2">{pendingTransfers.length}</p>
                        </div>
                        <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-5 shadow-lg">
                            <p className="text-slate-400 text-xs uppercase tracking-widest">Subastas realizadas</p>
                            <p className="text-2xl font-black text-white mt-2">{performedAuctionsCount}</p>
                        </div>
                        <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-5 shadow-lg">
                            <p className="text-slate-400 text-xs uppercase tracking-widest">Clausulas ejecutadas</p>
                            <p className="text-2xl font-black text-white mt-2">{executedClauses.length}</p>
                        </div>
                        <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-5 shadow-lg">
                            <p className="text-slate-400 text-xs uppercase tracking-widest">Comprometido total</p>
                            <p className="text-xl font-black text-emerald-400 mt-2">{formatCurrency(totalSpent)}</p>
                        </div>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-700 rounded-2xl shadow-xl overflow-hidden mb-6">
                        <div className="px-5 py-4 border-b border-slate-700">
                            <h2 className="text-lg font-bold text-white">Subastas activas del usuario por jugador</h2>
                        </div>
                        <div className="p-5">
                            {auctions.length === 0 ? (
                                <p className="text-slate-400">No hay subastas activas para esta temporada.</p>
                            ) : (
                                <div className="space-y-4">
                                    {Object.entries(auctionsByPlayer).map(([playerName, playerAuctions]) => (
                                        <div key={playerName} className="bg-slate-800/70 border border-slate-700 rounded-lg p-3">
                                            <h3 className="font-bold text-white mb-2 text-sm flex items-center gap-2">
                                                ⚽ {playerName}
                                                <span className="bg-slate-700 px-2 py-0.5 rounded text-xs text-slate-300">{playerAuctions.length}</span>
                                            </h3>
                                            <ul className="space-y-1.5 ml-2">
                                                {playerAuctions.map(auction => (
                                                    <li key={auction.id} className="text-slate-300 text-xs bg-slate-950/50 border border-slate-700/50 rounded px-2 py-1.5">
                                                        <span className="font-semibold">Última oferta:</span> {formatCurrency(auction.amount)}
                                                        {auction.season && <span className="text-slate-500 ml-2">({auction.season.name || 'Temporada'})</span>}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-700 rounded-2xl shadow-xl overflow-hidden mb-6">
                        <div className="px-5 py-4 border-b border-slate-700">
                            <h2 className="text-lg font-bold text-white">Clausulas ejecutadas por el usuario</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left text-slate-200">
                                <thead className="bg-slate-950 text-slate-400 uppercase text-xs tracking-wider">
                                    <tr>
                                        <th className="py-3 px-4">ID</th>
                                        <th className="py-3 px-4">Jugador</th>
                                        <th className="py-3 px-4">Equipo origen</th>
                                        <th className="py-3 px-4">Valor</th>
                                        <th className="py-3 px-4">Accion</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {executedClauses.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="py-6 px-4 text-center text-slate-400">Sin clausulas ejecutadas.</td>
                                        </tr>
                                    )}
                                    {executedClauses.map((clause) => {
                                        const teamId = clause?.id_team?.id || clause?.id_team;
                                        const teamNameToShow = clause?.id_team?.name || teamNameById[teamId] || 'Sin equipo';
                                        const playerId = clause?.id_player?.id || clause?.id_player;

                                        return (
                                            <tr key={clause.id} className="hover:bg-slate-800/70 transition-colors">
                                                <td className="py-3 px-4">{clause.id}</td>
                                                <td className="py-3 px-4">{clause.name || clause?.id_player?.name || 'Sin jugador'}</td>
                                                <td className="py-3 px-4">{teamNameToShow}</td>
                                                <td className="py-3 px-4">{formatCurrency(clause.total_value)}</td>
                                                <td className="py-3 px-4">
                                                    {playerId ? (
                                                        <Link className="text-blue-400 hover:text-blue-300 font-semibold" to={`/app/offers/${playerId}`}>
                                                            Ver ofertas
                                                        </Link>
                                                    ) : (
                                                        <span className="text-slate-500">Sin acciones</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-700 rounded-2xl shadow-xl overflow-hidden mb-6">
                        <div className="px-5 py-4 border-b border-slate-700">
                            <h2 className="text-lg font-bold text-white">Clausulas recibidas por el equipo</h2>
                        </div>
                        <div className="p-5">
                            {receivedClauses.length === 0 ? (
                                <p className="text-slate-400">No hay clausulas recibidas en esta temporada.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {receivedClauses.map(clause => (
                                        <li key={clause.id} className="text-slate-200 text-sm bg-slate-800/70 border border-slate-700 rounded-lg px-3 py-2">
                                            Jugador: {clause.name || clause?.id_player?.name} | Equipo: {clause?.id_team?.name || 'Sin equipo'} | Valor: {formatCurrency(clause.total_value)}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">Transferencias</h2>
                            {loading && <span className="text-xs text-slate-400">Actualizando...</span>}
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-slate-700">
                            <button
                                onClick={() => setTransfersTab('pending')}
                                className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
                                    transfersTab === 'pending'
                                        ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-400'
                                        : 'text-slate-400 hover:text-slate-300'
                                }`}
                            >
                                Pendientes ({pendingTransfers.length})
                            </button>
                            <button
                                onClick={() => setTransfersTab('confirmed')}
                                className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
                                    transfersTab === 'confirmed'
                                        ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400'
                                        : 'text-slate-400 hover:text-slate-300'
                                }`}
                            >
                                Confirmadas ({confirmedTransfers.length})
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left text-slate-200">
                                <thead className="bg-slate-950 text-slate-400 uppercase text-xs tracking-wider">
                                    <tr>
                                        <th className="py-3 px-4">N</th>
                                        <th className="py-3 px-4">Jugadores</th>
                                        <th className="py-3 px-4">Desde</th>
                                        <th className="py-3 px-4">Hasta</th>
                                        <th className="py-3 px-4">Monto</th>
                                        <th className="py-3 px-4">Accion</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {transfersTab === 'pending' && (
                                        <>
                                            {pendingTransfers.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" className="py-6 px-4 text-center text-slate-400">Sin transferencias pendientes.</td>
                                                </tr>
                                            )}
                                            {pendingTransfers.map((transfer) => {
                                                const teamNameToShow = teamNameById[transfer.id_team_to] || 'Sin equipo';
                                                const teamNameToShowFrom = teamNameById[transfer.id_team_from] || 'Sin equipo';

                                                return (
                                                    <tr key={transfer.id} className="hover:bg-slate-800/70 transition-colors">
                                                        <td className="py-3 px-4">{transfer.id}</td>
                                                        <td className="py-3 px-4">{transfer.transferred_players}</td>
                                                        <td className="py-3 px-4">{teamNameToShowFrom}</td>
                                                        <td className="py-3 px-4">{teamNameToShow}</td>
                                                        <td className="py-3 px-4">{formatCurrency(transfer.budget)}</td>
                                                        <td className="py-3 px-4">
                                                            <button
                                                                className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 transition text-white font-semibold text-sm"
                                                                onClick={() => confirmTransfer(transfer.id)}
                                                            >
                                                                Confirmar
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </>
                                    )}
                                    {transfersTab === 'confirmed' && (
                                        <>
                                            {confirmedTransfers.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" className="py-6 px-4 text-center text-slate-400">Sin transferencias confirmadas.</td>
                                                </tr>
                                            )}
                                            {confirmedTransfers.map((transfer) => {
                                                const teamNameToShow = teamNameById[transfer.id_team_to] || 'Sin equipo';
                                                const teamNameToShowFrom = teamNameById[transfer.id_team_from] || 'Sin equipo';
                                                const confirmerName = transfer.confirmer?.name || 'Usuario desconocido';

                                                return (
                                                    <tr key={transfer.id} className="hover:bg-slate-800/70 transition-colors bg-slate-800/20">
                                                        <td className="py-3 px-4">{transfer.id}</td>
                                                        <td className="py-3 px-4">{transfer.transferred_players}</td>
                                                        <td className="py-3 px-4">{teamNameToShowFrom}</td>
                                                        <td className="py-3 px-4">{teamNameToShow}</td>
                                                        <td className="py-3 px-4 text-emerald-400 font-semibold">{formatCurrency(transfer.budget)}</td>
                                                        <td className="py-3 px-4">
                                                            <span className="text-xs text-emerald-300 bg-emerald-900/30 px-2 py-1 rounded">
                                                                ✓ Confirmado por {confirmerName}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}


