<?php
namespace App\Services;

use App\Contracts\OcrAnalyzerInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Exception;

use Gemini\Laravel\Facades\Gemini;
use Gemini\Enums\MimeType;
use GuzzleHttp\Client;
use Log;

class OpenAIOcrService implements OcrAnalyzerInterface
{
    // public function analyzeMatchImage(UploadedFile $image, array $context, int $homeId, int $awayId): array
    // {
    //     $imagePath = $image->getPathname();
    //     $rawMimeType = $image->getMimeType();
    //     $imageBase64 = base64_encode(file_get_contents($imagePath));
    //     $playersContext = json_encode($context);

    //     $prompt = $this->buildPrompt($playersContext, $homeId, $awayId);

    //     // Llamada a OpenAI (GPT-4o-mini es baratísimo y rapidísimo para visión)
    //     $response = Http::withHeaders([
    //         'Authorization' => 'Bearer ' . env('GROQ_API_KEY'),
    //         'Content-Type' => 'application/json',
    //     ])
    //         ->timeout(120)
    //         // La URL de Groq es idéntica a OpenAI
    //         ->post('https://api.groq.com/openai/v1/chat/completions', [
    //             // Este modelo en Groq vuela y siempre está activo
    //             // Reemplaza la línea vieja por esta:
    //             'model' => 'meta-llama/llama-4-scout-17b-16e-instruct',
    //             'response_format' => ["type" => "json_object"],
    //             'messages' => [
    //                 [
    //                     'role' => 'user',
    //                     'content' => [
    //                         ['type' => 'text', 'text' => $prompt],
    //                         ['type' => 'image_url', 'image_url' => ['url' => "data:{$rawMimeType};base64,{$imageBase64}"]]
    //                     ]
    //                 ]
    //             ],
    //             'max_tokens' => 4000,
    //         ]);

    //     if (!$response->successful()) {
    //         throw new Exception("OpenAI falló: " . $response->body());
    //     }

    //     $responseData = $response->json();
    //     $text = $responseData['choices'][0]['message']['content'] ?? '';

    //     $jsonText = str_replace(['```json', '```'], '', trim($text));
    //     $data = json_decode($jsonText, true);

    //     if (!$data) {
    //         throw new Exception('OpenAI no devolvió un JSON válido.');
    //     }

    //     return $data;
    // }

    // private function buildPrompt(string $context, int $homeId, int $awayId): string
    // {
    //     return "
    //    Eres un sistema avanzado de OCR experto en extraer datos estadísticos de imágenes deportivas del juego Football Manager.

    //     INFORMACIÓN DEL PARTIDO:
    //     - EQUIPO LOCAL (ID: $homeId): Tabla lateral IZQUIERDA. Panel central alineado a la izquierda.
    //     - EQUIPO VISITANTE (ID: $awayId): Tabla lateral DERECHA. Panel central alineado a la derecha.

    //     BASE DE DATOS OFICIAL:
    //     $context

    //     SISTEMA DE EXTRACCIÓN DE 2 PASOS (¡EJECUTA EN ESTE ORDEN ESTRICTO!):

    //     === PASO 1: LECTURA BASE POR POSICIONES (TABLAS LATERALES) ===
    //     - OBJETIVO: Armar la lista completa SIN OMITIR A NADIE y SIN INVENTAR JUGADORES ni estadísticas.
    //     - TÉCNICA DE ANCLAJE OBLIGATORIA: Lee la tabla fila por fila guiándote por la sigla de posición (POR, DF, MC, ME, MP, DL, S1, S2, S3, S4...). ¡NO PUEDES SALTARTE FILAS! Asegúrate de leer a todos (Ej: Vlahović, Mbappé, Semih, etc.).
    //     - PROHIBIDO ALUCINAR: NO inventes jugadores. Solo usa los nombres que ves y emparéjalos con la 'BASE DE DATOS OFICIAL'.
    //     - Extrae el 'rating' (Columna 'Cal'). Si es un guion, es 0.
    //     - VERIFICACIÓN DE GUIONES (¡CRÍTICO!): Observa las columnas 'Gol' y 'Asis'. Si un jugador tiene un guion '-' (Ej: Mbappe - - 6.4), ES MATEMÁTICAMENTE IMPOSIBLE que tenga goles o asistencias. Asignarás 0 obligatoriamente.
    //     - ¡ELIMINACIÓN DE MINUTOS DE CAMBIO!: Cualquier número acompañado de una flecha (<- o ->) o de un apóstrofe (Ej: 46', 72', 56') DEBE SER IGNORADO POR COMPLETO. No es un gol, no es asistencia.

