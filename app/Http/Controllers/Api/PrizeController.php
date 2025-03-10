<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\PrizeResource;
use App\Models\Prize;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePrizeRequest;
use App\Http\Requests\UpdatePrizeRequest;
use App\Models\Team;

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
        $prize = Prize::create($request->validated());

        $team = Team::find($request->team_id);

        $user = $team->user;
        $user->profits += $request->amount;
        $user->save();

        return new PrizeResource($prize);
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
        $team->profits += ($request->amount - $oldAmount);
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
