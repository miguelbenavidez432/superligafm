<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Ejecutar todos los días a las 01:00 AM
        $schedule->command('rescissions:confirm')
            ->dailyAt('01:01')
            ->timezone('America/Argentina/Buenos_Aires');

        // Ejecutar todos los días a las 10:00 AM
        $schedule->command('rescissions:confirm')
            ->dailyAt('10:01')
            ->timezone('America/Argentina/Buenos_Aires');

        // Ejecutar todos los días a las 18:00 (6:00 PM)
        $schedule->command('rescissions:confirm')
            ->dailyAt('18:01')
            ->timezone('America/Argentina/Buenos_Aires');

        // Enviar lista de transferibles cada 3 horas a Discord
        $schedule->command('transferibles:send-discord')
            ->everyThreeHours()
            ->timezone('America/Argentina/Buenos_Aires');

        $schedule->call(function () {
            \Log::info('CRON TEST OK: ' . now());
        })->everyMinute();

    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
