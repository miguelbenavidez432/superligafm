<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\StandingResource;
use App\Models\Game;
use App\Models\Standing;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStandingRequest;
use App\Http\Requests\UpdateStandingRequest;
use App\Models\Team;
use App\Models\Tournament;
use Illuminate\Http\Request;
use PhpParser\Node\Expr\Match_;

class StandingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $tournamentId = $request->query('tournament_id');
        if (!$tournamentId) {
            return response()->json(['message' => 'tournament_id is required'], 400);
        }

        $matches = $this->getMatches($tournamentId);
        if ($matches->isEmpty()) {
            return response()->json(['message' => 'No hay partidos jugados en este torneo.'], 204);
        }

        $standingsData = $this->calculateStandings($matches, $tournamentId);
        $this->syncStandingsWithDatabase($standingsData, $tournamentId);

        $standings = $this->prepareStandingsCollection($standingsData, $tournamentId);

        if ($standings->isEmpty()) {
            return response()->json(null, 204);
        }

        return StandingResource::collection($standings);
    }

    private function getMatches($tournamentId)
    {
        return Game::with(['homeTeam', 'awayTeam'])
            ->where('tournament_id', $tournamentId)
            ->whereNotNull('home_score')
            ->whereNotNull('away_score')
            ->get();
    }

    private function calculateStandings($matches, $tournamentId)
    {
        $standingsData = [];
        foreach ($matches as $match) {
            foreach (['home', 'away'] as $side) {
                $teamId = $side === 'home' ? $match->home_team_id : $match->away_team_id;
                if (!isset($standingsData[$teamId])) {
                    $standingsData[$teamId] = [
                        'tournament_id' => $tournamentId,
                        'team_id' => $teamId,
                        'played' => 0,
                        'won' => 0,
                        'drawn' => 0,
                        'lost' => 0,
                        'goals_for' => 0,
                        'goals_against' => 0,
                        'goal_difference' => 0,
                        'points' => 0,
                    ];
                }
                $standingsData[$teamId]['played']++;

                $gf = $side === 'home' ? $match->home_score : $match->away_score;
                $ga = $side === 'home' ? $match->away_score : $match->home_score;
                $standingsData[$teamId]['goals_for'] += $gf;
                $standingsData[$teamId]['goals_against'] += $ga;

                if ($gf > $ga) {
                    $standingsData[$teamId]['won']++;
                    $standingsData[$teamId]['points'] += 3;
                } elseif ($gf == $ga) {
                    $standingsData[$teamId]['drawn']++;
                    $standingsData[$teamId]['points'] += 1;
                } else {
                    $standingsData[$teamId]['lost']++;
                }
            }
        }

        foreach ($standingsData as &$row) {
            $row['goal_difference'] = $row['goals_for'] - $row['goals_against'];
        }
        unset($row);

        return $standingsData;
    }

    private function syncStandingsWithDatabase($standingsData, $tournamentId)
    {
        $dbStandings = Standing::where('tournament_id', $tournamentId)->get()->keyBy('team_id');
        foreach ($standingsData as $teamId => $data) {
            $db = $dbStandings->get($teamId);
            if (!$db || array_diff_assoc($data, $db->only(array_keys($data)))) {
                Standing::updateOrCreate(
                    ['tournament_id' => $tournamentId, 'team_id' => $teamId],
                    $data
                );
            }
        }
    }

    private function prepareStandingsCollection($standingsData, $tournamentId)
    {
        $standings = collect($standingsData)
            ->sortByDesc('points')
            ->sortByDesc('goal_difference')
            ->sortByDesc('goals_for')
            ->sortByDesc('team_id')
            ->values();

        $teamIds = $standings->pluck('team_id')->all();
        $teams = Team::query()->whereIn('id', $teamIds)->get()->keyBy('id');
        $tournament = Tournament::find($tournamentId);

        return $standings->map(function ($row) use ($teams, $tournament) {
            $standing = new Standing($row);
            $standing->setRelation('team', $teams->get($row['team_id']));
            $standing->setRelation('tournament', $tournament);
            return $standing;
        });
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreStandingRequest $request)
    {
        $data = $request->validated();
        $standing = Standing::create($data);
        return response(new StandingResource($standing), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Standing $standing)
    {
        return new StandingResource($standing->load('tournament', 'team'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateStandingRequest $request, Standing $standing)
    {
        $data = $request->validated();
        $standing->update($data);
        return new StandingResource($standing);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Standing $standing)
    {
        $standing->delete();
        return response()->json(null, 204);
    }
}
