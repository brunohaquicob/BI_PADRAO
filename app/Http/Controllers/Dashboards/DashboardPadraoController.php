<?php

namespace App\Http\Controllers\Dashboards;

use App\Http\Class\Utilitarios\GeradorTabela;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Querys\JallQueryExecutor;
use App\Http\Controllers\Users\EmpresaController;
use App\Http\Controllers\Utilitarios\ControllerUtils;
use App\Mail\EmailHelper;
use App\Models\Empresa;
use DateInterval;
use DateTime;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class DashboardPadraoController extends Controller {
    private $tempo_execucao;
    private $dataInicial;
    private $dataFinal;

    private $array_fases;

    public function __construct() {
        $this->array_fases = ControllerUtils::fases_padrao();
    }

    public function dadosDashboardPadrao(Request $request) {

        try {
            $ar_fields['datas']     = 'required|array';
            $ar_fields['datas.*']   = 'date_format:Y-m-d';
            $dadosTratados = ControllerUtils::validateRequest($request, $ar_fields);
            $this->dataInicial = $dadosTratados['datas'][0] . ' 00:00:00';
            $this->dataFinal   = $dadosTratados['datas'][1] . ' 23:59:59';

            $dados = [];

            $dados_request = ControllerUtils::excutarChamadaApiAqc('dash_acordos', "aqc_bi_padrao", ["data_ini" => $this->dataInicial, "data_fim" => $this->dataFinal], $this->tempo_execucao, true);

            if ($dados_request['retorno'] === false) {
                return ControllerUtils::jsonResponse(false, [], $dados_request['mensagem']);
            }

            $dados_retorno['header'] = $this->trataDadosHeader($dados_request);
            //$dados_retorno['grafico_pagamentos'] = $this->trataDadosPagamentos($dados_request['dados']['acordos']['pagamentos']);
            // Salva a variável de sessão
            session(['request_acordos_dados_consulta' => $dados_request['dados']['acordos']['dados_consulta']]);

            $acordos_por_fase = $this->trataDadosAcordos($dados_request['dados']['acordos']['dados_consulta']);
            $dados_retorno['grafico_fases_qtd']            = $this->gerarGraficoFases($acordos_por_fase['por_qtd'], 'Fase e Quantidade', '', 'Acordos');
            $dados_retorno['grafico_fases_valor']          = $this->gerarGraficoFases($acordos_por_fase['por_valor'], 'Fase e Valor', '', 'Acordos');
            $dados_retorno['grafico_tipo_pagamento_qtd']   = $this->gerarGraficoFases($acordos_por_fase['tipo_pagamento_qtd'], 'Tipo Pagamento e Quantidade', '', 'Acordos');
            $dados_retorno['grafico_tipo_pagamento_valor'] = $this->gerarGraficoFases($acordos_por_fase['tipo_pagamento_valor'], 'Tipo Pagamento e Valor', '', 'Acordos');
            $dados_retorno['grafico_data_qtd']             = $acordos_por_fase['data_qtd'];
            $dados_retorno['grafico_data_valor']           = $acordos_por_fase['data_valor'];
            $dados_retorno['grafico_pie_mult_qtd']         = $this->trataDadosPieMult($dados_request['dados']['acordos']['dados_consulta'], "qtd_acordos", "", "grafico_01", "Acordos por Quantidade");
            $dados_retorno['grafico_pie_mult_valor']       = $this->trataDadosPieMult($dados_request['dados']['acordos']['dados_consulta'], "vl_acordos", "", "grafico_02", "Acordos por Valor");


            return ControllerUtils::jsonResponse(true, $dados_retorno, "");
        } catch (\Throwable $e) {
            return ControllerUtils::jsonResponse(false, [], "File:" . $e->getFile() . " | Linha:" . $e->getLine() . " | Erro: " . $e->getMessage());
        }
    }

    private function trataDadosSintetico($dados) {
        $colunas = [
            ["alinhamento" => "text-left", "decimalPlaces" => null, "somar_footer" => false],
            ["alinhamento" => "text-center", "decimalPlaces" => 'date', "somar_footer" => false],
            ["alinhamento" => "text-center", "decimalPlaces" => null, "somar_footer" => false],
            ["alinhamento" => "text-center", "decimalPlaces" => null, "somar_footer" => false],
            ["alinhamento" => "text-center", "decimalPlaces" => null, "somar_footer" => false],
            ["alinhamento" => "text-center", "decimalPlaces" => null, "somar_footer" => false],
            ["alinhamento" => "text-center", "decimalPlaces" => 0, "somar_footer" => true],
            ["alinhamento" => "text-center", "decimalPlaces" => 0, "somar_footer" => true],
            ["alinhamento" => "text-right", "decimalPlaces" => 2, "somar_footer" => true],
            ["alinhamento" => "text-right", "decimalPlaces" => 2, "somar_footer" => false],
            ["alinhamento" => "text-right", "decimalPlaces" => 2, "somar_footer" => true],
        ];

        return ['dados' => $dados, "colunas_config" => $colunas];
    }

    public function trataDadosPagamentos($dados) {
        $arr_retorno = [];
        $arr_retorno1 = [];
        foreach ($dados as $key => $value) {
            $valores = ["aberto" => 0, "recebido" => 0, "cancelado" => 0];
            $valores1 = ["aberto" => 0, "recebido" => 0, "cancelado" => 0];
            foreach ($value as $k2 => $v2) {
                $valores['aberto']      += $v2['aberto'];
                $valores['recebido']    += $v2['recebido'];
                $valores['cancelado']   += $v2['cancelado'];
                $valores1['aberto']      += $v2['qt_aberto'];
                $valores1['recebido']    += $v2['qt_recebido'];
                $valores1['cancelado']   += $v2['qt_cancelado'];
            }
            $arr_retorno[] = ["name" => $key, "values" => array_values($valores)];
            $arr_retorno1[] = ["name" => $key, "values" => array_values($valores1)];
        }
        return ["valores" => array_values($arr_retorno), "quantidade" => array_values($arr_retorno1)];
    }

    public function dadosDashboardPadraoDetalhes(Request $request) {
        try {
            $ar_fields['codigo']  = 'required|string';
            $dadosTratados = ControllerUtils::validateRequest($request, $ar_fields);
            $codigo = $dadosTratados['codigo'];
            $request_acordos_dados_consulta = session('request_acordos_dados_consulta', []);

            $dados_retorno = array();
            if (!empty($request_acordos_dados_consulta)) {
                $acordos_por_fase = $this->trataDadosAcordos($request_acordos_dados_consulta, $codigo);
                $dados_retorno['grafico_fases_qtd']             = $this->gerarGraficoFases($acordos_por_fase['por_qtd'], 'Fase e Quantidade', '', 'Acordos');
                $dados_retorno['grafico_fases_valor']           = $this->gerarGraficoFases($acordos_por_fase['por_valor'], 'Fase e Valor', '', 'Acordos');
                $dados_retorno['grafico_tipo_pagamento_qtd']    = $this->gerarGraficoFases($acordos_por_fase['tipo_pagamento_qtd'], 'Tipo Pagamento e Quantidade', '', 'Acordos');
                $dados_retorno['grafico_tipo_pagamento_valor']  = $this->gerarGraficoFases($acordos_por_fase['tipo_pagamento_valor'], 'Tipo Pagamento e Valor', '', 'Acordos');
                $dados_retorno['grafico_data_qtd']              = $acordos_por_fase['data_qtd'];
                $dados_retorno['grafico_data_valor']            = $acordos_por_fase['data_valor'];
                $dados_retorno['grafico_pie_mult_qtd']          = $this->trataDadosPieMult($request_acordos_dados_consulta, "qtd_acordos", $codigo, "grafico_01_detalhes", "Acordos por Quantidade");
                $dados_retorno['grafico_pie_mult_valor']        = $this->trataDadosPieMult($request_acordos_dados_consulta, "vl_acordos", $codigo, "grafico_02_detalhes", "Acordos por Valor");
            } else {
                throw new Exception('Detalhes não encontrados', 1);
            }
            return ControllerUtils::jsonResponse(true, $dados_retorno, "Sucesso");
        } catch (\Exception $e) {
            return ControllerUtils::jsonResponse(false, [], "File:" . $e->getFile() . " | Linha:" . $e->getLine() . " | Erro: " . $e->getMessage());
        }
    }

    private function gerarGraficoFases($dados, $title, $subTitle, $serieName) {
        $retorno = [];
        $retorno['data']            = [];
        $retorno['title']           = $title;
        $retorno['subtitle']        = $subTitle;
        $retorno['seriesname']      = $serieName;
        $dados_data = [];
        if (!empty($dados)) {
            foreach ($dados as $key => $value) {
                $dados_data[]    = ['name' => $key, 'y' => $value];
            }
        }

        $retorno['data'] = array_values($dados_data);

        return $retorno;
    }

    private function trataDadosAcordos($dados, $filtro = "") {

        $array_fases_qtd        = [];
        $array_fases_valor      = [];
        $array_tipo_pagamento_qtd   = [
            "A vista" => 0,
            "A prazo" => 0,
        ];
        $array_tipo_pagamento_valor = [
            "A vista" => 0,
            "A prazo" => 0,
        ];

        $array_data_qtd     = [];
        $array_data_valor   = [];

        foreach ($this->array_fases as $key => $value) {
            $array_fases_qtd[$value['name']] = 0;
            $array_fases_valor[$value['name']] = 0;
        }

        foreach ($dados as $key => $value) {
            if (!empty($filtro)) {
                if ($filtro !== $value['origem']) {
                    continue;
                }
            }
            //Por data
            $data_timestamp = strtotime($value['data']) * 1000;
            if (empty($array_data_qtd[$data_timestamp])) {
                $array_data_qtd[$data_timestamp] = 0;
            }
            if (empty($array_data_valor[$data_timestamp])) {
                $array_data_valor[$data_timestamp] = 0;
            }
            $array_data_qtd[$data_timestamp]    += $value['qtd_acordos'];
            $array_data_valor[$data_timestamp]  += $value['vl_acordos'];
            //Por tipo pagamento
            $value['aco_tipo_pagamento'] == 'A' ? $array_tipo_pagamento_qtd['A vista']      += $value['qtd_acordos'] : $array_tipo_pagamento_qtd['A prazo']     += $value['qtd_acordos'];
            $value['aco_tipo_pagamento'] == 'A' ? $array_tipo_pagamento_valor['A vista']    += $value['vl_acordos']  : $array_tipo_pagamento_valor['A prazo']   += $value['vl_acordos'];

            //Por fase
            foreach ($this->array_fases as $fase) {
                if ($this->isBetween($value['fase'], $fase['ini'], $fase['fim'])) {
                    $array_fases_qtd[$fase['name']]      += $value['qtd_acordos'];
                    $array_fases_valor[$fase['name']]    += $value['vl_acordos'];
                }
            }
        }
        $array_data_qtd_ = [];
        foreach ($array_data_qtd as $key => $value) {
            $array_data_qtd_[] = [$key, $value];
        }
        $array_data_valor_ = [];
        foreach ($array_data_valor as $key => $value) {
            $array_data_valor_[] = [$key, $value];
        }

        return [
            'por_valor' => $array_fases_valor,
            "por_qtd" => $array_fases_qtd,
            "tipo_pagamento_qtd" => $array_tipo_pagamento_qtd,
            "tipo_pagamento_valor" => $array_tipo_pagamento_valor,
            "data_qtd" => $array_data_qtd_,
            "data_valor" => $array_data_valor_,
        ];
    }

    private function trataDadosPieMult($dados, $coluna_valor, $filtro = "", $idContainer = "", $title = "Acordos Fase Pagamento") {

        $array_sub = ["A vista" => 0, "A prazo" => 0];
        $array_fases_qtd = array();
        $total_acordos = 0;
        foreach ($this->array_fases as $fase) {
            $array_fases_qtd[$fase['name']] = [
                "total" => 0,
                "subs" => $array_sub,
            ];
        }
        //Percorrendo os dados da consulta
        foreach ($dados as $key => $value) {
            if (!empty($filtro)) {
                if ($filtro !== $value['origem']) {
                    continue;
                }
            }
            //Loop nas fases
            foreach ($this->array_fases as $fase) {
                //Comparando para ver em qual fase esta
                if ($this->isBetween($value['fase'], $fase['ini'], $fase['fim'])) {
                    //iniciando Key
                    if (!isset($array_fases_qtd[$fase['name']])) {
                        $array_fases_qtd[$fase['name']] = [
                            "total" => 0,
                            "subs" => $array_sub,
                        ];
                    }
                    //Total da fase
                    $array_fases_qtd[$fase['name']]['total'] += $value[$coluna_valor];
                    //Dados Sub
                    $value['aco_tipo_pagamento'] == 'A'
                        ? $array_fases_qtd[$fase['name']]['subs']['A vista'] += $value[$coluna_valor]
                        : $array_fases_qtd[$fase['name']]['subs']['A prazo'] += $value[$coluna_valor];

                    //Total geral para %                    
                    $total_acordos += $value[$coluna_valor];
                }
            }
        }
        //Montando retorno
        $i = 0;
        $ar_grafico = array();
        $categorias = array();
        foreach ($array_fases_qtd as $key => $value) {
            $categorias[] = $key;
            $ar_grafico[$key] = [
                "porcentagem" => round(($value["total"] / $total_acordos) * 100, 2),
                "valor" => $value["total"],
                "color" => $i,
                "drilldown" => [
                    "name" => $key,
                    "categories" => array_keys($value["subs"]),
                    "data" => array_values($value["subs"])
                ]
            ];
            $i++;
        }

        $status = !empty($ar_grafico) ? true : false;
        $retorno = array_values($ar_grafico);
        return [
            "status" => $status,
            "totalTodos" => $total_acordos,
            "data" => $retorno,
            "containerId" => $idContainer,
            "subtitle" => "",
            "nameTooltip" => "Acordos",
            "categories" => $categorias,
            "title" => $title
        ];
    }

    private function isBetween($num, $start, $end) {
        return ($num >= $start && $num <= $end);
    }

    private function trataDadosHeader($dados) {
        $color          = ['lightblue', 'olive', 'gray', 'info', 'warning'];
        $header         = [];
        $count          = count($dados['dados']['acordos']['por_origem']);
        $total          = 0;
        $total_valor    = 0;
        $maior_valor    = "";
        $compara        = 0;
        $tiket_medio    = 0;
        if ($count > 0) {
            $ar_padrao = [
                'color' => '',
                'id'  => '',
                'value' => 0,
                'valor' => 0,
                'size' => 'auto',
                'click' => 'N',
                'add_valor' => 0
            ];

            $i = 0;
            //Totais
            foreach ($dados['dados']['acordos']['por_origem'] as $key => $value) {
                $total += $value['qtd'];
                $total_valor += $value['valor'];
            }
            // dd($dados['dados']['acordos']['por_origem']);
            foreach ($dados['dados']['acordos']['por_origem'] as $key => $value) {
                if (!isset($header[$key])) {
                    $header[$key] = $ar_padrao;
                    $header[$key]['size']   = $value['size'] ?? "auto";
                    $header[$key]['color']  = $color[0];
                    $i++;
                }
                if (!empty($value['sub'])) {
                    foreach ($value['sub'] as $key2 => $value2) {
                        $header[$key]['sub'][$key2] = [
                            'text' => 'acordos',
                            'value' => $value2['qtd'],
                            'valor' => $value2['valor'],
                            'size' => $value2['size'],
                            'color' => $color[0],
                            'add_valor' => $value2['add_valor'],
                            'click' => 'S',
                            'click_key' => $value2['click']
                        ];
                        $fields   = [];
                        $fields[] = ["text" => "Tkt. Médio", "value" => ($value2['qtd'] > 0 ? ($value2['valor'] / $value2['qtd']) : 0), "decimal" => 2, "principal" => ""];
                        $fields[] = ["text" => "Val. Acordos", "value" => $value2['valor'], "decimal" => 2, "principal" => true];
                        $fields[] = ["text" => "Val. Pagos", "value" => $value2['valor_pago'], "decimal" => 2, "principal" => false];
                        $fields[] = ["text" => "Val. Abertos", "value" => $value2['valor_aberto'] - $value2['valor_quebra'], "decimal" => 2, "principal" => false];
                        $fields[] = ["text" => "Val. Quebras", "value" => $value2['valor_quebra'], "decimal" => 2, "principal" => false];
                        $fields[] = ["text" => "Qtd. Quebras", "value" => $value2['qtd_quebra'], "decimal" => 0, "principal" => ""];
                        $header[$key]['sub'][$key2]['fields'] = $fields;
                    }
                } else {
                    $header[$key]['click'] = 'S';
                }
                $header[$key]['value'] = $value['qtd'];
                $header[$key]['valor'] = $value['valor'];
                $header[$key]['click_key'] = $value['click'];

                $fields   = [];
                $fields[] = ["text" => "Tkt. Médio", "value" => ($value['qtd'] > 0 ? ($value['valor'] / $value['qtd']) : 0), "decimal" => 2, "principal" => ""];
                $fields[] = ["text" => "Val. Acordos", "value" => $value['valor'], "decimal" => 2, "principal" => true];
                $fields[] = ["text" => "Val. Pagos", "value" => $value['valor_pago'], "decimal" => 2, "principal" => false];
                $fields[] = ["text" => "Val. Abertos", "value" => $value['valor_aberto'] - $value['valor_quebra'], "decimal" => 2, "principal" => false];
                $fields[] = ["text" => "Val. Quebras", "value" => $value['valor_quebra'], "decimal" => 2, "principal" => false];
                $fields[] = ["text" => "Qtd. Quebras", "value" => $value['qtd_quebra'], "decimal" => 0, "principal" => false];
                $header[$key]['fields'] = $fields;
            }

            foreach ($header as $key => $value) {
                if ($value['valor'] > $compara) {
                    $maior_valor = $key;
                    $compara = $value['valor'];
                }
            }
            $tiket_medio = $total_valor / $total;
        }

        return ['divs' => $header, 'total_qtd' => $total, 'total_valor' => $total_valor, "tiket_medio" => $tiket_medio, "campeao" => ['name' => $maior_valor, "valor" => $compara]];
    }
}
