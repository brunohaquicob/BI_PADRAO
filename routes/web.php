<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

Auth::routes();

// ✅ GARANTIA: só roda se não estiver em console
if (!app()->runningInConsole()) {

    Route::middleware('web')->group(function () {
        // dd('Dentro do web.php, antes da query', [
        //     'conexao_mysql' => config('database.connections.mysql'),
        //     'banco_ativo' => DB::connection()->getDatabaseName(),
        //     'empresa' => app()->bound('empresa') ? app('empresa')->nome : 'não definida'
        // ]);
        Route::get('/', function () {
            return redirect()->route('view.dashboard');
        })->name('home');

        Route::get('/acesso_negado', function () {
            return view('errors.unauthorized');
        })->name('unauthorized');

        // ✅ Proteção garantida ao redor do DB
        try {
            $routes = DB::table('route_views')->where('active', 1)->get();

            foreach ($routes as $route) {
                $method = strtolower($route->method);
                $controllerAction = $route->controller;

                $controller = 'App\\Http\\Controllers\\' . explode('@', $controllerAction)[0];
                $action = explode('@', $controllerAction)[1];

                if (class_exists($controller) && method_exists($controller, $action)) {
                    Route::$method($route->url, [$controller, $action])
                        ->middleware('checkRoleOrPermission')
                        ->name($route->route_name);
                }
            }
        } catch (\Throwable $e) {
            abort(500, 'Erro ao carregar rotas dinâmicas: ' . $e->getMessage());
        }
    });
}
