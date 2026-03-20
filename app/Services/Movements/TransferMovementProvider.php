<?php

namespace App\Services\Movements;

use App\Contracts\MovementProviderInterface;
use App\Models\Transfer;
use App\Models\Player;
use App\DTOs\MovementDTO;
use Illuminate\Support\Collection;

class TransferMovementProvider implements MovementProviderInterface
{
    public function getMovementsByPlayer(int $playerId): Collection
    {
        // 1. Primero necesitamos saber el nombre exacto del jugador
        $player = Player::find($playerId);

        if (!$player) {
            return collect(); // Si no existe, devolvemos una colección vacía
        }

        // 2. Buscamos en la tabla transfers donde el texto contenga el nombre del jugador
        // Asegúrate de que los nombres de las relaciones (fromTeam, toTeam, season)
        // coincidan con los métodos en tu modelo Transfer.
        $transfers = Transfer::with(['teamFrom', 'teamTo', 'season'])
            ->where('transferred_players', 'like', '%' . $player->name . '%')
            ->where('confirmed', 'si') // Tu confirmación específica
            ->get();

        // 3. Mapeamos al DTO estándar
        return $transfers->map(function ($transfer) {
            return new MovementDTO(
                id: $transfer->id,
                type: 'Traspaso Directo',
                from_team_name: $transfer->teamFrom ? $transfer->teamFrom->name : 'Desconocido',
                to_team_name: $transfer->teamTo ? $transfer->teamTo->name : 'Desconocido',
                value: (float) $transfer->budget,
                date: $transfer->season ? $transfer->season->name : 'Sin fecha'
            );
        });
    }
}
