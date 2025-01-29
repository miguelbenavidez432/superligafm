<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
}
