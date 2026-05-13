<?php

namespace App\Console\Commands;

use App\Models\Player;
use App\Models\Team;
use App\Models\DiscordUser;
use Illuminate\Console\Command;
use Spatie\WebhookServer\WebhookCall;

class SendTransferiblesListToDiscord extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'transferibles:send-discord';

    /**
     * The command description.
     *
     * @var string
     */
    protected $description = 'Envía la lista de todos los jugadores transferibles a un canal de Discord cada 3 horas';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            // 1. Obtener todos los jugadores transferibles con sus equipos
            $transferibles = Player::where('status', 'transferible')
                ->with('team')
                ->orderBy('value', 'desc')
                ->get();

            if ($transferibles->isEmpty()) {
                $this->info('No hay jugadores transferibles en este momento');
                return;
            }

            // 2. Agrupar por equipo para mejor presentación
            $jugadoresPorEquipo = $transferibles->groupBy(function ($jugador) {
                return $jugador->team?->name ?? 'Sin equipo';
            });

            // 3. Construir el mensaje para Discord
            $mensaje = $this->construirMensajeDiscord($jugadoresPorEquipo, $transferibles->count());

            // 4. Enviar el webhook a Discord
            $this->enviarDiscord($mensaje);

            $this->info('✅ Lista de transferibles enviada a Discord correctamente');
            $this->info('Total de jugadores: ' . $transferibles->count());

        } catch (\Exception $e) {
            $this->error('❌ Error al enviar la lista de transferibles: ' . $e->getMessage());
        }
    }

    /**
     * Construir el mensaje formateado para Discord
     */
    private function construirMensajeDiscord($jugadoresPorEquipo, $totalJugadores)
    {
        $ahora = now('America/Argentina/Buenos_Aires')->format('d/m/Y H:i');

        $mensaje = "📋 **LISTA DE JUGADORES TRANSFERIBLES** 📋\n";
        $mensaje .= "🕐 Actualizado: **{$ahora}**\n";
        $mensaje .= "👥 Total: **{$totalJugadores} jugadores**\n\n";

        $posicion = 1;

        foreach ($jugadoresPorEquipo as $equipo => $jugadores) {
            $mensaje .= "⚽ **{$equipo}**\n";
            $mensaje .= "```\n";

            foreach ($jugadores as $jugador) {
                $valor = $this->formatearValor($jugador->value);
                // Limitar largo de línea
                $nombre = substr($jugador->name, 0, 25);
                $mensaje .= sprintf(
                    "%2d. %-25s | CA:%2d | PA:%2d | $%s\n",
                    $posicion++,
                    $nombre,
                    $jugador->ca,
                    $jugador->pa,
                    $valor
                );
            }
            $mensaje .= "```\n";
        }

        return $mensaje;
    }

    /**
     * Formatear valor del jugador (para mejor legibilidad)
     */
    private function formatearValor($valor)
    {
        if ($valor >= 1000000) {
            return number_format($valor / 1000000, 1, ',', '.') . 'M';
        }
        return number_format($valor, 0, ',', '.');
    }

    /**
     * Enviar el webhook a Discord
     */
    private function enviarDiscord($mensaje)
    {
        $webhookUrl = env('DISCORD_WEBHOOK_TRANSFERIBLES');

        if (!$webhookUrl) {
            throw new \Exception('No está configurada la variable DISCORD_WEBHOOK_TRANSFERIBLES');
        }

        $response = \Illuminate\Support\Facades\Http::post($webhookUrl, [
            'content' => $mensaje,
        ]);

        if (!$response->successful()) {
            throw new \Exception('Discord respondió con error: ' . $response->status() . ' - ' . $response->body());
        }
    }
}
