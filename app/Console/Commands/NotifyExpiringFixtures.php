<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Fixture;
use App\Services\DiscordNotificationService;
use Carbon\Carbon;

class NotifyExpiringFixtures extends Command
{
    protected $signature = 'fixtures:notify-discord';
    protected $description = 'Envía alertas a Discord de partidos por vencer (36h, 24h, 18h, 12h, 6h)';

    public function __construct(
        private DiscordNotificationService $discordService
    ) {
        parent::__construct();
    }

    public function handle()
    {
        $fixtures = Fixture::with(['homeTeam.user.discordUser', 'awayTeam.user.discordUser', 'tournament'])
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
            35 => 36,
            23 => 24,
            17 => 18,
            11 => 12,
            5  => 6,
        ];

        foreach ($fixtures as $fixture) {
            $diffInHours = now()->diffInHours(Carbon::parse($fixture->due_date));

            if (array_key_exists($diffInHours, $milestones)) {
                $alertHour = $milestones[$diffInHours];

                \Log::info("Disparando alerta de {$alertHour}h para el partido {$fixture->id}");

                try {
                    $this->discordService->sendFixtureExpiringAlert($fixture, $alertHour);
                } catch (\Throwable $e) {
                    \Log::error("Error al enviar alerta fixture {$fixture->id}: {$e->getMessage()}", [
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                    ]);
                }
            }
        }
    }
}
