<?php

namespace App\Services\Movements;

use App\Contracts\MovementProviderInterface;
use App\Models\Auction;
use App\DTOs\MovementDTO;
use Illuminate\Support\Collection;

class AuctionMovementProvider implements MovementProviderInterface
{
    public function getMovementsByPlayer(int $playerId): Collection
    {
        $auctions = Auction::with(['team', 'toTeam', 'season',])
            ->where('id_player', $playerId)
            ->get();

        return $auctions->map(function ($auction) {

            return new MovementDTO(
                id: $auction->id,
                type: 'Subasta',
                from_team_name: $auction->team ? $auction->team->name : 'Agente Libre',
                to_team_name: $auction->toTeam ? $auction->toTeam->name : 'Desconocido',
                value: $auction->amount,
                date: $auction->season ? $auction->season->name : 'Sin fecha'
            );
        });
    }
}
