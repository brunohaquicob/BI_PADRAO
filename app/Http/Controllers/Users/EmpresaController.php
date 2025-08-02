<?php

namespace App\Http\Controllers\Users;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Empresa;
use Exception;
use Illuminate\Support\Facades\Auth;

class EmpresaController extends Controller {
    /**
     * Consulta os dados da empresa com base no ID do usuário e, opcionalmente, no emp_codigo.
     *
     * @param int $id
     * @param int|null $emp_codigo
     * @return Empresa
     */
    static public function getEmpresaByUser($emp_codigo = null) {
        try {
            $id = Auth::id();
            // Recupera o usuário com o ID fornecido
            $user = User::findOrFail($id);

            // Recupera as empresas associadas ao usuário
            $query = $user->empresas(); // Supondo que 'empresas' é um relacionamento no modelo User

            // Filtra apenas empresas ativas
            $query->where('emp_ativo', 'S');

            // Se emp_codigo for fornecido, filtra a consulta
            if ($emp_codigo !== null) {
                $query->where('emp_codigo', $emp_codigo);
            }

            $empresa = $query->first(); // Recupera a primeira empresa correspondente

            if ($empresa) {
                return  $empresa;
            } else {
                return false;;
            }
        } catch (\Exception $e) {
            throw new Exception("Erro: " . $e->getMessage());
        }
    }


    static public function getEmpresaByUserToken($emp_codigo = null) {
        try {
            $id = Auth::id();
            // Recupera o usuário com o ID fornecido
            $user = User::findOrFail($id);

            // Recupera as empresas associadas ao usuário
            $query = $user->empresas(); // Supondo que 'empresas' é um relacionamento no modelo User

            // Filtra apenas empresas ativas
            $query->where('emp_ativo', 'S');

            // Se emp_codigo for fornecido, filtra a consulta
            if ($emp_codigo !== null) {
                $query->where('emp_codigo', $emp_codigo);
            }

            $empresa = $query->first(); // Recupera a primeira empresa correspondente

            if ($empresa) {
                return $empresa->emp_api_token;
            } else {
                return false;
            }
        } catch (\Exception $e) {
            throw new Exception("Erro: " . $e->getMessage());
        }
    }
}
