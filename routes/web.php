<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

// Roteamento de autenticação
Auth::routes();

// Redirecionamento padrão
Route::get('/', function () {
    return redirect()->route('view.dashboard');
})->name('home');

// Rota de acesso negado
Route::get('/acesso_negado', function () {
    return view('errors.unauthorized');
})->name('unauthorized');

// Carregar rotas do banco de dados
$routes = DB::table('route_views')->where('active', 1)->get();

foreach ($routes as $route) {
    $method = strtolower($route->method);
    $controllerAction = $route->controller;
    
    // Garantir que a separação do controlador e ação esteja correta
    $controller = 'App\\Http\\Controllers\\' . explode('@', $route->controller)[0];
    $action = explode('@', $route->controller)[1];
    // Verifique se o controlador existe
    if (class_exists($controller) && method_exists($controller, $action)) {
        Route::$method($route->url, [$controller, $action])
            ->middleware('checkRoleOrPermission')
            ->name($route->route_name);
    }
}
