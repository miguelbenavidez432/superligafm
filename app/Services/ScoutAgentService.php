<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class ScoutAgentService
{
    /**
     * Genera el reporte del agente usando la IA y lo envía a Discord.
     */
    public function generateReport(string $playerName, array $playerStats): string
    {
        // 1. Obtener la opinión de la IA (Ahora usando OpenRouter)
        $report = $this->askOpenRouter($playerName, $playerStats);

        // 2. Notificar a la comunidad en Discord
        $this->notifyDiscord($playerName, $report);

        return $report;
    }

    /**
     * Lógica exclusiva de comunicación con la API de OpenRouter.
     */
    private function askOpenRouter(string $playerName, array $stats): string
    {
        $systemPrompt = "Eres un agente deportivo experto y un scout implacable de la Superliga.
        Tu trabajo es analizar las estadísticas de un jugador y decirle a un mánager si es un buen fichaje o no.
        REGLAS ESTRICTAS:
        1. Basa tu análisis ÚNICAMENTE en el JSON de estadísticas que te enviaré. No inventes datos ni partidos.
        2. Sé brutalmente honesto y directo. Si el rating (average_rating) es menor a 6.0 o tiene muchas rojas (red_cards),
        advierte que es un mal fichaje. Si tiene muchos goles (goals) o asistencias (assists), elógialo.
        3. Mantén tu respuesta en un solo párrafo, máximo 4 o 5 oraciones. Tono irónico pero profesional.
        4. Da una respuesta formalmente redactada, como si fueras un scout veterano escribiendo un informe para su director deportivo.";

        // Endpoint oficial de OpenRouter
        $openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';

        $response = Http::withToken(env('DEEPSEEK_API_KEY'))
            ->withHeaders([
                'Content-Type' => 'application/json',
                // OpenRouter recomienda enviar estos headers para sus estadísticas internas
                'HTTP-Referer' => env('APP_URL', 'http://localhost'),
                'X-Title' => 'Superliga Football Manager',
            ])
            ->post($openRouterUrl, [
                // Usamos un modelo de Llama 3 (Meta) que es excelente, rapidísimo y tiene tier gratuito en OpenRouter
                'model' => 'anthropic/claude-opus-4.7-fast:free',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => "Datos del jugador {$playerName}: " . json_encode($stats)]
                ],
                'temperature' => 0.4, // Mantiene el análisis lógico y estructurado
            ]);

        if ($response->failed()) {
            throw new Exception('Error al contactar a OpenRouter: ' . $response->body());
        }

        return $response->json('choices.0.message.content');
    }

    /**
     * Lógica exclusiva de envío de Webhooks a Discord.
     */
    private function notifyDiscord(string $playerName, string $reportText): void
    {
        $webhookUrl = env('DISCORD_AGENT_WEBHOOK');

        if (!$webhookUrl) return;

        $discordMessage = "🕵️ **Reporte de Ojeo Solicitado** 🕵️\n\n";
        $discordMessage .= "**Jugador:** {$playerName}\n";
        $discordMessage .= "**El Agente dice:**\n> *" . trim($reportText) . "*";

        Http::post($webhookUrl, [
            'content' => $discordMessage
        ]);
    }
}
