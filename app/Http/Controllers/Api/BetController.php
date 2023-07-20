<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bet;
use App\Http\Requests\StoreBetRequest;
use App\Http\Requests\UpdateBetRequest;
use App\Http\Resources\BetResource;

class BetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return BetResource::collection(
            Bet::query()->orderBy('created_at', 'desc')->paginate(50)
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
}
