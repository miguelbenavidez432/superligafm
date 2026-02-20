<?php
// filepath: app/Services/GeminiOcrService.php

namespace App\Services;

use App\Contracts\OcrAnalyzerInterface;
use Illuminate\Http\UploadedFile;
use Gemini\Laravel\Facades\Gemini;
use Gemini\Enums\MimeType;
use Exception;
use GuzzleHttp\Client;

class GeminiOcrService implements OcrAnalyzerInterface
{
    public function analyzeMatchImage(UploadedFile $image, array $context): array
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

        $prompt = $this->buildPrompt($playersContext);

        $client = \Gemini::factory()
            ->withApiKey(config('services.gemini.api_key'))
            ->withHttpClient(new Client(['timeout' => 120, 'connect_timeout' => 120]))
            ->make();

        // Usamos nuestro nuevo cliente relajado en lugar de la Facade por defecto
        $result = $client->generativeModel('gemini-2.5-flash')->generateContent([
            $prompt,
            new \Gemini\Data\Blob(
                mimeType: $geminiMimeType,
                data: $imageBase64
            )
        ]);

        $jsonText = str_replace(['```json', '```'], '', $result->text());
        $data = json_decode(trim($jsonText), true);

        if (!$data) {
            throw new Exception('No se pudo generar un JSON válido desde la imagen.');
        }

        return $data;
    }

    private function buildPrompt(string $context): string
    {
        return "
        Eres un analista experto en Football Manager. Tu objetivo es mapear los datos de la imagen con la lista de jugadores oficial que te proporciono.

        ESTA ES LA LISTA OFICIAL DE JUGADORES (CONTEXTO):
        $context

        REGLAS CRÍTICAS DE EXTRACCIÓN:
        1. IDENTIFICACIÓN DE ICONOS:
           - BALÓN CON CRUZ ROJA: Es un GOL ANULADO. No lo cuentes como gol.
           - RECUADRO ROJO CON CRUZ TRANSPARENTE: Es una LESIÓN (is_injured: true). NO es tarjeta roja.
           - TARJETA ROJA: Es un rectángulo rojo sólido sin cruces.
           - TARJETA AMARILLA: Es un rectángulo amarillo sólido sin cruces.

        2. COBERTURA TOTAL DE JUGADORES:
           - Debes devolver TODOS los jugadores que aparecen en la 'LISTA OFICIAL' arriba mencionada.
           - Si un jugador de la lista oficial NO aparece en la imagen o no tiene estadísticas, devuélvelo con rating 0, goles 0, asistencias 0, etc.
           - Los jugadores que SÍ aparecen en la imagen deben tener sus estadísticas extraídas fielmente.
           - Analiza la sección central de la imagen donde dice 'Encuentros'. Ignora los goles y céntrate exclusivamente en identificar:
                Tarjetas Amarillas: Icono de rectángulo amarillo.
                Lesiones: Icono de cruz roja (como el de P. Porro 39').
                Tarjetas Rojas: Icono de rectángulo rojo.
                Para cada jugador en esta lista central, marca en el JSON: amarillas: 1, is_injured: true, o rojas: 1 según corresponda. Cruza estos nombres con la lista general de jugadores para asegurar la consistencia.

        3. FORMATO DE SALIDA:
           - Devuelve los nombres del jugador y del equipo tal cual aparecen en la lista oficial.
           - Ordena la lista de jugadores por nombre de equipo.
           - El jugador con mejor rating debe tener el campo 'mvp' marcado como true.
           - Un jugador puede tener tarjeta amarilla y luego roja en la misma imagen, en ese caso debe reflejar ambas cosas (yellow_cards: 1, red_cards: 1).

        RESPUESTA JSON ESPERADA:
        {
          \"score\": { \"home\": 0, \"away\": 0 },
          \"statistics\": [],
          \"players\": [
            {
              \"player_name\": \"Nombre del Jugador\",
              \"team_name\": \"Nombre del Equipo\",
              \"rating\": 6.7,
              \"goals\": 0,
              \"assists\": 0,
              \"amarillas\": 0,
              \"rojas\": 0,
              \"is_injured\": false
            }
          ]
        }
        No incluyas markdown, solo el JSON puro.
    ";
    }
}
