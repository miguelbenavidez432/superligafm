/* eslint-disable no-unused-vars */
import { useState } from 'react';
import axiosClient from '../axios';

export const useOcrProcessor = () => {
    const [files, setFiles] = useState([]);
    const [loadingOcr, setLoadingOcr] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [mergedData, setMergedData] = useState({
        score: { home: 0, away: 0 },
        statistics: [],
        players: []
    });

    const updatePlayerStat = (index, field, value) => {
        setMergedData(prev => {
            const newPlayers = [...prev.players];
            newPlayers[index] = { ...newPlayers[index], [field]: value };
            return { ...prev, players: newPlayers };
        });
    };

    const processImages = async (homeTeamId, awayTeamId) => {
        setLoadingOcr(true);
        setStatusMessage('Procesando y consolidando datos de imágenes...');
        try {
            const formData = new FormData();
            files.forEach(file => formData.append('images[]', file));
            formData.append('home_team_id', homeTeamId);
            formData.append('away_team_id', awayTeamId);

            const response = await axiosClient.post(`ocr/process-multiple`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // 1. Separar éxitos de fracasos
            const successfulResults = response.data.results?.filter(r => r.success && r.data) || [];
            const failedResults = response.data.results?.filter(r => !r.success) || [];

            // Si TODAS fallaron, entonces sí cortamos el proceso
            if (successfulResults.length === 0) {
                const isQuota = failedResults.some(r => r.error?.includes('quota'));
                setStatusMessage(isQuota ? '⚠️ Límite de la API alcanzado. Espera 30 segundos y reintenta.' : '❌ Error al procesar las imágenes.');
                setLoadingOcr(false);
                return;
            }

            const playerMap = {};
            let finalScore = { home: 0, away: 0 };

            // 2. Iterar SOLO sobre las que tuvieron éxito
            successfulResults.forEach(res => {
                if (res.data.score && res.data.score.home !== null) {
                    finalScore = res.data.score;
                }

                if (res.data.players && Array.isArray(res.data.players)) {
                    res.data.players.forEach(p => {
                        const name = p.player_name;
                        if (!name) return; // Saltar si viene vacío

                        if (!playerMap[name]) {
                            playerMap[name] = {
                                ...p,
                                rating: parseFloat(p.rating) || 0,
                                goals: parseInt(p.goals) || 0,
                                assists: parseInt(p.assists) || 0,
                                amarillas: parseInt(p.yellow_cards || p.amarillas) || 0,
                                rojas: parseInt(p.red_cards || p.rojas) || 0,
                                count: 1
                            };
                        } else {
                            const existing = playerMap[name];
                            existing.goals += (parseInt(p.goals) || 0);
                            existing.assists += (parseInt(p.assists) || 0);
                            existing.rating += (parseFloat(p.rating) || 0);
                            existing.count += 1;
                            existing.amarillas += (parseInt(p.yellow_cards || p.amarillas) || 0);
                            existing.rojas += (parseInt(p.red_cards || p.rojas) || 0);
                            if (p.is_injured) existing.is_injured = true;
                            if (p.mvp) existing.mvp = true;
                        }
                    });
                }
            });

            const finalPlayers = Object.values(playerMap).map(player => {
                const averageRating = player.rating / player.count;
                let totalAmarillas = player.amarillas;
                let totalRojas = player.rojas;

                if (totalAmarillas >= 2) {
                    totalRojas = 1;
                    totalAmarillas = 0;
                }

                return {
                    ...player,
                    rating: parseFloat(averageRating.toFixed(1)),
                    amarillas: totalAmarillas,
                    rojas: totalRojas
                };
            });

            setMergedData({
                score: finalScore,
                statistics: [],
                players: finalPlayers
            });

            // 3. Avisar al usuario del estado real
            if (failedResults.length > 0) {
                setStatusMessage(`⚠️ Se procesaron ${successfulResults.length} imágenes, pero fallaron ${failedResults.length} por límite de la API. Faltan datos.`);
            } else {
                setStatusMessage('✅ ¡Todos los datos consolidados correctamente!');
            }

            return true;
        } catch (error) {
            setStatusMessage('❌ Error de conexión al procesar las imágenes.');
            console.error(error);
            throw error;
        } finally {
            setLoadingOcr(false);
        }
    };

    return {
        files, setFiles,
        loadingOcr, statusMessage, setStatusMessage,
        mergedData, setMergedData,
        processImages, updatePlayerStat
    };
};
