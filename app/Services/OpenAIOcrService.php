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
        - OBJETIVO: Armar la lista completa SIN OMITIR A NADIE y SIN INVENTAR JUGADORES ni estadísticas.
        - TÉCNICA DE ANCLAJE OBLIGATORIA: Lee la tabla fila por fila guiándote por la sigla de posición (POR, DF, MC, ME, MP, DL, S1, S2, S3, S4...). ¡NO PUEDES SALTARTE FILAS! Asegúrate de leer a todos (Ej: Vlahović, Mbappé, Semih, etc.).
        - PROHIBIDO ALUCINAR: NO inventes jugadores. Solo usa los nombres que ves y emparéjalos con la 'BASE DE DATOS OFICIAL'.
        - Extrae el 'rating' (Columna 'Cal'). Si es un guion, es 0.
        - VERIFICACIÓN DE GUIONES (¡CRÍTICO!): Observa las columnas 'Gol' y 'Asis'. Si un jugador tiene un guion '-' (Ej: Mbappe - - 6.4), ES MATEMÁTICAMENTE IMPOSIBLE que tenga goles o asistencias. Asignarás 0 obligatoriamente.
        - ¡ELIMINACIÓN DE MINUTOS DE CAMBIO!: Cualquier número acompañado de una flecha (<- o ->) o de un apóstrofe (Ej: 46', 72', 56') DEBE SER IGNORADO POR COMPLETO. No es un gol, no es asistencia.

        === PASO 2: AUDITORÍA Y CORRECCIÓN (PANEL CENTRAL '> Encuentros') ===
        - OBJETIVO: Confirmar autores de goles/asistencias.
        - Escanea el panel central línea por línea.
           * EQUIPO LOCAL (Izquierda): El formato es \"[Minuto]' [GOL] [ASISTENCIA]\". Si hay 1 solo nombre tras el minuto (Ej: '79' D. Vlahović'), es GOL suyo.
           * EQUIPO VISITANTE (Derecha): El formato es \"[ASISTENCIA] [GOL] [Minuto]'\". El GOL es el jugador pegado al minuto. La ASISTENCIA es el primer nombre (Ej: 'Angeliño P. Foden 4'' -> Asistencia: Angeliño, Gol: Foden).
        - Si la tabla lateral y el panel central no coinciden en quién hizo el gol, LA VERDAD ABSOLUTA LA TIENE EL PANEL CENTRAL.

        === PASO 3: EVENTOS ESPECIALES (TARJETAS, LESIONES Y ANULADOS) ===
        Escanea el panel central buscando estrictamente estos íconos junto a los nombres:
        - GOL ANULADO (¡NUEVO!): Ícono de un BALÓN TACHADO CON UNA CRUZ ROJA (Ej: E. Haaland al 1'). ESTO NO ES UN GOL. NO sumes nada a las estadísticas. Ignóralo.
        - AMARILLAS: Cuadrado amarillo liso = 'amarillas': 1.
        - ROJAS: Cuadrado rojo liso = 'rojas': 1.
        - DOS TARJETAS: Si el mismo jugador aparece en dos líneas distintas con amarilla y luego roja, TIENES QUE ASIGNAR 'amarillas': 1 Y 'rojas': 1.
        - LESIONES: Ícono de cruz médica (camilla/cruz blanca). Solo aquí asigna 'is_injured': true.

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
