<?php

namespace App\Services;

use App\Models\Player;

class MatchContextService
{
    public function getPlayersContext(int $homeTeamId, int $awayTeamId): array
    {
        return [
            'local_team_id' => $homeTeamId,
            'local_players' => Player::where('id_team', $homeTeamId)
            ->where('status', 'registrado')
            ->select('id', 'name')->get(),
            'away_team_id' => $awayTeamId,
            'away_players' => Player::where('id_team', $awayTeamId)
            ->where('status', 'registrado')
            ->select('id', 'name')->get()
        ];
    }
}
