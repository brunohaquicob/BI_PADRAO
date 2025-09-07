<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Querys\JallQueryExecutor;
use App\Http\Controllers\Utilitarios\ControllerUtils;
use App\Models\Empresa;
use Illuminate\Support\Facades\Auth;
use App\Models\Permissao\Role;
use App\Models\Permissao\RouteView;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Route;

class PagesController extends Controller {
    /**
     * Create a new controller instance.
     *
     * @return void
     */

    private $conns;

    public function __construct() {
        $this->middleware('auth');
    }

    public function dashbord() {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $empresa = app('empresa');

        $routeName = Route::currentRouteName();
        $nameView = RouteView::where('route_name', $routeName)->first();
        $data['nameView'] = $nameView->name ?? 'Dashboard';
        // dd($empresa);
        switch (trim(strtoupper($empresa->db_database))) {
            case 'PADRAO':
                return view('pages.dashboards.dashboard_padrao', $data);
            case 'VERTEX':
                return view('pages.dashboards.dashboard_padrao', $data);
            case 'SOLUT':
                return view('pages.dashboards.dashboard_padrao', $data);
            case 'NACIONAL':
                return view('pages.dashboards.dashboard_padrao', $data);
            case 'TOPONE':
                return view('pages.topone.dashboard_padrao', $data);
            default:
                return view('pages.dashboards.dashboard_padrao', $data);
        }
    }


    public function rel_analise_carteiras() {

        $dados_equipes = ControllerUtils::excutarChamadaApiAqc('get_equipe_loja', "aqc_bi_credores", ["and_where" => ""], $time, true);
        if (!isset($dados_equipes['retorno']) || $dados_equipes['retorno'] === false) {
            throw new Exception("Erro ao buscar dados API AQC: " . $dados_equipes['mensagem'], 1);
        }

        $data = [
            'equipes_loja' => $dados_equipes['dados'],
        ];

        $routeName = Route::currentRouteName();
        $nameView = RouteView::where('route_name', $routeName)->first();
        $data['nameView'] = $nameView->name;
        return view('pages.relatorios.rel_analise_carteiras', $data);
    }

    public function rel_acordos_gerencial() {

        $dados = ControllerUtils::excutarChamadaApiAqc('get_canais_senff', "aqc_bi", [], $time, true);
        //dd($dados);
        if (!isset($dados['retorno']) || $dados['retorno'] === false) {
            throw new Exception("Erro ao buscar dados API AQC: " . $dados['mensagem'], 1);
        }

        $data = [
            'canais_senff' => $dados['dados']
        ];

        $routeName = Route::currentRouteName();
        $nameView = RouteView::where('route_name', $routeName)->first();
        $data['nameView'] = $nameView->name;
        return view('pages.relatorios.rel_acordos_gerencial', $data);
    }

    public function rel_oportunidades_ws() {

        $dados = ControllerUtils::excutarChamadaApiAqc('get_canais_senff', "aqc_bi", ["grupo_only" => ["AutoNegociacao"]], $time, true);
        //dd($dados);
        if (!isset($dados['retorno']) || $dados['retorno'] === false) {
            return redirect()->route('unauthorized')->withErrors(['error' => "Erro ao buscar dados API AQC: " . $dados['mensagem']]);
        }

        $data = [
            'canais_senff' => $dados['dados']
        ];

        $routeName = Route::currentRouteName();
        $nameView = RouteView::where('route_name', $routeName)->first();
        $data['nameView'] = $nameView->name;
        return view('pages.relatorios.rel_oportunidades_ws', $data);
    }

