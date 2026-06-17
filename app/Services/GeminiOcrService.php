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

Para evitar errores y omisiones de estadísticas (como goles perdidos o tarjetas no asignadas), DEBES basar la extracción de eventos EXCLUSIVAMENTE en la caja central titulada Encuentros.

Sigue estas reglas estrictas para leer la caja central, diferenciando el equipo local (izquierda) del visitante (derecha):

1. Reglas para el Equipo Local (Mitad Izquierda del centro):
La lectura de eventos es [Ícono] [Minuto] [Nombre 1] [Nombre 2].

Gol (Balón de fútbol normal): El [Nombre 1] es el goleador (+1 goals). El [Nombre 2] es el asistente (+1 assists).

Gol Anulado / Penal Errado (Balón con punto rojo o marca): Ignora esta estadística. NO sumes goles ni asistencias.

Tarjeta Amarilla (Rectángulo amarillo): Suma 1 a amarillas del jugador nombrado.

Tarjeta Roja (Rectángulo rojo): Suma 1 a rojas del jugador nombrado.

Lesión (Cruz roja): Marca is_injured: true al jugador nombrado.

2. Reglas para el Equipo Visitante (Mitad Derecha del centro):
La lectura de eventos es INVERSA: [Nombre 1] [Nombre 2] [Minuto] [Ícono].

Gol (Balón de fútbol normal): El [Nombre 1] es el asistente (+1 assists). El [Nombre 2] (el que está pegado al minuto) es el goleador (+1 goals).

Gol Anulado / Penal Errado (Balón con punto rojo o marca): Ignora esta estadística.

Tarjeta Amarilla (Rectángulo amarillo): Suma 1 a amarillas del jugador nombrado.

Tarjeta Roja (Rectángulo rojo): Suma 1 a rojas del jugador nombrado.

Lesión (Cruz roja): Marca is_injured: true al jugador nombrado.

3. Consolidación de Datos:

Una vez extraídos todos los eventos de la caja Encuentros, busca a esos jugadores en las tablas laterales para obtener sus calificaciones (rating).

El MVP (mvp: true) es el jugador con la calificación más alta de todo el partido en las listas laterales.

Si un jugador en la lista lateral no tiene calificación numérica (guion o vacío), asigna rating: 0 y ceros en todas sus estadísticas.

Devuelve ÚNICAMENTE el JSON válido con esta estructura, sin texto adicional:
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
