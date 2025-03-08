<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\MatchStatisticResource;
use App\Models\MatchStatistic;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMatchStatisticRequest;
use App\Http\Requests\UpdateMatchStatisticRequest;
use Illuminate\Http\Request;

class MatchStatisticController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request )
    {
        if ($request->query('all') == 'true') {
            return MatchStatisticResource::collection(MatchStatistic::with(['player', 'tournament', 'user'])->get());
        } else {
            return MatchStatisticResource::collection(MatchStatistic::with(['player', 'tournament', 'user'])->paginate(100));
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMatchStatisticRequest $request)
    {
        $data = $request->validated();

        $statistic = MatchStatistic::create($data);

        return response(new MatchStatisticResource($statistic), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(MatchStatistic $matchStatistic)
    {
        $game = $matchStatistic->load(['player', 'tournament', 'user']);
        return new MatchStatisticResource($game);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMatchStatisticRequest $request, MatchStatistic $matchStatistic)
    {
        $data = $request->validated();

        $matchStatistic->update($data);

        return new MatchStatisticResource($matchStatistic->load(['player', 'tournament', 'user']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MatchStatistic $matchStatistic)
    {
        //
    }
}
