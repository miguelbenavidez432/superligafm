<?php

namespace App\Services;

use App\Models\Tournament;

class TournamentService
{
    /**
     * Obtiene el fixture con filtros aplicados y trae los datos de los equipos.
     */
    public function getAllTournaments(array $filters = [])
    {
        $query = Tournament::with(['homeTeam:id,name', 'awayTeam:id,name', 'season:id,name']);

        if (isset($filters['id_season']) && $filters['id_season'] !== '') {
            $query->where('id_season', $filters['id_season']);
        }

        if (isset($filters['division']) && $filters['division'] !== '') {
            $query->where('division', $filters['division']);
        }

        if (isset($filters['matchday']) && $filters['matchday'] !== '') {
            $query->where('matchday', $filters['matchday']);
        }

        // Ordenamos por vencimiento (los más próximos a vencer primero)
        return $query->orderBy('due_date', 'asc')->get();
    }

    public function createTournament(array $data)
    {
        return Tournament::create($data);
    }

    public function getTournamentById($id)
    {
        return Tournament::with(['homeTeam', 'awayTeam'])->findOrFail($id);
    }

    public function updateTournament($id, array $data)
    {
        $tournament = Tournament::findOrFail($id);
        $tournament->update($data);

        return $tournament;
    }

    public function deleteTournament($id)
    {
        $tournament = Tournament::findOrFail($id);
        return $tournament->delete();
    }
}
