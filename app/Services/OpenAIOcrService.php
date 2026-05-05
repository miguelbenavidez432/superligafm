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
        - EQUIPO LOCAL (ID: $homeId): Tabla lateral IZQUIERDA. Panel central alineado a la izquierda.
        - EQUIPO VISITANTE (ID: $awayId): Tabla lateral DERECHA. Panel central alineado a la derecha.

        BASE DE DATOS OFICIAL:
        $context

        SISTEMA DE EXTRACCIÓN DE 2 PASOS (¡EJECUTA EN ESTE ORDEN ESTRICTO!):

        === PASO 1: LECTURA BASE (TABLAS LATERALES) ===
        - OBJETIVO: Armar la lista de jugadores y sus calificaciones.
        - Lee TODOS los nombres de las tablas laterales DE ARRIBA HACIA ABAJO. ¡PROHIBIDO OMITIR LA ÚLTIMA FILA! Asegúrate de incluir a los jugadores al final de la lista (como Haaland, Diao, etc.).
        - Emparéjalos lógicamente con los nombres de la 'BASE DE DATOS OFICIAL'.
        - Extrae el 'rating' (Columna 'Cal'). Si es un guion, es 0.
        - Haz un pre-conteo de goles (ícono de balón) y asistencias (ícono de bota) mirando las tablas.
        - ¡PELIGRO VISUAL!: Al leer las tablas, IGNORA por completo las flechas de cambio (<- o ->) y los números a su lado (ej. 75', 46'). NUNCA los cuentes como goles o asistencias.

        === PASO 2: AUDITORÍA Y CORRECCIÓN (PANEL CENTRAL '> Encuentros') ===
        - OBJETIVO: Confirmar autores de goles/asistencias.
        - Escanea el panel central línea por línea.
           * EQUIPO LOCAL (Izquierda): El formato es \"[Minuto]' [GOL] [ASISTENCIA]\". (Ej: '14' Vinícius Júnior A. Hakimi' -> Gol: Vinícius, Asis: Hakimi). Si hay 1 solo nombre tras el minuto, es GOL suyo.
           * EQUIPO VISITANTE (Derecha): El formato es \"[ASISTENCIA] [GOL] [Minuto]'\". El GOL es el jugador pegado al minuto. La ASISTENCIA es el primer nombre. Si hay 1 solo nombre antes del minuto, es GOL.
        - Si la tabla lateral y el panel central no coinciden, LA VERDAD ABSOLUTA LA TIENE LA TABLA.
         - Si solo hay un jugador listado en el evento (de cualquier equipo) y tiene un balón después del minuto, ese jugador es el autor del GOL.
           - Si solo hay un jugador listado en el evento (de cualquier equipo) y tiene un cuadrado amarillo, ese jugador tiene amarilla.
           - Si solo hay un jugador listado en el evento (de cualquier equipo) y tiene un cuadrado rojo, ese jugador tiene roja.
           - Si solo hay un jugador listado en el evento (de cualquier equipo) y tiene un cuadrado verde, ese jugador tiene gol de penal (gol).
           - Si solo hay un jugador listado en el evento (de cualquier equipo) y tiene un cuadrado blanco con un balón tachado, ese jugador tiene un penal errado y no cuenta como estadística.
           - Si solo hay un jugador listado en el evento (de cualquier equipo) y sale repetido en la misma línea, ese jugador tiene un gol errado y no cuenta para estadísticas.

        === PASO 3: EVENTOS ESPECIALES (TARJETAS, LESIONES Y PENALES) ===
        Escanea el panel central buscando estrictamente estos íconos junto a los nombres. SON CAMPOS INDEPENDIENTES:
        - AMARILLAS: Cuadrado amarillo liso. Asigna 'amarillas': 1.
        - ROJAS: Cuadrado rojo liso. Asigna 'rojas': 1.
        - AMBAS TARJETAS: Si un jugador tiene un cuadrado amarillo en una línea y un cuadrado rojo en otra (Ej: Lewis-Skelly), DEBES asignar 'amarillas': 1 Y 'rojas': 1 en su JSON final. No sobrescribas un valor con el otro.
        - GOL DE PENAL: Cuadrado verde con balón blanco (Ej: B. Saka al 41'). Esto es un GOL. Suma 1 a la estadística de 'goals'. NUNCA lo confundas con una lesión.
        - PENAL ERRADO: Cuadrado blanco con cruz roja sobre un balón. NO es tarjeta, NO es gol. Ignóralo para las estadísticas.
        - LESIONES: Ícono explícito de cruz médica roja/blanca. Solo en este caso asigna 'is_injured': true.

        === PASO 4: CÁLCULO DEL MVP ===
        - Revisa todos los 'rating' reales extraídos en el Paso 1 de AMBOS equipos.
        - Encuentra matemáticamente cuál es el número más alto absoluto del partido.
        - ÚNICAMENTE al jugador con ese número exacto asígnale 'mvp': true. A TODOS LOS DEMÁS asígnales 'mvp': false sin excepción.

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
