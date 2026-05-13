<?php

namespace App\Repositories;

use App\Models\Player;
use Illuminate\Support\Facades\Log;

class PlayerRepository
{
    /**
     * Filtra jugadores transferibles basándose EXACTAMENTE en los parámetros del usuario.
     */
    public function getProfitablePlayers(array $filters)
    {
        $query = Player::query()
            // Buscamos sin importar si está con mayúscula o minúscula
            ->where(function($q) {
                $q->where('status', 'transferible')
                  ->orWhere('status', 'Transferible');
            })
            ->when(isset($filters['min_age']), fn($q) => $q->where('age', '>=', $filters['min_age']))
            ->when(isset($filters['max_age']), fn($q) => $q->where('age', '<=', $filters['max_age']))
            // Calidad Actual (CA)
            ->when(isset($filters['min_ca']), fn($q) => $q->where('ca', '>=', $filters['min_ca']))
            ->when(isset($filters['max_ca']), fn($q) => $q->where('ca', '<=', $filters['max_ca']))
            // Potencial (PA)
            ->when(isset($filters['min_pa']), fn($q) => $q->where('pa', '>=', $filters['min_pa']))
            ->when(isset($filters['max_pa']), fn($q) => $q->where('pa', '<=', $filters['max_pa']))
            // Valor de Mercado
            ->when(isset($filters['min_value']), fn($q) => $q->where('value', '>=', $filters['min_value']))
            ->when(isset($filters['max_value']), fn($q) => $q->where('value', '<=', $filters['max_value']))
            ->limit(20);

        // 1. Ejecutamos la consulta ANTES de loguear para tener los datos reales
        $profitablePlayers = $query->get(['id', 'name', 'age', 'ca', 'pa', 'value']);

        // 2. Guardamos en el log la consulta SQL y los DATOS en formato JSON
        Log::info('--- QUERY RENTABLES ---');
        Log::info('DATA JSON: ' . $profitablePlayers->toJson());

        return $profitablePlayers;
    }

    /**
     * Obtiene oportunidades de mercado no bloqueadas.
     */
    public function getMarketOpportunities()
    {
        // 1. Obtenemos los 10 con mayor CA
        $topCA = Player::where(function ($q) {
                $q->whereNotIn('status', ['bloqueado', 'transferible', 'Transferible'])
                  ->orWhereNull('status')
                  ->orWhere('status', '');
            })
            ->orderByDesc('ca')
            ->limit(10)
            ->get(['id', 'name', 'ca']);

        // 2. Extraemos un array solo con los IDs
        $topCAIds = $topCA->pluck('id');

        // 3. Obtenemos los 10 con mejor rating, EXCLUYENDO los IDs anteriores
        $topRatingQuery = Player::where(function ($q) {
                $q->whereNotIn('status', ['bloqueado', 'transferible', 'Transferible'])
                  ->orWhereNull('status')
                  ->orWhere('status', '');
            })
            ->whereNotIn('id', $topCAIds)
            ->withAvg('matchStatistics', 'rating')
            ->orderByDesc('match_statistics_avg_rating')
            ->limit(10);

        // Obtenemos la colección de datos reales
        $topRating = $topRatingQuery->get(['id', 'name']);

        // 4. Logueamos EXCLUSIVAMENTE los JSON de los datos obtenidos
        Log::info('--- DATA OPORTUNIDADES ---');
        Log::info('JSON Top CA: ' . $topCA->toJson());
        Log::info('JSON Top Rating: ' . $topRating->toJson());
        Log::info('--------------------------');

        return [
            'top_ca' => $topCA,
            'top_rating' => $topRating
        ];
    }
}
