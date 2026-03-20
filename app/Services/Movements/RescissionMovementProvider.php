<?php

namespace App\Services\Movements;

use App\Contracts\MovementProviderInterface;
use App\Models\Rescission;
use App\DTOs\MovementDTO;
use Illuminate\Support\Collection;

class RescissionMovementProvider implements MovementProviderInterface
{
    public function getMovementsByPlayer(int $playerId): Collection
    {
        $rescissions = Rescission::with(['team', 'toTeam', 'season',])
            ->where('id_player', $playerId)
            ->get();

        return $rescissions->map(function ($rescission) {
            return new MovementDTO(
                id: $rescission->id,
                type: 'Cláusula',
                from_team_name: $rescission->team ? $rescission->team->name : 'Agente Libre',
                to_team_name: $rescission->toTeam ? $rescission->toTeam->name : 'Desconocido',
                value: (float) $rescission->total_value,
                date: $rescission->season ? $rescission->season->name : 'Sin fecha'
            );
        });
    }
}
