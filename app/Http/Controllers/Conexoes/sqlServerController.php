<?php

namespace App\Http\Controllers\Conexoes;

use Illuminate\Support\Facades\DB;
use Exception;

class sqlServerController {
    protected $connection;

    public function __construct($conn_name = 'topone_sqlsrv') {
        try {
            $this->connection = DB::connection($conn_name);
            // Testa a conexão executando uma consulta simples
            $this->connection->getPdo();
        } catch (\Exception $e) {
            throw new \Exception("Erro ao conectar ao banco de dados: " . $e->getMessage());
        }
    }

    /**
     * Executa um SELECT e retorna os resultados
     */
    public function select($query, $bindings = []) {
        try {
            return $this->connection->select($query, $bindings);
        } catch (Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Executa um INSERT, UPDATE ou DELETE
     */
    public function execute($query, $bindings = []) {
        try {
            return $this->connection->statement($query, $bindings);
        } catch (Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }
}
