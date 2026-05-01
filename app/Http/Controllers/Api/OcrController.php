<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Contracts\OcrAnalyzerInterface;
use App\Services\MatchContextService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Services\GeminiOcrService;
use App\Services\OpenAIOcrService;
use App\Services\OpenRouterOcrService;

class OcrController extends Controller
{
    // Inyección de dependencias (DIP)
    public function __construct(
        private OcrAnalyzerInterface $ocrAnalyzer,
        private MatchContextService $contextService,
        private GeminiOcrService $geminiAnalyzer,
        private OpenAIOcrService $openAiAnalyzer,
        private OpenRouterOcrService $openRouterAnalyzer,
    ) {
    }

    public function processImage(Request $request)
    {
        set_time_limit(300); // Le damos 2 minutos (120 segundos) a PHP en lugar de 30
        ini_set('memory_limit', '512M');

        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg|max:10240',
            'home_team_id' => 'required|integer',
            'away_team_id' => 'required|integer'
        ]);

        try {
            $context = $this->contextService->getPlayersContext(
                $request->input('home_team_id'),
                $request->input('away_team_id')
            );

            // Intentamos extraer la data usando nuestra nueva función con Fallback
            $data = $this->executeOcrWithFallback(
                $request->file('image'),
                $context,
                $request->input('home_team_id'),
                $request->input('away_team_id')
            );

            return response()->json([
                'success' => true,
                'data' => $data
            ]);

        } catch (\Exception $e) {
            Log::error('OCR Error Crítico: ' . $e->getMessage());
            return response()->json(['error' => 'Nuestras IAs están saturadas. Intenta en un minuto.'], 500);
        }
    }

    public function processMultipleImages(Request $request)
    {
        // Tu validación inicial
        $request->validate([
            'images' => 'required|array|max:5',
            'images.*' => 'required|image|mimes:jpeg,png,jpg|max:10240',
            'home_team_id' => 'required|integer',
            'away_team_id' => 'required|integer'
        ]);

        $context = $this->contextService->getPlayersContext(
            $request->input('home_team_id'),
            $request->input('away_team_id')
        );

        $results = [];

        foreach ($request->file('images') as $image) {
            try {
                // Usamos la función de Fallback para múltiples imágenes
                $data = $this->executeOcrWithFallback(
                    $image,
                    $context,
                    $request->input('home_team_id'),
                    $request->input('away_team_id')
                );

                $results[] = [
                    'filename' => $image->getClientOriginalName(),
                    'success' => true,
                    'data' => $data
                ];
                // \Throwable nos protege de todo
            } catch (\Throwable $e) {
                $results[] = [
                    'filename' => $image->getClientOriginalName(),
                    'success' => false,
                    'error' => $e->getMessage()
                ];
            }
        }

        return response()->json(['success' => true, 'results' => $results]);
    }

    private function executeOcrWithFallback($image, $context, $homeId, $awayId)
    {
        try {
            // INTENTO 1: GEMINI
            return $this->geminiAnalyzer->analyzeMatchImage($image, $context, $homeId, $awayId);
        } catch (\Exception $e) {
            // GEMINI FALLÓ (High Demand, etc). Lo anotamos en el log para saberlo nosotros.
            Log::warning('Gemini falló: ' . $e->getMessage() . '. Pasando a OpenRouter...');

            // INTENTO 2: OPENROUTER (El usuario no se entera del fallo de Gemini)
            return $this->openRouterAnalyzer->analyzeMatchImage($image, $context, $homeId, $awayId);
        }
    }
}
