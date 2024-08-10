<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transfer;
use App\Http\Requests\StoreTransferRequest;
use App\Http\Requests\UpdateTransferRequest;
use App\Http\Resources\TransferResource;
use App\Models\User;
use Illuminate\Http\Request;

class TransferController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return TransferResource::collection(
            Transfer::query()->orderBy('created_at', 'asc')->paginate(150)
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTransferRequest $request)
    {
        $data = $request->validated();
        $player = Transfer::create($data);
        return response(new TransferResource($player), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Transfer $transfer)
    {
        return new TransferResource($transfer);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTransferRequest $request, Transfer $transfer)
    {
        $data = $request->validated();

        $transfer->update($data);

        return new TransferResource($transfer);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Transfer $transfer)
    {
        $transfer->delete();
        return response("", 204);
    }

    public function transfer(Request $request)
    {
        $datosActualizados = $request->input('data');

        $upsertData = [];
        $buyUser = null;
        $sellUser = null;
        $transferValue = 0;

        foreach ($datosActualizados as $dato) {
            // Obtener los IDs de los usuarios (managers)
            $buyUser = User::find($dato['buy_by']);
            $sellUser = User::find($dato['sold_by']);

            // Obtener el valor de la transferencia
            $transferValue = $dato['costs'];

            // Actualizar el presupuesto del comprador
            if ($buyUser) {
                $buyUser->profits -= $transferValue;
                $buyUser->save();
            }

            // Actualizar el presupuesto del vendedor
            if ($sellUser) {
                $sellUser->profits += $transferValue;
                $sellUser->save();
            }

            // Crear el array para upsert
            $upsertData[] = [
                'transferred_players' => $dato['transferred_players'],
                'id_team_from' => $dato['id_team_from'],
                'id_team_to' => $dato['id_team_to'],
                'budget' => $transferValue,
                'created_by' => $dato['created_by'],
                'buy_by' => $dato['buy_by'],
                'sold_by' => $dato['sold_by'],
            ];
        }

        // Realizar el upsert en la tabla de Transferencias
        Transfer::upsert($upsertData, 'id', ['transferred_players']);

        return response()->json(['message' => 'Datos actualizados correctamente']);
    }
}
