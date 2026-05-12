<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Player;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\MatchStatisticController;
use App\Services\ScoutAgentService;
use Illuminate\Support\Facades\Log;

class AgentController extends Controller
{
    public function __construct(
        private ScoutAgentService $scoutAgentService
    ) {}

    public function getScoutReport($playerId, Request $request, MatchStatisticController $statController)
    {
        try {
            // 1. Buscamos al jugador
            $player = Player::findOrFail($playerId);

            // 2. Obtenemos sus estadísticas (Reutilizando tu lógica existente)
            $statsResponse = $statController->getPlayerStats($playerId, $request);
            $playerStats = $statsResponse->getData()->data;

            // 3. Delegamos TODO el trabajo al Servicio
            $agentReport = $this->scoutAgentService->generateReport($player->name, (array) $playerStats);

            // 4. Respondemos al Frontend
            return response()->json([
                'success' => true,
                'agent_report' => $agentReport
            ]);

        } catch (\Exception $e) {
            Log::error('Fallo en AgentController: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'El agente no está disponible en este momento.'
            ], 500);
        }
    }
}
