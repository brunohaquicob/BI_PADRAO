<?php

namespace App\Http\Controllers\Dashboards;

use App\Http\Class\Utilitarios\GeradorTabela;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Querys\JallQueryExecutor;
use App\Http\Controllers\Utilitarios\ControllerUtils;
use App\Mail\EmailHelper;
use DateInterval;
use DateTime;
use Exception;
use Illuminate\Http\Request;

class DashboardProducaoController extends Controller {
    /** @var \JallQueryExecutor $conns */
    private $conns;
    private $dataInicial;
    private $dataFinal;
    private $ar_clientes;

    public function dadosDashboard(Request $request) {

        try {
            $ar_fields['datas']     = 'required|array';
            $ar_fields['datas.*']   = 'date_format:Y-m-d';
            $ar_fields['clientes']  = 'array';
            $dadosTratados = ControllerUtils::validateRequest($request, $ar_fields);

            $this->dataInicial = $dadosTratados['datas'][0] . ' 00:00:00';
            $this->dataFinal   = $dadosTratados['datas'][1] . ' 23:59:59';
            $this->ar_clientes = $dadosTratados['clientes'] ?? "";
            $verificaData = $this->isIntervalGreaterThanOneMonth($this->dataInicial, $this->dataFinal);
            if ($verificaData) {
                throw new Exception("Selecione um intervalo de no maximo 1 mês.", 1);
            }

            $this->conns = new JallQueryExecutor([]);
            $dados = $this->getDadosCard1();
            $dados['hotmap'] = $this->getDadosHotMap();
            $dados['totais'] = $this->getDadosTotaisCard1();

            return ControllerUtils::jsonResponse(true, $dados, $this->conns->getErros() . "<br>Tempo da requisição: " . $this->conns->getTempoExecusao());
        } catch (\Exception $e) {
            return ControllerUtils::jsonResponse(false, [], "File:" . $e->getFile() . " | Linha:" . $e->getLine() . " | Erro: " . $e->getMessage());
        }
    }

    private function isIntervalGreaterThanOneMonth($startDate, $endDate) {
        // Converte as strings de data para objetos DateTime
        $startDateTime = new DateTime($startDate);
        $endDateTime = new DateTime($endDate);

        // Adiciona 1 mês à data de início
        $startDateTime->add(new DateInterval('P1M'));

        // Compara a data de término com a nova data de início
        return $endDateTime > $startDateTime;
    }

    private function getDadosTotaisCard1() {
        $bindValues = [];
        $and_datas = "AND pp.data between " . $this->conns->adicionaBlindValues($bindValues, $this->dataInicial) . " AND " . $this->conns->adicionaBlindValues($bindValues, $this->dataFinal);
        $and_clientes = "";
        if (!empty($this->ar_clientes)) {
            $and_clientes = "AND pp.sigla_cliente IN (" . $this->conns->adicionaBlindValues($bindValues, $this->ar_clientes) . ")";
        }

        $sql = "WITH db as (select 
        opd.codigo_op,
        op.quantidade,
        opd.departamento, 
        CASE WHEN (opd.usuario_fim IS NULL) THEN (CASE WHEN opd.usuario_ini IS NULL THEN 'AGUARDANDO' ELSE 'INICIADO' END) ELSE (CASE WHEN opd.usuario_fim IS NOT NULL THEN 'FINALIZADO' ELSE NULL END) END AS situacao
        FROM
            ordens_producao op
            INNER JOIN
            pedidos_producao pp ON pp.id = op.pedido_producao_id
            LEFT JOIN
            ordens_producao_departamentos opd ON opd.codigo_op = op.codigo 
        WHERE 1 = 1
            {$and_datas}
            {$and_clientes}
            AND opd.departamento IN ('COFRE', 'GRAVACAO', 'IMPRESSAO', 'INSERTADORA', 'MANUSEIO', 'LIBERACAO_EXPEDICAO', 'EXPEDICAO')   
            AND op.movimento = 'PRODUCAO' )
            select db.codigo_op, db.departamento,
            sum(case when db.situacao = 'FINALIZADO' then db.quantidade else 0 end) as finalizado,
            sum(case when db.situacao = 'AGUARDANDO' then db.quantidade else 0 end) as aguardando,
            sum(case when db.situacao = 'INICIADO' then db.quantidade else 0 end) as iniciado
            from db
            group by db.codigo_op, db.departamento
            ORDER by db.codigo_op,
            CASE
                WHEN db.departamento = 'COFRE' THEN 1
                WHEN db.departamento = 'GRAVACAO' THEN 2
                WHEN db.departamento = 'IMPRESSAO' THEN 3
                WHEN db.departamento = 'INSERTADORA' THEN 4
                WHEN db.departamento = 'MANUSEIO' THEN 5
                WHEN db.departamento = 'LIBERACAO_EXPEDICAO' THEN 6
                WHEN db.departamento = 'EXPEDICAO' THEN 7
            end";

