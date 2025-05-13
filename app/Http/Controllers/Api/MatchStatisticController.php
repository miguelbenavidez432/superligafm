<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\MatchStatisticResource;
use App\Models\Game;
use App\Models\MatchStatistic;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMatchStatisticRequest;
use App\Http\Requests\UpdateMatchStatisticRequest;
use App\Models\Player;
use App\Models\Tournament;
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
            ->selectRaw('
            player_id,
            tournament_id,
            user_id,
            SUM(goals) as goals,
            SUM(assists) as assists,
            SUM(yellow_cards) as yellow_cards,
            SUM(red_cards) as red_cards,
            SUM(simple_injuries) as simple_injuries,
            SUM(serious_injuries) as serious_injuries,
            SUM(mvp) as mvp
        ')
            ->groupBy(
                'player_id',
                'tournament_id',
                'user_id'
            )
            ->orderBy('goals', 'desc')
            ->orderBy('assists', 'desc')
            ->orderBy('mvp', 'desc');

        // Ajustar la lógica de filtrado
        $query->where(function ($q) use ($tournamentId, $matchId) {
            if ($matchId) {
                $q->where('tournament_id', $tournamentId)
                    ->where('match_id', $matchId);
            } else {
                $q->where('tournament_id', $tournamentId);
            }
        });

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

    public function getStatistics($id_team)
    {
        $id_player = Player::where('id_team', $id_team)->pluck('id');

        $query = MatchStatistic::selectRaw('
            player_id,
            match_id,
            match_statistics.tournament_id,
            SUM(yellow_cards) as yellow_cards,
            SUM(red_cards) as red_cards,
            MAX(simple_injuries) as simple_injuries,
            MAX(serious_injuries) as serious_injuries,
            sum(goals) as goals,
            sum(assists) as assists,
            SUM(mvp) as mvp,
            CASE
                WHEN MAX(CASE WHEN yellow_cards > 0 AND red_cards > 0 THEN 1 ELSE 0 END) = 1 THEN "no"
                ELSE "yes"
            END as direct_red
        ')
            ->join('games', 'match_statistics.match_id', '=', 'games.id')
            ->whereIn('player_id', $id_player)
            ->groupBy(
                'player_id',
                'match_statistics.tournament_id',
                'match_id'
            )
            ->orderBy('match_statistics.match_id', 'asc')
            ->with(['player', 'tournament', 'match']);
        return MatchStatisticResource::collection($query->get());
    }

    public function getTotalYellowCard($id_team)
    {
        $id_player = Player::where('id_team', $id_team)->pluck('id');

        $query = MatchStatistic::selectRaw('
            player_id,
            match_statistics.tournament_id,
            SUM(yellow_cards) as total_yellow_cards,
            SUM(red_cards) as total_red_cards,
            simple_injuries,
            serious_injuries,
            MAX(games.stage) as max_stage,
            CASE
                WHEN MAX(CASE WHEN yellow_cards > 0 AND red_cards > 0 THEN 1 ELSE 0 END) = 1 THEN "no"
                ELSE "yes"
            END as direct_red
        ')
            ->join('games', 'match_statistics.match_id', '=', 'games.id')
            ->whereIn('player_id', $id_player)
            ->groupBy(
                'player_id',
                'match_statistics.tournament_id'
            )
            ->orderBy('total_yellow_cards', 'desc')
            ->with(['player', 'tournament']);


        return MatchStatisticResource::collection($query->get());

        //otra opción

        // $id_player = Player::where('id_team', $id_team)->pluck('id');

        // $query = MatchStatistic::query()
        //     ->selectRaw('
        //     match_statistics.player_id,
        //     match_statistics.tournament_id,
        //     SUM(match_statistics.yellow_cards) as total_yellow_cards,
        //     MAX(games.stage) as max_stage,
        //     tournaments.format
        // ')
        //     ->join('games', 'match_statistics.match_id', '=', 'games.id')
        //     ->join('tournaments', 'match_statistics.tournament_id', '=', 'tournaments.id')
        //     ->whereIn('match_statistics.player_id', $id_player)
        //     ->groupBy('match_statistics.player_id', 'match_statistics.tournament_id', 'tournaments.format')
        //     ->orderByDesc('total_yellow_cards')
        //     ->with(['player', 'tournament']);

        // return MatchStatisticResource::collection($query->get());
    }
}
