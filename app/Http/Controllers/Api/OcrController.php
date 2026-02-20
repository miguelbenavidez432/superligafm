<?php
// filepath: app/Http/Controllers/Api/OcrController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Contracts\OcrAnalyzerInterface;
use App\Services\MatchContextService;
use Illuminate\Support\Facades\Log;

class OcrController extends Controller
{
    // Inyección de dependencias (DIP)
    public function __construct(
        private OcrAnalyzerInterface $ocrAnalyzer,
        private MatchContextService $contextService
    ) {}

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

            // El controlador no sabe que usa Gemini, solo usa la interfaz
            $data = $this->ocrAnalyzer->analyzeMatchImage($request->file('image'), $context);

            return response()->json([
                'success' => true,
                'data' => $data
            ]);

        } catch (\Exception $e) {
            Log::error('OCR Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
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
                $data = $this->ocrAnalyzer->analyzeMatchImage($image, $context);
                $results[] = [
                    'filename' => $image->getClientOriginalName(),
                    'success' => true,
                    'data' => $data
                ];
            } catch (\Exception $e) {
                $results[] = [
                    'filename' => $image->getClientOriginalName(),
                    'success' => false,
                    'error' => $e->getMessage()
                ];
            }
        }

        return response()->json(['success' => true, 'results' => $results]);
    }
}
