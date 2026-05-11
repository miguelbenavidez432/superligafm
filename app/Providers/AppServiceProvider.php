<?php

namespace App\Providers;
use App\Contracts\OcrAnalyzerInterface;
use App\Services\GeminiOcrService;
use Illuminate\Support\ServiceProvider;
use App\Contracts\PrizeAssignmentInterface;
use App\Services\PrizeAssignmentService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            OcrAnalyzerInterface::class,
            GeminiOcrService::class
        );
        $this->app->bind(
            PrizeAssignmentInterface::class,
            PrizeAssignmentService::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
