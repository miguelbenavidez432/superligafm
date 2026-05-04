<?php
// filepath: app/Services/PrizeAssignmentService.php

namespace App\Services;

use App\Contracts\PrizeAssignmentInterface;
use App\Models\Prize;
use Illuminate\Support\Facades\DB;
use Exception;

class PrizeAssignmentService implements PrizeAssignmentInterface
{
    public function __construct(
        // Inyectamos el servicio que manejará el dinero (SRP)
        private BudgetManagerService $budgetManager
    ) {}

    public function assignTournamentPrizes(int $tournamentId, array $positionTeamMap): void
    {
        DB::transaction(function () use ($tournamentId, $positionTeamMap) {

            // Obtenemos todos los premios pendientes para este torneo, indexados por 'position'
            $prizes = Prize::where('tournament_id', $tournamentId)
                           ->pending()
                           ->get()
                           ->keyBy('position');

            if ($prizes->isEmpty()) {
                throw new Exception("No se encontraron premios pendientes configurados para el torneo #{$tournamentId}.");
            }

            foreach ($positionTeamMap as $position => $teamId) {
                // Si el admin no configuró un premio para esta posición (ej. puesto 14), lo saltamos
                if (!$prizes->has($position)) {
                    continue;
                }

                $prize = $prizes->get($position);

                // 1. Asignamos el premio al equipo y cambiamos el estado
                $prize->update([
                    'team_id' => $teamId,
                    'status' => 'pagado'
                ]);

                // 2. Aplicamos el monto al presupuesto del equipo
                // Delegamos esta responsabilidad al BudgetManagerService
                $description = "Premio Torneo #{$tournamentId} - Posición {$position}: {$prize->description}";
                $this->budgetManager->addFunds($teamId, $prize->amount, $description);
            }
        });
    }
}
