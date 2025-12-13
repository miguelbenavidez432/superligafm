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
            ->dailyAt('01:05')
            ->timezone('America/Argentina/Buenos_Aires');

        // Ejecutar todos los días a las 10:00 AM
        $schedule->command('rescissions:confirm')
            ->dailyAt('10:05')
            ->timezone('America/Argentina/Buenos_Aires');

        // Ejecutar todos los días a las 18:00 (6:00 PM)
        $schedule->command('rescissions:confirm')
            ->dailyAt('18:05')
            ->timezone('America/Argentina/Buenos_Aires');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