        $dados = ($this->conns->executeQuery($sql, $bindValues, true));
        $key_id = [
            "JALL_PR" => "grafico1",
            "JALL_SP" => "grafico2",
            "JALL_PE" => "grafico3",
        ];
        $sub_line = [
            "finalizado"    => 0,
            "aguardando"    => 0,
            "iniciado"      => 0,
        ];
        $retorno = [];
        foreach ($dados as $key => $value) {
            $retorno[$key_id[$key]] = [];
            foreach ($value as $k => $v) {
                $departamento = $v['departamento'];
                if ($departamento == "GRAVACAO" || $departamento == "IMPRESSAO") {
                    $departamento =   "GRAVACAO/IMPRESSAO";
                }
                if (!isset($retorno[$key_id[$key]][$departamento])) {
                    $retorno[$key_id[$key]][$departamento] = $sub_line;
                }

                $bg_color = "bg-warning";
                $icon = "far fa-flag";
                if ($departamento == "LIBERACAO_EXPEDICAO" || $departamento == "EXPEDICAO") {
                    $bg_color = "bg-success";
                    $icon = "far fa-flag";
                }

                $retorno[$key_id[$key]][$departamento]['finalizado']    += $v['finalizado'];
                $retorno[$key_id[$key]][$departamento]['aguardando']    += $v['aguardando'];
                $retorno[$key_id[$key]][$departamento]['iniciado']      += $v['iniciado'];
                $retorno[$key_id[$key]][$departamento]['bgcolor']        = $bg_color;
                $retorno[$key_id[$key]][$departamento]['icon']           = $icon;
            }
        }
        return $retorno;
    }

    private function getDadosCard1() {
        $bindValues = [];
        $and_datas = "AND pp.data between " . $this->conns->adicionaBlindValues($bindValues, $this->dataInicial) . " AND " . $this->conns->adicionaBlindValues($bindValues, $this->dataFinal);
        $and_clientes = "";
        if (!empty($this->ar_clientes)) {
            $and_clientes = "AND pp.sigla_cliente IN (" . $this->conns->adicionaBlindValues($bindValues, $this->ar_clientes) . ")";
        }

        $sql = "WITH db as (select TO_CHAR(pp.data, 'YYYY-MM-DD') as dt,
        opd.codigo_op,
        op.quantidade,
        opd.departamento, 
        CASE WHEN (opd.usuario_fim IS NULL) THEN (CASE WHEN opd.usuario_ini IS NULL THEN 'AGUARDANDO' ELSE 'INICIADO' END) ELSE (CASE WHEN opd.usuario_fim IS NOT NULL THEN 'FINALIZADO' ELSE NULL END) END AS situacao
        FROM
            ordens_producao op
            INNER JOIN
            pedidos_producao pp ON pp.id = op.pedido_producao_id
            LEFT JOIN
            ordens_producao_departamentos opd ON opd.codigo_op = op.codigo 
        WHERE 1 = 1
            {$and_datas}
            {$and_clientes}
            AND opd.departamento IN ('COFRE', 'GRAVACAO', 'IMPRESSAO', 'INSERTADORA', 'MANUSEIO', 'LIBERACAO_EXPEDICAO', 'EXPEDICAO')   
            AND op.movimento = 'PRODUCAO' 
            and op.status <> 'CANCELADA'
            and op.codigo not like 'JAL%'
            )
            select db.dt, db.departamento, 
            sum(case when db.situacao = 'FINALIZADO' then db.quantidade else 0 end) as finalizado,
            sum(case when db.situacao = 'AGUARDANDO' then db.quantidade else 0 end) as aguardando,
            sum(case when db.situacao = 'INICIADO' then db.quantidade else 0 end) as iniciado
            from db
            group by db.dt, db.departamento
            ORDER by db.dt";

        $dados = $this->ajustarDadosCard1($this->conns->executeQuery($sql, $bindValues, true));
        return $dados;
    }
    private function ajustarDadosCard1(array $dados) {
        $newData        = [];
        $retornoDados   = [];
        $sub_line = [
            "finalizado"    => 0,
            "aguardando"    => 0,
            "iniciado"      => 0,
        ];
        $line = [
            "cofre"                 => $sub_line,
            "gravacao"              => $sub_line,
            "impressao"             => $sub_line,
            "insertadora"           => $sub_line,
            "manuseio"              => $sub_line,
            "liberacao_expedicao"   => $sub_line,
            "expedicao"             => $sub_line,
        ];

        $key_id = [
            "JALL_PR" => "grafico1",
            "JALL_SP" => "grafico2",
            "JALL_PE" => "grafico3",
        ];
        $title = [
            "JALL_PR" => "JALL CARD PARANÁ",
            "JALL_SP" => "JALL CARD SÃO PAULO",
            "JALL_PE" => "JALL CARD PERNAMBUCO",
        ];
        foreach ($key_id as $key => $value) {
            $retornoDados[$key_id[$key]] =  ["data" => [], "title" => $title[$key] . " - SEM DADOS PARA LISTAR"];
        }
        foreach ($dados as $key => $value) {
            foreach ($value as $k => $v) {
                if (empty($newData[$key][$v['dt']])) {
                    $newData[$key][$v['dt']]['dados'] = $line;
                    $newData[$key][$v['dt']]['value'] = 0;
                    $newData[$key][$v['dt']]['data']  = ControllerUtils::mysql2date($v['dt']);
                    $newData[$key][$v['dt']]['base']  = $key;
                }
                $newData[$key][$v['dt']]['date']   = $v['dt'];
                $newData[$key][$v['dt']]['value'] += ($v['aguardando'] + $v['iniciado']);
                $newData[$key][$v['dt']]['dados'][strtolower($v['departamento'])]['iniciado']    = $v['iniciado'];
                $newData[$key][$v['dt']]['dados'][strtolower($v['departamento'])]['aguardando']  = $v['aguardando'];
                $newData[$key][$v['dt']]['dados'][strtolower($v['departamento'])]['finalizado']  = $v['finalizado'];
            }
            $retornoDados[$key_id[$key]] = ["data" => array_values($newData[$key]), "title" => $title[$key]];
        }

        return $retornoDados;
    }

    private function getDadosHotMap() {
        $bindValues = [];
        date_default_timezone_set('America/Sao_Paulo');
        if (strtotime($this->dataFinal) > time()) {
            // Se for, ajuste a data final para a data atual
            $this->dataFinal = date('Y-m-d') . ' 23:59:59';
        }
        $and_datas = "AND pp.data between " . $this->conns->adicionaBlindValues($bindValues, $this->dataInicial) . " AND " . $this->conns->adicionaBlindValues($bindValues, $this->dataFinal);
        $and_clientes = "";
        if (!empty($this->ar_clientes)) {
            $and_clientes = "AND pp.sigla_cliente IN (" . $this->conns->adicionaBlindValues($bindValues, $this->ar_clientes) . ")";
        }
        $sql = "SELECT TO_CHAR(pp.data, 'YYYY-MM-DD') as dt, TO_CHAR(pp.data, 'HH24') as h, sum(op.quantidade) as qtd
        FROM ordens_producao op 
        INNER JOIN pedidos_producao pp on pp.id = op.pedido_producao_id 
        WHERE 1 = 1
        {$and_datas}
        {$and_clientes}
        AND op.movimento = 'PRODUCAO'
        AND op.tipo = 'GRAVACAO'
        AND op.status <> 'CANCELADA'
        GROUP BY dt, h";
        $dados = ($this->conns->executeQuery($sql, $bindValues, true));
        $retorno = [];
        $key_id = [
            "JALL_PR" => "grafico1",
            "JALL_SP" => "grafico2",
            "JALL_PE" => "grafico3",
        ];
        $title = [
            "JALL_PR" => "JALL CARD PARANÁ",
            "JALL_SP" => "JALL CARD SÃO PAULO",
            "JALL_PE" => "JALL CARD PERNAMBUCO",
        ];

        $dataInicial = new DateTime($this->dataInicial);
        $dataFinal = new DateTime($this->dataFinal);
        foreach ($key_id as $key => $value) {
            $retorno[$key_id[$key]]['data']             = [];
            $retorno[$key_id[$key]]['title']            = $title[$key] . "- SEM DADOS PARA LISTAR";
            $retorno[$key_id[$key]]['subTitle']         = "Soma dos cartões das Ordens de Produção criadas por hora.";
            $retorno[$key_id[$key]]['minX']             = strtotime($dataInicial->format('Y-m-d')) * 1000;
            $retorno[$key_id[$key]]['maxX']             = strtotime($dataFinal->format('Y-m-d')) * 1000;
            $retorno[$key_id[$key]]['headerTooltip']    = "Cartões ";
            $retorno[$key_id[$key]]['id']               = "card_hot_grap_" . $key_id[$key];
            $retorno[$key_id[$key]]['csv']              = "";
        }


        foreach ($dados as $key => $value) {
            $retorno[$key_id[$key]]['data'] = $this->gerarArrayDatasH($this->dataInicial, $this->dataFinal);;
            foreach ($value as $k => $v) {
                $retorno[$key_id[$key]]['data']["{$v['dt']} {$v['h']}"]['value'] = $v['qtd'];
            }

            //$retorno[$key_id[$key]]['data'] = array_map('array_values', $retorno[$key_id[$key]]['data']);
            $retorno[$key_id[$key]]['data'] = array_values($retorno[$key_id[$key]]['data']);
            $retorno[$key_id[$key]]['title'] = $title[$key];
            $csv = implode(',', array_keys($retorno[$key_id[$key]]['data'][0])) . "\n";
            foreach ($retorno[$key_id[$key]]['data'] as $linha) {
                $csv .= implode(',', $linha) . "\n";
            }
            unset($retorno[$key_id[$key]]['data']);
            $retorno[$key_id[$key]]['csv'] = $csv;
        }
        return $retorno;
    }

    private function gerarArrayDatasH($dataInicial, $dataFinal) {
        $datas = [];
        $dataAtual = new DateTime($dataInicial);
        $dataFinal = new DateTime($dataFinal);

        while ($dataAtual <= $dataFinal) {
            $datas[$dataAtual->format('Y-m-d H')] = ["Date" => ($dataAtual->format('Y-m-d')), "Time" => ($dataAtual->format('H') * 1), "value" => 0];

            $dataAtual->modify('+1 hour');
        }

        return $datas;
    }

    ///Detalhes
    public function dadosDashboardDetalhes(Request $request) {

        try {
            $ar_fields['data']      = 'required|string';
            $ar_fields['data']      = 'date_format:d/m/Y';
            $ar_fields['base']      = 'required|string';
            $ar_fields['clientes']  = 'array';
            $dadosTratados = ControllerUtils::validateRequest($request, $ar_fields);
            $dadosTratados['data'] = ControllerUtils::convertData($dadosTratados['data'], "d/m/Y", "Y-m-d");
            $this->dataInicial = $dadosTratados['data'] . ' 00:00:00';
            $this->dataFinal   = $dadosTratados['data'] . ' 23:59:59';
            $this->ar_clientes = $dadosTratados['clientes'] ?? "";
            $this->conns = new JallQueryExecutor([$dadosTratados['base']]);

            $dados = $this->getDadosDetalhes();


            return ControllerUtils::jsonResponse(true, $dados, $this->conns->getErros() . "<br>Tempo da requisição: " . $this->conns->getTempoExecusao());
        } catch (\Exception $e) {
            return ControllerUtils::jsonResponse(false, [], "File:" . $e->getFile() . " | Linha:" . $e->getLine() . " | Erro: " . $e->getMessage());
        }
    }
    private function getDadosDetalhes() {
        $bindValues = [];
        $and_datas = "AND pp.data between " . $this->conns->adicionaBlindValues($bindValues, $this->dataInicial) . " AND " . $this->conns->adicionaBlindValues($bindValues, $this->dataFinal);
        $and_clientes = "";
        if (!empty($this->ar_clientes)) {
            $and_clientes = "AND pp.sigla_cliente IN (" . $this->conns->adicionaBlindValues($bindValues, $this->ar_clientes) . ")";
        }
        $sql = "select TO_CHAR(pp.data, 'YYYY-MM-DD') as dt,
            op.codigo,
            op.quantidade,
            CASE WHEN (opd1.departamento = 'COFRE' AND opd1.usuario_fim IS NULL) 				THEN (CASE WHEN opd1.usuario_ini IS NULL THEN 'AGUARDANDO' ELSE 'INICIADO' END) ELSE (CASE WHEN opd1.usuario_fim IS NOT NULL THEN 'FINALIZADO' ELSE '' END) END AS cofre,
            CASE WHEN (opd2.departamento = 'GRAVACAO' AND opd2.usuario_fim IS NULL) 	    	THEN (CASE WHEN opd2.usuario_ini IS NULL THEN 'AGUARDANDO' ELSE 'INICIADO' END) ELSE (CASE WHEN opd2.usuario_fim IS NOT NULL THEN 'FINALIZADO' ELSE '' END) END AS gravacao,
            CASE WHEN (opd3.departamento = 'IMPRESSAO' AND opd3.usuario_fim IS NULL) 			THEN (CASE WHEN opd3.usuario_ini IS NULL THEN 'AGUARDANDO' ELSE 'INICIADO' END) ELSE (CASE WHEN opd3.usuario_fim IS NOT NULL THEN 'FINALIZADO' ELSE '' END) END AS impressao,
            CASE WHEN (opd4.departamento = 'INSERTADORA' AND opd4.usuario_fim IS NULL) 			THEN (CASE WHEN opd4.usuario_ini IS NULL THEN 'AGUARDANDO' ELSE 'INICIADO' END) ELSE (CASE WHEN opd4.usuario_fim IS NOT NULL THEN 'FINALIZADO' ELSE '' END) END AS insertadora,
            CASE WHEN (opd5.departamento = 'MANUSEIO' AND opd5.usuario_fim IS NULL) 			THEN (CASE WHEN opd5.usuario_ini IS NULL THEN 'AGUARDANDO' ELSE 'INICIADO' END) ELSE (CASE WHEN opd5.usuario_fim IS NOT NULL THEN 'FINALIZADO' ELSE '' END) END AS manuseio,
            CASE WHEN (opd6.departamento = 'LIBERACAO_EXPEDICAO' AND opd6.usuario_fim IS NULL) 	THEN (CASE WHEN opd6.usuario_ini IS NULL THEN 'AGUARDANDO' ELSE 'INICIADO' END) ELSE (CASE WHEN opd6.usuario_fim IS NOT NULL THEN 'FINALIZADO' ELSE '' END) END AS liberacao_expedicao,
            CASE WHEN (opd7.departamento = 'EXPEDICAO' AND opd7.usuario_fim IS NULL) 			THEN (CASE WHEN opd7.usuario_ini IS NULL THEN 'AGUARDANDO' ELSE 'INICIADO' END) ELSE (CASE WHEN opd7.usuario_fim IS NOT NULL THEN 'FINALIZADO' ELSE '' END) END AS expedicao
            FROM
            ordens_producao op
            INNER JOIN
            pedidos_producao pp ON pp.id = op.pedido_producao_id
            LEFT JOIN
            ordens_producao_departamentos opd1 ON opd1.codigo_op = op.codigo and opd1.departamento IN ('COFRE')
            LEFT JOIN
            ordens_producao_departamentos opd2 ON opd2.codigo_op = op.codigo and opd2.departamento IN ('GRAVACAO')
            LEFT JOIN
            ordens_producao_departamentos opd3 ON opd3.codigo_op = op.codigo and opd3.departamento IN ('IMPRESSAO')
            LEFT JOIN
            ordens_producao_departamentos opd4 ON opd4.codigo_op = op.codigo and opd4.departamento IN ('INSERTADORA')
            LEFT JOIN
            ordens_producao_departamentos opd5 ON opd5.codigo_op = op.codigo and opd5.departamento IN ('MANUSEIO')
            LEFT JOIN
            ordens_producao_departamentos opd6 ON opd6.codigo_op = op.codigo and opd6.departamento IN ('LIBERACAO_EXPEDICAO')
            LEFT JOIN
            ordens_producao_departamentos opd7 ON opd7.codigo_op = op.codigo and opd7.departamento IN ('EXPEDICAO')
            WHERE 1 = 1
            {$and_datas}
            {$and_clientes}
            AND op.movimento = 'PRODUCAO'
            and op.status <> 'CANCELADA'
            and op.codigo not like 'JAL%' ";
        $dados = $this->conns->executeQuery($sql, $bindValues, false);
        // Gerar tabela HTML
        $colunas = [
            'CODIGO_OP',
            'QTD',
            'COFRE',
            'GRAVACAO',
            'IMPRESSAO',
            'INSERTADORA',
            'MANUSEIO',
            'LIBERACAO_EXP',
            'EXPEDICAO',
        ];
        $tabela = new GeradorTabela('tabela-cad1', [], true);
        $tabela->adicionarCabecalho($colunas[0], 'texto',     ['text-center'], true);
        $tabela->adicionarCabecalho($colunas[1], 'inteiro',   ['text-center'], true);
        $tabela->adicionarCabecalho($colunas[2], 'texto',     ['text-center'], true);
        $tabela->adicionarCabecalho($colunas[3], 'texto',     ['text-center'], true);
        $tabela->adicionarCabecalho($colunas[4], 'texto',     ['text-center'], true);
        $tabela->adicionarCabecalho($colunas[5], 'texto',     ['text-center'], true);
        $tabela->adicionarCabecalho($colunas[6], 'texto',     ['text-center'], true);
        $tabela->adicionarCabecalho($colunas[7], 'texto',     ['text-center'], true);
        $tabela->adicionarCabecalho($colunas[8], 'texto',     ['text-center'], true);
        $i = 0;
        foreach ($dados as $value) {
            $i++;
            $tabela->adicionarLinha($i, $colunas[0],  $value['codigo'], ['text-left']);
            $tabela->adicionarLinha($i, $colunas[1],  $value['quantidade'], ['text-center']);
            $tabela->adicionarLinha($i, $colunas[2],  $value['cofre'], ['text-center']);
            $tabela->adicionarLinha($i, $colunas[3],  $value['gravacao'], ['text-center']);
            $tabela->adicionarLinha($i, $colunas[4],  $value['impressao'], ['text-center']);
            $tabela->adicionarLinha($i, $colunas[5],  $value['insertadora'], ['text-center']);
            $tabela->adicionarLinha($i, $colunas[6],  $value['manuseio'], ['text-center']);
            $tabela->adicionarLinha($i, $colunas[7],  $value['liberacao_expedicao'], ['text-center']);
            $tabela->adicionarLinha($i, $colunas[8],  $value['expedicao'], ['text-center']);
        }
        $tabelaHTML =  $tabela->gerarTabela();
        return ["tabela" => $tabelaHTML, "title" => "OPs do dia " . ControllerUtils::convertData($this->dataInicial, "Y-m-d H:i:s", "d/m/Y")];
    }

    ///Audit
    public function dadosDashboardModalAudit(Request $request) {
        try {
            $ar_fields['datas']     = 'required|array';
            $ar_fields['datas.*']   = 'date_format:Y-m-d';
            $ar_fields['base']      = 'required|string';
            $ar_fields['clientes']  = 'array';
            $dadosTratados = ControllerUtils::validateRequest($request, $ar_fields);
            $this->dataInicial = $dadosTratados['datas'][0] . ' 00:00:00';
            $this->dataFinal   = $dadosTratados['datas'][1] . ' 23:59:59';
            $this->ar_clientes = $dadosTratados['clientes'] ?? "";
            // Verifique se a data final é maior que a data atual
            // Defina o fuso horário
            date_default_timezone_set('America/Sao_Paulo');
            if (strtotime($this->dataFinal) > time()) {
                // Se for, ajuste a data final para a data atual
                $this->dataFinal = date('Y-m-d') . ' 23:59:59';
            }

            $this->conns = new JallQueryExecutor(["JALL_" . $dadosTratados['base']]);

            $dados['audit_user']    = $this->topUser();
            $dados['audit_cliente'] = $this->topCliente();

            return ControllerUtils::jsonResponse(true, $dados, $this->conns->getErros() . "<br>Tempo da requisição: " . $this->conns->getTempoExecusao());
        } catch (\Exception $e) {
            return ControllerUtils::jsonResponse(false, [], "File:" . $e->getFile() . " | Linha:" . $e->getLine() . " | Erro: " . $e->getMessage());
        }
    }

    private function topCliente() {
        $bindValues = [];
        $and_datas = "AND ai.data_leitura between " . $this->conns->adicionaBlindValues($bindValues, $this->dataInicial) . " AND " . $this->conns->adicionaBlindValues($bindValues, $this->dataFinal);
        $and_clientes = "";
        if (!empty($this->ar_clientes)) {
            $and_clientes = "AND pp.sigla_cliente IN (" . $this->conns->adicionaBlindValues($bindValues, $this->ar_clientes) . ")";
        }
        $sql = "SELECT pp.sigla_cliente, a.funcionario1, a.funcionario2, count(distinct a.id) as qtd
        from audit a 
        inner join audit_itens ai on ai.audit_id = a.id 
        inner join ordens_producao op on op.codigo = a.op 
        inner join pedidos_producao pp on pp.id = op.pedido_producao_id 
        where ai.lido = true 
        and ai.data_leitura is not null 
        {$and_datas}
        {$and_clientes}
        group by pp.sigla_cliente, a.funcionario1, a.funcionario2";

        $dados = $this->conns->executeQuery($sql, $bindValues, false);
        $ar = [];
        $retorno = [];
        $categorias = [];
        $base = "";
        $total = 0;
        foreach ($dados as $k => $value) {
            $base = $value['database'];
            $divisor = 1;
            if (!empty($value['funcionario2'])) {
                $divisor = 2;
                if (!isset($ar[$value['sigla_cliente']]["funcionarios"][$value['funcionario2']])) {
                    $ar[$value['sigla_cliente']]["funcionarios"][$value['funcionario2']] = 0;
                }
                $ar[$value['sigla_cliente']]["funcionarios"][$value['funcionario2']] += round($value['qtd'] / $divisor, 2);
            }

            if (!isset($ar[$value['sigla_cliente']]["total"])) {
                $ar[$value['sigla_cliente']]["total"] = 0;
            }
            if (!isset($ar[$value['sigla_cliente']]["funcionarios"][$value['funcionario1']])) {
                $ar[$value['sigla_cliente']]["funcionarios"][$value['funcionario1']] = 0;
            }
            $ar[$value['sigla_cliente']]["funcionarios"][$value['funcionario1']] += round($value['qtd'] / $divisor, 2);
            $ar[$value['sigla_cliente']]["total"] += $value['qtd'];

            $total += $value['qtd'];
        }
        $total = 0;
        if (!empty($ar)) {
            // Ordena o array baseado no valor da coluna "total"
            uasort($ar, function ($a, $b) {
                return $b['total'] <=> $a['total'];
            });
            // Pega os top 10 elementos
            $ar = array_slice($ar, 0, 10, true);
            foreach ($ar as $key => $value) {
                uasort($value['funcionarios'], function ($a, $b) {
                    return $b <=> $a;
                });
                // // Pega os top 10 elementos
                // $retorno[$key]['funcionarios'] = array_slice($value['funcionarios'], 0, 5, true);
                $retorno[$key]['funcionarios'] = $value['funcionarios'];
                $retorno[$key]['total']        = $ar[$key]['total'];
                $total += $ar[$key]['total'];
            }
            $ar_grafico = [];
            $i = 1;
            foreach ($retorno as $key => $value) {
                $categorias[] = $key;
                $ar_grafico[$key] = [
                    "porcentagem" => round(($value["total"] / $total) * 100, 2),
                    "valor" => $value["total"],
                    "color" => $i,
                    "drilldown" => [
                        "name" => $key,
                        "categories" => array_keys($value["funcionarios"]),
                        "data" => array_values($value["funcionarios"])
                    ]
                ];
                $i++;
            }
            unset($retorno);
            $retorno = array_values($ar_grafico);
        }

        $title = [
            "JALL_PR" => "JALL CARD PARANÁ - TOP CLIENTES",
            "JALL_SP" => "JALL CARD SÃO PAULO  - TOP CLIENTES",
            "JALL_PE" => "JALL CARD PERNAMBUCO  - TOP CLIENTES",
        ];

        $status = !empty($retorno) ? true : false;
        return [
            "status" => $status,
            "totalTodos" => $total,
            "data" => $retorno,
            "containerId" => "modalAuditGraficoCliente",
            "subtitle" => "",
            "nameTooltip" => "Audits",
            "categories" => $categorias,
            "title" => ($title[$base] ?? "SEM DADOS PARA EXIBIR")
        ];
    }

    private function topUser() {
        $bindValues = [];
        $and_datas = "AND ai.data_leitura between " . $this->conns->adicionaBlindValues($bindValues, $this->dataInicial) . " AND " . $this->conns->adicionaBlindValues($bindValues, $this->dataFinal);
        $and_clientes = "";
        if (!empty($this->ar_clientes)) {
            $and_clientes = "AND pp.sigla_cliente IN (" . $this->conns->adicionaBlindValues($bindValues, $this->ar_clientes) . ")";
        }
        $sql = "select TO_CHAR(ai.data_leitura, 'YYYY-MM-DD') as dt, a.funcionario1, a.funcionario2, count(distinct a.id) as qtd
        from audit a 
        inner join audit_itens ai on ai.audit_id = a.id 
        inner join ordens_producao op on op.codigo = a.op 
        inner join pedidos_producao pp on pp.id = op.pedido_producao_id 
        where ai.lido = true 
        and ai.data_leitura is not null 
        {$and_datas}
        {$and_clientes}
        group by dt, a.funcionario1, a.funcionario2";

        $dados = $this->conns->executeQuery($sql, $bindValues, false);
        $ar = [];

        $min = ControllerUtils::convertData($this->dataInicial, "Y-m-d H:i:s", "Ymd");
        $max = ControllerUtils::convertData($this->dataFinal, "Y-m-d H:i:s", "Ymd");

        $ar_datas = $this->gerarArrayDatas($min, $max);
        $base = "";
        foreach ($dados as $k => $value) {
            $base = $value['database'];
            $chave = str_replace("-", "", $value['dt']);
            $divisor = 1;
            if (!empty($value['funcionario2'])) {
                if (!isset($ar[$value['funcionario2']])) {
                    $ar[$value['funcionario2']] = $ar_datas;
                    $ar[$value['funcionario2']]['total'] = 0;
                }
                $divisor = 2;
                $ar[$value['funcionario2']]['total'] += ($value['qtd']  / $divisor);
                $this->updateValuesTopUser($ar[$value['funcionario2']], $chave, $ar[$value['funcionario2']]['total']);
            }
            if (!isset($ar[$value['funcionario1']])) {
                $ar[$value['funcionario1']] = $ar_datas;
                $ar[$value['funcionario1']]['total'] = 0;
            }
            $ar[$value['funcionario1']]['total'] += ($value['qtd']  / $divisor);
            $this->updateValuesTopUser($ar[$value['funcionario1']], $chave, $ar[$value['funcionario1']]['total']);
        }

        $title = [
            "JALL_PR" => "JALL CARD PARANÁ - TOP AUDITS",
            "JALL_SP" => "JALL CARD SÃO PAULO  - TOP AUDITS",
            "JALL_PE" => "JALL CARD PERNAMBUCO  - TOP AUDITS",
        ];

        $status = !empty($ar) ? true : false;
        return ["status" => $status, "data" => $ar, "min" => $min, "max" => $max, "title" => ($title[$base] ?? "SEM DADOS PARA EXIBIR")];
    }
    private function gerarArrayDatas($dataInicial, $dataFinal) {
        $datas = [];
        $dataAtual = new DateTime($dataInicial);
        $dataFinal = new DateTime($dataFinal);

        while ($dataAtual <= $dataFinal) {
            $datas[$dataAtual->format('Ymd')] = 0;
            $dataAtual->modify('+1 day');
        }

        return $datas;
    }

    private function updateValuesTopUser(&$ar, $k, $v) {
        foreach ($ar as $key => $value) {
            if ($key >= $k && $key != "total") {
                $ar[$key] = $v;
            }
        }
    }
}
