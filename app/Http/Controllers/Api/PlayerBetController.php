<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlayerBet;
use App\Http\Requests\StorePlayerBetRequest;
use App\Http\Requests\UpdatePlayerBetRequest;
use App\Http\Resources\PlayerBetResource;
use App\Models\User;
use Illuminate\Http\Request;

class PlayerBetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return PlayerBetResource::collection(
            PlayerBet::query()->orderBy('created_at', 'desc')->paginate(15)
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePlayerBetRequest $request)
    {
        $data = $request->validated();
        //$data['created_by'] = auth()->user()->id;
        $playerBet = PlayerBet::create($data);
        return response(new PlayerBetResource($playerBet), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(PlayerBet $playerBet)
    {
        return new PlayerBetResource($playerBet);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePlayerBetRequest $request, PlayerBet $playerBet)
    {
        $data = $request->validated();
        $playerBet->update($data);
        return new PlayerBetResource($playerBet);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PlayerBet $playerBet)
    {
        $playerBet->delete();
        return response('', 204);
    }

    public function attach(Request $request)
    {

        $validatedData = $request->validate([
            'id_playerbet' => 'required|exists:bets,id',
            'id_user' => 'required|exists:users,id',
            'selected_option' => 'required',
            'amount' => 'required|integer',
        ]);

        $user = User::find($validatedData['id_user']);
        $bet = PlayerBet::find($validatedData['id_playerbet']);

        $amountToBet = $validatedData['amount'];
        if ($user->profits < $amountToBet) {
            return response()->json(['message' => 'No tienes suficiente presupuesto para esta apuesta'], 400);
        }

        $bet->users()->attach($validatedData['id_user'], [
            'selected_option' => $validatedData['selected_option'],
            'amount' => $amountToBet,
        ]);

        $user->profits -= $amountToBet;
        $user->save();

        $data = [
            'message' => 'Apuesta agregada correctamente',
            'bet' => $bet,
        ];
        return response()->json($data);
    }
}
