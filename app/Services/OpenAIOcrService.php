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
            'model' => 'llama-3.2-90b-vision-instruct',
            'response_format' => [ "type" => "json_object" ],
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
        Eres un analista experto en Football Manager. Tu objetivo es extraer las estadísticas de los jugadores de la imagen y devolverlas en formato JSON.

        INFORMACIÓN DEL PARTIDO (CRÍTICO):
        - EQUIPO LOCAL (ID: $homeId): Sus jugadores aparecen en la tabla de la MITAD IZQUIERDA de la imagen.
        - EQUIPO VISITANTE (ID: $awayId): Sus jugadores aparecen en la tabla de la MITAD DERECHA de la imagen.

        LISTA OFICIAL DE JUGADORES (CONTEXTO):
        $context

        REGLAS CRÍTICAS DE EXTRACCIÓN:
        1. COBERTURA TOTAL: Debes extraer a TODOS los jugadores de la tabla izquierda y TODOS los de la tabla derecha, sin importar las siglas que aparezcan arriba de las tablas.
        2. ASIGNACIÓN DE EQUIPO:
           - Si el jugador está en la tabla izquierda, asigna estrictamente 'id_team': $homeId.
           - Si el jugador está en la tabla derecha, asigna estrictamente 'id_team': $awayId.
        3. IDENTIFICACIÓN DE EVENTOS (Sección central 'Encuentros'):
              - IMPORTANTE: La sección central se usa para eventos. NO deduzcas lesiones desde iconos ambiguos si el evento corresponde a gol/autogol/gol anulado.
              - BALÓN CON CRUZ ROJA: Gol anulado o gol en contra. NO sumar goles ni asistencias y NO marcar lesión.
              - TARJETA ROJA: Rectángulo rojo sólido (rojas: 1).
              - TARJETA AMARILLA: Rectángulo amarillo sólido (amarillas: 1).
              - LESIÓN: Solo marcar is_injured=true si aparece explícitamente un icono inequívoco de lesión y NO hay indicador de gol/autogol/gol anulado en esa jugada.
              - PATRÓN DE ORDEN (CRÍTICO PARA GOLES):
                 a) Si el evento se ve como \"minuto - jugador1 - jugador2\" => jugador1 = GOL, jugador2 = ASISTENCIA.
                 b) Si el evento se ve como \"jugador1 - jugador2 - minuto\" => jugador1 = ASISTENCIA, jugador2 = GOL.
                 c) Estas reglas aplican SOLO a goles válidos (sin balón con cruz roja).
                 d) Si el evento se ve como \"minuto - jugador1\" => jugador1 = GOL.
                 e) Si el evento se ve como \"jugador1 - minuto\" => jugador1 = GOL.
               - Si el evento muestra \"minuto + un solo jugador\" con icono de autogol/gol anulado, NO marcar lesión y NO registrar asistencia.
              - Si ves un botón rojo con recuadro blanco en forma de arco (penal fallado/similar), ignóralo: no es gol, asistencia, lesión ni tarjeta.
              - Cruza los nombres de esta sección central con la lista general para marcar correctamente goles, asistencias, tarjetas o lesión.
        4. Cruza los nombres de la imagen con la LISTA OFICIAL de contexto. Devuelve el nombre exactamente como aparece en la lista oficial. Si un jugador de la lista oficial no aparece en la imagen, devuélvelo con rating 0 y goles 0.
          5. VALIDACIÓN FINAL OBLIGATORIA:
              - Revisa que no haya jugadores con lesión por eventos que en realidad son autogol o gol anulado.
              - Revisa que el patrón de goles/asistencias esté aplicado correctamente antes de responder.
          6. El jugador con mejor rating debe tener el campo 'mvp' marcado como true.

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
