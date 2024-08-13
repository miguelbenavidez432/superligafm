<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Player;
use App\Http\Requests\StorePlayerRequest;
use App\Http\Requests\UpdatePlayerRequest;
use App\Http\Resources\PlayerResource;
use App\Models\Rescission;
use App\Models\Team;
use App\Models\Transfer;
use App\Models\User;
use Illuminate\Http\Request;

class PlayerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return PlayerResource::collection(
            Player::with('team')->orderBy('ca', 'desc')->paginate(2000)
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
            $buyUser = User::find($dato['buy_by']);
            $sellUser = User::find($dato['sold_by']);
            $transferValue = $dato['budget'];

            if ($buyUser) {
                $buyUser->profits -= $transferValue;
                $buyUser->save();
            }

            if ($sellUser) {
                $sellUser->profits += $transferValue;
                $sellUser->save();
            }

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

        Transfer::upsert($upsertData, 'id', ['transferred_players']);

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

    public function block(Request $request)
    {
        $id_team = $request->input('id_team');

        $team = Team::findOrFail($id_team);

        $id_user = $team->id_user;

        $user = User::findOrFall($id_user);

        $player = Player::query()->where('id', $request->input('id'))->get();

        //hacer un match
    }
}
