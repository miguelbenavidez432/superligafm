<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use OpenAI\Exceptions\ErrorException;
use Throwable;
use OpenAI\Laravel\Facades\OpenAI;

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
                'model' => $request->model,
                'prompt' => $request->content,
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

        $userId = auth()->id();
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

        $messages = $conversation->messages ?? [];

        $messages[] = [
            'role' => 'user',
            'content' => $request->content,
        ];

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('OPENAI_API_KEY'),
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                        'model' => 'gpt-3.5-turbo',
                        'messages' => $messages,
                        'temperature' => 1.0,
                        'max_tokens' => 2048,
                    ])->json();

            $botReply = $response['choices'][0]['message']['content'] ?? 'Error processing response';

            $messages[] = [
                'role' => 'assistant',
                'content' => $botReply,
            ];

            $conversation->update(['messages' => $messages]);

            return response()->json([
                'message' => $botReply,
                'history' => $messages,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Something went wrong'], 500);
        }
    }
}
