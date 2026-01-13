<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Force HTTPS if the request is secure (behind proxy/load balancer)
        // or if we're in production environment
        // This ensures all URLs including assets (Vite) are generated with HTTPS
        $shouldForceHttps = request()->server('HTTP_X_FORWARDED_PROTO') === 'https'
            || request()->server('HTTPS') === 'on'
            || request()->secure()
            || app()->environment('production')
            || env('APP_FORCE_HTTPS', false);

        if ($shouldForceHttps) {
            URL::forceScheme('https');

            // Also ensure APP_URL uses HTTPS if it's set
            $appUrl = config('app.url');
            if ($appUrl && str_starts_with($appUrl, 'http://')) {
                config(['app.url' => str_replace('http://', 'https://', $appUrl)]);
            }
        }
    }
}
