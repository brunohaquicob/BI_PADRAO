<?php

namespace App\Http\Controllers;

use App\Http\Class\Utilitarios\GeradorTabela;
use App\Http\Controllers\Querys\JallQueryExecutor;
use App\Http\Controllers\Utilitarios\ControllerUtils;
use Illuminate\Http\Request;

class AjaxController extends Controller {

    public function buscarProdutos(Request $request) {
        try {
            $ar_fields['jall_familias'] = 'array';
            $ar_fields['jall_clientes'] = 'array';
            $dadosTratados = ControllerUtils::validateRequest($request, $ar_fields);
            $conns = new JallQueryExecutor(['JALL_PR']);

            $blinds = [];
            $and_familias = "";
            $and_clientes = "";

            if (isset($dadosTratados['jall_familias'])) {
                $and_familias = "AND f.codigo IN(:familias)";
                $blinds['familias'] = $dadosTratados['jall_familias'];
            }

            if (isset($dadosTratados['jall_clientes'])) {
                $and_clientes = "AND c.sigla IN(:clientes)";
                $blinds['clientes'] = $dadosTratados['jall_clientes'];
            }

            $sql = "SELECT i.sigla_cliente AS col1, 
            c.nome AS col2,
            f.nome AS col3, 
            SUM(le.quantidade * le.valor_unitario) AS col4  
            FROM lotes_estoque le 
            INNER JOIN insumos i ON i.codigo = le.codigo_insumo 
            INNER JOIN familias f ON f.codigo = i.codigo_familia 
            INNER JOIN clientes c ON c.sigla = i.sigla_cliente 
            WHERE LEFT(le.codigo_insumo, 2) IN ('10','20') 
            AND le.codigo_insumo NOT LIKE '%JAL%'
            {$and_familias}
            {$and_clientes}
            GROUP BY i.sigla_cliente, c.nome, f.nome";

            $dados = $conns->executeQuery($sql, $blinds);
            $dados = $conns->unirResultados($dados, ['col4'], true, 'col4');

            // Gerar tabela HTML
            $tabela = new GeradorTabela('tabela-resultado', [], true);
            $tabela->adicionarCabecalho('SIGLA', 'texto',    ['text-center']);
            $tabela->adicionarCabecalho('CLIENTE', 'texto',  ['text-left'], true);
            $tabela->adicionarCabecalho('FAMILIA', 'texto',  ['text-left'], true);
            $tabela->adicionarCabecalho('PR', 'numerico',    ['text-right'], true);
            $tabela->adicionarCabecalho('SP', 'numerico',    ['text-right'], true);
            $tabela->adicionarCabecalho('PE', 'numerico',    ['text-right'], true);
            $tabela->adicionarCabecalho('TOTAL', 'numerico', ['text-right'], true);

            foreach ($dados as $value) {
                $tabela->adicionarLinha($value['col1'], 'SIGLA',   $value['col1'], ['text-center']);
                $tabela->adicionarLinha($value['col1'], 'CLIENTE', $value['col2'], ['text-left']);
                $tabela->adicionarLinha($value['col1'], 'FAMILIA', $value['col3'], ['text-left']);
                $tabela->adicionarLinha($value['col1'], 'PR',      $value[$conns->colunasBases[0]], ['text-right']);
                $tabela->adicionarLinha($value['col1'], 'SP',      $value[$conns->colunasBases[1]], ['text-right']);
                $tabela->adicionarLinha($value['col1'], 'PE',      $value[$conns->colunasBases[2]], ['text-right']);
                $tabela->adicionarLinha($value['col1'], 'TOTAL',   $value[$conns->colunaTotalSelecionados], ['text-right']);
            }

            $tabelaHTML = $tabela->gerarTabela();
            return ControllerUtils::jsonResponse(true, ['tabela' => $tabelaHTML], $conns->getErros() . "Tempo da requisição: " . $conns->getTempoExecusao());
        } catch (\Exception $e) {
            return ControllerUtils::jsonResponse(false, [], "File:" . $e->getFile() . " | Linha:" . $e->getLine() . " | Erro: " . $e->getMessage());
        }
    }
}
