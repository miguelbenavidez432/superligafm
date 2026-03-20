<?php

namespace App\Contracts;

use Illuminate\Support\Collection;
use App\DTOs\MovementDTO;

interface MovementProviderInterface
{
    /**
     * @param int $playerId
     * @return Collection<MovementDTO>
     */
    public function getMovementsByPlayer(int $playerId): Collection;
}
