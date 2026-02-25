<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\StandingResource;
use App\Models\Standing;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStandingRequest;
use App\Http\Requests\UpdateStandingRequest;
use App\Models\Game;
use App\Models\Team;
use Illuminate\Http\Request;

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

        try {
            $calculatedStandings = $this->calculateStandingsFromMatches($tournamentId);

            $this->syncStandingsWithDatabase($calculatedStandings, $tournamentId);

            $standings = Standing::with(['tournament', 'team'])
                ->where('tournament_id', $tournamentId)
                ->orderBy('points', 'desc')
                ->orderBy('goal_difference', 'desc')
                ->orderBy('goals_for', 'desc')
                ->orderBy('team_id', 'asc')
                ->get();

            if ($standings->isEmpty()) {
                return response()->json(null, 204);
            }

            if ($request->query('all') == 'true') {
                return StandingResource::collection($standings);
            } else {
                return StandingResource::collection($standings->take(14));
            }

        } catch (\Exception $e) {
            \Log::error('Error en standings:', [
                'message' => $e->getMessage(),
                'tournament_id' => $tournamentId
            ]);

            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }

    /**
     * Calcular standings desde los partidos jugados
     */
    private function calculateStandingsFromMatches($tournamentId, $includeStage13 = false)
    {
        // 1. Armamos la consulta base
        $query = Game::where('tournament_id', $tournamentId)
            ->where('status', 'completed')
            ->with(['teamHome', 'teamAway']);

        // 2. Filtramos la Fecha 13 si no fue solicitada explícitamente
        if ($includeStage13) {
            // Ajusta 'stage' por el nombre real de tu columna en BD (puede ser 'matchday', 'round', etc.)
            $query->where('stage', '!=', '13');
        }

        $matches = $query->get();

        // 3. Obtenemos los IDs únicos de los equipos
        $teamIds = $matches->pluck('team_home_id')
            ->merge($matches->pluck('team_away_id'))
            ->unique();

        $standings = [];

        // Inicializamos la tabla en 0
        foreach ($teamIds as $teamId) {
            $standings[$teamId] = [
                'team_id' => $teamId,
                'tournament_id' => $tournamentId,
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

        // 4. Calculamos los puntos partido a partido
        foreach ($matches as $match) {
            $homeId = $match->team_home_id;
            $awayId = $match->team_away_id;

            // REGLA DE ORO: Todo partido cuenta como jugado, sin importar cómo se definió
            $standings[$homeId]['played']++;
            $standings[$awayId]['played']++;

            // REGLA NUEVA: Si es "No Jugado", cortamos acá. No suma goles ni puntos.
            if ($match->outcome_type === 'unplayed') {
                continue;
            }

            // Normal, Administrativo o Penales
            $scoreHome = $match->score_home ?? 0;
            $scoreAway = $match->score_away ?? 0;

            $standings[$homeId]['goals_for'] += $scoreHome;
            $standings[$homeId]['goals_against'] += $scoreAway;
            $standings[$awayId]['goals_for'] += $scoreAway;
            $standings[$awayId]['goals_against'] += $scoreHome;

            // Determinamos al ganador
            $winner = 'draw';

            if ($match->outcome_type === 'penalties') {
                // Si hubo penales, manda el resultado de los penales
                if ($match->penalties_home > $match->penalties_away) {
                    $winner = 'home';
                } elseif ($match->penalties_away > $match->penalties_home) {
                    $winner = 'away';
                }
            } else {
                // Definición normal o escritorio
                if ($scoreHome > $scoreAway) {
                    $winner = 'home';
                } elseif ($scoreAway > $scoreHome) {
                    $winner = 'away';
                }
            }

            // Asignamos puntos y estadísticas
            if ($winner === 'home') {
                $standings[$homeId]['won']++;
                $standings[$homeId]['points'] += 3;
                $standings[$awayId]['lost']++;
            } elseif ($winner === 'away') {
                $standings[$awayId]['won']++;
                $standings[$awayId]['points'] += 3;
                $standings[$homeId]['lost']++;
            } else {
                $standings[$homeId]['drawn']++;
                $standings[$homeId]['points'] += 1;
                $standings[$awayId]['drawn']++;
                $standings[$awayId]['points'] += 1;
            }
        }

        // 5. Calculamos la diferencia de gol final
        foreach ($standings as &$standing) {
            $standing['goal_difference'] = $standing['goals_for'] - $standing['goals_against'];
        }

        return $standings;
    }

    /**
     * Sincronizar standings calculados con la base de datos
     */
    private function syncStandingsWithDatabase($calculatedStandings, $tournamentId)
    {
        foreach ($calculatedStandings as $teamId => $calculatedData) {

            $existingStanding = Standing::where('tournament_id', $tournamentId)
                ->where('team_id', $teamId)
                ->first();

            if ($existingStanding) {

                $hasChanges = false;
                $fieldsToCheck = ['played', 'won', 'drawn', 'lost', 'goals_for', 'goals_against', 'goal_difference', 'points'];

                foreach ($fieldsToCheck as $field) {
                    if ($existingStanding->$field != $calculatedData[$field]) {
                        $hasChanges = true;
                        break;
                    }
                }

                if ($hasChanges) {
                    $existingStanding->update($calculatedData);
                    \Log::info('Standing actualizado:', [
                        'tournament_id' => $tournamentId,
                        'team_id' => $teamId,
                        'changes' => $calculatedData
                    ]);
                }
            } else {
                Standing::create($calculatedData);
                \Log::info('Standing creado:', [
                    'tournament_id' => $tournamentId,
                    'team_id' => $teamId,
                    'data' => $calculatedData
                ]);
            }
        }
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
