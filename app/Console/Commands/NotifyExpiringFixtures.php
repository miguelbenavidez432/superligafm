<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Fixture;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;
use App\Events\FixtureExpiringAlert;
use Illuminate\Support\Facades\Log;

class NotifyExpiringFixtures extends Command
{
    protected $signature = 'fixtures:notify-discord';
    protected $description = 'Envía alertas a Discord de partidos por vencer (18h, 12h, 6h)';

    public function handle()
    {
        // Tu URL de Webhook de Discord (La sacas de Ajustes del Canal -> Integraciones)
        $webhookUrl = env('DISCORD_WEBHOOK_NOTIFICATIONS_URL');

        if (!$webhookUrl) {
            $this->error('Falta configurar DISCORD_WEBHOOK_NOTIFICATIONS_URL en el .env');
            return;
        }
        // Las ventanas de horas que queremos avisar
        $alertHours = [36, 24, 18, 12, 6];

        foreach ($alertHours as $hoursLeft) {
            // EL SECRETO ESTÁ AQUÍ:
            // Creamos una ventana exacta de 1 hora.
            // Ej: Si $hoursLeft es 6, busca partidos que venzan entre (ahora + 5h) y (ahora + 6h).
            $targetTimeStart = now()->addHours($hoursLeft - 1);
            $targetTimeEnd = now()->addHours($hoursLeft);

            $fixtures = Fixture::with(['homeTeam', 'awayTeam', 'tournament'])
                ->whereIn('status', ['pendiente', 'aplazado'])
                ->whereNotNull('due_date')
                ->where('due_date', '<=', now()->addHours(36))
                ->where('due_date', '>', now())
                ->get();
            \Log::info("Alerta de {$hoursLeft}h | Rango: {$targetTimeStart} a {$targetTimeEnd} | Partidos encontrados: " . $fixtures->toJson());
            // Logeamos solo si encontramos algo para no ensuciar el log vacío
            if ($fixtures->isEmpty()) {
                \Log::info("Cron ejecutado. No hay partidos próximos a vencer en las próximas 36h.");
                return;
            }

            $milestones = [
                35 => 36, // Cron a las 12:00 del día anterior -> Faltan 35h 59m
                23 => 24, // Cron a las 00:00 del mismo día -> Faltan 23h 59m
                17 => 18, // Cron a las 06:00 del mismo día -> Faltan 17h 59m
                11 => 12, // Cron a las 12:00 del mismo día -> Faltan 11h 59m
                5 => 6   // Cron a las 18:00 del mismo día -> Faltan 5h 59m
            ];

            foreach ($fixtures as $fixture) {

                $diffInHours = now()->diffInHours(Carbon::parse($fixture->due_date));

                if (array_key_exists($diffInHours, $milestones)) {
                    $alertHour = $milestones[$diffInHours];

                    \Log::info("Disparando alerta de {$alertHour}h para el partido {$fixture->id}");
                    // $homeUserId = $fixture->homeTeam->user_id;
                    // $awayUserId = $fixture->awayTeam->user_id;

                    // Avisamos al Local
                    // if ($homeUserId) {
                    //     FixtureExpiringAlert::dispatch($fixture, $homeUserId);
                    // }

                    // Avisamos al Visitante
                    // if ($awayUserId) {
                    //     FixtureExpiringAlert::dispatch($fixture, $awayUserId);
                    // }

                    $this->sendDiscordMessage($fixture, $webhookUrl, $hoursLeft);
                }
            }
        }
    }

    private function sendDiscordMessage($fixture, $webhookUrl, $hoursLeft)
    {
        $color = $hoursLeft == 6 ? 16711680 : ($hoursLeft == 12 ? 16753920 : 65280);

        $idRol = 862915468401442856;

        $payload = [
            'content' => "<@&" . $idRol . ">",
            'embeds' => [
                [
                    'title' => "Partido por Vencer en {$hoursLeft} Horas",
                    'description' => "**{$fixture->homeTeam->name}** vs **{$fixture->awayTeam->name}**",
                    'color' => $color,
                    'fields' => [
                        ['name' => '🏆 Torneo', 'value' => $fixture->tournament->name, 'inline' => true],
                        ['name' => '📅 Fecha Límite', 'value' => Carbon::parse($fixture->due_date)->format('d/m/Y H:i'), 'inline' => true]
                    ],
                ]
            ]
        ];

        \Log::info("Enviando webhook a Discord para el partido: " . $fixture->id);

        Http::post($webhookUrl, $payload);
    }
}
