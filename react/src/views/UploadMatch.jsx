/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import axiosClient from '../axios';
import { useMatchData } from '../hooks/useMatchData';
import { useOcrProcessor } from '../hooks/useOcrProcessor';

export default function UploadMatch() {
    const matchData = useMatchData();
    const ocrProcessor = useOcrProcessor();
    const [outcomeType, setOutcomeType] = useState('normal');
    const [penalties, setPenalties] = useState({ home: 0, away: 0 });

    useEffect(() => {
        if (ocrProcessor.statusMessage) {
            const timer = setTimeout(() => ocrProcessor.setStatusMessage(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [ocrProcessor.statusMessage]);

    const handleProcessClick = async () => {
        if (!matchData.selectedHomeTeam || !matchData.selectedAwayTeam || !matchData.selectedTournament || !matchData.stage) {
            alert("Completa todos los datos del partido y sube las imágenes.");
            return;
        }
        try {
            await ocrProcessor.processImages(matchData.selectedHomeTeam, matchData.selectedAwayTeam);
        } catch (error) {
            alert("Hubo un error al procesar las imágenes con IA.");
        }
    };

    const handleSaveMatch = async () => {
        if (!confirm("¿Estás seguro que los datos son correctos? Se guardará el partido y se actualizará la tabla de posiciones.")) return;

        try {
            const formData = new FormData();

            formData.append('tournament_id', matchData.selectedTournament);
            formData.append('home_team_id', matchData.selectedHomeTeam);
            formData.append('away_team_id', matchData.selectedAwayTeam);
            formData.append('stage', matchData.stage);
            formData.append('outcome_type', outcomeType);
            formData.append('score_home', ocrProcessor.mergedData.score.home);
            formData.append('score_away', ocrProcessor.mergedData.score.away);

            if (outcomeType === 'penalties') {
                formData.append('penalties_home', penalties.home);
                formData.append('penalties_away', penalties.away);
            }

            const homeNameOficial = homeTeamName.toLowerCase();
            const awayNameOficial = awayTeamName.toLowerCase();

            const playersWithTeamId = ocrProcessor.mergedData.players.map(player => {
                const iaTeamName = (player.team_name || '').toLowerCase();

                let assignedTeamId = null;

                if (iaTeamName.includes(homeNameOficial) || homeNameOficial.includes(iaTeamName)) {
                    assignedTeamId = matchData.selectedHomeTeam;
                }
                else if (iaTeamName.includes(awayNameOficial) || awayNameOficial.includes(iaTeamName)) {
                    assignedTeamId = matchData.selectedAwayTeam;
                }

                return {
                    ...player,
                    team_id: assignedTeamId
                };
            });

            formData.append('players', JSON.stringify(playersWithTeamId));

            if (ocrProcessor.files && ocrProcessor.files.length > 0) {
                ocrProcessor.files.forEach((file) => {
                    formData.append('images[]', file);
                });
            }

            const response = await axiosClient.post('/games/store-from-ocr', formData);

            alert("¡Partido guardado exitosamente!");
            window.location.href = '/app/partidos';

        } catch (error) {
            console.error("Error guardando el partido:", error);
            alert("Hubo un error al guardar el partido: " + (error.response?.data?.message || error.message));
        }
    };

    const handleReset = () => {
        if (confirm("¿Deseas limpiar las imágenes y los resultados actuales?")) {
            ocrProcessor.setFiles([]);
            ocrProcessor.setMergedData({ score: { home: 0, away: 0 }, statistics: [], players: [] });
            document.getElementById('file-input').value = "";
        }
    };

    const homeTeamName = matchData.teams.find(t => t.id == matchData.selectedHomeTeam)?.name || 'Local';
    const awayTeamName = matchData.teams.find(t => t.id == matchData.selectedAwayTeam)?.name || 'Visitante';

    if (matchData.loadingData) return (
        <div className="flex justify-center items-center py-20">
            <p className="font-bold text-gray-800 animate-pulse text-xl">Cargando datos del sistema...</p>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in-down">

            {/* ENCABEZADO */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white bg-slate-900/80 backdrop-blur-md border border-slate-700 px-6 py-4 rounded-xl shadow-lg text-center">
                    Registrar Partido con captura de pantalla
                </h1>
            </div>

            {/* SECCIÓN 1: Selección de Torneo y Equipos */}
            <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700 text-white rounded-xl shadow-xl p-6 mb-6">
                <div className="mb-6">
                    <label className="block text-sm mb-2 font-bold text-blue-400 uppercase tracking-wider">🏆 Torneo</label>
                    <select
                        className="w-full p-3 rounded-lg text-white bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                        value={matchData.selectedTournament}
                        onChange={(e) => matchData.setSelectedTournament(e.target.value)}
                    >
                        <option value="">Seleccione el torneo...</option>
                        {matchData.tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>

                <div className="flex flex-col md:flex-row gap-6 justify-center items-center mt-4">
                    <div className="flex-1 w-full">
                        <label className="block text-sm mb-2 font-bold text-gray-300 uppercase tracking-wider">🏠 Equipo Local</label>
                        <select
                            className="w-full p-3 rounded-lg text-white bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                            value={matchData.selectedHomeTeam}
                            onChange={(e) => matchData.setSelectedHomeTeam(e.target.value)}
                        >
                            <option value="">Seleccione...</option>
                            {matchData.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>

                    <div className="text-3xl font-black text-slate-500 px-4 italic">VS</div>

                    <div className="flex-1 w-full">
                        <label className="block text-sm mb-2 font-bold text-gray-300 uppercase tracking-wider">✈️ Equipo Visitante</label>
                        <select
                            className="w-full p-3 rounded-lg text-white bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                            value={matchData.selectedAwayTeam}
                            onChange={(e) => matchData.setSelectedAwayTeam(e.target.value)}
                        >
                            <option value="">Seleccione...</option>
                            {matchData.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="mt-6">
                    <label className="block text-sm mb-2 font-bold text-gray-300 uppercase tracking-wider">📅 Fecha o Ronda</label>
                    <input
                        type="number"
                        placeholder="Ej: 1, 2, 14..."
                        className="w-full md:w-1/3 p-3 rounded-lg text-white bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                        value={matchData.stage}
                        onChange={(e) => matchData.setStage(e.target.value)}
                    />
                </div>
            </div>

            {/* SECCIÓN 2: Tipo de Definición */}
            <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700 text-white rounded-xl shadow-xl p-6 mb-6">
                <label className="block text-sm mb-3 font-bold text-purple-400 uppercase tracking-wider">⚙️ Tipo de Definición del Partido</label>
                <select
                    className="w-full p-3 rounded-lg text-white bg-slate-800 border border-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors font-medium"
                    value={outcomeType}
                    onChange={(e) => setOutcomeType(e.target.value)}
                >
                    <option value="normal">Normal (Carga con imagen o Manual)</option>
                    <option value="penalties">Definición por Penales</option>
                    <option value="administrative">Victoria por Escritorio</option>
                    <option value="unplayed">Partido No Jugado (Suma PJ, pero 0 puntos)</option>
                </select>

                {/* PENALES */}
                {outcomeType === 'penalties' && (
                    <div className="flex gap-6 items-center justify-center bg-slate-800/80 border border-slate-600 p-6 rounded-xl mt-6 shadow-inner">
                        <div className="flex flex-col items-center">
                            <label className="text-sm font-bold text-blue-300 mb-2">Penales Local</label>
                            <input
                                type="number" min="0"
                                className="w-24 p-3 text-center text-2xl font-black text-white bg-slate-950 border border-slate-600 rounded-lg focus:border-blue-500 outline-none"
                                value={penalties.home}
                                onChange={(e) => setPenalties({ ...penalties, home: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <span className="text-4xl font-black text-slate-600">-</span>
                        <div className="flex flex-col items-center">
                            <label className="text-sm font-bold text-blue-300 mb-2">Penales Visitante</label>
                            <input
                                type="number" min="0"
                                className="w-24 p-3 text-center text-2xl font-black text-white bg-slate-950 border border-slate-600 rounded-lg focus:border-blue-500 outline-none"
                                value={penalties.away}
                                onChange={(e) => setPenalties({ ...penalties, away: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                )}

                {/* ESCRITORIO */}
                {outcomeType === 'administrative' && (
                    <div className="flex gap-6 items-center justify-center bg-slate-800/80 border border-slate-600 p-6 rounded-xl mt-6 shadow-inner">
                        <div className="flex flex-col items-center">
                            <label className="text-sm font-bold text-red-400 mb-2">Goles Local</label>
                            <input
                                type="number" min="0"
                                className="w-24 p-3 text-center text-2xl font-black text-white bg-slate-950 border border-slate-600 rounded-lg focus:border-red-500 outline-none"
                                value={ocrProcessor.mergedData.score.home}
                                onChange={(e) => ocrProcessor.setMergedData(prev => ({
                                    ...prev,
                                    score: { ...prev.score, home: parseInt(e.target.value) || 0 }
                                }))}
                            />
                        </div>
                        <span className="text-4xl font-black text-slate-600">-</span>
                        <div className="flex flex-col items-center">
                            <label className="text-sm font-bold text-red-400 mb-2">Goles Visitante</label>
                            <input
                                type="number" min="0"
                                className="w-24 p-3 text-center text-2xl font-black text-white bg-slate-950 border border-slate-600 rounded-lg focus:border-red-500 outline-none"
                                value={ocrProcessor.mergedData.score.away}
                                onChange={(e) => ocrProcessor.setMergedData(prev => ({
                                    ...prev,
                                    score: { ...prev.score, away: parseInt(e.target.value) || 0 }
                                }))}
                            />
                        </div>
                    </div>
                )}
            </div>

            {ocrProcessor.statusMessage && (
                <div className={`p-4 rounded-xl mb-6 text-center font-bold shadow-lg backdrop-blur-md border ${
                    ocrProcessor.statusMessage.includes('✅')
                    ? 'bg-green-900/80 text-green-300 border-green-600'
                    : 'bg-red-900/80 text-red-200 border-red-600'
                }`}>
                    {ocrProcessor.statusMessage}
                </div>
            )}


            {/* SECCIÓN 3: Carga de Imágenes */}
            <div className={`bg-slate-900/70 backdrop-blur-md border border-slate-700 text-white rounded-xl shadow-xl p-6 mb-8 space-y-4 ${(!matchData.selectedHomeTeam || !matchData.selectedAwayTeam || !matchData.selectedTournament) ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="mb-2">
                    <label className="block text-sm font-bold mb-3 text-green-400 uppercase tracking-wider">📸 Subir Capturas de Pantalla</label>
                    <input
                        id="file-input"
                        type="file" multiple accept="image/*"
                        onChange={(e) => ocrProcessor.setFiles(Array.from(e.target.files))}
                        className="block w-full text-sm text-slate-300
                        file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0
                        file:text-sm file:font-bold file:bg-slate-800 file:text-white
                        hover:file:bg-slate-700 cursor-pointer file:transition-colors
                        border border-slate-700 rounded-lg bg-slate-900"
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button
                        onClick={handleProcessClick}
                        disabled={ocrProcessor.loadingOcr || ocrProcessor.files.length === 0}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 px-6 py-3.5 rounded-lg font-bold transition-colors shadow-lg flex items-center justify-center"
                    >
                        {ocrProcessor.loadingOcr ? (
                            <>
                                <div className="loader mr-3 border-2 border-white/20 border-t-white w-5 h-5 rounded-full animate-spin"></div>
                                <span>IA Analizando... (puede tardar)</span>
                            </>
                        ) : (
                            `🔍 Procesar ${ocrProcessor.files.length > 0 ? ocrProcessor.files.length : '0'} imagen(es)`
                        )}
                    </button>

                    {(ocrProcessor.files.length > 0 || ocrProcessor.mergedData.players.length > 0) && (
                        <button
                            onClick={handleReset}
                            className="bg-red-900/80 hover:bg-red-600 text-red-200 hover:text-white border border-red-700 px-6 py-3.5 rounded-lg font-bold transition-colors shadow-lg flex items-center justify-center"
                        >
                            🗑️ Limpiar
                        </button>
                    )}
                </div>
            </div>

            {/* SECCIÓN 4: Resultado Final */}
            {ocrProcessor.mergedData.players.length > 0 && (
                <div className="bg-slate-900/80 backdrop-blur-md text-white rounded-xl shadow-2xl p-6 mb-8 flex flex-col items-center border border-slate-700">
                    <h3 className="text-xl font-bold mb-6 text-yellow-400 uppercase tracking-widest">⚽ Marcador Final ⚽</h3>

                    <div className="flex items-center gap-4 sm:gap-10 text-3xl font-black bg-slate-950 p-6 rounded-2xl border border-slate-700 shadow-inner w-full max-w-md justify-center">
                        <div className="flex flex-col items-center w-1/3">
                            <span className="text-xs sm:text-sm mb-3 font-bold text-gray-400 uppercase tracking-wide truncate w-full text-center" title={homeTeamName}>{homeTeamName}</span>
                            <input
                                type="number" min="0"
                                className="w-16 sm:w-20 text-center p-3 rounded-xl text-white bg-slate-800 border border-slate-600 focus:border-yellow-400 outline-none shadow-md transition-colors"
                                value={ocrProcessor.mergedData.score.home}
                                onChange={(e) => ocrProcessor.setMergedData(prev => ({
                                    ...prev, score: { ...prev.score, home: parseInt(e.target.value) || 0 }
                                }))}
                            />
                        </div>

                        <div className="text-slate-600 text-4xl shrink-0">-</div>

                        <div className="flex flex-col items-center w-1/3">
                            <span className="text-xs sm:text-sm mb-3 font-bold text-gray-400 uppercase tracking-wide truncate w-full text-center" title={awayTeamName}>{awayTeamName}</span>
                            <input
                                type="number" min="0"
                                className="w-16 sm:w-20 text-center p-3 rounded-xl text-white bg-slate-800 border border-slate-600 focus:border-yellow-400 outline-none shadow-md transition-colors"
                                value={ocrProcessor.mergedData.score.away}
                                onChange={(e) => ocrProcessor.setMergedData(prev => ({
                                    ...prev, score: { ...prev.score, away: parseInt(e.target.value) || 0 }
                                }))}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* SECCIÓN 5: Tabla Editable */}
            {ocrProcessor.mergedData.players.length > 0 && (
                <div className="bg-slate-900/80 backdrop-blur-md rounded-xl overflow-hidden shadow-2xl border border-slate-700 mb-8">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-slate-300 text-sm">
                            <thead className="!bg-[#0f172a] uppercase text-xs font-bold tracking-wider border-b-2 border-slate-700">
                                <tr>
                                    <th style={{ backgroundColor: '#020617', color: '#cbd5e1' }} className="px-4 py-4 text-left border-b-2 border-slate-700 min-w-[150px]">Jugador</th>
                                    <th style={{ backgroundColor: '#020617', color: '#cbd5e1' }} className="px-3 py-4 text-center border-b-2 border-slate-700">Equipo</th>
                                    <th style={{ backgroundColor: '#020617', color: '#cbd5e1' }} className="px-2 py-4 text-center border-b-2 border-slate-700">Rating</th>
                                    <th style={{ backgroundColor: '#020617', color: '#cbd5e1' }} className="px-2 py-4 text-center border-b-2 border-slate-700 text-green-400">Goles</th>
                                    <th style={{ backgroundColor: '#020617', color: '#cbd5e1' }} className="px-2 py-4 text-center border-b-2 border-slate-700 text-blue-400">Asist.</th>
                                    <th style={{ backgroundColor: '#020617', color: '#cbd5e1' }} className="px-2 py-4 text-center border-b-2 border-slate-700 text-yellow-400">Amarillas</th>
                                    <th style={{ backgroundColor: '#020617', color: '#cbd5e1' }} className="px-2 py-4 text-center border-b-2 border-slate-700 text-red-500">Rojas</th>
                                    <th style={{ backgroundColor: '#020617', color: '#cbd5e1' }} className="px-2 py-4 text-center border-b-2 border-slate-700">Lesión</th>
                                    <th style={{ backgroundColor: '#020617', color: '#cbd5e1' }} className="px-2 py-4 text-center border-b-2 border-slate-700 text-yellow-300">MVP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {ocrProcessor.mergedData.players.map((player, index) => (
                                    <tr key={index} className="hover:bg-slate-800/80 transition-colors">
                                        <td className="px-4 py-3 font-bold text-white whitespace-nowrap">{player.player_name}</td>
                                        <td className="px-3 py-3 text-center text-slate-400 text-xs">{player.team_name}</td>
                                        <td className="px-4 py-4 text-center">
                                            <input
                                                type="number" step="0.1"
                                                value={player.rating || 0}
                                                onChange={(e) => ocrProcessor.updatePlayerStat(index, 'rating', e.target.value)}
                                                className="w-28 bg-slate-800 border border-slate-600 text-white text-center py-1 rounded focus:border-blue-500 outline-none"
                                            />
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <input
                                                type="number" min="0"
                                                value={player.goals || 0}
                                                onChange={(e) => ocrProcessor.updatePlayerStat(index, 'goals', e.target.value)}
                                                className="w-28 bg-slate-800 border border-slate-600 text-white text-center py-1 rounded focus:border-green-500 outline-none"
                                            />
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <input
                                                type="number" min="0"
                                                value={player.assists || 0}
                                                onChange={(e) => ocrProcessor.updatePlayerStat(index, 'assists', e.target.value)}
                                                className="w-28 bg-slate-800 border border-slate-600 text-white text-center py-1 rounded focus:border-blue-500 outline-none"
                                            />
                                        </td>

                                        <td className="px-4 py-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={player.amarillas > 0}
                                                onChange={(e) => ocrProcessor.updatePlayerStat(index, 'amarillas', e.target.checked ? 1 : 0)}
                                                className="w-5 h-5 accent-yellow-400 cursor-pointer rounded bg-slate-800 border-slate-600"
                                            />
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={player.rojas > 0}
                                                onChange={(e) => ocrProcessor.updatePlayerStat(index, 'rojas', e.target.checked ? 1 : 0)}
                                                className="w-5 h-5 accent-red-600 cursor-pointer rounded bg-slate-800 border-slate-600"
                                            />
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={player.is_injured}
                                                onChange={(e) => ocrProcessor.updatePlayerStat(index, 'is_injured', e.target.checked)}
                                                className="w-5 h-5 accent-red-600 cursor-pointer rounded bg-slate-800 border-slate-600"
                                            />
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={player.mvp}
                                                onChange={(e) => ocrProcessor.updatePlayerStat(index, 'mvp', e.target.checked)}
                                                className="w-5 h-5 accent-yellow-400 cursor-pointer rounded bg-slate-800 border-slate-600"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* BOTONES FINALES */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
                <button
                    onClick={() => window.location.reload()}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl font-bold border border-slate-600 transition-colors shadow-lg"
                >
                    Cancelar / Volver
                </button>
                <button
                    onClick={handleSaveMatch}
                    disabled={
                        ocrProcessor.loadingOcr ||
                        ((outcomeType === 'normal' || outcomeType === 'penalties') && ocrProcessor.mergedData.players.length === 0)
                    }
                    className={`px-10 py-4 rounded-xl font-black text-lg shadow-xl transition-all flex items-center justify-center gap-2
                    ${(ocrProcessor.loadingOcr || ((outcomeType === 'normal' || outcomeType === 'penalties') && ocrProcessor.mergedData.players.length === 0))
                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600'
                            : 'bg-green-600 hover:bg-green-500 text-white cursor-pointer border border-green-500 shadow-green-900/50 hover:-translate-y-1'
                        }`}
                >
                    {ocrProcessor.loadingOcr ? '⏳ PROCESANDO...' : '💾 GUARDAR PARTIDO'}
                </button>
            </div>
        </div>
    );
}
