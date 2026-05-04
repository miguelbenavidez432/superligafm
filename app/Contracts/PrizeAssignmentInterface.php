<?php

namespace App\Contracts;

interface PrizeAssignmentInterface
{
    /**
     * Asigna los premios de un torneo a los equipos basándose en sus posiciones.
     *
     * @param int $tournamentId
     * @param array $positionTeamMap Formato: [1 => $teamId1, 2 => $teamId2, ...]
     * @return void
     */
    public function assignTournamentPrizes(int $tournamentId, array $positionTeamMap): void;
}
