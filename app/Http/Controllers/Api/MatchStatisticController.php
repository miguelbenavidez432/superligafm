<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\MatchStatisticResource;
use App\Models\Game;
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
    public function index(Request $request)
    {
        $tournamentId = $request->query('tournament_id');
        $matchId = $request->query('match_id');

        $query = MatchStatistic::with(['player', 'tournament', 'user', 'match'])
            ->selectRaw('player_id, SUM(goals) as total_goals, SUM(assists) as total_assists, SUM(yellow_cards) as total_yellow_cards')
            ->groupBy('player_id')
            ->orderBy('total_goals', 'desc')
            ->orderBy('total_assists', 'desc')
            ->orderBy('total_yellow_cards', 'desc')
            ->where('tournament_id', $tournamentId)
            ->orWhere('match_id', $matchId);


        if ($request->query('all') == 'true') {
            return MatchStatisticResource::collection($query->get());
        } else {
            return MatchStatisticResource::collection($query->paginate(100));
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMatchStatisticRequest $request)
    {
        $statistics = $request->input('statistics');

        foreach ($statistics as $statistic) {
            $filteredData = [];

            foreach ($statistic as $key => $value) {
                if (!($value === 0 || $value === null || $value === false) || in_array($key, ['user_id', 'tournament_id', 'player_id', 'match_id'])) {
                    $filteredData[$key] = $value;
                }
            }

            $relevantStats = ['goals', 'assists', 'yellow_cards', 'red_cards', 'simple_injuries', 'serious_injuries', 'mvp'];
            $allZeroOrNull = true;
            foreach ($relevantStats as $stat) {
                if (isset($filteredData[$stat]) && $filteredData[$stat] !== 0 && $filteredData[$stat] !== null && $filteredData[$stat] !== false) {
                    $allZeroOrNull = false;
                    break;
                }
            }

            if (!$allZeroOrNull) {
                MatchStatistic::create($filteredData);
            }
        }

        $matachId = $request->input('statistics')[0]['match_id'];
        $match = Game::find($matachId);
        $match->update(['status' => 'completed']);

        return response()->json(['message' => 'Estadísticas guardadas correctamente'], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(MatchStatistic $matchStatistic)
    {
        $game = $matchStatistic->load(['player', 'tournament', 'user', 'match']);
        return new MatchStatisticResource($game);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMatchStatisticRequest $request, MatchStatistic $matchStatistic)
    {
        $data = $request->validated();

        $matchStatistic->update($data);

        return new MatchStatisticResource($matchStatistic->load(['player', 'tournament', 'user', 'match']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MatchStatistic $matchStatistic)
    {
        //
    }
}
