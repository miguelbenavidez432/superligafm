<?php
// filepath: app/Services/BudgetManagerService.php

namespace App\Services;

use App\Models\Team;
use App\Models\User;
use App\Models\Transaction;
use Exception;

class BudgetManagerService
{
    public function addFunds(int $teamId, float $amount, string $description = ''): void
    {
        $team = Team::with('user')->find($teamId);

        if (!$team || !$team->user) {
            throw new Exception("No se encontró el equipo con ID {$teamId} al intentar pagar el premio.");
        }

        $user = $team->user;
        $previousBalance = $user->profits;

        // 1. Actualizar el saldo del usuario
        $user->increment('profits', $amount);
        $currentBalance = $user->profits;

        // 2. Registrar la transacción en el historial
        Transaction::create([
            'user_id' => $user->id,
            'team_id' => $team->id,
            'amount' => $amount,
            'previous_balance' => $previousBalance,
            'current_balance' => $currentBalance,
            'type' => 'ingreso',
            'description' => $description ?: 'Ingreso de fondos por premio/evento'
        ]);
    }

    public function deductFunds(int $userId, float $amount, string $description, ?int $teamId = null): void
    {
        $user = User::findOrFail($userId);
        $previousBalance = (float) $user->profits;

        // if ($previousBalance < $amount) {
        //     throw new Exception("Fondos insuficientes. El usuario {$user->name} tiene \${$previousBalance} y necesita \${$amount}.");
        // }

        // Descontamos del saldo global del usuario
        $user->decrement('profits', $amount);
        $currentBalance = $user->profits;

        // Registramos la auditoría
        Transaction::create([
            'user_id' => $user->id,
            'team_id' => $teamId,
            'amount' => $amount,
            'previous_balance' => $previousBalance,
            'current_balance' => $currentBalance,
            'type' => 'egreso',
            'description' => $description
        ]);
    }

    public function adjustManualFunds(User $user, float $newAmount, string $description): void
    {
        $previousBalance = (float) $user->profits;
        $user->profits = $newAmount;
        $user->save();

        Transaction::create([
            'user_id' => $user->id,
            'amount' => $newAmount - $previousBalance,
            'previous_balance' => $previousBalance,
            'current_balance' => $newAmount,
            'type' => 'ajuste',
            'description' => $description
        ]);
    }
}
