<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\PrizeResource;
use App\Models\Prize;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePrizeRequest;
use App\Http\Requests\UpdatePrizeRequest;
use App\Models\Team;
use App\Models\User;

class PrizeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $prizes = Prize::with(['tournament', 'team'])->get();
        return PrizeResource::collection($prizes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePrizeRequest $request)
    {
        $data = $request->validated();

        foreach ($data['prizes'] as $prize) {
            $createdPrize = Prize::create($prize);
            $team = Team::find($prize['team_id']);
            if ($team && $team->id_user) {
                $user = User::find($team->id_user);
                if($user){
                    $user->profits += $prize['amount'];
                    $user->save();
                }
            }
        }

        return response()->json(['message' => 'Premios creados correctamente'], 201);
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
