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
        Actúa como un experto en análisis de datos deportivos y visión artificial. Tu tarea es extraer la información de los jugadores y las estadísticas del partido de la imagen adjunta, estructurándola estrictamente en el formato JSON proporcionado.

Las imágenes de aplicaciones de resultados deportivos tienen elementos visuales pequeños que son cruciales. Para evitar alucinaciones o errores de asignación, debes aplicar obligatoriamente las siguientes reglas paso a paso:

1. Anclaje Visual de Íconos (Estadísticas Individuales):
Escanea cuidadosamente la fila de cada jugador buscando íconos minúsculos al lado o debajo de su nombre/calificación:

Balón de fútbol: Suma 1 a goals.

Bota de fútbol (o ícono de asistencia): Suma 1 a assists.

Tarjeta roja / amarilla: Asigna 1 a rojas o amarillas según corresponda.

Estrella o calificación más alta (ej. 8.5): Asigna true a mvp (solo puede haber un MVP en todo el partido).

2. Cruce de Información (La Caja Central):
No confíes solo en la lista de jugadores. Lee la línea de tiempo o caja central de eventos del partido (donde se listan los goles y tarjetas por minuto). Si dice que un jugador (ej. Barrios) recibió una roja o alguien (ej. Musiala) hizo un gol, búscalo en la lista de jugadores y asegúrate de que su JSON tenga ese evento registrado.

3. Filtro de Jugadores sin Minutos:
Revisa la columna derecha de calificaciones. Si un jugador no tiene una calificación numérica (aparece un guion, está en gris, o no tiene número), significa que no jugó. A estos jugadores debes asignarles estrictamente rating: 0 y ceros en goles, asistencias y tarjetas. ¡No les inventes calificaciones!

4. Control de Calidad Final:

Verifica que no haya ningún jugador duplicado en el JSON.

Asegúrate de que los IDs de los equipos correspondan correctamente (home vs away).

Devuelve ÚNICAMENTE el JSON válido con esta estructura (sin texto adicional ni formato markdown fuera del bloque JSON):
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
