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

    // NUEVOS ESTADOS PARA EL FIXTURE
    const [pendingFixtures, setPendingFixtures] = useState([]);
    const [selectedFixtureId, setSelectedFixtureId] = useState(null);
    const [loadingFixtures, setLoadingFixtures] = useState(false);

    useEffect(() => {
        if (ocrProcessor.statusMessage) {
            const timer = setTimeout(() => ocrProcessor.setStatusMessage(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [ocrProcessor.statusMessage]);

    // EFECTO PARA TRAER LOS PARTIDOS PENDIENTES DEL TORNEO SELECCIONADO
    useEffect(() => {
        if (matchData.selectedTournament) {
            fetchPendingFixtures(matchData.selectedTournament);
        } else {
            setPendingFixtures([]);
            setSelectedFixtureId(null);
        }
    }, [matchData.selectedTournament]);

    const fetchPendingFixtures = async (tournamentId) => {
        setLoadingFixtures(true);
        try {
            const response = await axiosClient.get('/fixtures', {
                params: {
                    id_tournament: tournamentId,
                    status: 'pendiente' // Solo traemos los que faltan jugar
                }
            });
            // Ordenamos por fecha/jornada para que sea más fácil buscar
            const fixtures = response.data.data || [];
            fixtures.sort((a, b) => a.matchday - b.matchday);
            setPendingFixtures(fixtures);
        } catch (error) {
            console.error("Error al cargar partidos pendientes:", error);
        } finally {
            setLoadingFixtures(false);
        }
    };

    // FUNCIÓN PARA AUTO-COMPLETAR AL TOCAR UN PARTIDO DEL FIXTURE
    const handleSelectFixture = (fixture) => {
        if (selectedFixtureId === fixture.id) {
            // Si lo vuelve a tocar, lo deselecciona
            setSelectedFixtureId(null);
            matchData.setSelectedHomeTeam('');
            matchData.setSelectedAwayTeam('');
            matchData.setStage('');
        } else {
            // Auto-completar datos
            setSelectedFixtureId(fixture.id);
            matchData.setSelectedHomeTeam(fixture.home_team_id);
            matchData.setSelectedAwayTeam(fixture.away_team_id);
            matchData.setStage(fixture.matchday);
        }
    };

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

            // Adjuntamos el ID del fixture para que el backend lo marque como "jugado"
            if (selectedFixtureId) {
                formData.append('fixture_id', selectedFixtureId);
            }

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
            <p className="font-bold text-slate-400 animate-pulse text-xl tracking-wider">Cargando datos del sistema...</p>
        </div>
    );

    const handlePaste = (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        const pastedFiles = [];
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.includes('image')) {
                const file = items[i].getAsFile();
                if (file) pastedFiles.push(file);
            }
        }

        if (pastedFiles.length > 0) {
            e.preventDefault();
            ocrProcessor.setFiles(prev => [...(Array.isArray(prev) ? prev : []), ...pastedFiles]);
            ocrProcessor.setStatusMessage("✅ Imagen cargada desde portapapeles");
        }
    };

    return (
        <div
            className="p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in-down pb-20 focus:outline-none"
            onPaste={handlePaste}
            tabIndex="0"
        >

            {/* ENCABEZADO */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white bg-slate-900/80 backdrop-blur-md border border-slate-700 px-6 py-4 rounded-xl shadow-lg text-center">
                    Registrar Partido con captura de pantalla
                </h1>
            </div>

            {/* SECCIÓN 1: Selección de Torneo y Fixture */}
            <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700 text-white rounded-3xl shadow-xl p-6 sm:p-8 mb-6">

                <div className="mb-8">
                    <label className="block text-sm mb-2 font-bold text-blue-400 uppercase tracking-wider">🏆 1. Selecciona el Torneo</label>
                    <select
                        className="w-full md:w-1/2 p-3.5 rounded-xl text-white bg-slate-950 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                        value={matchData.selectedTournament}
                        onChange={(e) => {
                            matchData.setSelectedTournament(e.target.value);
                            setSelectedFixtureId(null); // Reseteamos la selección al cambiar torneo
                        }}
                    >
                        <option value="">Seleccione el torneo...</option>
                        {matchData.tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>

                {/* GRID DE PARTIDOS PENDIENTES */}
                {matchData.selectedTournament && (
                    <div className="mb-8 p-6 bg-slate-950/50 rounded-2xl border border-slate-800">
                        <label className="text-sm mb-4 font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-2">
                            <span>🗓️ 2. Elige el Partido Programado</span>
                            {loadingFixtures && <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>}
                        </label>

                        {!loadingFixtures && pendingFixtures.length === 0 ? (
                            <p className="text-slate-500 italic">No hay partidos pendientes en este torneo.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                {pendingFixtures.map(fixture => (
                                    <button
                                        key={fixture.id}
                                        type="button"
                                        onClick={() => handleSelectFixture(fixture)}
                                        className={`flex flex-col p-4 rounded-xl border text-left transition-all ${selectedFixtureId === fixture.id
                                                ? 'bg-indigo-600 border-indigo-400 shadow-lg shadow-indigo-900/50 scale-[1.02]'
                                                : 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-500'
                                            }`}
                                    >
                                        <span className={`text-[10px] font-black uppercase tracking-wider mb-2 ${selectedFixtureId === fixture.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                                            Fecha {fixture.matchday}
                                        </span>
                                        <div className="flex justify-between items-center w-full font-bold text-sm">
                                            <span className="truncate flex-1 text-right">{fixture.home_team?.name}</span>
                                            <span className={`mx-3 text-xs ${selectedFixtureId === fixture.id ? 'text-indigo-300' : 'text-slate-500'}`}>VS</span>
                                            <span className="truncate flex-1 text-left">{fixture.away_team?.name}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* SELECTORES MANUALES (Se autocompletan, pero permiten corrección) */}
                <div className="flex flex-col md:flex-row gap-6 justify-center items-center pt-4 border-t border-slate-800">
                    <div className="flex-1 w-full opacity-60 hover:opacity-100 transition-opacity">
                        <label className="block text-xs mb-2 font-bold text-slate-300 uppercase tracking-wider">🏠 Equipo Local</label>
                        <select
                            className="w-full p-3 rounded-xl text-white bg-slate-950 border border-slate-700 focus:border-blue-500 outline-none transition-colors"
                            value={matchData.selectedHomeTeam}
                            onChange={(e) => {
                                matchData.setSelectedHomeTeam(e.target.value);
                                setSelectedFixtureId(null); // Desvinculamos el fixture si lo cambian a mano
                            }}
                        >
                            <option value="">Seleccione...</option>
                            {matchData.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>

                    <div className="text-2xl font-black text-gray-300 px-2 italic">VS</div>

                    <div className="flex-1 w-full opacity-60 hover:opacity-100 transition-opacity">
                        <label className="block text-xs mb-2 font-bold text-slate-300 uppercase tracking-wider">✈️ Equipo Visitante</label>
                        <select
                            className="w-full p-3 rounded-xl text-white bg-slate-950 border border-slate-700 focus:border-blue-500 outline-none transition-colors"
                            value={matchData.selectedAwayTeam}
                            onChange={(e) => {
                                matchData.setSelectedAwayTeam(e.target.value);
                                setSelectedFixtureId(null);
                            }}
                        >
                            <option value="">Seleccione...</option>
                            {matchData.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>

                    <div className="w-full md:w-32 opacity-60 hover:opacity-100 transition-opacity">
                        <label className="block text-xs mb-2 font-bold text-slate-400 uppercase tracking-wider">📅 Fecha</label>
                        <input
                            type="number"
                            className="w-full p-3 rounded-xl text-center text-white bg-slate-950 border border-slate-700 focus:border-blue-500 outline-none transition-colors"
                            value={matchData.stage}
                            onChange={(e) => {
                                matchData.setStage(e.target.value);
                                setSelectedFixtureId(null);
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: Tipo de Definición */}
            <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700 text-white rounded-3xl shadow-xl p-6 sm:p-8 mb-6">
                <label className="block text-sm mb-3 font-bold text-purple-400 uppercase tracking-wider">⚙️ 3. Tipo de Definición del Partido</label>
                <select
                    className="w-full md:w-1/2 p-3.5 rounded-xl text-white bg-slate-950 border border-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors font-medium"
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
                    <div className="flex gap-6 items-center justify-center bg-slate-950 border border-slate-800 p-6 rounded-2xl mt-6 shadow-inner w-full md:w-1/2">
                        <div className="flex flex-col items-center">
                            <label className="text-xs font-bold text-blue-300 mb-2 uppercase tracking-wider truncate max-w-[100px]">{homeTeamName}</label>
                            <input
                                type="number" min="0"
                                className="w-20 p-3 text-center text-2xl font-black text-white bg-slate-900 border border-slate-700 rounded-xl focus:border-blue-500 outline-none"
                                value={penalties.home}
                                onChange={(e) => setPenalties({ ...penalties, home: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <span className="text-3xl font-black text-slate-700">-</span>
                        <div className="flex flex-col items-center">
                            <label className="text-xs font-bold text-blue-300 mb-2 uppercase tracking-wider truncate max-w-[100px]">{awayTeamName}</label>
                            <input
                                type="number" min="0"
                                className="w-20 p-3 text-center text-2xl font-black text-white bg-slate-900 border border-slate-700 rounded-xl focus:border-blue-500 outline-none"
                                value={penalties.away}
                                onChange={(e) => setPenalties({ ...penalties, away: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                )}

                {/* ESCRITORIO */}
                {outcomeType === 'administrative' && (
                    <div className="flex gap-6 items-center justify-center bg-slate-950 border border-slate-800 p-6 rounded-2xl mt-6 shadow-inner w-full md:w-1/2">
                        <div className="flex flex-col items-center">
                            <label className="text-xs font-bold text-red-400 mb-2 uppercase tracking-wider truncate max-w-[100px]">{homeTeamName}</label>
                            <input
                                type="number" min="0"
                                className="w-20 p-3 text-center text-2xl font-black text-white bg-slate-900 border border-slate-700 rounded-xl focus:border-red-500 outline-none"
                                value={ocrProcessor.mergedData.score.home}
                                onChange={(e) => ocrProcessor.setMergedData(prev => ({
                                    ...prev,
                                    score: { ...prev.score, home: parseInt(e.target.value) || 0 }
                                }))}
                            />
                        </div>
                        <span className="text-3xl font-black text-slate-700">-</span>
                        <div className="flex flex-col items-center">
                            <label className="text-xs font-bold text-red-400 mb-2 uppercase tracking-wider truncate max-w-[100px]">{awayTeamName}</label>
                            <input
                                type="number" min="0"
                                className="w-20 p-3 text-center text-2xl font-black text-white bg-slate-900 border border-slate-700 rounded-xl focus:border-red-500 outline-none"
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
                <div className={`p-4 rounded-xl mb-6 text-center font-bold shadow-lg backdrop-blur-md border ${ocrProcessor.statusMessage.includes('✅')
                        ? 'bg-emerald-900/80 text-emerald-300 border-emerald-600'
                        : 'bg-red-900/80 text-red-200 border-red-600'
                    }`}>
                    {ocrProcessor.statusMessage}
                </div>
            )}

            {/* SECCIÓN 3: Carga de Imágenes */}
            <div className={`bg-slate-900/70 backdrop-blur-md border border-slate-700 text-white rounded-3xl shadow-xl p-6 sm:p-8 mb-8 space-y-4 ${(!matchData.selectedHomeTeam || !matchData.selectedAwayTeam || !matchData.selectedTournament) ? 'opacity-50 pointer-events-none blur-[1px] transition-all' : 'transition-all'}`}>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-3 text-emerald-400 uppercase tracking-wider">📸 4. Subir Capturas de Pantalla</label>
                    <input
                        id="file-input"
                        type="file" multiple accept="image/*"
                        onChange={(e) => ocrProcessor.setFiles(Array.from(e.target.files))}
                        className="block w-full text-sm text-slate-300
                        file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0
                        file:text-sm file:font-bold file:bg-slate-800 file:text-white
                        hover:file:bg-slate-700 cursor-pointer file:transition-colors
                        border border-slate-700 rounded-xl bg-slate-950"
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button
                        onClick={handleProcessClick}
                        disabled={ocrProcessor.loadingOcr || ocrProcessor.files.length === 0}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 px-6 py-4 rounded-xl font-bold transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center"
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
                            className="bg-red-900/40 hover:bg-red-600 text-red-400 hover:text-white border border-red-800/50 px-6 py-4 rounded-xl font-bold transition-colors shadow-lg flex items-center justify-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            {/* SECCIÓN 4: Resultado Final */}
            {ocrProcessor.mergedData.players.length > 0 && (
                <div className="bg-slate-900/80 backdrop-blur-md text-white rounded-3xl shadow-2xl p-6 sm:p-8 mb-8 flex flex-col items-center border border-slate-700 animate-fade-in-down">
                    <h3 className="text-xl font-black mb-6 text-yellow-400 uppercase tracking-widest">⚽ Marcador Final ⚽</h3>

                    <div className="flex items-center gap-4 sm:gap-10 text-3xl font-black bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-inner w-full max-w-lg justify-center">
                        <div className="flex flex-col items-center w-1/3">
                            <span className="text-xs sm:text-sm mb-3 font-bold text-slate-400 uppercase tracking-wide truncate w-full text-center" title={homeTeamName}>{homeTeamName}</span>
                            <input
                                type="number" min="0"
                                className="w-16 sm:w-20 text-center p-3 rounded-2xl text-white bg-slate-900 border border-slate-700 focus:border-yellow-400 outline-none shadow-md transition-colors"
                                value={ocrProcessor.mergedData.score.home}
                                onChange={(e) => ocrProcessor.setMergedData(prev => ({
                                    ...prev, score: { ...prev.score, home: parseInt(e.target.value) || 0 }
                                }))}
                            />
                        </div>

                        <div className="text-slate-700 text-4xl shrink-0">-</div>

                        <div className="flex flex-col items-center w-1/3">
                            <span className="text-xs sm:text-sm mb-3 font-bold text-slate-400 uppercase tracking-wide truncate w-full text-center" title={awayTeamName}>{awayTeamName}</span>
                            <input
                                type="number" min="0"
                                className="w-16 sm:w-20 text-center p-3 rounded-2xl text-white bg-slate-900 border border-slate-700 focus:border-yellow-400 outline-none shadow-md transition-colors"
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
                <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border border-slate-700 mb-8 animate-fade-in-down">
                    <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                        <span className="font-bold text-slate-300 uppercase tracking-wider text-sm">Ajustes Individuales</span>
                        <span className="bg-indigo-900/50 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold border border-indigo-800/50">
                            {ocrProcessor.mergedData.players.length} Jugadores analizados
                        </span>
                    </div>
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left text-slate-300 text-sm">
                            <thead className="bg-[#0b0f19] uppercase text-[10px] font-black tracking-wider border-b border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-slate-400 border-b border-slate-800 min-w-[180px]">Jugador</th>
                                    <th className="px-3 py-4 text-center text-slate-500 border-b border-slate-800">Equipo</th>
                                    <th className="px-2 py-4 text-center border-b border-slate-800 text-slate-300">Rating</th>
                                    <th className="px-2 py-4 text-center border-b border-slate-800 text-emerald-400">Goles</th>
                                    <th className="px-2 py-4 text-center border-b border-slate-800 text-blue-400">Asist.</th>
                                    <th className="px-2 py-4 text-center border-b border-slate-800 text-yellow-400">Amarillas</th>
                                    <th className="px-2 py-4 text-center border-b border-slate-800 text-red-500">Rojas</th>
                                    <th className="px-2 py-4 text-center border-b border-slate-800 text-rose-300">Lesión</th>
                                    <th className="px-2 py-4 text-center border-b border-slate-800 text-yellow-300">MVP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {ocrProcessor.mergedData.players.map((player, index) => (
                                    <tr key={index} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="px-6 py-3 font-bold text-white whitespace-nowrap">{player.player_name}</td>
                                        <td className="px-3 py-3 text-center text-slate-500 text-xs font-medium">{player.team_name}</td>
                                        <td className="px-4 py-3 text-center">
                                            <input
                                                type="number" step="0.1"
                                                value={player.rating || 0}
                                                onChange={(e) => ocrProcessor.updatePlayerStat(index, 'rating', e.target.value)}
                                                className="w-20 bg-slate-950 border border-slate-700 text-white text-center py-1.5 rounded-lg focus:border-blue-500 outline-none"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <input
                                                type="number" min="0"
                                                value={player.goals || 0}
                                                onChange={(e) => ocrProcessor.updatePlayerStat(index, 'goals', e.target.value)}
                                                className="w-16 bg-slate-950 border border-slate-700 text-white text-center py-1.5 rounded-lg focus:border-emerald-500 outline-none"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <input
                                                type="number" min="0"
                                                value={player.assists || 0}
                                                onChange={(e) => ocrProcessor.updatePlayerStat(index, 'assists', e.target.value)}
                                                className="w-16 bg-slate-950 border border-slate-700 text-white text-center py-1.5 rounded-lg focus:border-blue-500 outline-none"
                                            />
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={player.amarillas > 0}
                                                onChange={(e) => ocrProcessor.updatePlayerStat(index, 'amarillas', e.target.checked ? 1 : 0)}
                                                className="w-5 h-5 accent-yellow-400 cursor-pointer rounded bg-slate-900 border-slate-700"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={player.rojas > 0}
                                                onChange={(e) => ocrProcessor.updatePlayerStat(index, 'rojas', e.target.checked ? 1 : 0)}
                                                className="w-5 h-5 accent-red-600 cursor-pointer rounded bg-slate-900 border-slate-700"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={player.is_injured}
                                                onChange={(e) => ocrProcessor.updatePlayerStat(index, 'is_injured', e.target.checked)}
                                                className="w-5 h-5 accent-rose-400 cursor-pointer rounded bg-slate-900 border-slate-700"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={player.mvp}
                                                onChange={(e) => ocrProcessor.updatePlayerStat(index, 'mvp', e.target.checked)}
                                                className="w-5 h-5 accent-yellow-400 cursor-pointer rounded bg-slate-900 border-slate-700"
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
            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
                <button
                    onClick={() => window.location.reload()}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-8 py-4 rounded-xl font-bold border border-slate-600 transition-colors shadow-lg"
                >
                    Cancelar / Volver
                </button>
                <button
                    onClick={handleSaveMatch}
                    disabled={
                        ocrProcessor.loadingOcr ||
                        ((outcomeType === 'normal' || outcomeType === 'penalties') && ocrProcessor.mergedData.players.length === 0)
                    }
                    className={`px-10 py-4 rounded-xl font-black text-lg shadow-xl transition-all flex items-center justify-center gap-3
                    ${(ocrProcessor.loadingOcr || ((outcomeType === 'normal' || outcomeType === 'penalties') && ocrProcessor.mergedData.players.length === 0))
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer border border-emerald-500 shadow-emerald-900/40 hover:-translate-y-1'
                        }`}
                >
                    {ocrProcessor.loadingOcr ? '⏳ PROCESANDO...' : '💾 GUARDAR PARTIDO'}
                </button>
            </div>
        </div>
    );
}