    public function rel_comissao_pagamento() {

        $dados = ControllerUtils::excutarChamadaApiAqc('get_canais_senff', "aqc_bi", ["inner_comissao" => true], $time, true);
        //dd($dados);
        if (!isset($dados['retorno']) || $dados['retorno'] === false) {
            throw new Exception("Erro ao buscar dados API AQC: " . $dados['mensagem'], 1);
        }

        $data = [
            'canais_senff' => $dados['dados']
        ];

        $routeName = Route::currentRouteName();
        $nameView = RouteView::where('route_name', $routeName)->first();
        $data['nameView'] = $nameView->name;
        return view('pages.relatorios.rel_comissao_pagamento', $data);
    }
    //CREDORES
    public function credor_dash_carteiras() {
        if (Auth::check()) {
            $routeName = Route::currentRouteName();
            $nameView  = RouteView::where('route_name', $routeName)->first();
            $data['nameView'] = $nameView->name;
            return view('pages.credores.dash_carteira', $data);
        } else {
            return redirect()->route('login');
        }
    }
    public function rel_painel_desempenho() {
        if (Auth::check()) {

            $meses = ControllerUtils::gerarUltimosMesesAr(12);
            $dados = ControllerUtils::excutarChamadaApiAqc('get_lojas', "aqc_bi_padrao", [], $time, true);
            //dd($dados);
            if (!isset($dados['retorno']) || $dados['retorno'] === false) {
                return redirect()->route('unauthorized')->withErrors(['error' => "Erro ao buscar dados API AQC: " . $dados['mensagem']]);
            }

            $dados = ControllerUtils::excutarChamadaApiAqc('get_lojas_equipe', "aqc_bi_padrao", [], $time, true);
            //dd($dados);
            if (!isset($dados['retorno']) || $dados['retorno'] === false) {
                return redirect()->route('unauthorized')->withErrors(['error' => "Erro ao buscar dados API AQC: " . $dados['mensagem']]);
            }

            $data = [
                'lojas' => $dados['dados'],
                'equipe_lojas' => $dados['dados'],
                'meses' => $meses
            ];

            $routeName = Route::currentRouteName();
            $nameView  = RouteView::where('route_name', $routeName)->first();
            $data['nameView'] = $nameView->name;
            return view('pages.relatorios.rel_painel_desempenho', $data);
        } else {
            return redirect()->route('login');
        }
    }
    public function rel_analise_funcionario() {
        if (Auth::check()) {

            // $dados = ControllerUtils::excutarChamadaApiAqc('get_lojas', "aqc_bi_padrao", [], $time, true);
            // //dd($dados);
            // if (!isset($dados['retorno']) || $dados['retorno'] === false) {
            //     return redirect()->route('unauthorized')->withErrors(['error' => "Erro ao buscar dados API AQC: " . $dados['mensagem']]);
            // }

            $usuarios = ControllerUtils::excutarChamadaApiAqc('get_usuarios', "aqc_bi_padrao", [], $time, true);
            //dd($dados);
            if (!isset($usuarios['retorno']) || $usuarios['retorno'] === false) {
                return redirect()->route('unauthorized')->withErrors(['error' => "Erro ao buscar dados API AQC: " . $usuarios['mensagem']]);
            }
            $dados = ControllerUtils::excutarChamadaApiAqc('get_lojas_equipe', "aqc_bi_padrao", [], $time, true);
            //dd($dados);
            if (!isset($dados['retorno']) || $dados['retorno'] === false) {
                return redirect()->route('unauthorized')->withErrors(['error' => "Erro ao buscar dados API AQC: " . $dados['mensagem']]);
            }

            $meses = ControllerUtils::gerarUltimosMesesAr(12);
            $data = [
                // 'lojas' => $dados['dados'],
                'equipe_lojas' => $dados['dados'],
                'usuarios' => $usuarios['dados'],
                'meses' => $meses
            ];

            $routeName = Route::currentRouteName();
            $nameView  = RouteView::where('route_name', $routeName)->first();
            $data['nameView'] = $nameView->name;
            return view('pages.relatorios.rel_analise_funcionario', $data);
        } else {
            return redirect()->route('login');
        }
    }
    public function credor_dash_carteira_desempenho() {
        if (Auth::check()) {

            $dados_loja = ControllerUtils::excutarChamadaApiAqc('get_lojas', "aqc_bi_padrao", [], $time, true);
            //dd($dados);
            if (!isset($dados_loja['retorno']) || $dados_loja['retorno'] === false) {
                return redirect()->route('unauthorized')->withErrors(['error' => "Erro ao buscar dados API AQC: " . $dados_loja['mensagem']]);
            }

            $dados = ControllerUtils::excutarChamadaApiAqc('get_equipe_loja', "aqc_bi_credores", ["and_where" => ""], $time, true);
            //dd($dados);
            if (!isset($dados['retorno']) || $dados['retorno'] === false) {
                return redirect()->route('unauthorized')->withErrors(['error' => "Erro ao buscar dados API AQC: " . $dados['mensagem']]);
            }

            $data = [
                'lojas' => $dados_loja['dados'],
                'equipe_lojas' => $dados['dados'],
            ];

            $routeName = Route::currentRouteName();
            $nameView  = RouteView::where('route_name', $routeName)->first();
            $data['nameView'] = $nameView->name;
            return view('pages.credores.dash_carteira_desempenho', $data);
        } else {
            return redirect()->route('login');
        }
    }

