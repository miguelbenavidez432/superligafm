<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use OpenAI\Exceptions\ErrorException;
use Throwable;
use OpenAI\Laravel\Facades\OpenAI;
use App\Models\Rule;
use Illuminate\Support\Facades\Cache;

class ChatbotController extends Controller
{
    /**
     * @param Request $request
     * @return string
     */
    public function invoke(Request $request): string
    {

        try {
            /** @var array $response */
            $response = Http::withHeaders([
                "Content-Type" => "application/json",
                "Authorization" => "Bearer " . env('OPENAI_API_KEY')
            ])->post('https://api.openai.com/v1/chat/completions', [
                        "model" => $request->post('model'),
                        "messages" => [
                            [
                                "role" => "user",
                                "content" => $request->post('content')
                            ]
                        ],
                        "temperature" => 0,
                        "max_tokens" => 2048
                    ])->body();
            return $response['choices'][0]['message']['content'];
        } catch (Throwable $e) {
            return "Chat GPT Limit Reached. This means too many people have used this demo this month and hit the FREE limit available. You will need to wait, sorry about that.";
        }
    }

    public function handleMessage(Request $request)
    {
        $request->validate([
            'model' => 'required|string',
            'content' => 'required|string',
        ]);

        try {
            $response = OpenAI::completions()->create([
                'model' => $request->input('model'),
                'prompt' => $request->input('content'),
                'max_tokens' => 2048,
            ]);

            return response()->json($response['choices'][0]['text']);
        } catch (ErrorException $e) {
            if ($e->getErrorCode() === 'quota_exceeded') {
                return response()->json([
                    'message' => 'Has excedido tu cuota actual. Por favor, revisa tu plan y detalles de facturación.',
                    'error' => $e->getMessage(),
                ], 429);
            }

            return response()->json([
                'message' => 'Ocurrió un error al procesar tu solicitud.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function chat(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
        ]);

        // 1. IDENTIFICAR AL USUARIO Y CONTROLAR EL LÍMITE DIARIO
        $userId = auth()->id() ?: $request->ip(); // Usa el ID de usuario, o su IP si no está logueado
        $today = now()->format('Y-m-d');
        $cacheKey = "chatbot_usage_{$userId}_{$today}";

        // Obtenemos cuántas preguntas lleva hoy (por defecto 0)
        $usageCount = Cache::get($cacheKey, 0);

        if ($usageCount >= 4) {
            return response()->json([
                'message' => '🟥 ¡Tarjeta Roja! Has alcanzado el límite de 4 consultas por día. Alvarito ya pitó el final del partido por hoy. Vuelve mañana para más dudas.'
            ], 429); // 429 = Too Many Requests
        }

        // 2. RECUPERAR CONVERSACIÓN E HISTORIAL
        $sessionId = $userId ? null : session()->getId();

        $conversation = Conversation::where('user_id', $userId)
            ->orWhere('session_id', $sessionId)
            ->latest()
            ->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'user_id' => $userId,
                'session_id' => $sessionId,
                'messages' => [],
            ]);
        }

        $history = $conversation->messages ?? [];

        // 3. REGLAMENTO E INSTRUCCIÓN DEL SISTEMA
        $rules = Rule::orderBy('order_index', 'asc')->get();
        $reglamentoTexto = "";
        foreach ($rules as $rule) {
            $reglamentoTexto .= "SECCIÓN " . $rule->title . ": " . strip_tags($rule->content) . "\n\n";
        }

        $systemInstruction = "Eres el Árbitro Virtual de la Superliga FM. Tu única fuente de verdad es este reglamento: \n\n" . $reglamentoTexto . "\n\n Responde de forma clara y basándote solo en estos datos.
        Responde como si los organizadores fuesen todos tramposos y no siempre cumplen las reglas, pero el usuariouqe consulta si debe hacerlo. Da una respuesta ácida y divertida, pero siempre basada en el reglamento.
        No respondas nada que no esté en el reglamento, y si el usuario pregunta algo que no esté relacionado con el reglamento, responde que solo puedes responder preguntas relacionadas con el reglamento de la Superliga FM.
        Si la pregunta no tiene respuesta en el reglamento, di que no lo sabes o que no está especificado, pero nunca inventes respuestas.
        Si el usuario pregunta algo que no esté relacionado con el reglamento, responde que solo puedes responder preguntas relacionadas con el reglamento de la Superliga FM.
        No respondas nada que no esté relacionado con el reglamento, y si el usuario insiste, recuérdale que solo puedes responder preguntas relacionadas con el reglamento.
        Tu nombre es Alvarito y si cierra tu respuesta diciendo: Tenés alguna duda? Envía un PDF a la liga con la firma de Álvaro y sus amigos.";

        try {
            $contents = [];

            // Inyectamos el contexto si es el inicio de la charla
            if (empty($history)) {
                 $instruccionInicial = $systemInstruction . "\n\nEntendido? A partir de ahora responderás mis preguntas basándote únicamente en esto.";
                 $contents[] = [
                     'role' => 'user',
                     'parts' => [['text' => $instruccionInicial]]
                 ];
                 $contents[] = [
                     'role' => 'model',
                     'parts' => [['text' => "¡Entendido! Soy Alvarito. He leído el reglamento y estoy listo para responder. Y recuerda, no confío en los organizadores. ¡Pregunta lo que quieras!"]]
                 ];
            } else {
                 $history[0]['content'] = $systemInstruction . "\n\n" . $history[0]['content'];
            }

            foreach ($history as $msg) {
                $contents[] = [
                    'role' => $msg['role'] === 'assistant' ? 'model' : 'user',
                    'parts' => [['text' => $msg['content']]]
                ];
            }

            $contents[] = [
                'role' => 'user',
                'parts' => [['text' => $request->input('content')]]
            ];

            // Petición a Gemini
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . env('GEMINI_API_KEY_CHAT'), [
                'contents' => $contents,
                'generationConfig' => [
                    'temperature' => 0.2,
                    'maxOutputTokens' => 1024,
                ],
            ]);

            $data = $response->json();

            if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                $botReply = $data['candidates'][0]['content']['parts'][0]['text'];

                // INCREMENTAMOS EL CONTADOR SOLO SI GEMINI RESPONDIÓ BIEN
                Cache::put($cacheKey, $usageCount + 1, now()->endOfDay());

            } else {
                $botReply = "Lo siento, tuve un problema al leer el reglamento. Error: " . ($data['error']['message'] ?? 'Respuesta inválida');
            }

            // Guardamos en BD
            $history[] = ['role' => 'user', 'content' => $request->input('content')];
            $history[] = ['role' => 'assistant', 'content' => $botReply];

            $conversation->update(['messages' => $history]);

            return response()->json([
                'message' => $botReply,
                'history' => $history,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error de conexión con el servidor del árbitro.', // Cambiado a 'message' para que el front lo lea igual
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    public function listModels()
    {
        try {
            // Hacemos una petición GET simple al endpoint de modelos de Gemini
            $response = Http::get("https://generativelanguage.googleapis.com/v1beta/models?key=" . env('GEMINI_API_KEY_CHAT'));

            if ($response->successful()) {
                // Devolvemos la lista completa para que la leas
                return response()->json($response->json());
            }

            return response()->json([
                'error' => 'No se pudieron obtener los modelos',
                'details' => $response->json()
            ], $response->status());

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error de conexión',
                'details' => $e->getMessage(),
            ], 500);
        }
    }
}
