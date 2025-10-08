<?php
// filepath: app/Http/Controllers/Api/OcrController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OcrController extends Controller
{
    public function processImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg|max:10240'
        ]);

        $matchId = $request->query('matchId');

        try {
            $image = $request->file('image');

            $response = Http::asMultipart()->post('https://api.ocr.space/parse/image', [
                [
                    'name' => 'apikey',
                    'contents' => env('OCR_SPACE_API_KEY')
                ],
                [
                    'name' => 'language',
                    'contents' => 'spa'
                ],
                [
                    'name' => 'isOverlayRequired',
                    'contents' => 'false'
                ],
                [
                    'name' => 'OCREngine',
                    'contents' => '2'
                ],
                [
                    'name' => 'isTable',
                    'contents' => 'true'
                ],
                [
                    'name' => 'scale',
                    'contents' => 'true'
                ],
                [
                    'name' => 'file',
                    'contents' => fopen($image->getRealPath(), 'r'),
                    'filename' => $image->getClientOriginalName()
                ],
                // [
                //     'name' => 'detectOrientation',
                //     'contents' => 'true'
                // ]
            ]);

            if ($response->successful()) {
                $result = $response->json();

                if (!$result['IsErroredOnProcessing']) {
                    $extractedText = $result['ParsedResults'][0]['ParsedText'] ?? '';

                    return response()->json([
                        'success' => true,
                        'text' => $extractedText,
                        'processed_data' => $this->parseFootballManagerData($extractedText, $matchId),
                        'respose' => $result
                    ]);
                }

                return response()->json(['error' => 'OCR processing failed: ' . $result['ErrorMessage']], 400);
            }

            return response()->json(['error' => 'API request failed'], 500);

        } catch (\Exception $e) {
            Log::error('OCR Error: ' . $e->getMessage());
            return response()->json(['error' => 'Internal server error: ' . $e->getMessage()], 500);
        }
    }

    public function processMultipleImages(Request $request)
    {
        $request->validate([
            'images' => 'required|array|max:5',
            'images.*' => 'required|image|mimes:jpeg,png,jpg|max:10240'
        ]);

        $results = [];

        foreach ($request->file('images') as $index => $image) {
            $tempRequest = new Request();
            $tempRequest->files->set('image', $image);

            $result = $this->processImage($tempRequest);
            $resultData = json_decode($result->getContent(), true);

            $results[] = [
                'image_index' => $index + 1,
                'filename' => $image->getClientOriginalName(),
                'success' => $resultData['success'] ?? false,
                'data' => $resultData['processed_data'] ?? null,
                'error' => $resultData['error'] ?? null
            ];
        }

        return response()->json([
            'success' => true,
            'results' => $results,
            'total_processed' => count($results)
        ]);
    }

    private function parseFootballManagerData($text, $matchId = null)
    {
        $lines = explode("\n", trim($text));
        $players = [];
        $lineas = [];
        $teamName = null;
        $teamId = null;
        $teamHomeName = null;
        $teamAwayName = null;
        $isHomeTeam = false;
        $isAwayTeam = false;

        // Detectar si es formato "Final de partido" o contiene "SUPERLIGA FM"
        $isFinalFormat = false;
        $isStatisticsFormat = false;

        // Buscar "DATOS DE" para extraer el nombre del equipo
        foreach ($lines as $line) {
            if (strpos($line, 'DATOS DE') !== false) {
                $parts = explode('DATOS DE', $line);
                if (isset($parts[1])) {
                    $teamNamePart = trim($parts[1]);
                    $teamNamePart = preg_replace('/\s+o\s+.*$/', '', $teamNamePart);
                    $teamName = trim($teamNamePart);
                    break;
                }
            }
        }

        //Busco el partido para saber cual de los equipos es el que se esta procesando
        if ($matchId) {
            $game = Game::find($matchId);
            if ($game) {
                $teamHomeName = $game->teamHome->name;
                $teamAwayName = $game->teamAway->name;

                if ($teamName) {

                    if (strtolower($teamName) === strtolower($teamHomeName)) {
                        $isHomeTeam = true;
                    } elseif (strtolower($teamName) === strtolower($teamAwayName)) {
                        $isAwayTeam = true;
                    } else {

                        $similarityHome = similar_text(strtolower($teamName), strtolower($teamHomeName));
                        $similarityAway = similar_text(strtolower($teamName), strtolower($teamAwayName));

                        if ($similarityHome > $similarityAway && $similarityHome > 3) {
                            $isHomeTeam = true;
                            $teamId = $game->teamHome->id;
                            $teamName = $game->teamHome->name;
                        } elseif ($similarityAway > 3) {
                            $isAwayTeam = true;
                            $teamId = $game->teamAway->id;
                            $teamName = $game->teamAway->name;
                        }
                    }
                }
            }
        }

        foreach ($lines as $line) {
            $lineUpper = strtoupper($line);
            if (
                strpos($lineUpper, 'FINAL DE PARTIDO') !== false ||
                strpos($lineUpper, 'FINAL DE') !== false
            ) {
                $isFinalFormat = true;
                break;
            }
            if (strpos($lineUpper, 'SUPERLIGA FM') !== false) {
                $isStatisticsFormat = true;
                break;
            }
        }

        // Si es formato final de partido, usar proceso diferente
        if ($isFinalFormat || $isStatisticsFormat) {
            return $this->parseEndGameData($lines, $matchId, $teamId);
        }

        foreach ($lines as $line) {
            $linea = explode("\r", $line);
            foreach ($linea as $l) {
                trim($l) != '' ? $lineas[] = trim($l) : null;
            }
        }

        foreach ($lineas as $line) {
            $isInjured = false;

            // Buscar líneas que empiecen con "A " (jugadores activos) o "Les" (lesionados)
            if (preg_match('/^(A|Les)\s+(.+)/', $line, $matches)) {
                $status = $matches[1];
                $playerData = trim($matches[2]);

                // Si empieza con "Les", es una lesión grave
                if ($status === 'Les') {
                    $isInjured = true;
                }

                // Dividir por tabulaciones para separar los datos correctamente
                $parts = explode("\t", $playerData);
                $playerName = trim($parts[0]);

                // Inicializar valores por defecto
                $goals = 0;
                $assists = 0;
                $rating = 0.0;

                // Si hay más partes, la última podría ser la calificación
                if (count($parts) > 1) {
                    $lastPart = trim($parts[count($parts) - 1]);

                    // Verificar si la última parte es una calificación válida
                    if (preg_match('/^(\d+\.\d+)$/', $lastPart, $ratingMatch)) {
                        $rating = floatval($ratingMatch[1]);

                        // Buscar goles y asistencias en las partes intermedias
                        for ($i = 1; $i < count($parts) - 1; $i++) {
                            $part = trim($parts[$i]);

                            // Buscar números que podrían ser goles (números sin %)
                            if (preg_match('/^(\d+)$/', $part, $goalMatch)) {
                                $potentialGoal = intval($goalMatch[1]);
                                // Solo considerar como gol si es un número razonable (0-50)
                                if ($potentialGoal >= 0 && $potentialGoal <= 50) {
                                    $goals = $potentialGoal;
                                }
                            }

                            // Buscar asistencias (números seguidos de %)
                            if (preg_match('/^(\d+)%$/', $part, $assistMatch)) {
                                $assists = intval($assistMatch[1]);
                            }
                        }
                    }
                }

                // Limpiar el nombre del jugador (remover caracteres extraños del OCR)
                $playerName = preg_replace('/[^\w\s\.\'\-áéíóúñüÁÉÍÓÚÑÜ]/u', '', $playerName);
                $playerName = trim($playerName);

                // Validar que el nombre sea válido
                if (strlen($playerName) > 2 && !preg_match('/^\d+$/', $playerName)) {
                    $players[] = [
                        'name' => $playerName,
                        'goals' => $goals,
                        'assists' => $assists,
                        'rating' => $rating,
                        'is_injured' => $isInjured,
                        'injury_type' => $isInjured ? 'grave' : null,
                        'team' => $teamId
                    ];
                }
            }
        }

        $uniquePlayers = [];
        $seenNames = [];

        foreach ($players as $player) {
            $normalizedName = strtolower($player['name']);
            if (!in_array($normalizedName, $seenNames)) {
                $uniquePlayers[] = $player;
                $seenNames[] = $normalizedName;
            }
        }

        return [
            'extracted_team_name' => $teamName,
            'team_id' => $teamId,
            'match_info' => [
                'is_home_team' => $teamHomeName,
                'is_away_team' => $teamAwayName,
                'team_type' => $isHomeTeam ? 'home' : ($isAwayTeam ? 'away' : 'unknown')
            ],
            'players' => $uniquePlayers,
            'total_players' => count($uniquePlayers),
            'raw_text' => $text
        ];
    }

    private function parseEndGameData($text, $matchId, $teamId)
    {   
        var_dump($text);
    }
}
