<?php

namespace App\Services;

use App\Models\Fixture;

class FixtureAlertService
{
    /**
     * Obtiene los partidos pendientes que vencen en las próximas 24h para un usuario específico.
     */
    public function getExpiringFixturesForUser(int $userId)
    {
        return Fixture::with(['home_team', 'away_team', 'tournament'])
            ->whereIn('status', ['pendiente', 'aplazado'])
            ->whereNotNull('due_date')
            ->where('due_date', '<=', now()->addHours(24))
            ->where(function ($query) use ($userId) {
                $query->whereHas('home_team', function ($q) use ($userId) {
                    $q->where('user_id', $userId);
                })->orWhereHas('away_team', function ($q) use ($userId) {
                    $q->where('user_id', $userId);
                });
            })
            ->get();
    }
}