    //     === PASO 2: AUDITORÍA Y CORRECCIÓN (PANEL CENTRAL '> Encuentros') ===
    //     - OBJETIVO: Confirmar autores de goles/asistencias.
    //     - Escanea el panel central línea por línea.
    //        * EQUIPO LOCAL (Izquierda): El formato es \"[Minuto]' [GOL] [ASISTENCIA]\". Si hay 1 solo nombre tras el minuto (Ej: '79' D. Vlahović'), es GOL suyo.
    //        * EQUIPO VISITANTE (Derecha): El formato es \"[ASISTENCIA] [GOL] [Minuto]'\". El GOL es el jugador pegado al minuto. La ASISTENCIA es el primer nombre (Ej: 'Angeliño P. Foden 4'' -> Asistencia: Angeliño, Gol: Foden).
    //     - Si la tabla lateral y el panel central no coinciden en quién hizo el gol, LA VERDAD ABSOLUTA LA TIENE EL PANEL CENTRAL.

    //     === PASO 3: EVENTOS ESPECIALES (TARJETAS, LESIONES Y ANULADOS) ===
    //     Escanea el panel central buscando estrictamente estos íconos junto a los nombres:
    //     - GOL ANULADO (¡NUEVO!): Ícono de un BALÓN TACHADO CON UNA CRUZ ROJA (Ej: E. Haaland al 1'). ESTO NO ES UN GOL. NO sumes nada a las estadísticas. Ignóralo.
    //     - AMARILLAS: Cuadrado amarillo liso = 'amarillas': 1.
    //     - ROJAS: Cuadrado rojo liso = 'rojas': 1.
    //     - DOS TARJETAS: Si el mismo jugador aparece en dos líneas distintas con amarilla y luego roja, TIENES QUE ASIGNAR 'amarillas': 1 Y 'rojas': 1.
    //     - LESIONES: Ícono de cruz médica (camilla/cruz blanca). Solo aquí asigna 'is_injured': true.

    //     === PASO 4: CÁLCULO DEL MVP ===
    //     - Revisa todos los 'rating' reales extraídos en el Paso 1 de AMBOS equipos.
    //     - Encuentra matemáticamente cuál es el número más alto absoluto del partido.
    //     - ÚNICAMENTE al jugador con ese número exacto asígnale 'mvp': true. A TODOS LOS DEMÁS asígnales 'mvp': false sin excepción.

    //     FORMATO JSON REQUERIDO:
    //     {
    //       \"score\": { \"home\": 0, \"away\": 0 },
    //       \"statistics\": [],
    //       \"players\": [
    //         {
    //           \"id\": 123,
    //           \"player_name\": \"Nombre Exacto del Contexto\",
    //           \"team_name\": \"Nombre del Equipo\",
    //           \"id_team\": $homeId,
    //           \"rating\": 7.8,
    //           \"goals\": 0,
    //           \"assists\": 1,
    //           \"amarillas\": 0,
    //           \"rojas\": 0,
    //           \"is_injured\": false,
    //           \"mvp\": true
    //         }
    //       ]
    //     }
    //     Devuelve SOLO el texto JSON válido, sin markdown ni comillas invertidas.
    //     ";
    // }

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
            ->withApiKey(config('services.gemini-2.api_key'))
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
        Eres un analista experto en Football Manager. Tu objetivo es extraer las estadísticas de los jugadores de la imagen y
        devolverlas en formato JSON.

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
                 a) Si el evento se ve como \"minuto - jugador1 - jugador2\" => jugador1 = GOL, jugador2 = ASISTENCIA. Inicia el texto desde la izquierda a la derecha, el primer jugador que aparezca después del minuto es el goleador, el segundo jugador es el asistente.
                    Se debe observa algo así: \"23' - J. Pérez - Carlos Gómez\" con un icono de balón sin cruz roja => Juan Pérez = GOL, Carlos Gómez = ASISTENCIA.
                 b) Si el evento se ve como \"jugador1 - jugador2 - minuto\" => jugador1 = ASISTENCIA, jugador2 = GOL. Inicia el texto desde el centro a la derecha, el primer jugador que aparezca antes del minuto es el asistente, el segundo jugador es el goleador.
                    Se debe observa algo así: \"J. Pérez - Carlos Gómez - 23'\" con un icono de balón sin cruz roja => Juan Pérez = ASISTENCIA, Carlos Gómez = GOL.
                 c) Estas reglas aplican SOLO a goles válidos (sin balón con cruz roja).
                 d) Si el evento se ve como \"minuto - jugador1\" pero con el ícono de balón => jugador1 = GOL.
                 e) Si el evento se ve como \"jugador1 - minuto\" pero con el ícono de balón => jugador1 = GOL.
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
