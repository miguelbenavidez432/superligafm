<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\Rule;
use Illuminate\Support\Facades\Http;

class RulesAgentService
{
    public function getResponse(Conversation $conversation, string $userMessage): string
    {
        $history = is_array($conversation->messages) ? $conversation->messages : json_decode($conversation->messages, true) ?? [];

        // Armar el reglamento
        $rules = Rule::orderBy('order_index', 'asc')->get();
        $reglamentoTexto = "";
        foreach ($rules as $rule) {
            $reglamentoTexto .= "SECCIÓN " . $rule->title . ": " . strip_tags($rule->content) . "\n\n";
        }

        $systemInstruction = "Eres el Árbitro Virtual de la Superliga FM. Tu única fuente de verdad es este reglamento: \n\n" . $reglamentoTexto . "\n\n Responde de forma clara y basándote solo en estos datos. Responde como si los organizadores fuesen todos tramposos... (resto de tus instrucciones) ...Tu nombre es Alvarito.";

        $contents = [];

        if (empty($history)) {
            $contents[] = ['role' => 'user', 'parts' => [['text' => $systemInstruction . "\n\nEntendido?"]]];
            $contents[] = ['role' => 'model', 'parts' => [['text' => "¡Entendido! Soy Alvarito. ¡Pregunta lo que quieras!"]]];
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
            'parts' => [['text' => $userMessage]]
        ];

        // Llamada a Gemini 2.5 Flash (El que ya usabas para Alvarito)
        $response = Http::withHeaders(['Content-Type' => 'application/json'])
            ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . env('GEMINI_API_KEY_CHAT'), [
                'contents' => $contents,
                'generationConfig' => ['temperature' => 0.2, 'maxOutputTokens' => 1024],
            ]);

        $data = $response->json();

        if (!isset($data['candidates'][0]['content']['parts'][0]['text'])) {
            throw new \Exception("Gemini falló: " . json_encode($data));
        }

        $botReply = $data['candidates'][0]['content']['parts'][0]['text'];

        // Actualizar BD (Guardamos en JSON)
        $history[] = ['role' => 'user', 'content' => $userMessage];
        $history[] = ['role' => 'assistant', 'content' => $botReply];
        $conversation->update(['messages' => $history]);

        return $botReply;
    }
}
