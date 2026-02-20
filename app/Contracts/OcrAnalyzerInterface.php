<?php

namespace App\Contracts;

use Illuminate\Http\UploadedFile;

interface OcrAnalyzerInterface
{
    /**
     * Analiza una imagen y devuelve los datos estructurados del partido.
     */
    public function analyzeMatchImage(UploadedFile $image, array $context): array;
}
