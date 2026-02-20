/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// filepath: src/views/UploadMatch.jsx
import { useEffect } from 'react';
import axiosClient from '../axios';
import { useMatchData } from '../hooks/useMatchData';
import { useOcrProcessor } from '../hooks/useOcrProcessor';

export default function UploadMatch() {
    const matchData = useMatchData();
    const ocrProcessor = useOcrProcessor();

    useEffect(() => {
        if (ocrProcessor.statusMessage) {
            const timer = setTimeout(() => ocrProcessor.setStatusMessage(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [ocrProcessor.statusMessage]);

    // Función para disparar la petición a Gemini
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

    // Función para guardar el partido en Laravel
    const handleSaveMatch = async () => {
        if (!confirm("¿Estás seguro que los datos son correctos? Se guardará el partido y se actualizará la tabla de posiciones.")) return;

        try {
            const payload = {
                tournament_id: matchData.selectedTournament,
                home_team_id: matchData.selectedHomeTeam,
                away_team_id: matchData.selectedAwayTeam,
                stage: matchData.stage,
                score_home: ocrProcessor.mergedData.score.home,
                score_away: ocrProcessor.mergedData.score.away,
                statistics: ocrProcessor.mergedData.statistics,
                players: ocrProcessor.mergedData.players
            };

            const response = await axiosClient.post('/games/store-from-ocr', payload);
            alert("¡Partido guardado exitosamente!");
            // Redirigir a la vista de partidos (ajusta la ruta según tu app)
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

    if (matchData.loadingData) return <div className="text-white text-center mt-10 text-xl font-bold">Cargando datos...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center text-white">Cargar Nuevo Partido con imágenes</h2>

            {ocrProcessor.statusMessage && (
                <div className={`p-4 rounded-lg mb-4 text-center font-bold ${ocrProcessor.statusMessage.includes('✅') ? 'bg-green-600' : 'bg-blue-600'
                    }`}>
                    {ocrProcessor.statusMessage}
                </div>
            )}

            {/* SECCIÓN 1: Selección */}
            <div className="bg-slate-800 text-white rounded-lg shadow-md p-6 mb-6">
                <div className="mb-4">
                    <label className="block text-sm mb-1 font-semibold">🏆 Torneo</label>
                    <select
                        className="w-full p-2 rounded text-black bg-white"
                        value={matchData.selectedTournament}
                        onChange={(e) => matchData.setSelectedTournament(e.target.value)}
                    >
                        <option value="">Seleccione el torneo...</option>
                        {matchData.tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>

                <div className="flex gap-4 justify-center items-center mt-4">
                    <div className="flex-1">
                        <label className="block text-sm mb-1 font-semibold">🏠 Equipo Local</label>
                        <select
                            className="w-full p-2 rounded text-black bg-white"
                            value={matchData.selectedHomeTeam}
                            onChange={(e) => matchData.setSelectedHomeTeam(e.target.value)}
                        >
                            <option value="">Seleccione...</option>
                            {matchData.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div className="text-2xl font-bold text-gray-400 px-4">VS</div>
                    <div className="flex-1">
                        <label className="block text-sm mb-1 font-semibold">✈️ Equipo Visitante</label>
                        <select
                            className="w-full p-2 rounded text-black bg-white"
                            value={matchData.selectedAwayTeam}
                            onChange={(e) => matchData.setSelectedAwayTeam(e.target.value)}
                        >
                            <option value="">Seleccione...</option>
                            {matchData.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="">Fecha o Ronda</label>
                    <input
                        type="text"
                        className="w-full p-2 rounded text-black bg-white mt-2"
                        value={matchData.stage}
                        onChange={(e) => matchData.setStage(e.target.value)} />
                </div>
            </div>

            {/* SECCIÓN 2: Imágenes */}
            <div className={`text-white bg-slate-900 rounded-lg shadow-md p-6 mb-6 space-y-2 ${(!matchData.selectedHomeTeam || !matchData.selectedAwayTeam || !matchData.selectedTournament) ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">📸 Sube las capturas de pantalla</label>
                    <input
                        type="file" multiple accept="image/*"
                        onChange={(e) => ocrProcessor.setFiles(Array.from(e.target.files))}
                        className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white cursor-pointer"
                    />
                </div>

                <button
                    onClick={handleProcessClick}
                    disabled={ocrProcessor.loadingOcr || ocrProcessor.files.length === 0}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center"
                >
                    {ocrProcessor.loadingOcr ? (
                        <>
                            <div className="loader"></div>
                            <span>IA Analizando... (esto puede tardar unos minutos)</span>
                        </>
                    ) : (
                        `🔍 Procesar ${ocrProcessor.files.length} imagen(es)`
                    )}
                </button>
                {(ocrProcessor.files.length > 0 || ocrProcessor.mergedData.players.length > 0) && (
                    <button
                        onClick={handleReset}
                        className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                    >
                        🗑️ Limpiar Todo
                    </button>
                )}
            </div>

            {/* SECCIÓN 3: Tabla Editable */}
            {ocrProcessor.mergedData.players.length > 0 && (
                <div className="bg-white text-black rounded-lg overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-800 text-black">
                            <tr>
                                <th className="px-3 py-3 text-left">Jugador</th>
                                <th className="px-3 py-3 text-center">Equipo</th>
                                <th className="px-3 py-3 text-center">Rating</th>
                                <th className="px-3 py-3 text-center">Goles</th>
                                <th className="px-3 py-3 text-center">Asist.</th>
                                <th className="px-3 py-3 text-center">Amarillas</th>
                                <th className="px-3 py-3 text-center">Rojas</th>
                                <th className="px-3 py-3 text-center">Lesión</th>
                                <th className="px-3 py-3 text-center">MVP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ocrProcessor.mergedData.players.map((player, index) => (
                                <tr key={index} className="border-b hover:bg-gray-100">
                                    <td className="p-3 font-bold">{player.player_name}</td>
                                    <td className="p-3 text-gray-600">{player.team_name}</td>
                                    <td className="p-3 text-center">
                                        <input
                                            type="number" step="0.1"
                                            value={player.rating || 0}
                                            onChange={(e) => ocrProcessor.updatePlayerStat(index, 'rating', e.target.value)}
                                            className="w-16 border text-center p-1 rounded"
                                        />
                                    </td>
                                    <td className="p-3 text-center">
                                        <input
                                            type="number"
                                            value={player.goals || 0}
                                            onChange={(e) => ocrProcessor.updatePlayerStat(index, 'goals', e.target.value)}
                                            className="w-16 border text-center p-1 rounded"
                                        />
                                    </td>
                                    <td className="p-3 text-center">
                                        <input
                                            type="number"
                                            value={player.assists || 0}
                                            onChange={(e) => ocrProcessor.updatePlayerStat(index, 'assists', e.target.value)}
                                            className="w-16 border text-center p-1 rounded"
                                        />
                                    </td>
                                    {/* AMARILLAS */}
                                    <td className="px-3 py-2 text-center">
                                        <input
                                            type="checkbox"
                                            checked={player.amarillas > 0}
                                            onChange={(e) => ocrProcessor.updatePlayerStat(index, 'amarillas', e.target.checked ? 1 : 0)}
                                            className="w-5 h-5 accent-yellow-400 cursor-pointer"
                                        />
                                    </td>

                                    {/* ROJAS */}
                                    <td className="px-3 py-2 text-center">
                                        <input
                                            type="checkbox"
                                            checked={player.rojas > 0}
                                            onChange={(e) => ocrProcessor.updatePlayerStat(index, 'rojas', e.target.checked ? 1 : 0)}
                                            className="w-5 h-5 accent-red-600 cursor-pointer"
                                        />
                                    </td>

                                    {/* LESIONES */}
                                    <td className="px-3 py-2 text-center">
                                        <input
                                            type="checkbox"
                                            checked={player.is_injured}
                                            onChange={(e) => ocrProcessor.updatePlayerStat(index, 'is_injured', e.target.checked)}
                                            className="w-5 h-5 accent-red-600 cursor-pointer"
                                        />
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <input
                                            type="checkbox"
                                            checked={player.mvp}
                                            onChange={(e) => ocrProcessor.updatePlayerStat(index, 'mvp', e.target.checked)}
                                            className="w-5 h-5 accent-red-600 cursor-pointer"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {/* BOTÓN DE GUARDADO FINAL */}
            <div className="flex justify-end gap-4 p-4">
                <button onClick={() => window.location.reload()} className="bg-slate-700 px-6 py-3 rounded-lg font-bold">Cancelar</button>
                <button
                    onClick={handleSaveMatch}
                    // LÓGICA: Se deshabilita si está cargando O si la lista de jugadores está vacía
                    disabled={ocrProcessor.loadingOcr || ocrProcessor.mergedData.players.length === 0}
                    className={`px-10 py-3 rounded-lg font-black text-lg shadow-xl transition-all
                    ${(ocrProcessor.loadingOcr || ocrProcessor.mergedData.players.length === 0)
                            ? 'bg-gray-600 opacity-50 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-500 animate-pulse cursor-pointer'
                        }`}
                >
                    {ocrProcessor.loadingOcr ? '⏳ PROCESANDO...' : '💾 GUARDAR PARTIDO'}
                </button>
            </div>
        </div>
    );
}
