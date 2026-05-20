<?php

namespace App\Services;

use App\Models\Fixture;

class FixtureService
{
    /**
     * Obtiene el fixture con filtros aplicados y trae los datos de los equipos.
     */
    public function getAllFixtures(array $filters = [])
    {
        $query = Fixture::with(['homeTeam:id,name', 'awayTeam:id,name', 'season:id,name']);

        if (isset($filters['id_season']) && $filters['id_season'] !== '') {
            $query->where('id_season', $filters['id_season']);
        }

        if (isset($filters['id_tournament']) && $filters['id_tournament'] !== '') {
            $query->where('id_tournament', $filters['id_tournament']);
        }

        if (isset($filters['matchday']) && $filters['matchday'] !== '') {
            $query->where('matchday', $filters['matchday']);
        }

        // Ordenamos por vencimiento (los más próximos a vencer primero)
        return $query->orderBy('due_date', 'asc')->get();
    }

    public function createFixture(array $data)
    {
        return Fixture::create($data);
    }

    public function getFixtureById($id)
    {
        return Fixture::with(['homeTeam', 'awayTeam'])->findOrFail($id);
    }

    public function updateFixture($id, array $data)
    {
        $fixture = Fixture::findOrFail($id);
        $fixture->update($data);

        return $fixture;
    }

    public function deleteFixture($id)
    {
        $fixture = Fixture::findOrFail($id);
        return $fixture->delete();
    }
}
