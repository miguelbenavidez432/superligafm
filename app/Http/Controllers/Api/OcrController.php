<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class OcrController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function process(Request $request)
    {
        $request->validate([
            'images' => 'required|array',
            'images.*' => 'required|image|mimes:jpg,jpeg,png|max:10240'
        ]);

        $apiKey = env('GOOGLE_VISION_API_KEY');
        $endpoint = "https://vision.googleapis.com/v1/images:annotate?key={$apiKey}";

        dd($endpoint);

        $results = [];

        foreach ($request->file('images') as $file) {
            $content = base64_encode(file_get_contents($file->getRealPath()));

            $payload = [
                "requests" => [
                    [
                        "image" => ["content" => $content],
                        "features" => [
                            ["type" => "DOCUMENT_TEXT_DETECTION", "maxResults" => 1]
                        ]
                    ]
                ]
            ];

            $resp = Http::withHeaders([
                'Content-Type' => 'application/json'
            ])->post($endpoint, $payload);

            if ($resp->failed()) {
                return response()->json(['error' => 'Google Vision error', 'details' => $resp->body()], 500);
            }

            $json = $resp->json();

            // text principal: fullTextAnnotation.text o textAnnotations[0].description
            $text = '';
            if (!empty($json['responses'][0]['fullTextAnnotation']['text'])) {
                $text = $json['responses'][0]['fullTextAnnotation']['text'];
            } elseif (!empty($json['responses'][0]['textAnnotations'][0]['description'])) {
                $text = $json['responses'][0]['textAnnotations'][0]['description'];
            }

            // parsear a players (función abajo)
            $players = $this->parseOcrText($text);

            // opcional: guardar
            // $ocr = OcrResult::create([...]);

            $results[] = [
                'filename' => $file->getClientOriginalName(),
                'raw_text' => $text,
                'players' => $players,
            ];
        }

        return response()->json(['results' => $results], 200);
    }

    private function parseOcrText($text)
    {
        // función simple de parsing (ver abajo)
        return $this->extractPlayersFromText($text);
    }

    private function extractPlayersFromText($text)
    {
        $lines = preg_split('/\r\n|\r|\n/', $text);
        $players = [];
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '')
                continue;

            // buscar rating X.Y
            if (preg_match('/([0-9]\.[0-9])/', $line, $mRating)) {
                $rating = (float) $mRating[1];
            } else {
                $rating = null;
            }

            // heurística de nombre: palabras con mayúscula inicial (2+ palabras)
            if (preg_match('/([A-ZÑÁÉÍÓÚ][a-zñáéíóú]+(?:\s+[A-ZÑÁÉÍÓÚa-zñáéíóú\-\']+){1,3})/', $line, $mName)) {
                $name = trim($mName[1]);
            } else {
                $name = null;
            }

            if ($name) {
                $players[] = ['name' => $name, 'rating' => $rating, 'raw_line' => $line];
            }
        }

        return $players;
    }
}
