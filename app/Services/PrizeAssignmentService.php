<?php
// filepath: app/Services/PrizeAssignmentService.php

namespace App\Services;

use App\Contracts\PrizeAssignmentInterface;
use App\Models\Prize;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class PrizeAssignmentService implements PrizeAssignmentInterface
{
    public function __construct(
        // Inyectamos el servicio que manejará el dinero (SRP)
        private BudgetManagerService $budgetManager
    ) {}

    /**
     * Asigna premios a múltiples equipos y procesa los pagos.
     * * @param int $tournamentId
     * @param array $assignments Formato: [ prizeId => [teamId1, teamId2] ]
     */
    public function assignTournamentPrizes(int $tournamentId, array $assignments): void
    {
        DB::transaction(function () use ($tournamentId, $assignments) {

            foreach ($assignments as $prizeId => $teamIds) {
                // Buscamos el premio en el catálogo
                $prize = Prize::find($prizeId);

                if (!$prize) {
                    Log::warning("Se intentó asignar el premio ID {$prizeId}, pero no existe.");
                    continue;
                }

                // Medida de seguridad: Verificar que el premio corresponda al torneo que estamos cerrando
                if ($prize->tournament_id != $tournamentId) {
                    Log::warning("El premio ID {$prizeId} no pertenece al torneo {$tournamentId}.");
                    continue;
                }

                // Iteramos sobre todos los equipos que ganaron este premio en particular
                foreach ($teamIds as $teamId) {

                    // 1. Registramos la ganancia en la tabla intermedia (prize_team)
                    // Usamos syncWithoutDetaching para no duplicar si el admin le da click 2 veces por error
                    $prize->teams()->syncWithoutDetaching([
                        $teamId => ['status' => 'Pagado']
                    ]);

                    // 2. Aplicamos el monto al presupuesto del equipo usando BudgetManagerService
                    $description = "Premio Torneo #{$tournamentId}: {$prize->description}";
                    $this->budgetManager->addFunds($teamId, $prize->amount, $description);
                }
            }

        });
    }
}
