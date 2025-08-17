<?php

namespace App\Http\Controllers\Users;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Utilitarios\ControllerDB;
use App\Http\Controllers\Utilitarios\ControllerUtils;
use App\Models\Permissao\Role;
use App\Models\User;
use App\Models\UserGrupoAqc;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UserController extends Controller {

    public function getUsuario(Request $request) {
        try {
            $user  = User::with([
                'empresas:emp_codigo,emp_nome,emp_ativo',
                'gruposAqc:uga_fk_id_user,uga_fk_bbcg_codigo'
            ])->findOrFail($request->input('id'));

            $roles = Role::all();

            return ControllerUtils::jsonResponse(true, [
                'user'           => $user,
                'roles'          => $roles,
                'userRole'       => $user->role,
                // Arrays de IDs para os selects:
                'userEmpresas'   => $user->empresas->pluck('emp_codigo')->values(),
                'userGruposAqc'  => $user->gruposAqc->pluck('uga_fk_bbcg_codigo')->map(fn($v) => (int)$v)->values(),
            ], 'Dados obtidos', 200);
        } catch (\Exception $e) {
            return ControllerUtils::jsonResponse(false, [], "File:" . $e->getFile() . " | Linha:" . $e->getLine() . " | Erro: " . $e->getMessage());
        }
    }

    //INSERIR/ATUALIZAR/RESETAR SENHA
    public function updateUsuario(Request $request) {
        DB::beginTransaction();
        try {
            // Regras base
            $rules = [
                'id'         => 'required',
                'nome'       => 'required|string',
                'permissao'  => 'required|exists:roles,id',
                'email'      => 'required|email|unique:users,email,' . $request->input('id'),
                'password'   => 'required|string|confirmed|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/|min:8',
            ];

            // Fluxos
            if ($request->input('reset') === 'S') {
                // RESET DE SENHA
                $rules = [
                    'id'       => 'required',
                    'password' => $rules['password'],
                ];
            } elseif ($request->filled('id') && (int)$request->input('id') > 0) {
                // ATUALIZAR (sem senha)
                unset($rules['password']);
                $rules['situacao_usuario'] = 'required|string|max:1|in:S,N,B';
                // empresas/grupo_credor são opcionais no update (só tratamos se vierem no request)
                if ($request->has('empresa')) {
                    $rules['empresa']   = 'array|min:1';
                    $rules['empresa.*'] = 'integer|exists:empresa,emp_codigo';
                }
                if ($request->has('grupo_credor')) {
                    $rules['grupo_credor']   = 'array';
                    $rules['grupo_credor.*'] = 'integer';
                }
            } else {
                // INSERIR (sem id)
                unset($rules['id']);
                // empresas obrigatórias ao criar
                $rules['empresa']   = 'required|array|min:1';
                $rules['empresa.*'] = 'integer|exists:empresa,emp_codigo';
                // grupo_credor opcional
                if ($request->has('grupo_credor')) {
                    $rules['grupo_credor']   = 'array';
                    $rules['grupo_credor.*'] = 'integer';
                }
            }

            $data = ControllerUtils::validateRequest($request, $rules);

            // Upsert do usuário
            $user = User::updateOrCreate(
                ['id' => $data['id'] ?? null],
                [
                    ...(isset($data['password']) ? ['password' => bcrypt($data['password'])] : []),
                    ...(isset($data['nome']) ? ['name' => $data['nome']] : []),
                    ...(isset($data['permissao']) ? ['role_id' => $data['permissao']] : []),
                    ...(isset($data['situacao_usuario']) ? ['active' => $data['situacao_usuario']] : []),
                    ...(isset($data['email']) ? ['email' => $data['email']] : []),
                ]
            );

            // === SYNC PIVOTS ===

            // (A) Empresas: sincroniza quando:
            //   - criação (obrigatório)
            //   - update: só se o campo veio no request
            if (array_key_exists('empresa', $data)) {
                $empIds = array_values(array_unique(array_map('intval', $data['empresa'] ?? [])));
                $user->empresas()->sync($empIds);
            }

            // (B) Grupo AQC: opcional; só sincroniza se veio no request
            if (array_key_exists('grupo_credor', $data)) {
                $novos = array_values(array_unique(array_map('intval', $data['grupo_credor'] ?? [])));
                // atuais
                $atuais = $user->gruposAqc()->pluck('uga_fk_bbcg_codigo')->map(fn($v) => (int)$v)->toArray();

                $inserir = array_diff($novos, $atuais);
                $remover = array_diff($atuais, $novos);

                if ($inserir) {
                    $rows = array_map(fn($c) => [
                        'uga_fk_id_user'     => $user->id,
                        'uga_fk_bbcg_codigo' => $c,
                    ], $inserir);
                    UserGrupoAqc::insert($rows);
                }
                if ($remover) {
                    UserGrupoAqc::where('uga_fk_id_user', $user->id)
                        ->whereIn('uga_fk_bbcg_codigo', $remover)
                        ->delete();
                }
            }

            DB::commit();
            return ControllerUtils::jsonResponse(true, $user, "Dados inseridos/atualizados");
        } catch (\Throwable $e) {
            DB::rollBack();
            return ControllerUtils::jsonResponse(false, [], "File:" . $e->getFile() . " | Linha:" . $e->getLine() . " | Erro: " . $e->getMessage());
        }
    }

    public function destroy($id) {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'Usuário deletado com sucesso!']);
    }

    public function tableFull() {
        $users = User::with('role')->get();
        return view('pages.usuarios.cadastro_usuario_tbody', compact('users'));
    }
}
