<?php

namespace App\Providers;
use App\Contracts\OcrAnalyzerInterface;
use App\Services\GeminiOcrService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(OcrAnalyzerInterface::class, GeminiOcrService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
