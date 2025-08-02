<?php

namespace App\Http\Controllers\Querys;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Utilitarios\ControllerUtils;
use Exception;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use PDO;
use PDOException;

class JallQueryExecutor extends Controller {
    public      $databases;
    protected   $erros;
    public      $colunasBases   = [];
    public      $colunasBasesOn = [];
    public      $colunaTotalSelecionados = '';
    public      $inicioConsulta;
    public      $fimConsulta;

    public function __construct($only = []) {
        $this->inicioConsulta = microtime(true);
        $this->databases = $this->setupConnections($only);
    }
    public function getErros() {
        $retorno = "";
        if (is_array($this->erros) && count($this->erros) > 0) {
            foreach ($this->erros as $key => $value) {
                $retorno .= $value . '<br>';
            }
            return $retorno;
        }
        return $this->erros;
    }
    public function getTempoExecusao($fim = "", $decimal = 2) {
        $tempoExecucao = ($fim != "" ? $fim : $this->fimConsulta) - $this->inicioConsulta;
        return round($tempoExecucao, $decimal);
    }
    protected function checkHostAvailability(&$connectionName) {
        return true;
        $databaseConfig = Config::get("database.connections.{$connectionName}");
        $host = $databaseConfig['host'];
        $port = $databaseConfig['port'];
        $timeout = 3; // Tempo limite em segundos

        $socket = @fsockopen($host, $port, $errno, $errstr, $timeout);
        if ($socket) {
            fclose($socket);
            return true;
        } else {
            $connectionName = $connectionName . '2';
            $databaseConfig = Config::get("database.connections.{$connectionName}");
            $host = $databaseConfig['host'];
            $port = $databaseConfig['port'];
            $timeout = 3; // Tempo limite em segundos

            $socket = @fsockopen($host, $port, $errno, $errstr, $timeout);
            if ($socket) {
                fclose($socket);
                return true;
            }
        }
        return false;
    }
    protected function setupConnections($only = []) {
        $connections = [
            'JALL_PR' => [
                'conn' => null, // Instância da conexão PDO
                'active' => true, // Conexão está ativa ou não
                'msg' => '', // Mensagem de erro ou informação adicional
            ],
            'JALL_SP' => [
                'conn' => null,
                'active' => true,
                'msg' => '',
            ],
            'JALL_PE' => [
                'conn' => null,
                'active' => false,
                'msg' => '',
            ],
        ];
        //Definir as colunas para a função arrumaColunaArrayUnicaEmColuna
        foreach ($connections as $key => $value) {
            $this->colunasBases[] = $key;
        }

        //Somente essas bases
        if (count($only) > 0) {
            foreach ($connections as $key => $value) {
                if (!in_array($key, $only)) {
                    unset($connections[$key]);
                }
            }
        }

        foreach ($connections as $connectionName => &$connection) {
            try {
                if (!$this->checkHostAvailability($connectionName)) {
                    $connection['active'] = false;
                    $connection['msg'] = 'Database : ' . $connectionName . ' OFFLINE';
                } else {
                    if ($connection['active'] === true) {
                        $connection['conn'] = DB::connection($connectionName)->getPdo();
                        $this->colunasBasesOn[] = ControllerUtils::removeNumeros($connectionName);
                    } else {
                        $connection['msg'] = 'Database : ' . $connectionName . ' OFFLINE';
                    }
                }
            } catch (PDOException $e) {
                $connection['active'] = false;
                $connection['msg'] = 'Erro ao obter a conexão com o banco de dados: ' . $e->getMessage();
            }
        }

        return $connections;
    }

    public function adicionaBlindValues(&$bindValues, $valor) {
        if (!empty($valor)) {
            if (is_array($valor)) {

                $placeholders = implode(',', array_fill(0, count($valor), '?'));

                foreach ($valor as $v) {
                    $bindValues[] = $v;
                }

                return $placeholders;
            } else {
                $bindValues[] = $valor;
                return '?';
            }
        } else {
            throw new Exception("Bind Value não configurado. {$valor}", 1);
        }
    }

    private function quoteValues($bindValues, $pdo) {
        foreach ($bindValues as &$value) {
            $value = $pdo->quote(str_replace("'", "", $value));
        }
        return $bindValues;
    }

