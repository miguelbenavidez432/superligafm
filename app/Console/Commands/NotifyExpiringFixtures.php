<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Fixture;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

class NotifyExpiringFixtures extends Command
{
    protected $signature = 'fixtures:notify-discord';
    protected $description = 'Envía alertas a Discord de partidos por vencer (36h, 24h, 18h, 12h, 6h)';

    public function handle()
    {
        $webhookUrl = env('DISCORD_WEBHOOK_NOTIFICATIONS_URL');

        if (!$webhookUrl) {
            $this->error('Falta configurar DISCORD_WEBHOOK_NOTIFICATIONS_URL en el .env');
            return;
        }

        // 1. Una sola consulta a la base de datos (eliminamos el foreach externo)
        // Agregamos 'homeTeam.user' y 'awayTeam.user' para poder acceder a los datos del usuario si ahí tienes su Discord ID
        $fixtures = Fixture::with(['homeTeam.user', 'awayTeam.user', 'tournament'])
            ->whereIn('status', ['pendiente', 'aplazado'])
            ->whereNotNull('due_date')
            ->where('due_date', '<=', now()->addHours(36))
            ->where('due_date', '>', now())
            ->get();

        if ($fixtures->isEmpty()) {
            \Log::info("Cron ejecutado. No hay partidos próximos a vencer en las próximas 36h.");
            return;
        }

        $milestones = [
            35 => 36, // Faltan 35h 59m -> Alerta 36h
            23 => 24, // Faltan 23h 59m -> Alerta 24h
            17 => 18, // Faltan 17h 59m -> Alerta 18h
            11 => 12, // Faltan 11h 59m -> Alerta 12h
            5  => 6   // Faltan 5h 59m  -> Alerta 6h
        ];

        // 2. Iteramos solo sobre los partidos encontrados
        foreach ($fixtures as $fixture) {
            $diffInHours = now()->diffInHours(Carbon::parse($fixture->due_date));

            if (array_key_exists($diffInHours, $milestones)) {
                $alertHour = $milestones[$diffInHours]; // Obtenemos la hora real para la alerta

                \Log::info("Disparando alerta de {$alertHour}h para el partido {$fixture->id}");

                $this->sendDiscordMessage($fixture, $webhookUrl, $alertHour);
            }
        }
    }

    private function sendDiscordMessage($fixture, $webhookUrl, $alertHour)
    {
        $color = $alertHour <= 6 ? 16711680 : ($alertHour <= 12 ? 16753920 : 65280);

        // EXTRAEMOS LOS IDS DE DISCORD
        // Asumiendo que el ID de Discord está en el modelo User asociado al equipo.
        // Si lo tienes en otro lugar de tu estructura existente, simplemente ajusta esta ruta.
        $homeDiscordId = $fixture->homeTeam->user->discord_id ?? null; 
        $awayDiscordId = $fixture->awayTeam->user->discord_id ?? null;

        $mentions = [];
        if ($homeDiscordId) {
            $mentions[] = "<@{$homeDiscordId}>"; // Sin el '&'
        }
        if ($awayDiscordId) {
            $mentions[] = "<@{$awayDiscordId}>"; // Sin el '&'
        }

        // Armamos el mensaje de contenido dependiendo de si encontramos IDs o no
        $contentMessage = count($mentions) > 0 
            ? implode(" ", $mentions) . " ⏰ ¡Su partido está por vencer en {$alertHour} horas!"
            : "⏰ ¡Un partido está por vencer en {$alertHour} horas!";

        $payload = [
            'content' => $contentMessage,
            'embeds' => [
                [
                    'title' => "Alerta de Vencimiento",
                    'description' => "**{$fixture->homeTeam->name}** vs **{$fixture->awayTeam->name}**",
                    'color' => $color,
                    'fields' => [
                        ['name' => '🏆 Torneo', 'value' => $fixture->tournament->name, 'inline' => true],
                        ['name' => '📅 Fecha Límite', 'value' => Carbon::parse($fixture->due_date)->format('d/m/Y H:i'), 'inline' => true]
                    ],
                ]
            ]
        ];

        Http::post($webhookUrl, $payload);
    }
}
