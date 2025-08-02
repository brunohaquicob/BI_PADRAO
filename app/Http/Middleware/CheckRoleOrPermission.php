<?php

namespace App\Http\Middleware;

use App\Http\Controllers\Utilitarios\ControllerUtils;
use App\Models\Permissao\RouteView;
use App\Models\Permissao\RoleRouteView;
use Closure;
use Exception;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\View\View;
use Illuminate\Support\Facades\DB;
use Illuminate\View\ViewException;
use Carbon\Carbon;

class CheckRoleOrPermission {

    /**
     * @var \App\Models\User|null
     */
    private $user;

    private $routeName;
    private $response;
    private $route;
    private $isView = false;
    private $erro = false;
    private $msg_log = "";

    public function handle($request, Closure $next) {
        try {
            if (Auth::check()) {
                $this->user = Auth::user();
                $this->response = $next($request);
                $this->route = $request->route();
                $this->routeName = $this->route->getName();

                if ($this->user->session_id !== session()->getId()) {
                    Auth::logout();
                    return redirect()->route('login')->withErrors(['session_expired' => 'Você foi desconectado!']);
                }

                if ($this->routeName == 'unauthorized') {
                    return $this->response;
                }

                if ($this->user->active === 'B') {
                    return redirect()->route('unauthorized')->withErrors(['acesso' => 'B']);
                }
                if ($this->user->active === 'N') {
                    return redirect()->route('unauthorized')->withErrors(['acesso' => 'N']);
                }

                $this->salvarLogAcesso($request);
                $this->validaRota();
                if ($this->validarRotaRole()) {
                    return $this->response;
                } else {
                    throw new Exception("Erro não identificado no acesso a rota");
                }
            } else {
                return redirect()->route('login');
            }
        } catch (ViewException $e) {
            $this->erro = true;
            $this->msg_log = $e->getMessage();
            if ($this->routeName == 'unauthorized') {
                return $this->response;
            }
            if ($this->isView) {
                return redirect()->route('unauthorized')->withErrors(['error' => $e->getMessage()]);
            } else {
                return ControllerUtils::jsonResponse(false, [], $e->getMessage());
            }
        } catch (\Exception $e) {
            $this->erro = true;
            $this->msg_log = $e->getMessage();
            if ($this->routeName == 'unauthorized') {
                return $this->response;
            }
            if ($this->isView) {
                return redirect()->route('unauthorized')->withErrors(['error' => $e->getMessage()]);
            } else {
                return ControllerUtils::jsonResponse(false, [], $e->getMessage());
            }
        } finally {
            // Lógica de salvar o log
            
        }
    }

    private function validaRota() {
        if ($this->response instanceof View || ($this->response instanceof Response && $this->response->original instanceof View)) {
            $this->isView = true;
        }

        if (!Route::has($this->routeName)) {
            // Rota não encontrada, faça o tratamento adequado
            throw new Exception("Rota não encontrada: " . $this->routeName, 1);
        } else {
            return true;
        }
    }

    private function validarRotaRole() {
        $role_id = $this->user->role_id;
        // Procurar o id da routeview pelo nome da rota
        $routeView = RouteView::where('route_name', $this->routeName)->first();
        if (empty($routeView)) {
            $error = "View [{$this->routeName}] não cadastrada no banco";
            throw new Exception($error, 1);
        }
        // Verificar se o role_id e o id da routeview existem na tabela rolerouteview
        $roleRouteView = RoleRouteView::where('role_id', $role_id)
            ->where('route_view_id', $routeView->id)
            ->first();

        if (!empty($roleRouteView)) {
            return true;
        } else {
            throw new Exception("Sem permissao de acesso a página: " . $routeView->name, 1);
        }
    }

    private function salvarLogAcesso($request) {
        try {
            if ($this->routeName !== 'unauthorized' && $this->user->id !== 1) {
                
                $routeView = RouteView::where('route_name', $this->routeName)->first();
                $logData = [
                    'user_id'               => $this->user->id,
                    'route_view_id'         => $routeView ? $routeView->id : null,
                    'access_date'           => Carbon::now()->toDateTimeString(),
                    'ip_address'            => $request->ip(),
                    'request_parameters'    => json_encode($request->all()),
                    'erro'                  => $this->erro,
                    'msg'                   => $this->msg_log,
                ];
                // DB::enableQueryLog();
                DB::table('route_access_logs')->insert($logData);
            }
        } catch (\Exception $e) {
            // Trate erros de log aqui, se necessário
            dd($e->getMessage());
        }
    }
}
