<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\GameResource;
use App\Models\Game;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGameRequest;
use App\Http\Requests\UpdateGameRequest;
use Illuminate\Http\Request;

class GameController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->query('all') == 'true') {
            return GameResource::collection(Game::with(['tournament', 'teamHome', 'teamAway'])->orderBy('match_date', 'desc')->get());
        } else {
            return GameResource::collection(Game::with(['tournament', 'teamHome', 'teamAway'])->orderBy('match_date', 'desc')->paginate(100));
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGameRequest $request)
    {
        $data = $request->validated();
        $game = Game::create($data);
        return response(new GameResource($game), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Game $game)
    {
        return new GameResource($game);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateGameRequest $request, Game $game)
    {
        $data = $request->validated();
        $game->update($data);
        return new GameResource($game);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Game $game)
    {
        $game->delete();
        return response(null, 204);
    }
}
