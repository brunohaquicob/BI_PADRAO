<?php

namespace App\Http\Middleware;

use Closure;

class CSPMiddleware {
    public function handle($request, Closure $next) {
        $response = $next($request);

        // Fontes permitidas
        $fontSources = [
            "'self'",
            "https://fonts.gstatic.com",
            "https://code.ionicframework.com"
        ];
        
        // Connect
        $connectSources = [
            "'self'",
            "https://code.highcharts.com",
            "https://cdn.datatables.net",
        ];

        // Img
        $imgSources = [
            "'self'",
            "data:",
            "https://code.highcharts.com",
            "https://upload.wikimedia.org"
        ];

        // Scripts permitidos
        $scriptSources = [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",  // Permitindo eval
            "https://code.highcharts.com",
            "https://unpkg.com",
            "https://cdnjs.cloudflare.com",
            "https://cdn.jsdelivr.net"
        ];

        // Estilos permitidos
        $styleSources = [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
            "https://code.ionicframework.com",
            "https://code.highcharts.com",
            "https://cdnjs.cloudflare.com"
        ];

        // Monta a CSP
        $cspHeader = "default-src 'self' 'unsafe-inline'; script-src " . implode(' ', $scriptSources) . "; style-src " . implode(' ', $styleSources) . "; font-src " . implode(' ', $fontSources) . "; connect-src " . implode(' ', $connectSources) ."; img-src " . implode(' ', $imgSources) .";";

        // Define a Política de Segurança de Conteúdo (CSP)
        $response->headers->set('Content-Security-Policy', $cspHeader);

        return $response;
    }
}
