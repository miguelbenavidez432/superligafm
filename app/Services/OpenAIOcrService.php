<?php
namespace App\Services;

use App\Contracts\OcrAnalyzerInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Exception;

class OpenAIOcrService implements OcrAnalyzerInterface
{
    public function analyzeMatchImage(UploadedFile $image, array $context, int $homeId, int $awayId): array
    {
        $imagePath = $image->getPathname();
        $rawMimeType = $image->getMimeType();
        $imageBase64 = base64_encode(file_get_contents($imagePath));
        $playersContext = json_encode($context);

        $prompt = $this->buildPrompt($playersContext, $homeId, $awayId);

        // Llamada a OpenAI (GPT-4o-mini es baratísimo y rapidísimo para visión)
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('GROQ_API_KEY'),
            'Content-Type' => 'application/json',
        ])
            ->timeout(120)
            // La URL de Groq es idéntica a OpenAI
            ->post('https://api.groq.com/openai/v1/chat/completions', [
                // Este modelo en Groq vuela y siempre está activo
                // Reemplaza la línea vieja por esta:
                'model' => 'meta-llama/llama-4-scout-17b-16e-instruct',
                'response_format' => ["type" => "json_object"],
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => [
                            ['type' => 'text', 'text' => $prompt],
                            ['type' => 'image_url', 'image_url' => ['url' => "data:{$rawMimeType};base64,{$imageBase64}"]]
                        ]
                    ]
                ]
            ]);

        if (!$response->successful()) {
            throw new Exception("OpenAI falló: " . $response->body());
        }

        $responseData = $response->json();
        $text = $responseData['choices'][0]['message']['content'] ?? '';

        $jsonText = str_replace(['```json', '```'], '', trim($text));
        $data = json_decode($jsonText, true);

        if (!$data) {
            throw new Exception('OpenAI no devolvió un JSON válido.');
        }

        return $data;
    }

    private function buildPrompt(string $context, int $homeId, int $awayId): string
    {
        return "
        Eres un sistema de procesamiento de datos OCR estricto. Tu tarea NO es adivinar, tu tarea es mapear una base de datos contra una imagen. Tienes terminantemente prohibido omitir datos.

        INFORMACIÓN:
        - LOCAL (ID: $homeId): Aparecen en la tabla IZQUIERDA.
        - VISITANTE (ID: $awayId): Aparecen en la tabla DERECHA.

        CONTEXTO OBLIGATORIO (TU BASE DE DATOS):
        $context

        REGLA DE ORO (CRÍTICA):
        Tu array 'players' DEBE tener EXACTAMENTE la misma longitud que el CONTEXTO OBLIGATORIO. Debes iterar cada jugador del contexto uno por uno. SI HAY 35 JUGADORES EN EL CONTEXTO, DEBE HABER 35 JUGADORES EN TU RESPUESTA JSON.

        INSTRUCCIONES DE MAPEO PARA CADA JUGADOR DEL CONTEXTO:
        1. Copia su 'id', 'player_name' y 'team_name' EXACTAMENTE como aparecen en el contexto.
        2. Asigna el 'id_team' ($homeId si pertenece al local, $awayId si pertenece al visitante).
        3. Busca visualmente a ese jugador en la imagen (Ojo: la imagen usa nombres cortos como 'C. Romero' o 'Júnior R.').
        4. SI LO ENCUENTRAS EN LA IMAGEN:
           - rating: El número de la columna 'Cal'.
           - goals: Revisa el panel central 'Eventos del partido'. Patrón 'minuto - jugador' o si sale segundo en 'min - jugador1 - jugador2'.
           - assists: Revisa el panel central. El que sale primero en 'min - jugador1 - jugador2'.
           - amarillas/rojas: Verifica si tiene un rectángulo amarillo o rojo a su lado.
        5. SI NO LO ENCUENTRAS EN LA IMAGEN O NO TIENE CALIFICACIÓN:
           - Asigna OBLIGATORIAMENTE: rating: 0, goals: 0, assists: 0, amarillas: 0, rojas: 0, is_injured: false.
        6. El único jugador de toda la imagen con el 'rating' más alto lleva 'mvp': true. El resto en false.

        FORMATO JSON REQUERIDO (RESPETA ESTOS CAMPOS ESTRICTAMENTE):
        {
          \"score\": { \"home\": 0, \"away\": 0 },
          \"statistics\": [],
          \"players\": [
            {
              \"id\": 123,
              \"player_name\": \"Nombre del Jugador\",
              \"team_name\": \"Nombre del Equipo\",
              \"id_team\": $homeId,
              \"rating\": 7.4,
              \"goals\": 0,
              \"assists\": 0,
              \"amarillas\": 0,
              \"rojas\": 0,
              \"is_injured\": false,
              \"mvp\": false
            }
          ]
        }
        NO incluyas markdown (```json). Devuelve SOLO el texto JSON válido.
        ";
    }
}
