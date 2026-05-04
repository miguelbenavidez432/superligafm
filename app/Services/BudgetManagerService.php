<?php
// filepath: app/Services/BudgetManagerService.php

namespace App\Services;

use App\Models\Team;
use Exception;

class BudgetManagerService
{
    /**
     * Agrega fondos al presupuesto de un equipo.
     *
     * @param int $teamId
     * @param float $amount
     * @param string $description Razón del ingreso (para historial/logs)
     * @return void
     */
    public function addFunds(int $teamId, float $amount, string $description = ''): void
    {
        // EJEMPLO BÁSICO:
        // 1. Buscar el equipo
        $team = Team::find($teamId);

        if (!$team) {
            throw new Exception("No se encontró el equipo con ID {$teamId} al intentar pagar el premio.");
        }

        // 2. Sumar el monto al presupuesto (asumiendo una columna 'budget')
        $team->increment('budget', $amount);

        // 3. (OPCIONAL) Registrar la transacción en un historial financiero
        // Transaction::create([
        //     'team_id' => $teamId,
        //     'amount' => $amount,
        //     'type' => 'ingreso',
        //     'description' => $description
        // ]);
    }
}
