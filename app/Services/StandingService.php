<?php

namespace App\Services;

use App\Models\Game;
use App\Models\Standing;

class StandingService
{
    public function updateStandings(Game $game)
    {
        $home = Standing::firstOrNew(['tournament_id' => $game->tournament_id, 'team_id' => $game->team_home_id]);
        $away = Standing::firstOrNew(['tournament_id' => $game->tournament_id, 'team_id' => $game->team_away_id]);

        // 1. Todo partido suma 1 jugado (incluso los no jugados)
        $home->played += 1;
        $away->played += 1;

        // 2. Si es "No Jugado", se guarda y termina aquí (no suma puntos ni goles)
        if ($game->outcome_type === 'unplayed') {
            $home->save();
            $away->save();
            return;
        }

        // 3. Sumar goles (Aplica para normal, administrativo y penales)
        $home->goals_for += $game->score_home ?? 0;
        $home->goals_against += $game->score_away ?? 0;
        $away->goals_for += $game->score_away ?? 0;
        $away->goals_against += $game->score_home ?? 0;

        // 4. Determinar Ganador
        $winner = $this->determineWinner($game);

        if ($winner === 'home') {
            $home->won += 1;
            $home->points += 3;
            $away->lost += 1;
        } elseif ($winner === 'away') {
            $away->won += 1;
            $away->points += 3;
            $home->lost += 1;
        } else {
            // Empate
            $home->drawn += 1;
            $home->points += 1;
            $away->drawn += 1;
            $away->points += 1;
        }

        // 5. Diferencia de gol
        $home->goal_difference = $home->goals_for - $home->goals_against;
        $away->goal_difference = $away->goals_for - $away->goals_against;

        $home->save();
        $away->save();
    }

    private function determineWinner(Game $game)
    {
        // Si se definió por penales, el ganador es quien hizo más penales
        if ($game->outcome_type === 'penalties') {
            if ($game->penalties_home > $game->penalties_away) return 'home';
            if ($game->penalties_away > $game->penalties_home) return 'away';
        }

        // Definición normal o escritorio
        if ($game->score_home > $game->score_away) return 'home';
        if ($game->score_away > $game->score_home) return 'away';

        return 'draw';
    }
}
