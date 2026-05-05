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

        === PASO 1: LECTURA BASE POR POSICIONES (TABLAS LATERALES) ===
        - OBJETIVO: Armar la lista completa SIN OMITIR A NADIE y SIN INVENTAR JUGADORES.
        - TÉCNICA DE ANCLAJE: Para no saltarte filas ni omitir el final de la tabla, lee guiándote por la sigla de posición (POR, DF, MC, DL, S1, S2, S3...). Extrae CADA fila que tenga una posición hasta llegar a la última.
        - PROHIBIDO ALUCINAR: NO inventes jugadores que no estén explícitamente escritos en la imagen. Solo usa los nombres que ves y emparéjalos con la 'BASE DE DATOS OFICIAL'.
        - Extrae el 'rating' (Columna 'Cal'). Si es un guion, es 0.
        - ¡ELIMINACIÓN DE MINUTOS DE CAMBIO!: La IA confunde los minutos con goles. REGLA ESTRICTA: Cualquier número acompañado de una flecha (<- o ->) o de un apóstrofe de minutos (Ej: 46', 75') DEBE SER IGNORADO POR COMPLETO. No es un gol, no es asistencia. Bórralo de tu análisis.
        - Haz un pre-conteo de goles (ícono de balón) y asistencias (ícono de bota) mirando solo lo que quedó en las tablas.

        === PASO 2: AUDITORÍA Y CORRECCIÓN (PANEL CENTRAL '> Encuentros') ===
        - OBJETIVO: Confirmar autores de goles/asistencias.
        - Escanea el panel central línea por línea.
           * EQUIPO LOCAL (Izquierda): El formato es \"[Minuto]' [GOL] [ASISTENCIA]\". (Ej: '14' Vinícius Júnior A. Hakimi' -> Gol: Vinícius, Asis: Hakimi). Si hay 1 solo nombre tras el minuto, es GOL suyo.
           * EQUIPO VISITANTE (Derecha): El formato es \"[ASISTENCIA] [GOL] [Minuto]'\". El GOL es el jugador pegado al minuto. La ASISTENCIA es el primer nombre. Si hay 1 solo nombre antes del minuto, es GOL.
        - Si la tabla lateral y el panel central no coinciden, LA VERDAD ABSOLUTA LA TIENE EL PANEL CENTRAL.

        === PASO 3: EVENTOS ESPECIALES (TARJETAS, LESIONES Y PENALES) ===
        Escanea el panel central buscando estrictamente estos íconos junto a los nombres. SON CAMPOS INDEPENDIENTES Y ACUMULABLES:
        - AMARILLAS: Cuadrado amarillo liso = 'amarillas': 1.
        - ROJAS: Cuadrado rojo liso = 'rojas': 1.
        - JUGADOR CON DOS TARJETAS DIFERENTES: Si el mismo jugador aparece en dos líneas distintas (Ej: una línea con amarillo al 45+1' y otra con rojo al 49'), TIENES QUE ASIGNAR 'amarillas': 1 Y ADEMÁS 'rojas': 1.
        - GOL DE PENAL: Cuadrado verde con balón blanco. Esto es un GOL, suma 1 a 'goals'.
        - PENAL ERRADO: Cuadrado blanco con cruz roja sobre un balón. NO es tarjeta, NO es gol.
        - LESIONES: Ícono de cruz médica. Solo aquí asigna 'is_injured': true.

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
