<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Utilitarios\ControllerUtils;
use Illuminate\Support\Facades\Auth;
use App\Models\Permissao\Role;
use App\Models\Permissao\RouteView;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Route;

class PagesControllerHapvida extends Controller {
    /**
     * Create a new controller instance.
     *
     * @return void
     */

    private $empresa;

    public function __construct() {
        $this->middleware('auth');
        $this->empresa = app('empresa');
    }

    public function hapvida_desempenho_carteira() {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $dados = ControllerUtils::excutarChamadaApiAqc('hapvida_get_filtros_retencao_ativa', "aqc_bi_nnc", ["and_where" => ""], $time, true);
        if (!isset($dados['retorno']) || $dados['retorno'] === false) {
            throw new Exception("Erro ao buscar dados API AQC[HAPVIDA]: " . $dados['mensagem'], 1);
        }

        if(empty($dados['dados'])){
            ControllerUtils::erroAbort("Filtros HAPVIDA não localizados.", 500);
        }

        $data = [
            'filtros' => $dados['dados'],
        ];
        // dd($data);
        $routeName          = Route::currentRouteName();
        $nameView           = RouteView::where('route_name', $routeName)->first();
        $data['nameView']   = $nameView->name;
        return view('pages.nacional.hapvida_desempenho_carteira', $data);
        
    }



}
