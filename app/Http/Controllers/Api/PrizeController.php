<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\PrizeResource;
use App\Models\Prize;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePrizeRequest;
use App\Http\Requests\UpdatePrizeRequest;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use App\Contracts\PrizeAssignmentInterface;

class PrizeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function __construct(
        private PrizeAssignmentInterface $prizeAssignmentService
    ) {
    }

    public function index()
    {
        $prizes = Prize::all();
        return PrizeResource::collection($prizes);
    }

    /**
     * FASE 1: CREAR PLANTILLA DE PREMIOS
     * Ahora solo crea los registros base. Nada de sumar dinero aquí.
     */
    public function store(StorePrizeRequest $request)
    {
        $data = $request->validated();

        foreach ($data['prizes'] as $prizeData) {
            Prize::create([
                'tournament_id' => $prizeData['tournament_id'],
                'amount' => $prizeData['amount'],
                'description' => $prizeData['description'] ?? "Premio por posición {$prizeData['position']}",
            ]);
        }

        return response()->json(['message' => 'Plantilla de premios creada correctamente'], 201);
    }

    /**
     * FASE 2: ASIGNAR PREMIOS (NUEVO ENDPOINT)
     * Recibe el torneo y qué equipo quedó en qué posición.
     */
    public function assign(Request $request)
    {
        $request->validate([
            'tournament_id' => 'required|exists:tournaments,id',
            // Esperamos un array clave-valor: [ "1" => 15, "2" => 8, "3" => 12 ] (posición => team_id)
            'assignments' => 'required|array',
        ]);

        try {
            // Delegamos la lógica transaccional a nuestro servicio SOLID
            $this->prizeAssignmentService->assignTournamentPrizes(
                $request->tournament_id,
                $request->assignments
            );

            return response()->json(['message' => 'Premios asignados y presupuestos actualizados correctamente'], 200);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Prize $prize)
    {
        return new PrizeResource($prize->load(['tournament', 'team']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePrizeRequest $request, Prize $prize)
    {
        $oldAmount = $prize->amount;
        $prize->update($request->validated());

        $team = Team::find($request->team_id);
        $user = User::find($team->id_user);
        $user->profits += $request->amount - $oldAmount;
        $team->save();

        return new PrizeResource($prize);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Prize $prize)
    {
        $team = Team::find($prize->team_id);
        $team->profits -= $prize->amount;
        $team->save();

        $prize->delete();

        return response()->json(null, 204);
    }
}
