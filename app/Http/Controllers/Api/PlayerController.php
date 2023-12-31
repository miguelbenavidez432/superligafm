<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Player;
use App\Http\Requests\StorePlayerRequest;
use App\Http\Requests\UpdatePlayerRequest;
use App\Http\Resources\PlayerResource;
use App\Models\Rescission;
use Illuminate\Http\Request;

class PlayerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return PlayerResource::collection(
            Player::query()->orderBy('ca', 'desc')->paginate(2000)
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
                'status' => $dato['status'],
            ];
        }

        Player::upsert($upsertData, 'id', ['id_team', 'status']);

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

    public function playerOffers($id)
    {
        $player = Player::findOrFail($id);
        $offers = Rescission::where('id_player', $id)->get();

        return response()->json([
            'player' => $player,
            'offers' => $offers,
        ]);
    }

    public function searchPlayers(Request $request)
    {
        $name = $request->query('name');

        $players = Player::query()->where('name', 'LIKE', '%' . $name . '%')->get();

        return PlayerResource::collection($players);
    }

    public function filteredPlayers(Request $request)
    {
        $teamId = $request->input('id_team');

        $players = Player::query()
            ->where('id_team', $teamId)
            ->orderBy('ca', 'desc')
            ->get();

        return PlayerResource::collection($players);
    }
}
