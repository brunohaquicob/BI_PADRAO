<?php

namespace App\Http\Controllers\Permissao;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Utilitarios\ControllerUtils;
use App\Models\Permissao\RouteView;
use ErrorException;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoleRouteViewController extends Controller {

    //Retorna 2 arrays com o id e o name da RouteView. Um so com o q ele tem vinculado, outro com os que ele nao tem vinculado
    public function getRouteViewsByRole(Request $request) {

        $request = ControllerUtils::tratarDados($request);
        $roleId = $request['role_id'];

        $allRouteViews = RouteView::select('id', 'name')->get();
        $roleRouteViews = RouteView::select('id', 'name')->whereHas('roles', function ($query) use ($roleId) {
            $query->where('roles.id', $roleId);
        })->get();

        $roleRouteViewIds = $roleRouteViews->pluck('id')->toArray();

        $linkedRouteViews = $roleRouteViews->toArray();
        $unlinkedRouteViews = $allRouteViews->reject(function ($routeView) use ($roleRouteViewIds) {
            return in_array($routeView->id, $roleRouteViewIds);
        })->toArray();

        if (count($linkedRouteViews) > 0 || count($unlinkedRouteViews) > 0) {
            $dados = [
                'vinculado' => $linkedRouteViews,
                'semvinculo' => $unlinkedRouteViews
            ];
            return ControllerUtils::jsonResponse(true, $dados, "Obteve resultados");
        } else {
            return ControllerUtils::jsonResponse(false, [], "Sem resultados");
        }
    }


    public function updateRouteViewsByRole(Request $request) {
        DB::beginTransaction(); // Inicia a transação
        try {
            $request = ControllerUtils::tratarDados($request);
            $role_id = $request['role_id'];
            $route_view_ids = isset($request['route_ids']) ? $request['route_ids'] : "";

            if (empty($role_id)) {
                throw new Exception("Grupo não informado", 1);
            }

            // Excluir todos os registros com o role_id informado
            DB::table('role_route_view')->where('role_id', $role_id)->delete();

            // Inserir os novos registros
            $novosRegistros = [];
            if (is_array($route_view_ids)) {
                foreach ($route_view_ids as $route_view_id) {
                    $novosRegistros[] = [
                        'role_id' => $role_id,
                        'route_view_id' => $route_view_id
                    ];
                }
                DB::table('role_route_view')->insert($novosRegistros);
            }
            DB::commit(); // Confirma a transação
            return ControllerUtils::jsonResponse(true, $route_view_ids, "Dados Atualizados com sucesso");
        } catch (ErrorException $e) {
            DB::rollback(); // Desfaz a transação em caso de erro
            // Tratamento do erro capturado
            return ControllerUtils::jsonResponse(false, [], "Erro ao atualizar: {$e->getMessage()}");
        } catch (\Exception $e) {
            DB::rollback(); // Desfaz a transação em caso de erro
            // Tratamento do erro
            return ControllerUtils::jsonResponse(false, [], "Erro ao atualizar: {$e->getMessage()}");
        }
    }
}
