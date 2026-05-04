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
        - EQUIPO LOCAL (ID: $homeId): Tabla lateral IZQUIERDA.
        - EQUIPO VISITANTE (ID: $awayId): Tabla lateral DERECHA.

        BASE DE DATOS OFICIAL:
        $context

        REGLAS DE EXTRACCIÓN Y LÓGICA ESTRICTA (¡SÍGUELAS AL PIE DE LA LETRA!):
        1. COBERTURA TOTAL OBLIGATORIA: Lee TODOS los nombres en las tablas izquierda y derecha. Búscalos en la 'BASE DE DATOS OFICIAL' y usa el 'id', 'player_name' y 'team_name' exactos. ¡Tus resultados DEBEN incluir a todo jugador que tenga una calificación (Cal) o algún evento (tarjeta, gol, asistencia), aunque haya entrado de suplente (como Dimarco o Luiz Henrique)!
        2. ASIGNACIÓN DE EQUIPO: Tabla izquierda => 'id_team': $homeId. Tabla derecha => 'id_team': $awayId.
        3. CALIFICACIÓN (rating): Es el número en la columna 'Cal'. Si es un guion o está vacío, su rating es 0.

        4. GOLES Y ASISTENCIAS (¡EXTRAER SOLO DE LAS TABLAS LATERALES!):
           - IGNORA el panel central '> Encuentros' para buscar goles y asistencias.
           - Ve directamente a las columnas 'Gol' y 'Asis' en las TABLAS LATERALES de cada equipo.
           - Columna 'Gol': Si ves un ícono de balón pequeño con  un número, es la cantidad de goles. Si ves un número, son esos goles. Si ves un guion (-), es 0.
           - Columna 'Asis': Si ves un ícono de bota/zapato, es asistencia. Si ves un número (ej. 2), son esas asistencias. Si ves un guion (-), es 0.

        5. TARJETAS (¡EXTRAER SOLO DEL PANEL CENTRAL '> Encuentros'!):
           - El panel central SOLO sirve para buscar tarjetas. Escanéalo línea por línea.
           - EQUIPO LOCAL (Alineados a la izquierda): Busca un CUADRADO AMARILLO o ROJO al INICIO de la línea (antes del minuto). Ej: '[Cuadrado Amarillo] 58' F. Dimarco'. Dimarco suma 1 amarilla.
           - EQUIPO VISITANTE (Alineados a la derecha): Busca un CUADRADO AMARILLO o ROJO al FINAL de la línea (después del minuto). Ej: 'Luiz Henrique 38' [Cuadrado Amarillo]'. Luiz Henrique suma 1 amarilla.
           - Si un jugador tiene tarjeta roja, anótala (rojas: 1). NO asumas tarjeta amarilla previa a menos que también veas el cuadrado amarillo.
           - Si un jugador tiene un icono con una cruz roja, es una lesión. Anótalo como 'is_injured': true. No confundir con un balón con cruz roja (gol anulado o gol en contra).

        6. REGLA DEL MVP (CÁLCULO MATEMÁTICO OBLIGATORIO):
           - Revisa todos los 'rating' extraídos de AMBOS equipos.
           - Encuentra matemáticamente el número más alto absoluto.
           - ÚNICAMENTE el jugador con ese número más alto absoluto recibe 'mvp': true. Absolutamente todos los demás reciben 'mvp': false.

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
