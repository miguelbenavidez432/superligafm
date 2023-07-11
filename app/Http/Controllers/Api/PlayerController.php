<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Player;
use App\Http\Requests\StorePlayerRequest;
use App\Http\Requests\UpdatePlayerRequest;
use App\Http\Resources\PlayerResource;
use Illuminate\Http\Request;

class PlayerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return PlayerResource::collection(
            Player::query()->orderBy('ca', 'desc')->paginate(500)
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePlayerRequest $request)
    {
        $data = $request->validated();
        $player = Player::create($data);
        return response(new PlayerResource($player), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Player $player)
    {
        return new PlayerResource($player);
    }

    
    public function transfer(Request $request)
    {
        $datosActualizados = $request->input('data');

        $upsertData = [];
        foreach ($datosActualizados as $dato) {
            $upsertData[] = [
                'id' => $dato['id'],
                'id_team' => $dato['id_team'],
                'name' => $dato['name'],
                'age' => $dato['age'],
                'ca' => $dato['ca'],
                'pa' => $dato['pa'],
                'value' => $dato['value'],
                // Agrega más columnas según tus necesidades
            ];
        }

        Player::upsert($upsertData, 'id', ['id_team']);

        return response()->json(['message' => 'Datos actualizados correctamente']);
    }

    /**
     * Update the specified resource in storage.
     */

    public function update(UpdatePlayerRequest $request, Player $player)
    {
        $data = $request->validated();

        $player->update($data);

        return new PlayerResource($player);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Player $player)
    {
        $player->delete();
        return response('', 204);
    }
}
