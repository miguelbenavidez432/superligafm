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
use App\Models\Season;
use App\Services\MatchStatisticService;

class MatchStatisticController extends Controller
{
    protected $matchStatisticService;

    public function __construct(MatchStatisticService $matchStatisticService)
    {
        $this->matchStatisticService = $matchStatisticService;
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $tournamentId = $request->query('tournament_id');
        $matchId = $request->query('match_id');

        $query = MatchStatistic::with(['player.team', 'tournament', 'user', 'match']);
        $selects = [
            'player_id',
            'team_id',
            'SUM(goals) as goals',
            'SUM(assists) as assists',
            'SUM(yellow_cards) as yellow_cards',
            'SUM(red_cards) as red_cards',
            'SUM(simple_injuries) as simple_injuries',
            'SUM(serious_injuries) as serious_injuries',
            'MAX(rating) as rating',
            'SUM(mvp) as mvp',
        ];

        $groups = [
            'player_id',
            'team_id'
        ];

        if ($matchId) {
            $selects[] = 'match_id';
            $groups[] = 'match_id';
            $query->where('match_id', $matchId);
        }

        if ($tournamentId) {
            $selects[] = 'tournament_id';
            $groups[] = 'tournament_id';
            $query->where('tournament_id', $tournamentId);
        }

        $query->selectRaw(implode(', ', $selects))
            ->groupBy($groups)
            ->orderByRaw('SUM(goals) DESC, SUM(assists) DESC, SUM(mvp) DESC');

        return MatchStatisticResource::collection($query->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMatchStatisticRequest $request)
    {
        $statistics = $request->input('statistics');

        $this->matchStatisticService->processMatchStatistics($statistics);

        return response()->json(['message' => 'Estadísticas procesadas y guardadas correctamente'], 201);
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
            ->join('tournaments', 'match_statistics.tournament_id', '=', 'tournaments.id')
            ->whereIn('player_id', $id_player)
            ->where('tournaments.season_id', Season::where('active', 'yes')->value('id') ?? Season::latest()->value('id'))
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
    }

    public function getPlayerStats($playerId, Request $request)
    {
        $seasonId = $request->query('season_id');
        $tournamentId = $request->query('tournament_id');

        if (!$seasonId) {
            $seasonId = Season::where('active', 'yes')->value('id') ?? Season::latest()->value('id');
        }

        $stats = MatchStatistic::where('player_id', $playerId)
            ->whereHas('tournament', function ($query) use ($seasonId, $tournamentId) {
                $query->where('season_id', $seasonId);

                if ($tournamentId) {
                    $query->where('id', $tournamentId);
                }
            })
            ->selectRaw('
                COUNT(DISTINCT match_id) as matches_played,
                SUM(goals) as goals,
                SUM(assists) as assists,
                SUM(yellow_cards) as yellow_cards,
                SUM(red_cards) as red_cards,
                SUM(simple_injuries) as simple_injuries,
                SUM(serious_injuries) as serious_injuries,
                SUM(mvp) as mvp_count,
                ROUND(AVG(rating), 2) as average_rating
            ')
            ->first();

        return response()->json([
            'data' => [
                'matches_played' => $stats->matches_played ?? 0,
                'goals' => $stats->goals ?? 0,
                'assists' => $stats->assists ?? 0,
                'yellow_cards' => $stats->yellow_cards ?? 0,
                'red_cards' => $stats->red_cards ?? 0,
                'simple_injuries' => $stats->simple_injuries ?? 0,
                'serious_injuries' => $stats->serious_injuries ?? 0,
                'mvp_count' => $stats->mvp_count ?? 0,
                'average_rating' => $stats->average_rating ?? 0,
            ]
        ]);
    }
}
