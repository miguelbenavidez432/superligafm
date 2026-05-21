<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Fixture;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;
use App\Events\FixtureExpiringAlert;

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
        $alertHours = [18, 12, 6];

        foreach ($alertHours as $hoursLeft) {
            $targetTimeStart = now()->addHours($hoursLeft)->startOfHour();
            $targetTimeEnd = now()->addHours($hoursLeft)->endOfHour();

            $fixtures = Fixture::with(['home_team', 'away_team', 'tournament'])
                ->where('status', 'pendiente')
                ->whereNotNull('due_date')
                ->whereBetween('due_date', [$targetTimeStart, $targetTimeEnd])
                ->get();

            foreach ($fixtures as $fixture) {


                // ... dentro de tu bucle donde identificas un partido por vencer
                $homeUserId = $fixture->home_team->user_id;
                $awayUserId = $fixture->away_team->user_id;

                // Avisamos al Local
                if ($homeUserId) {
                    FixtureExpiringAlert::dispatch($fixture, $homeUserId);
                }

                // Avisamos al Visitante
                if ($awayUserId) {
                    FixtureExpiringAlert::dispatch($fixture, $awayUserId);
                }
                $this->sendDiscordMessage($fixture, $webhookUrl, $hoursLeft);
            }
        }
    }

    private function sendDiscordMessage($fixture, $webhookUrl, $hoursLeft)
    {
        $color = $hoursLeft == 6 ? 16711680 : ($hoursLeft == 12 ? 16753920 : 65280);

        $payload = [
            'embeds' => [
                [
                    'title' => "Partido por Vencer en {$hoursLeft} Horas",
                    'description' => "**{$fixture->home_team->name}** vs **{$fixture->away_team->name}**",
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
