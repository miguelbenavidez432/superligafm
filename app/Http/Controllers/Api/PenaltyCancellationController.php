<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePenaltyCancellationRequest;
use App\Services\PenaltyCancellationService;
use App\Models\PenaltyCost;
use Exception;
//D:\xampp\htdocs\superligafm\app\Http\Controllers\Api\PenaltyCancellationController.php.php
class PenaltyCancellationController extends Controller
{
    protected $cancellationService;

    public function __construct(PenaltyCancellationService $cancellationService)
    {
        $this->cancellationService = $cancellationService;
    }

    public function indexCosts()
    {
        return response()->json(PenaltyCost::all());
    }

    public function store(StorePenaltyCancellationRequest $request)
    {
        try {
            $this->cancellationService->processCancellation($request->validated());
            return response()->json(['message' => 'Sanción levantada con éxito y presupuesto descontado.']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