    public function bindValuesToQuery($query, $bindValues) {
        if (is_array($bindValues) && !empty($bindValues)) {

            $connAjuste = DB::connection('mysql')->getPdo();
            $bindValues = $this->quoteValues($bindValues, $connAjuste);

            $position = 0;
            $newQuery = preg_replace_callback('/\?/', function ($matches) use (&$position, $bindValues) {
                $value = $bindValues[$position];
                $position++;

                if (is_string($value)) {
                    return $value;
                }
                return $value;
            }, $query);

            return $newQuery;
        } else {
            return $query;
        }
    }

    public function executeQuery($query, $bindValues = [], $databaseKey = true) {
        $results = [];

        foreach ($this->databases as $database => $dbInfo) {
            if (!$dbInfo['active']) {
                $this->erros[$database] = $dbInfo['msg'];
                continue; // Pular conexões inativas
            }
            /** @var \PDO $db */
            $db = $dbInfo['conn'];
            try {

                // $query = $this->bindValuesToQuery($query, $bindValues);
                // $bindValues = [];

                $statement = $db->prepare($query);
                $statement->execute($bindValues);
                $rows = $statement->fetchAll(PDO::FETCH_ASSOC);
                if (count($rows) > 0) {

                    if ($databaseKey) {
                        $results[$database] = $rows;
                    } else {
                        // Adicionar a coluna adicional indicando o banco de dados
                        foreach ($rows as $row) {
                            $row['database'] = $database;
                            $results[] = $row;
                        }
                    }
                }
            } catch (PDOException $e) {
                // Tratar exceções
                throw new Exception('Erro na consulta do banco de dados ' . $database . ': ' . $e->getMessage(), 1);
            }
        }
        $this->fimConsulta = microtime(true);
        return $results;
    }

    /*
    Objetivo
    Não repetir as linhas quando todos os valores das colunas restantes forem iguais. 
    Os dados selecionados serão adicionados ao array dadosSelecionados correspondente, utilizando a chave do array atual(sigla da conexão).
    */
    public function juntarArraysResult($array, $qtd_qrepete, $coluna_principal, $nome_coluna_total = "Total Jall") {
        $this->colunaTotalSelecionados = $nome_coluna_total;
        // Criar array de união vazio
        $uniaoArray = [];
        foreach ($this->colunasBases as $value) {
            $array_aux[$value] = 0;
        }
        if (!is_array($array)) {
            throw new Exception("Array de dados no formato incorreto ou sem dados", 1);
        }
        if (!is_array($this->colunasBases) || count($this->colunasBases) == 0) {
            throw new Exception("Colunas Bases no formato incorreto ou sem dados", 1);
        }
        foreach ($array as $key => $value) {
            // Percorrer o primeiro array
            foreach ($value as $item) {
                $chave = implode('_', array_slice($item, 0, $qtd_qrepete)); // Cria uma chave única com as primeiras colunas
                // Verificar se a chave já existe no array de união
                if (!isset($uniaoArray[$chave])) {
                    $uniaoArray[$chave] = array_slice($item, 0, $qtd_qrepete); // Adiciona as primeiras colunas
                    $uniaoArray[$chave][$coluna_principal] = $array_aux; // Adiciona as colunas vazias para os valores dos outros arrays
                }
                // Substituir o valor da primeira coluna do array de união
                $uniaoArray[$chave][$coluna_principal][$key] = is_numeric($item[$coluna_principal]) ? ($item[$coluna_principal] * 1) : $item[$coluna_principal];
            }
        }

        // Converter o resultado em um array numérico
        $novo_array = array_values($uniaoArray);

        // Adicionar a coluna "total" e converte o array da coluna seleciona para colunas novas do array principal
        foreach ($novo_array as &$item) {
            $somaTotal = array_sum($item[$coluna_principal]);
            //Adicionando como colunas o array da coluna selecionada
            foreach ($item[$coluna_principal] as $key => $value) {
                $item[$key] = $value;
            }
            //Adicionando o total
            $item[$this->colunaTotalSelecionados] = $somaTotal;
            unset($item[$coluna_principal]);
        }
        return $novo_array;
    }
}
