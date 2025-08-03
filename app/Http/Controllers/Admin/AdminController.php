<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Config;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Utilitarios\ControllerUtils;

class AdminController extends Controller {
    public function index() {
        $empresas = DB::connection('centralizador')
            ->table('empresas')
            ->where('app_name', '!=', 'PADRAO')
            ->get();
        return view('pages.admin.executor_query', compact('empresas'));
    }

    public function executar(Request $request) {
        try {
            $ar_fields['query']  = 'required|string';
            $ar_fields['bases']  = 'required|array';

            $dadosTratados = ControllerUtils::validateRequest($request, $ar_fields);

            $empresas = DB::connection('centralizador')->table('empresas')->get();
            $selecionadas = $empresas->whereIn('id', $request->bases);

            $query = $dadosTratados['query'];

            $resultados = [];

            foreach ($selecionadas as $empresa) {
                try {
                    Config::set('database.connections.temp_dynamic', [
                        'driver' => 'mysql',
                        'host' => $empresa->db_host,
                        'port' => $empresa->db_port,
                        'database' => $empresa->db_database,
                        'username' => $empresa->db_username,
                        'password' => $empresa->db_password,
                        'charset' => 'utf8mb4',
                        'collation' => 'utf8mb4_unicode_ci',
                        'prefix' => '',
                    ]);

                    DB::purge('temp_dynamic');
                    DB::reconnect('temp_dynamic');

                    $result = DB::connection('temp_dynamic')->select(DB::raw($query));
                    $resultados[$empresa->db_database] = $result;
                } catch (\Throwable $e) {
                    $resultados[$empresa->db_database] = 'Erro: ' . $e->getMessage();
                }
            }

            return ControllerUtils::jsonResponse(true, ["resultado" => $resultados, "empresas" => $empresas], "Processo realizado!");
        } catch (\Exception $e) {
            return ControllerUtils::jsonResponse(false, [], "File:" . $e->getFile() . " | Linha:" . $e->getLine() . " | Erro: " . $e->getMessage());
        }
    }
}
