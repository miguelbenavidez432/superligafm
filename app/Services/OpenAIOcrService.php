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
        Eres un analista de datos experto. Tu tarea principal NO es solo leer la imagen, sino TOMAR LA LISTA OFICIAL DE JUGADORES provista y ACTUALIZAR sus estadísticas basándote en la captura de pantalla del Football Manager.

        INFORMACIÓN DEL PARTIDO:
        - EQUIPO LOCAL (ID: $homeId): Sus jugadores aparecen en la tabla del extremo IZQUIERDO.
        - EQUIPO VISITANTE (ID: $awayId): Sus jugadores aparecen en la tabla del extremo DERECHO.

        LISTA OFICIAL DE JUGADORES (CONTEXTO MASTER):
        $context

        REGLAS CRÍTICAS DE MAPEO (¡LEER ATENTAMENTE!):
        1. LA LISTA ES LA LEY: Tu respuesta JSON debe contener a TODOS Y CADA UNO de los jugadores presentes en la 'LISTA OFICIAL DE JUGADORES' que te pasé arriba. ¡NO PUEDES OMITIR A NINGÚN JUGADOR DEL CONTEXTO!
        2. REGLA DEL JUGADOR NO VISIBLE/SIN DATOS: Si buscas a un jugador del contexto en la imagen y no lo encuentras, o no tiene una calificación (rating) visible, DEBES incluirlo en el JSON final obligatoriamente con estos valores por defecto: \"rating\": 0, \"goals\": 0, \"assists\": 0, \"amarillas\": 0, \"rojas\": 0, \"is_injured\": false, \"mvp\": false.
        3. NOMBRES INTACTOS: El campo 'player_name' debe devolver el nombre EXACTAMENTE igual a como está escrito en el contexto master, no como aparece abreviado en la imagen.
        4. EXTRACCIÓN VISUAL:
           - Calificación (Cal): Es el número verde o rojo en la columna derecha de cada tabla lateral (ej. 7.4, 6.5).
           - Goles, Asistencias y Tarjetas: Revisa OBLIGATORIAMENTE el panel central 'Eventos del partido' para confirmarlos.
        5. LECTURA DEL PANEL CENTRAL (EVENTOS):
           - BALÓN CON CRUZ ROJA: Gol anulado/en contra. NO suma goles ni asistencias.
           - PATRÓN GOL/ASISTENCIA: 'minuto - jugador1 - jugador2' => jugador1 = GOL, jugador2 = ASISTENCIA.
           - PATRÓN INVERSO: 'jugador1 - jugador2 - minuto' => jugador1 = ASISTENCIA, jugador2 = GOL.
           - TARJETAS: Rectángulo amarillo = 1 amarilla. Rectángulo rojo = 1 roja.
        6. MVP: Busca en las tablas laterales de ambos equipos el número de 'rating' más alto. Solo ese jugador debe tener 'mvp': true.

        RESPUESTA JSON ESPERADA:
        {
          \"score\": { \"home\": 0, \"away\": 0 },
          \"statistics\": [],
          \"players\": [
            // RECUERDA: AQUÍ DEBEN ESTAR EL 100% DE LOS JUGADORES DEL CONTEXTO, tengan datos visuales o no.
          ]
        }
        Devuelve ÚNICAMENTE el JSON puro, sin bloques de código markdown ni texto adicional.
        ";
    }
}
