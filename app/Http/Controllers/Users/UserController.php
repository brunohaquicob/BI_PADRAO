<?php

namespace App\Http\Controllers\Users;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Utilitarios\ControllerDB;
use App\Http\Controllers\Utilitarios\ControllerUtils;
use App\Models\Permissao\Role;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class UserController extends Controller {

    public function getUsuario(Request $request) {
        try {
            $user   = User::findOrFail($request->input('id'));
            $roles  = Role::all();

            return ControllerUtils::jsonResponse(true, [
                'user'      => $user,
                'roles'     => $roles,
                'userRole'  => $user->role // Inclui o grupo (role) do usuário
            ], 'Dados obtidos', 200);
        } catch (\Exception $e) {
            return ControllerUtils::jsonResponse(false, [], "File:" . $e->getFile() . " | Linha:" . $e->getLine() . " | Erro: " . $e->getMessage());
        }
    }
    //INSERIR/ATUALIZAR/RESETAR SENHA
    public function updateUsuario(Request $request) {
        try {
            //Validar
            $ar_fields['id']                    = 'required';
            $ar_fields['nome']                  = 'required|string';
            $ar_fields['permissao']             = 'required|exists:roles,id';
            $ar_fields['email']                 = 'required|email|unique:users,email,' . $request->input('id');
            $ar_fields['password']              = 'required|string|confirmed|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/|min:8';
            if ($request->has('reset') && $request->input('reset') === 'S') {
                //Editar senha
                unset($ar_fields['nome']);
                unset($ar_fields['permissao']);
                unset($ar_fields['email']);
            } else if ($request->has('id') && $request->input('id') > 0) {
                //Atualizar
                unset($ar_fields['password']);
                $ar_fields['situacao_usuario']  = 'required|string|max:1|in:S,N,B';
            } else {
                //Inserir
                unset($ar_fields['id']);
            }
            // Validação dos dados do formulário
            $validatedData = ControllerUtils::validateRequest($request, $ar_fields);
            // Criação/Atualização do usuário
            $user = User::updateOrCreate(
                [
                    'id' => (isset($validatedData['id']) ? $validatedData['id'] : NULL),
                ] // Condição para encontrar o registro (pode ser o ID ou outros atributos)
                ,
                (isset($validatedData['password'])                  ? ['password'       => bcrypt($validatedData['password'])] : []) +
                    (isset($validatedData['nome'])                  ? ['name'           => $validatedData['nome']] : []) +
                    (isset($validatedData['permissao'])             ? ['role_id'        => $validatedData['permissao']] : []) +
                    (isset($validatedData['situacao_usuario'])      ? ['active'         => $validatedData['situacao_usuario']] : []) +
                    (isset($validatedData['email'])                 ? ['email'          => $validatedData['email']] : [])
            );
            // return $validatedData;
            // Mensagem de sucesso
            return ControllerUtils::jsonResponse(true, $user, "Dados inseridos/Atualizados");
        } catch (\Exception $e) {
            return ControllerUtils::jsonResponse(false, [], "File:" . $e->getFile() . " | Linha:" . $e->getLine() . " | Erro: " . $e->getMessage());
        }
    }

    public function destroy($id) {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'Usuário deletado com sucesso!']);
    }
}
