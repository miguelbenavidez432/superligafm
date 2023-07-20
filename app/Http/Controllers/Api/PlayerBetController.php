<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlayerBet;
use App\Http\Requests\StorePlayerBetRequest;
use App\Http\Requests\UpdatePlayerBetRequest;
use App\Http\Resources\PlayerResource;

class PlayerBetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return PlayerResource::collection(
            PlayerBet::query()->orderBy('created_at', 'desc')->paginate(50)
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePlayerBetRequest $request)
    {
        $data = $request->validated();
        $playerBet = PlayerBet::create($data);
        return response(new PlayerResource($playerBet), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(PlayerBet $playerBet)
    {
        return new PlayerResource($playerBet);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePlayerBetRequest $request, PlayerBet $playerBet)
    {
        $data = $request->validated();
        $playerBet->update($data);
        return new PlayerResource($playerBet);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PlayerBet $playerBet)
    {
        $playerBet->delete();
        return response('', 204);
    }
}
