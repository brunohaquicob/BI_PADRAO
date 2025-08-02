<?php

namespace App\Http\Controllers\Permissao;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Utilitarios\ControllerDB;
use App\Http\Controllers\Utilitarios\ControllerUtils;
use App\Models\Permissao\RouteView;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RouteViewController extends Controller {

    public function InsertUpdateRouteViews(Request $request) {
        try {
            //Validar
            $ar_fields['id']               = 'required|numeric|min:1';
            $ar_fields['url']              = 'required|string|unique:route_views';
            $ar_fields['name']             = 'required|string';
            $ar_fields['route_name']       = 'required|string|min:10|unique:route_views';
            if (!$request->has('id') || empty($request->input('id'))) {
                //Atualizar
                unset($ar_fields['id']);
            } else {
                $ar_fields['url']              = 'required|string|unique:route_views,url,' . $request->input('id');
                $ar_fields['route_name']       = 'required|string|min:10|unique:route_views,route_name,' . $request->input('id');
            }
            // Validação dos dados do formulário
            $validatedData = ControllerUtils::validateRequest($request, $ar_fields);
            // Criação/Atualização do usuário
            $result = RouteView::updateOrCreate(
                [
                    'id' => (isset($validatedData['id']) ? $validatedData['id'] : NULL),
                ] // Condição para encontrar o registro (pode ser o ID ou outros atributos)
                ,
                ['name'           => $validatedData['name']]  +
                ['url'            => $validatedData['url']]  +
                ['route_name'     => $validatedData['route_name']]
            );
            // return $validatedData;
            // Mensagem de sucesso
            return ControllerUtils::jsonResponse(true, $result, "Dados inseridos/Atualizados");
        } catch (\Exception $e) {
            return ControllerUtils::jsonResponse(false, [], "File:" . $e->getFile() . " | Linha:" . $e->getLine() . " | Erro: " . $e->getMessage());
        }
    }
    

    public function getRouteViews(Request $request) {
        try {
            $request = ControllerUtils::tratarDados($request);
            if (ControllerUtils::validaNecessarios(["id"], $request)) {
                $result = DB::table('route_views')->where('id', $request['id'])->first();
                if ($result) {
                    return ControllerUtils::jsonResponse(true, $result, "");
                } else {
                    return ControllerUtils::jsonResponse(false, $result, "Dados não encontrados");
                }
            }
        } catch (\Exception $e) {
            return ControllerUtils::jsonResponse(false, [], "Erro: {$e->getMessage()}");
        }
    }

    public function deleteRouteViews(Request $request) {
        DB::beginTransaction();
        try {
            $request = ControllerUtils::tratarDados($request);
            if (ControllerUtils::validaNecessarios(["id"], $request)) {

                $result = DB::table('route_views')->where('id', $request['id'])->delete();
                if ($result) {
                    DB::commit();
                    return ControllerUtils::jsonResponse(true, [], "Registro Excluido");
                } else {
                    throw new Exception("Erro ao excluir Rota View " . $result, 1);
                }
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return ControllerUtils::jsonResponse(false, [], "File:" . $e->getFile() . " | Linha:" . $e->getLine() . " | Erro: " . $e->getMessage());
        }
    }
}
