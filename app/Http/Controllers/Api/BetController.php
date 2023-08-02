<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bet;
use App\Http\Requests\StoreBetRequest;
use App\Http\Requests\UpdateBetRequest;
use App\Http\Resources\BetResource;
use App\Models\User;
use Illuminate\Http\Request;

class BetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return BetResource::collection(
            Bet::query()->orderBy('created_at', 'desc')->paginate(15)
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBetRequest $request)
    {
        $data = $request->validated();
        $bet = Bet::create($data);
        return response(new BetResource($bet), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Bet $bet)
    {
        return new BetResource($bet);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBetRequest $request, Bet $bet)
    {
        $data = $request->validated();
        $bet->update($data);
        return new BetResource($bet);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Bet $bet)
    {
        $bet->delete();
        return response('', 204);
    }

    public function attach(Request $request)
    {

        $validatedData = $request->validate([
            'id_bet' => 'required|exists:bets,id',
            'id_user' => 'required|exists:users,id',
            'selected_option' => 'required',
            'amount' => 'required|integer',
        ]);

        $user = User::find($validatedData['id_user']);
        $bet = Bet::find($validatedData['id_bet']);

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
