<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Services\RulesAgentService;
use App\Services\MarketAgentService;

class ChatbotController extends Controller
{
    public function __construct(
        private RulesAgentService $rulesAgent,
        private MarketAgentService $marketAgent
    ) {}

    public function chat(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
            'agent'   => 'required|in:rules,market', // Validamos a quién le habla
            'filters' => 'nullable|array'
        ]);

        // 1. Control de Límite Diario (Rate Limiter manual)
        $userId = auth()->id() ?: $request->ip();
        $cacheKey = "chatbot_usage_{$userId}_" . now()->format('Y-m-d');
        $usageCount = Cache::get($cacheKey, 0);

        if ($usageCount >= 10) {
            return response()->json([
                'message' => '🟥 ¡Tarjeta Roja! Has alcanzado el límite de 6 consultas diarias. Vuelve mañana.'
            ], 429);
        }

        // 2. Recuperar o crear la Conversación Específica para ese Agente
        $sessionId = $userId ? null : session()->getId();

        $conversation = Conversation::where(function($q) use ($userId, $sessionId) {
                $q->where('user_id', $userId)->orWhere('session_id', $sessionId);
            })
            ->where('agent_type', $request->agent) // ¡Clave! Para no mezclar historiales
            ->latest()
            ->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'user_id' => $userId,
                'session_id' => $sessionId,
                'agent_type' => $request->agent,
                'messages' => [], // Inicializa el array JSON vacío
            ]);
        }

        // 3. Delegar al experto usando SOLID
        try {
            if ($request->agent === 'rules') {
                // Llamada directa al servicio de reglas
                $botReply = $this->rulesAgent->getResponse($conversation, $request->content);
            } else {
                // Llamada directa al servicio de mercado
                $botReply = $this->marketAgent->getResponse($conversation, $request->content, $request->filters ?? []);
            }

            // Incrementamos el uso solo si fue exitoso
            Cache::put($cacheKey, $usageCount + 1, now()->endOfDay());

            return response()->json([
                'message' => $botReply
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error de conexión con los servidores de la Superliga.',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
