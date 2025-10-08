import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../axios';

export default function UploadMatch() {
    const [files, setFiles] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const { id } = useParams();
    const [match, setMatch] = useState({});
    const [teamHome, setTeamHome] = useState([]);
    const [teamAway, setTeamAway] = useState([]);

    
    useEffect(() => {
        axiosClient.get(`/games/${id}`)
            .then(({ data }) => {
                setMatch(data.data);
                setTeamHome(data.data.team_home.name);
                setTeamAway(data.data.team_away.name)
                setLoading(false);
                console.log(data.data);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [id]);

    const handleSubmit = async () => {
        if (files.length === 0) return;

        setLoading(true);
        setResults([]);

        try {
            const formData = new FormData();

            const matchId = window.location.pathname.split('/').pop();

            if (files.length === 1) {
                formData.append('image', files[0]);
                const response = await axiosClient.post(`ocr/process`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    params: { matchId }
                });

                setResults([{
                    filename: files[0].name,
                    ...response.data
                }]);
                console.log(response.data);
            } else {
                files.forEach(file => formData.append('images[]', file));
                const response = await axiosClient.post(`ocr/process-multiple`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    params: { matchId }
                });

                setResults(response.data.results || []);
                console.log(response.data);
            }
        } catch (error) {
            console.error('Error procesando OCR:', error);
            setResults([{
                filename: 'Error',
                success: false,
                error: error.response?.data?.message || error.message
            }]);
            console.log(results);
        } finally {
            setLoading(false);
        }
    };

    const renderMatchStatistics = (data) => {
        if (!data.statistics || data.statistics.length === 0) {
            return <p className="text-gray-500">No se detectaron estadísticas</p>;
        }

        return (
            <div className="bg-white rounded-lg border">
                {data.teams && (
                    <div className="bg-gray-50 px-4 py-2 border-b">
                        <h6 className="font-semibold text-center">
                            {data.teams.home} vs {data.teams.away}
                        </h6>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left">Estadística</th>
                                <th className="px-4 py-2 text-center">Local</th>
                                <th className="px-4 py-2 text-center">Visitante</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.statistics.map((stat, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                    <td className="px-4 py-2 font-medium">{stat.stat}</td>
                                    <td className="px-4 py-2 text-center">{stat.home_value}</td>
                                    <td className="px-4 py-2 text-center">{stat.away_value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderPlayerRatings = (data) => {
        if (!data.players || data.players.length === 0) {
            return <p className="text-gray-500">No se detectaron jugadores</p>;
        }

        return (
            <div className="bg-white rounded-lg border">
                <div className="bg-gray-50 px-4 py-2 border-b">
                    <h6 className="font-semibold">Ratings de Jugadores ({data.total_players})</h6>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left">Dorsal</th>
                                <th className="px-4 py-2 text-left">Jugador</th>
                                <th className="px-4 py-2 text-center">Rating</th>
                                <th className="px-4 py-2 text-center">Goles</th>
                                <th className="px-4 py-2 text-center">Asistencias</th>
                                <th className="px-4 py-2 text-center">Amarillas</th>
                                <th className="px-4 py-2 text-center">Rojas</th>
                                <th className="px-4 py-2 text-center">Lesiones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.players.map((player, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                    <td className="px-4 py-2 text-center">
                                        {player.shirt_number || '-'}
                                    </td>
                                    <td className="px-4 py-2 font-medium">{player.name}</td>
                                    <td className="px-4 py-2 text-center">
                                        <span className={`px-2 py-1 rounded text-sm font-bold ${player.rating >= 8 ? 'bg-green-100 text-green-800' :
                                                player.rating >= 7 ? 'bg-yellow-100 text-yellow-800' :
                                                    player.rating >= 6 ? 'bg-orange-100 text-orange-800' :
                                                        'bg-red-100 text-red-800'
                                            }`}>
                                            {player.rating}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 font-medium"> <input type="number" min="0" defaultValue={player.goals} className='border border-gray-300 rounded-md p-1 w-16' /></td>
                                    <td className="px-4 py-2 font-medium"> <input type="number" min="0" defaultValue={player.assists} className='border border-gray-300 rounded-md p-1 w-16' /></td>
                                    <td className="px-4 py-2 font-medium"> <input type="checkbox" defaultChecked={player.is_injured} /></td>
                                    <td className="px-4 py-2 font-medium">{player.amarillas? player.amarillas : 0} <input type="checkbox" defaultChecked={player.amarillas} /></td>
                                    <td className="px-4 py-2 font-medium">{player.rojas? player.rojas : 0} <input type="checkbox" defaultChecked={player.rojas} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">
                Analizar Screenshots de Football Manager
            </h2>
            {match && match.id && (
                <div className="mb-6 p-4 bg-slate-800 text-white rounded-lg shadow-md text-center">
                    <h3 className="text-xl font-semibold">
                        Partido: {teamHome} vs {teamAway}
                    </h3>
                    <p className="text-gray-300">Fecha: {match.match_date}</p>
                </div>
            )}  
            <div className="text-white bg-slate-900 rounded-lg shadow-md p-6 mb-6">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-2">
                        Subir imágenes de las estadísticas
                    </label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => setFiles([...e.target.files])}
                        className="block w-full bg-slate-700 text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-sm text-gray-300 mt-2">
                        💡 <strong>Tip:</strong> Para mejores resultados, sube screenshots que muestren:
                        <br />• Tablas de estadísticas de partido (posesión, tiros, etc.)
                        <br />• Ratings de jugadores al final del partido
                        <br />• Asegúrate que el texto sea claro y legible
                    </p>
                </div>

                {files.length > 0 && (
                    <div className="mb-4">
                        <h4 className="font-medium mb-2">Archivos seleccionados:</h4>
                        <ul className="text-sm text-gray-300">
                            {Array.from(files).map((file, index) => (
                                <li key={index} className="flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                    {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={loading || files.length === 0}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-100 text-black px-6 py-3 rounded-lg font-medium transition-colors"
                >
                    {loading ? (
                        <>
                            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                            Analizando tablas...
                        </>
                    ) : (
                        `🔍 Analizar ${files.length} imagen${files.length !== 1 ? 'es' : ''}`
                    )}
                </button>
            </div>

            {results.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-2xl font-semibold flex items-center">
                        📊 Resultados del Análisis
                    </h3>

                    {results.map((result, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-lg border">
                            <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
                                <h4 className="text-lg font-bold">{result.filename}</h4>
                                {result.success ? (
                                    <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                                        ✅ Procesado exitosamente
                                    </span>
                                ) : (
                                    <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                                        ❌ Error
                                    </span>
                                )}
                            </div>

                            <div className="p-6">
                                {result.success && result.data ? (
                                    <div className="space-y-6">
                                        {result.data.type === 'match_statistics' ? (
                                            <div>
                                                <h5 className="text-xl font-semibold mb-4 text-blue-600 flex items-center">
                                                    📈 Estadísticas del Partido
                                                </h5>
                                                {renderMatchStatistics(result.data)}
                                            </div>
                                        ) : (
                                            <div>
                                                <h5 className="text-xl font-semibold mb-4 text-green-600 flex items-center">
                                                    ⭐ Ratings de Jugadores
                                                </h5>
                                                {renderPlayerRatings(result.data)}
                                            </div>
                                        )}

                                        {result.table_structure && (
                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                <h6 className="font-semibold text-blue-800 mb-2">
                                                    📋 Estructura de tabla detectada:
                                                </h6>
                                                <p className="text-blue-700 text-sm">
                                                    {result.table_structure.rows} filas •
                                                    ~{result.table_structure.estimated_columns} columnas
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-red-700 font-medium">Error procesando imagen:</p>
                                        <p className="text-red-600 text-sm">{result.error || 'Error desconocido'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}