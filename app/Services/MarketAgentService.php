<?php

namespace App\Services;

use App\Repositories\PlayerRepository;
use App\Models\Conversation;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MarketAgentService
{
    public function __construct(private PlayerRepository $playerRepo) {}

    public function getResponse(Conversation $conversation, string $userMessage, array $filters): string
    {
        $history = is_array($conversation->messages) ? $conversation->messages : json_decode($conversation->messages, true) ?? [];

        // 1. Obtener Datos
        $profitable = $this->playerRepo->getProfitablePlayers($filters);
        $opportunities = $this->playerRepo->getMarketOpportunities();

        Log::info('--- DEBUG ASESOR DE MERCADO ---');
        Log::info('Filtros enviados por React:', $filters);
        Log::info('Cantidad de Rentables encontrados: ' . $profitable->count());
        Log::info('Cantidad de Oportunidades CA: ' . $opportunities['top_ca']->count());
        Log::info('Cantidad de Oportunidades Rating: ' . $opportunities['top_rating']->count());
        Log::info('-------------------------------');
        // 🔥 FIN DEL LOG 🔥

        $systemPrompt = "Eres el Asesor de Mercado de la Superliga. Tu objetivo es recomendar fichajes a los managers basándote en datos reales de los jugadores.
        Analiza los siguientes DATOS y responde a la consulta del usuario de forma clara y directa. Además de recomendar jugadores específicos,
        da consejos generales sobre qué jugador sería ideal para fichar según esta información pero sin tomar siempre el jugador con mayor ca o mejor promedio de estadísticas.
        USAR SOLO ESTOS DATOS PARA RESPONDER, NO INVENTES NADA:
        Filtros del usuario: " . json_encode($filters) . ".
        DATOS:
        Transferibles: {$profitable->toJson()}. Top CA: " . json_encode($opportunities['top_ca']) . ". Top Rating: " . json_encode($opportunities['top_rating']) . ".
        Sujetate a estos datos para aconsejar fichajes. Basate en ellos para responder a la consulta del usuario: {$userMessage} y dar una respuesta coherente y útil. Si no hay jugadores que cumplan los filtros, sugiere qué tipo de jugador sería ideal fichar según los datos que tienes.
        Al final alista los jugadores con su valoración para los de mejor estadísticas y los de mejor CA, pero sin repetir jugadores. ";

        // 2. Preparar payload OpenRouter (formato OpenAI)
        $messages = [['role' => 'system', 'content' => $systemPrompt]];

        foreach ($history as $msg) {
            $messages[] = ['role' => $msg['role'], 'content' => $msg['content']];
        }
        $messages[] = ['role' => 'user', 'content' => $userMessage];

        // 3. Llamar API
        $response = Http::withToken(env('DEEPSEEK_API_KEY'))
            ->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => 'inclusionai/ring-2.6-1t:free',
                'messages' => $messages,
                'temperature' => 0.6,
            ]);

        if ($response->failed()) throw new \Exception('Error en OpenRouter');

        $aiReply = $response->json('choices.0.message.content');

        // 4. Actualizar BD
        $history[] = ['role' => 'user', 'content' => $userMessage];
        $history[] = ['role' => 'assistant', 'content' => $aiReply];
        $conversation->update(['messages' => $history]);

        return $aiReply;
    }
}
