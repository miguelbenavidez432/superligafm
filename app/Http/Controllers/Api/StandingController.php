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
            // Calcular standings desde los partidos
            $calculatedStandings = $this->calculateStandingsFromMatches($tournamentId);

            // Sincronizar con la base de datos
            $this->syncStandingsWithDatabase($calculatedStandings, $tournamentId);

            // Obtener standings actualizados desde la base de datos
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
    private function calculateStandingsFromMatches($tournamentId)
    {
        // Obtener todos los partidos completados del torneo
        $matches = Game::where('tournament_id', $tournamentId)
            ->where('status', 'completed')
            ->whereNotNull('score_home')
            ->whereNotNull('score_away')
            ->with(['teamHome', 'teamAway'])
            ->get();

        // Obtener todos los equipos del torneo
        $teamIds = $matches->pluck('team_home_id')
            ->merge($matches->pluck('team_away_id'))
            ->unique();

        $standings = [];

        // Inicializar estadísticas para cada equipo
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

        // Procesar cada partido
        foreach ($matches as $match) {
            $homeId = $match->team_home_id;
            $awayId = $match->team_away_id;
            $scoreHome = $match->score_home;
            $scoreAway = $match->score_away;

            // Actualizar estadísticas del equipo local
            $standings[$homeId]['played']++;
            $standings[$homeId]['goals_for'] += $scoreHome;
            $standings[$homeId]['goals_against'] += $scoreAway;

            // Actualizar estadísticas del equipo visitante
            $standings[$awayId]['played']++;
            $standings[$awayId]['goals_for'] += $scoreAway;
            $standings[$awayId]['goals_against'] += $scoreHome;

            // Determinar resultado y asignar puntos
            if ($scoreHome > $scoreAway) {
                // Victoria local
                $standings[$homeId]['won']++;
                $standings[$homeId]['points'] += 3;
                $standings[$awayId]['lost']++;
            } elseif ($scoreHome < $scoreAway) {
                // Victoria visitante
                $standings[$awayId]['won']++;
                $standings[$awayId]['points'] += 3;
                $standings[$homeId]['lost']++;
            } else {
                // Empate
                $standings[$homeId]['drawn']++;
                $standings[$homeId]['points'] += 1;
                $standings[$awayId]['drawn']++;
                $standings[$awayId]['points'] += 1;
            }
        }

        // Calcular diferencia de goles
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
            // Buscar o crear el registro en la base de datos
            $existingStanding = Standing::where('tournament_id', $tournamentId)
                ->where('team_id', $teamId)
                ->first();

            if ($existingStanding) {
                // Verificar si hay diferencias
                $hasChanges = false;
                $fieldsToCheck = ['played', 'won', 'drawn', 'lost', 'goals_for', 'goals_against', 'goal_difference', 'points'];

                foreach ($fieldsToCheck as $field) {
                    if ($existingStanding->$field != $calculatedData[$field]) {
                        $hasChanges = true;
                        break;
                    }
                }

                // Actualizar solo si hay cambios
                if ($hasChanges) {
                    $existingStanding->update($calculatedData);
                    \Log::info('Standing actualizado:', [
                        'tournament_id' => $tournamentId,
                        'team_id' => $teamId,
                        'changes' => $calculatedData
                    ]);
                }
            } else {
                // Crear nuevo registro
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
