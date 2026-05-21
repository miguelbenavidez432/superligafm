<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFixtureRequest;
use App\Http\Requests\UpdateFixtureRequest;
use Illuminate\Http\Request;
use App\Services\FixtureService;
use App\Services\FixtureAlertService;
use Illuminate\Http\JsonResponse;

class FixtureController extends Controller
{
    // Inyección del servicio de negocio
    public function __construct(
        private FixtureService $fixtureService,
        private FixtureAlertService $alertService
    ) {
    }

    public function index(Request $request)
    {
        try {
            $fixtures = $this->fixtureService->getAllFixtures($request->all());
            return response()->json(['data' => $fixtures], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener el fixture: ' . $e->getMessage()], 500);
        }
    }

    public function store(StoreFixtureRequest $request)
    {
        try {
            // Pasamos solo los datos validados limpiamente al servicio
            $fixture = $this->fixtureService->createFixture($request->validated());
            return response()->json([
                'message' => 'Partido creado correctamente',
                'data' => $fixture
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al crear el partido: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $fixture = $this->fixtureService->getFixtureById($id);
            return response()->json(['data' => $fixture], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Partido no encontrado'], 404);
        }
    }

    public function update(UpdateFixtureRequest $request, $id)
    {
        try {
            // El request ya viene completamente validado aquí
            $fixture = $this->fixtureService->updateFixture($id, $request->validated());
            return response()->json([
                'message' => 'Partido actualizado correctamente',
                'data' => $fixture
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al actualizar el partido: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $this->fixtureService->deleteFixture($id);
            return response()->json(['message' => 'Partido eliminado correctamente'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al eliminar el partido: ' . $e->getMessage()], 500);
        }
    }

    public function getUserAlerts(): JsonResponse
    {
        $userId = auth()->id();

        $alerts = $this->alertService->getExpiringFixturesForUser($userId);

        return response()->json(['data' => $alerts]);
    }
}
