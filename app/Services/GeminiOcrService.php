<?php
// filepath: app/Services/GeminiOcrService.php

namespace App\Services;

use App\Contracts\OcrAnalyzerInterface;
use Illuminate\Http\UploadedFile;
use Gemini\Laravel\Facades\Gemini;
use Gemini\Enums\MimeType;
use Exception;
use GuzzleHttp\Client;
use Log;

class GeminiOcrService implements OcrAnalyzerInterface
{
    public function analyzeMatchImage(UploadedFile $image, array $context, int $homeId, int $awayId): array
    {
        $imagePath = $image->getPathname();
        $rawMimeType = $image->getMimeType();
        $imageBase64 = base64_encode(file_get_contents($imagePath));
        $playersContext = json_encode($context);

        // Traducimos el texto al Enum oficial de Gemini
        $geminiMimeType = match ($rawMimeType) {
            'image/png' => MimeType::IMAGE_PNG,
            'image/webp' => MimeType::IMAGE_WEBP,
            'image/heic' => MimeType::IMAGE_HEIC,
            'image/heif' => MimeType::IMAGE_HEIF,
            default => MimeType::IMAGE_JPEG,
        };

        $prompt = $this->buildPrompt($playersContext, $homeId, $awayId);

        $client = \Gemini::factory()
            ->withApiKey(config('services.gemini.api_key'))
            ->withHttpClient(new Client(['timeout' => 120, 'connect_timeout' => 120]))
            ->make();

        // Usamos nuestro nuevo cliente relajado en lugar de la Facade por defecto
        $result = $client->generativeModel('gemini-2.5-flash-lite')->generateContent([
            $prompt,
            new \Gemini\Data\Blob(
                mimeType: $geminiMimeType,
                data: $imageBase64
            )
        ]);

        $jsonText = str_replace(['```json', '```'], '', $result->text());
        $data = json_decode(trim($jsonText), true);
        Log::info('Respuesta cruda de Gemini: ' . $result->text());
        if (!$data) {
            throw new Exception('No se pudo generar un JSON válido desde la imagen. Respuesta cruda: ' . $result->text());
        }

        return $data;
    }

    private function buildPrompt(string $context, int $homeId, int $awayId): string
    {
        return "
        Eres un analista experto en Football Manager. Tu objetivo es extraer las estadísticas de los jugadores de la imagen y
        devolverlas en formato JSON.

        INFORMACIÓN DEL PARTIDO (CRÍTICO):
        - EQUIPO LOCAL (ID: $homeId): Sus jugadores aparecen en la tabla de la MITAD IZQUIERDA de la imagen.
        - EQUIPO VISITANTE (ID: $awayId): Sus jugadores aparecen en la tabla de la MITAD DERECHA de la imagen.

        LISTA OFICIAL DE JUGADORES (CONTEXTO):
        $context

        REGLAS CRÍTICAS DE EXTRACCIÓN:
        1. COBERTURA TOTAL: Debes extraer a TODOS los jugadores de la tabla izquierda y TODOS los de la tabla derecha.
        2. ASIGNACIÓN DE EQUIPO:
           - Tabla izquierda = 'id_team': $homeId.
           - Tabla derecha = 'id_team': $awayId.

        3. EXTRACCIÓN DE GOLES Y ASISTENCIAS (CRÍTICO - LEER TABLAS LATERALES):
           - IGNORA la sección central para contar goles y asistencias. Debes extraer esta información EXCLUSIVAMENTE de las columnas 'Gol' y 'Asis' que están en las tablas laterales de los equipos.
           - COLUMNA GOL: Si ves un pequeño ícono de balón con un número (ej. 1, 2) al lado o debajo del nombre del jugador, asigna ese número al campo 'goals'. Si solo hay un guion (-), es 0.
           - COLUMNA ASIS: Si ves un número (ej. 1, 2) en la columna 'Asis', asigna ese número al campo 'assists'. Si hay un guion (-), es 0.

        4. EXTRACCIÓN DE TARJETAS Y LESIONES (SECCIÓN CENTRAL 'ENCUENTROS'):
           - Usa la caja central SOLO para extraer tarjetas rojas, tarjetas amarillas y lesiones.
           - TARJETA ROJA: Rectángulo rojo sólido junto al nombre (rojas: 1).
           - TARJETA AMARILLA: Rectángulo amarillo sólido junto al nombre (amarillas: 1).
           - LESIÓN: Solo marcar is_injured=true si aparece un ícono médico de lesión (cruz roja) y no corresponde a un gol anulado.

        5. CRUCE DE DATOS Y MVP:
           - Cruza los nombres de la imagen con la LISTA OFICIAL de contexto. Devuelve el nombre exactamente como aparece en la lista oficial.
           - Si un jugador de la lista oficial no aparece en la imagen, devuélvelo con rating 0 y goles 0.
           - El jugador de todo el partido con el número más alto en la columna 'Cal' (rating) debe tener el campo 'mvp' marcado como true (solo uno).

        RESPUESTA JSON ESPERADA:
        {
          \"score\": { \"home\": 0, \"away\": 0 },
          \"statistics\": [],
          \"players\": [
            {
              \"player_name\": \"Nombre del Jugador\",
              \"team_name\": \"Nombre del Equipo Oficial\",
              \"id_team\": $homeId,
              \"rating\": 6.7,
              \"goals\": 0,
              \"assists\": 0,
              \"amarillas\": 0,
              \"rojas\": 0,
              \"is_injured\": false,
              \"mvp\": false
            }
          ]
        }
        No incluyas markdown, solo el JSON puro.
        ";
    }
}
