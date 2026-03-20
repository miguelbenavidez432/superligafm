<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PenaltyCostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
{
    $costs = [
        // Fase Regular (1 a 13)
        ['penalty_type' => 'yellows', 'stage_type' => 'regular', 'description' => '3 Amarillas (Fase Regular)', 'cost' => 15000000],
        ['penalty_type' => 'red', 'stage_type' => 'regular', 'description' => 'Roja Directa (Fase Regular)', 'cost' => 20000000],
        ['penalty_type' => 'injury', 'stage_type' => 'regular', 'description' => 'Lesión Roja (Fase Regular)', 'cost' => 20000000],

        // Playoffs (14+)
        ['penalty_type' => 'yellows', 'stage_type' => 'playoff', 'description' => '3 Amarillas (Playoffs)', 'cost' => 30000000],
        ['penalty_type' => 'red', 'stage_type' => 'playoff', 'description' => 'Roja Directa (Playoffs)', 'cost' => 40000000],
        ['penalty_type' => 'injury', 'stage_type' => 'playoff', 'description' => 'Lesión Roja (Playoffs)', 'cost' => 30000000],
    ];

    foreach ($costs as $cost) {
        \App\Models\PenaltyCost::create($cost);
    }
}
}
