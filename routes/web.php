<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

Auth::routes();

// ✅ GARANTIA: só roda se não estiver em console
if (!app()->runningInConsole()) {

    Route::middleware('web')->group(function () {

        Route::get('/', function () {
            if (Auth::check()) {
                $user = Auth::user();
                // Primeira opção: usar o campo do usuário
                if (!empty($user->default_route) && Route::has($user->default_route)) {
                    return redirect()->route($user->default_route);
                }
                // Segunda opção: usar a rota da empresa associada
                $empresa = app('empresa');
                if (!empty($empresa->default_route) && Route::has($empresa->default_route)) {
                    return redirect()->route($empresa->default_route);
                }
                // Fallback
                return redirect()->route('view.dashboard');
            }

            return redirect()->route('login');
        })->name('home');

        Route::get('/acesso_negado', function () {
            return view('errors.unauthorized');
        })->name('unauthorized');

        Route::middleware(['auth', 'isSuperAdmin'])->group(function () {
            Route::get('/admin/executar-query', [App\Http\Controllers\Admin\AdminController::class, 'index'])->name('admin.executar-query');
            Route::post('/admin/executar-query', [App\Http\Controllers\Admin\AdminController::class, 'executar'])->name('admin.executar-query.post');
        });

        //CARREGAR ROTAS DO BANCO DE DADOS
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