    public function credor_dash_carteira_pagamento() {
        if (Auth::check()) {
            $data = [];
            $dados = ControllerUtils::excutarChamadaApiAqc('get_equipe_loja', "aqc_bi_credores", ["and_where" => ""], $time, true);
            //dd($dados);
            if (!isset($dados['retorno']) || $dados['retorno'] === false) {
                return redirect()->route('unauthorized')->withErrors(['error' => "Erro ao buscar dados API AQC: " . $dados['mensagem']]);
            }
            $data['equipe_lojas'] = $dados['dados'];
            $dados = ControllerUtils::excutarChamadaApiAqc('get_lojas', "aqc_bi_padrao", [], $time, true);
            //dd($dados);
            if (!isset($dados['retorno']) || $dados['retorno'] === false) {
                return redirect()->route('unauthorized')->withErrors(['error' => "Erro ao buscar dados API AQC: " . $dados['mensagem']]);
            }
            $data['lojas'] = $dados['dados'];

            $routeName = Route::currentRouteName();
            $nameView  = RouteView::where('route_name', $routeName)->first();
            $data['nameView'] = $nameView->name;
            return view('pages.credores.dash_carteira_pagamento', $data);
        } else {
            return redirect()->route('login');
        }
    }

    public function credor_dash_gerencial_acordos() {

        $dados_equipes = ControllerUtils::excutarChamadaApiAqc('get_equipe_loja', "aqc_bi_credores", ["and_where" => ""], $time, true);
        if (!isset($dados_equipes['retorno']) || $dados_equipes['retorno'] === false) {
            throw new Exception("Erro ao buscar dados API AQC: " . $dados_equipes['mensagem'], 1);
        }

        $data = [
            'equipes_loja' => $dados_equipes['dados'],
        ];

        $routeName = Route::currentRouteName();
        $nameView = RouteView::where('route_name', $routeName)->first();
        $data['nameView'] = $nameView->name;
        return view('pages.credores.credor_dash_gerencial_acordos', $data);
    }

    //PAINEL
    public function painel_comercial_01() {
        if (Auth::check()) {
            $data = [
                'equipe_lojas' => $this->equipeLojas(),
                'meses' => ControllerUtils::gerarUltimosMesesAr(12)
            ];

            $routeName = Route::currentRouteName();
            $nameView = RouteView::where('route_name', $routeName)->first();
            $data['nameView'] = $nameView->name;
            return view('pages.painel.painel_comercial_01', $data);
        } else {
            return redirect()->route('login');
        }
    }

    private function equipeLojas() {
        $dados = ControllerUtils::excutarChamadaApiAqc('get_lojas_equipe', "aqc_bi_padrao", [], $time, true);
        //dd($dados);
        if (!isset($dados['retorno']) || $dados['retorno'] === false) {
            return redirect()->route('unauthorized')->withErrors(['error' => "Erro ao buscar dados API AQC: " . $dados['mensagem']]);
        }

        return $dados['dados'];
    }

    //MENUS
    public function usuario_cadastro() {
        $users = User::all();
        $roles = Role::all();

        $routeName  = Route::currentRouteName();
        $nameView   = RouteView::where('route_name', $routeName)->first();
        $nameView   = $nameView->name;

        $dadosGrupo = ControllerUtils::excutarChamadaApiAqc('get_credor_grupo', "aqc_bi_credores", ["and_where" => ""], $time, true);
        $grupoCredor = $dadosGrupo['dados'] ?: [];

        $empresas = Empresa::where('emp_ativo', 'S')
            ->orderBy('emp_nome')
            ->get(['emp_codigo', 'emp_nome']);

        return view('pages.usuarios.cadastro_usuario', compact('users', 'roles', 'nameView', 'grupoCredor', 'empresas'));
    }

    public function acessos_cadastro() {
        $roles      = Role::all();
        $routeViews = RouteView::all();
        return view('pages.routes.cadastro_routes', compact('roles', 'routeViews'));
    }
}
