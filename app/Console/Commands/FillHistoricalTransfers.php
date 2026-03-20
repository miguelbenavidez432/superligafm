<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Auction;
use App\Models\Rescission;
use App\Models\Team; // 🔥 IMPORTANTE: Agregamos el modelo Team
use Illuminate\Support\Facades\DB;

class FillHistoricalTransfers extends Command
{
    /**
     * El nombre y firma del comando en consola.
     */
    protected $signature = 'db:fill-historical-teams';

    /**
     * La descripción del comando.
     */
    protected $description = 'Rellena el campo to_team_id en auctions y rescissions mapeando el id_user de la tabla teams.';

    /**
     * Ejecuta el comando.
     */
    public function handle()
    {
        $this->info('🚀 Iniciando la migración de datos históricos...');

        // Creamos un diccionario en memoria: [user_id => team_id]
        // Esto hace que el script vuele porque no consulta a la BD en cada vuelta del bucle
        $teamsByUser = Team::whereNotNull('id_user')->pluck('id', 'id_user')->toArray();

        if (empty($teamsByUser)) {
            $this->error('❌ No se encontraron equipos con id_user asignado. Abortando.');
            return;
        }

        DB::beginTransaction();

        try {
            $this->updateAuctions($teamsByUser);
            $this->updateRescissions($teamsByUser);

            DB::commit();
            $this->newLine();
            $this->info('✅ ¡Actualización histórica completada con éxito!');

        } catch (\Exception $e) {
            DB::rollBack();
            $this->newLine();
            $this->error('❌ Ocurrió un error y se revirtieron los cambios: ' . $e->getMessage());
        }
    }

    private function updateAuctions(array $teamsByUser)
    {
        $this->warn('🔨 Procesando Subastas Confirmadas (Auctions)...');

        // 🔥 AGREGAMOS EL FILTRO: solo confirmadas en 'yes'
        $auctions = Auction::whereNull('to_team_id')
            ->where('confirmed', 'yes')
            ->get();

        if ($auctions->isEmpty()) {
            $this->line('No hay subastas confirmadas pendientes de actualizar.');
            return;
        }

        $bar = $this->output->createProgressBar(count($auctions));
        $bar->start();

        $updatedCount = 0;

        foreach ($auctions as $auction) {
            $buyerId = $auction->auctioned_by ?? $auction->created_by;

            if ($buyerId && isset($teamsByUser[$buyerId])) {
                $auction->to_team_id = $teamsByUser[$buyerId];
                $auction->save();
                $updatedCount++;
            }
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Subastas actualizadas correctamente: $updatedCount");
    }

    private function updateRescissions(array $teamsByUser)
    {
        $this->warn('📄 Procesando Rescisiones Confirmadas...');

        // 🔥 AGREGAMOS EL FILTRO: solo confirmadas en 'yes'
        $rescissions = Rescission::whereNull('to_team_id')
            ->where('confirmed', 'yes')
            ->get();

        if ($rescissions->isEmpty()) {
            $this->line('No hay rescisiones confirmadas pendientes de actualizar.');
            return;
        }

        $bar = $this->output->createProgressBar(count($rescissions));
        $bar->start();

        $updatedCount = 0;

        foreach ($rescissions as $rescission) {
            if ($rescission->created_by && isset($teamsByUser[$rescission->created_by])) {
                $rescission->to_team_id = $teamsByUser[$rescission->created_by];
                $rescission->save();
                $updatedCount++;
            }
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Rescisiones actualizadas correctamente: $updatedCount");
    }
}
