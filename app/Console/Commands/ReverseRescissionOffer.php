<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Rescission;
use App\Models\Player;
use App\Models\User;
use App\Models\Team;
use Illuminate\Support\Facades\Log;

class ReverseRescissionOffer extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rescission:reverse {offerId} {playerId}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Revierte una oferta de rescisión confirmada y restaura el estado del jugador';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $offerId = $this->argument('offerId');
        $playerId = $this->argument('playerId');

        $this->info("Iniciando reversión de oferta {$offerId} para jugador {$playerId}...");

        try {
            // 1. Obtener la oferta
            $offer = Rescission::findOrFail($offerId);

            if ($offer->confirmed !== 'yes') {
                $this->error('La oferta NO está confirmada. No se puede revertir.');
                return 1;
            }

            // 2. Obtener datos necesarios
            $player = Player::findOrFail($playerId);
            $buyer = User::findOrFail($offer->created_by);
            $originalTeam = Team::findOrFail($offer->id_team);
            $seller = User::findOrFail($originalTeam->id_user);

            $value = $offer->total_value;

            // 3. Revertir el jugador al equipo original
            $player->update([
                'id_team' => $offer->id_team,
                'status' => ''
            ]);

            $this->info("✓ Jugador {$player->name} devuelto al equipo {$originalTeam->name}");

            // 4. Revertir presupuestos
            $buyer->profits += $value; // Devolver dinero al comprador
            $buyer->save();
            $this->info("✓ Devuelto \${$value} a {$buyer->name}");

            $seller->profits -= $value; // Quitar dinero al vendedor
            $seller->save();
            $this->info("✓ Descontado \${$value} de {$seller->name}");

            // 5. Revertir el estado de la oferta
            $offer->update([
                'confirmed' => 'no',
                'active' => 'no' // ✅ Cerrar la oferta para evitar confusiones
            ]);

            $this->info("✓ Oferta {$offerId} marcada como NO confirmada y cerrada");

            Log::info("Oferta de rescisión revertida", [
                'offer_id' => $offerId,
                'player_id' => $playerId,
                'player_name' => $player->name,
                'buyer' => $buyer->name,
                'seller' => $seller->name,
                'amount' => $value
            ]);

            $this->info("════════════════════════════════════════════════════");
            $this->info("Reversión completada exitosamente");
            $this->info("════════════════════════════════════════════════════");

            return 0;

        } catch (\Exception $e) {
            $this->error("Error al revertir la oferta: {$e->getMessage()}");
            Log::error("Error al revertir oferta {$offerId}: {$e->getMessage()}");
            return 1;
        }
    }
}
