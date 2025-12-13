<?php

namespace App\Console\Commands;

use App\Models\Rescission;
use App\Models\Season;
use App\Models\Player;
use App\Models\Team;
use App\Models\User;
use App\Models\DiscordUser;
use Spatie\WebhookServer\WebhookCall;
use Illuminate\Support\Facades\Log;
use Illuminate\Console\Command;

class ConfirmRescissionOffers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rescissions:confirm';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Confirma automáticamente las ofertas de rescisión más altas por jugador en la temporada activa';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando confirmación automática de ofertas de rescisión...');

        // 1. Obtener la temporada activa
        $activeSeason = Season::where('active', 'yes')->first();

        if (!$activeSeason) {
            $this->error('No hay temporada activa.');
            Log::warning('No hay temporada activa para confirmar rescisiones.');
            return 1;
        }

        $this->info("Temporada activa: {$activeSeason->name} (ID: {$activeSeason->id})");

        // 2. Obtener todas las ofertas activas de la temporada actual agrupadas por jugador
        $offers = Rescission::where('id_season', $activeSeason->id)
            ->where('confirmed', 'no')
            ->where('active', 'yes')
            ->get()
            ->groupBy('id_player');

        if ($offers->isEmpty()) {
            $this->info('No hay ofertas pendientes para confirmar.');
            Log::info('No hay ofertas de rescisión pendientes.');
            return 0;
        }

        $confirmedCount = 0;
        $tiedCount = 0;

        // 3. Por cada jugador, obtener la oferta con el total_value más alto
        foreach ($offers as $playerId => $playerOffers) {
            // Ordenar ofertas por total_value descendente
            $sortedOffers = $playerOffers->sortByDesc('total_value')->values();

            $highestOffer = $sortedOffers->first();
            $highestValue = $highestOffer->total_value;

            // ✅ Verificar si hay empate: contar cuántas ofertas tienen el mismo valor más alto
            $offersWithHighestValue = $sortedOffers->filter(function($offer) use ($highestValue) {
                return $offer->total_value == $highestValue;
            });

            if ($offersWithHighestValue->count() > 1) {
                // ❌ HAY EMPATE - No confirmar nada
                $this->warn("⚠ Jugador ID {$playerId} - EMPATE detectado con {$offersWithHighestValue->count()} ofertas de \${$highestValue}. NO se confirmará.");

                Log::warning("Empate en ofertas de rescisión para jugador {$playerId}", [
                    'player_id' => $playerId,
                    'highest_value' => $highestValue,
                    'tied_offers_count' => $offersWithHighestValue->count(),
                    'offer_ids' => $offersWithHighestValue->pluck('id')->toArray()
                ]);

                $tiedCount++;
                continue; // Saltar este jugador
            }

            // ✅ NO HAY EMPATE - Confirmar la oferta más alta
            $this->info("Procesando jugador ID {$playerId} - Oferta más alta: \${$highestOffer->total_value} (ID: {$highestOffer->id})");

            try {
                // 4. Confirmar la oferta usando la misma lógica de confirmOffer()
                $this->confirmOffer($highestOffer);
                $confirmedCount++;
                $this->info("✓ Oferta {$highestOffer->id} confirmada exitosamente.");
            } catch (\Exception $e) {
                $this->error("✗ Error al confirmar oferta {$highestOffer->id}: {$e->getMessage()}");
                Log::error("Error al confirmar rescisión {$highestOffer->id}: {$e->getMessage()}");
            }
        }

        $this->info("════════════════════════════════════════════════════");
        $this->info("Proceso completado:");
        $this->info("✓ {$confirmedCount} ofertas confirmadas");
        $this->warn("⚠ {$tiedCount} jugadores con empate (no confirmados)");
        $this->info("════════════════════════════════════════════════════");

        Log::info("Confirmación automática de rescisiones completada", [
            'confirmed_count' => $confirmedCount,
            'tied_count' => $tiedCount
        ]);

        return 0;
    }

    /**
     * Lógica de confirmación de oferta (similar a RescissionController@confirmOffer)
     */
    private function confirmOffer(Rescission $offer)
    {
        if ($offer->confirmed === 'yes') {
            throw new \Exception('La oferta ya fue confirmada.');
        }

        $value = $offer->total_value;
        $id_team = $offer->id_team;

        $team = Team::findOrFail($id_team);
        $receiver = User::findOrFail($team->id_user);
        $player = Player::findOrFail($offer->id_player);

        $buyer = User::findOrFail($offer->created_by);
        $buyerTeam = Team::where('id_user', $buyer->id)->first();

        if (!$buyerTeam) {
            throw new \Exception("El usuario comprador no tiene equipo asignado.");
        }

        $player->update([
            'id_team' => $buyerTeam->id,
            'status' => 'bloqueado'
        ]);

        $buyer->profits -= $value;
        $buyer->save();

        $receiver->profits += $value;
        $receiver->save();

        $offer->confirmed = 'yes';
        $offer->active = 'no';
        $offer->save();

        $userDiscord = DiscordUser::where('user_id', $buyerTeam->id_user)->first();
        $mentionMessage = $userDiscord && $userDiscord->discord_id
            ? '<@' . $userDiscord->discord_id . '> '
            : $buyer->name;

        $webhookUrl = env('DISCORD_WEBHOOK_URL');
        $webhookSecret = env('DISCORD_WEBHOOK_SECRET');

        WebhookCall::create()
            ->url($webhookUrl)
            ->payload([
                'content' => "🔔 **HERE WE GO (? \nLa oferta por {$player->name} ha sido confirmada** 🔔
                \n✅
                \n📍 El jugador será transferido de **{$team->name}** a **{$buyerTeam->name}**.
                \n💰 Monto de la transferencia: **\$ {$value}** pagado por {$mentionMessage}.\n",
            ])
            ->useSecret($webhookSecret)
            ->dispatch();

        Log::info("Oferta de rescisión confirmada automáticamente", [
            'offer_id' => $offer->id,
            'player' => $player->name,
            'from_team' => $team->name,
            'to_team' => $buyerTeam->name,
            'amount' => $value
        ]);
    }
}
