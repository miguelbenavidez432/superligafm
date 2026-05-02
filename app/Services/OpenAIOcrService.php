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
                ],
                'max_tokens' => 4000,
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
        Eres un sistema avanzado de OCR experto en extraer datos estadísticos de imágenes deportivas del juego Football Manager.

        INFORMACIÓN DEL PARTIDO:
        - EQUIPO LOCAL (ID: $homeId): Aparecen en la lista del extremo IZQUIERDO.
        - EQUIPO VISITANTE (ID: $awayId): Aparecen en la lista del extremo DERECHO.

        BASE DE DATOS OFICIAL:
        $context

        REGLAS DE EXTRACCIÓN Y LÓGICA ESTRICTA:
        1. SOLO JUGADORES VISIBLES: Lee los nombres en las tablas izquierda y derecha de la imagen. Búscalos en la 'BASE DE DATOS OFICIAL' y usa el 'id', 'player_name' y 'team_name' exactos de la base de datos.
        2. ASIGNACIÓN DE EQUIPO: Si está en la tabla izquierda => 'id_team': $homeId. Si está en la derecha => 'id_team': $awayId.
        3. CALIFICACIÓN (rating): Es el número en la columna 'Cal' (ej: 7.8, 6.5). Si el jugador no tiene número, su rating es 0.

        4. GOLES Y ASISTENCIAS (¡CRÍTICO: EL ORDEN CAMBIA SEGÚN EL EQUIPO!):
           - Ve a la sección central 'Eventos del partido'.
           - PARA EVENTOS DEL EQUIPO LOCAL (Alineados a la izquierda): Se leen como '[Minuto] [Jugador 1] [Jugador 2]'. El PRIMER nombre que lees es el GOL. El SEGUNDO nombre es la ASISTENCIA.
           - PARA EVENTOS DEL EQUIPO VISITANTE (Alineados a la derecha): El diseño está espejado. El PRIMER nombre que lees (el que está más a la izquierda en ese bloque) es la ASISTENCIA. El SEGUNDO nombre es el GOL.
           - Si solo hay un jugador listado en el evento (de cualquier equipo), ese jugador es el autor del GOL.

        5. TARJETAS: Rectángulo amarillo junto al nombre = 1 amarilla. Rectángulo rojo = 1 roja.

        6. REGLA DEL MVP (CÁLCULO MATEMÁTICO OBLIGATORIO):
           - Al finalizar la extracción, revisa todos los 'rating' que encontraste en AMBOS equipos.
           - Compara los números matemáticamente (Ejemplo: 7.8 es mayor que 7.2 y mayor que 7.5).
           - ÚNICAMENTE el jugador con el número más alto absoluto recibe 'mvp': true. Absolutamente todos los demás reciben 'mvp': false.

        FORMATO JSON REQUERIDO:
        {
          \"score\": { \"home\": 0, \"away\": 0 },
          \"statistics\": [],
          \"players\": [
            {
              \"id\": 123,
              \"player_name\": \"Nombre Exacto del Contexto\",
              \"team_name\": \"Nombre del Equipo\",
              \"id_team\": $homeId,
              \"rating\": 7.8,
              \"goals\": 0,
              \"assists\": 1,
              \"amarillas\": 0,
              \"rojas\": 0,
              \"is_injured\": false,
              \"mvp\": true
            }
          ]
        }
        Devuelve SOLO el texto JSON válido, sin markdown ni comillas invertidas.
        ";
    }
}
