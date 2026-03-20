<?php

namespace App\Services;

use App\Contracts\MovementProviderInterface;

class PlayerHistoryService
{
    /** @var MovementProviderInterface[] */
    protected array $providers;

    // Inyectamos los proveedores (puedes configurarlo en un ServiceProvider de Laravel)
    public function __construct(array $providers)
    {
        $this->providers = $providers;
    }

    public function getFullHistory(int $playerId): array
    {
        $allMovements = collect();

        foreach ($this->providers as $provider) {
            $movements = $provider->getMovementsByPlayer($playerId);
            $allMovements = $allMovements->merge($movements);
        }

        // Ordenamos por fecha de más reciente a más antiguo
        $sorted = $allMovements->sortByDesc(fn($dto) => $dto->date)->values();

        // Convertimos los DTOs a array puro para el frontend
        return $sorted->map(fn($dto) => $dto->toArray())->toArray();
    }
}
