<?php

namespace App\Http\Controllers\Relatorios;

use App\Http\Class\Utilitarios\GeradorTabela;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Querys\JallQueryExecutor;
use App\Http\Controllers\Utilitarios\ControllerUtils;
use App\Mail\EmailHelper;
use Exception;
use Illuminate\Http\Request;

class RelAcordos extends Controller {
    private $dataInicial;
    private $dataFinal;
    private $nvl1;
    private $nvl2;
    private $nvl3;
    private $qtd_nvl3;
    private $qtd_tipo;
    private $tipo_rel;
    private $tempo_execucao = 0;
    private $array_fases;

    public function __construct(){
        $this->array_fases = ControllerUtils::fases_padrao_senff();
    }

    public function get_rel_acordos_gerencial(Request $request) {
        try {

            $ar_fields['nvl1']                  = 'required|string';
            $ar_fields['nvl2']                  = 'required|string';
            $ar_fields['nvl3']                  = 'required|string';
            $ar_fields['tipo_qtd']              = 'required|string';
            $ar_fields['tipo_rel']              = 'required|string';
            $ar_fields['loja_cartao']           = 'nullable|string';
            $ar_fields['qtd_nvl3_agrupador']    = 'required|numeric';
            $ar_fields['rel_canal']             = 'nullable|array';

            $ar_fields['rangedatas']         = 'required|array';
            $ar_fields['rangedatas.*']       = 'date_format:Y-m-d';

            $dadosTratados = ControllerUtils::validateRequest($request, $ar_fields);
            $this->nvl1 = $dadosTratados['nvl1'];
            $this->nvl2 = $dadosTratados['nvl2'];
            $this->nvl3 = $dadosTratados['nvl3'];
            $this->qtd_nvl3 = $dadosTratados['qtd_nvl3_agrupador'];
            $this->qtd_tipo = $dadosTratados['tipo_qtd'];

            $this->dataInicial = $dadosTratados['rangedatas'][0] . ' 00:00:00';
            $this->dataFinal   = $dadosTratados['rangedatas'][1] . ' 23:59:59';
            $this->tipo_rel = $dadosTratados['tipo_rel'];
            $dados = [];

            $post = [
                "data_ini"  => $this->dataInicial,
                "data_fim"  => $this->dataFinal,
                "tipo_rel"  => $dadosTratados['tipo_rel'],
                "rel_canal" => !empty($dadosTratados['rel_canal']) ? $dadosTratados['rel_canal'] : []
            ];

            if (isset($dadosTratados['loja_cartao']) && !empty($dadosTratados['loja_cartao'])) {
                $post['loja_cartao'] = $dadosTratados['loja_cartao'];
            }

            $dados = ControllerUtils::excutarChamadaApiAqc('rel_acordos_gerencial', "aqc_bi", $post, $this->tempo_execucao, true);

            if (!isset($dados['retorno']) || $dados['retorno'] === false || empty($dados['dados']['acordos'])) {
                throw new Exception("Erro ao buscar dados API AQC: " . $dados['mensagem'], 1);
            }
            $this->adicionarFaseGrupo($dados['dados']['acordos']);
            $grafico_data = $this->ajustaArraySunBurst($dados['dados']['acordos']);
            $tabelaHtml = $this->gerarTabelaHtml($dados['dados']['acordos'], "QTD");

            return ControllerUtils::jsonResponse(true, ['grafico_data' => $grafico_data, 'qtdecimal' => $this->qtd_tipo, 'tabela' => $tabelaHtml], "Tempo da requisição: " . $this->tempo_execucao);
        } catch (\Exception $e) {
            return ControllerUtils::jsonResponse(false, $dados, "File:" . $e->getFile() . " | Linha:" . $e->getLine() . " | Erro: " . $e->getMessage());
        }
    }

    private function adicionarFaseGrupo(&$dados){
        $i = 0;
        foreach ($dados as $key => &$value) {
            $value['fase_grupo'] = ControllerUtils::fases_padrao_senff_name($value['fase']);
            $i+=$value['qtd'];
        }
        // dd($i);
    }

    private function ajustaArraySunBurst($dados) {
        $ar_dados = [];
        //Montar niveis
        //ArPelosNiveis
        $ar_niveis = [];
        foreach ($dados as $value) {
            if (!isset($ar_niveis[$value[$this->nvl1] . $value[$this->nvl2] . $value[$this->nvl3]])) {
                $ar_niveis[$value[$this->nvl1] . $value[$this->nvl2] . $value[$this->nvl3]]['qtd']       = 0;
                $ar_niveis[$value[$this->nvl1] . $value[$this->nvl2] . $value[$this->nvl3]]['valor']     = 0;
                $ar_niveis[$value[$this->nvl1] . $value[$this->nvl2] . $value[$this->nvl3]][$this->nvl1] = $value[$this->nvl1];
                $ar_niveis[$value[$this->nvl1] . $value[$this->nvl2] . $value[$this->nvl3]][$this->nvl2] = $value[$this->nvl2];
                $ar_niveis[$value[$this->nvl1] . $value[$this->nvl2] . $value[$this->nvl3]][$this->nvl3] = $value[$this->nvl3];
            }
            $ar_niveis[$value[$this->nvl1] . $value[$this->nvl2] . $value[$this->nvl3]]['qtd']       += $value['qtd'];
            $ar_niveis[$value[$this->nvl1] . $value[$this->nvl2] . $value[$this->nvl3]]['valor']     += $value['valor'];
        }
        foreach (array_values($ar_niveis) as $value) {
            if (isset($value['uf'])) {
                if (empty(trim($value['uf']))) {
                    $value['uf'] = "NI";
                }
            }
            //$value['uf'] = (ControllerUtils::retornaUfCompleta($value['uf'], false));
            if (isset($value['tipo_pagamento'])) {
                $value['tipo_pagamento'] = $value['tipo_pagamento'] == 'A' ? "À vista" : "Parcelado";
            }
            $nvl1 = $value[$this->nvl1];
            $nvl2 = $value[$this->nvl2];
            $nvl3 = $value[$this->nvl3];
            if ($value['qtd'] >= $this->qtd_nvl3) {
                if (!isset($ar_dados[$nvl1][$nvl2][$nvl3])) {
                    $ar_dados[$nvl1][$nvl2][$nvl3]["valor1"]    = 0;
                    $ar_dados[$nvl1][$nvl2][$nvl3]["valor2"]    = 0;
                }
                $ar_dados[$nvl1][$nvl2][$nvl3]["valor1"]    += ($this->qtd_tipo == 0) ? $value['qtd'] : $value['valor'];
                $ar_dados[$nvl1][$nvl2][$nvl3]["valor2"]    += ($this->qtd_tipo == 0) ? $value['valor'] : $value['qtd'];
            } else {
                if (!isset($ar_dados[$nvl1][$nvl2]["OUTROS"])) {
                    $ar_dados[$nvl1][$nvl2]["OUTROS"]["valor1"]    = 0;
                    $ar_dados[$nvl1][$nvl2]["OUTROS"]["valor2"]    = 0;
                }
                $ar_dados[$nvl1][$nvl2]["OUTROS"]["valor1"] += ($this->qtd_tipo == 0) ? $value['qtd'] : $value['valor'];
                $ar_dados[$nvl1][$nvl2]["OUTROS"]["valor2"] += ($this->qtd_tipo == 0) ? $value['valor'] : $value['qtd'];
            }
        }

        $k0 = "SENFF";
        $grafico[] = ["id" => "{$k0}", "parent" => "", "name" => "SENFF", "last" => "Início"];
        foreach ($ar_dados as $k1 => $v1) {
            $grafico[] = ["id" => $k0 . $k1, "parent" => "{$k0}", "name" => $k1, "last" => $k0];
            foreach ($v1 as $k2 => $v2) {
                $grafico[] = ["id" => $k1 . $k2, "parent" => $k0 . $k1, "name" => $k2, "last" => $k1];
                foreach ($v2 as $k3 => $v3) {
                    $grafico[] = ["id" => $k2 . $k3, "parent" => $k1 . $k2, "name" => $k3, "value" => $v3['valor1'], "last" => $k2, "value2" => $v3['valor2']];
                }
            }
        }
        $msg_tipo = ($this->tipo_rel == 'B') ? 'Baixas' : 'Acordos';
        return [
            "title" => "Quantidade de {$msg_tipo}",
            "subtitle" => "Mostrando somatórias superior a {$this->qtd_nvl3} {$msg_tipo}",
            "dados" => array_values($grafico)
        ];
    }

    private function gerarTabelaHtml($dados, $coluna_name_qtd) {
        // Gerar tabela HTML
        // $colunas = [
        //     'CANAL',
        //     'UF',
        //     'CIDADE',
        //     'TIPO_PAGAMENTO',
        //     'CNPJ CARTÃO',
        //     'LOJA CARTÃO',
        //     $coluna_name_qtd,
        //     'VALOR',
        // ];
        // $tabela = new GeradorTabela('tabela', [], true);
        // $tabela->adicionarCabecalho($colunas[0], 'texto',   ['text-center'], true);
        // $tabela->adicionarCabecalho($colunas[1], 'texto',   ['text-center'], true);
        // $tabela->adicionarCabecalho($colunas[2], 'texto',   ['text-center'], true);
        // $tabela->adicionarCabecalho($colunas[3], 'texto',   ['text-center'], true);
        // $tabela->adicionarCabecalho($colunas[4], 'texto',   ['text-center'], true);
        // $tabela->adicionarCabecalho($colunas[5], 'texto',   ['text-center'], true);
        // $tabela->adicionarCabecalho($colunas[6], 'inteiro', ['text-center'], true);
        // $tabela->adicionarCabecalho($colunas[7], 'numerico', ['text-center'], true);
        // $i = 0;
        // foreach ($dados as $value) {
        //     $i++;
        //     $tabela->adicionarLinha($i, $colunas[0],  $value['canal'], ['text-left']);
        //     $tabela->adicionarLinha($i, $colunas[1],  ControllerUtils::retornaUfCompleta($value['uf'], false), ['text-left']);
        //     $tabela->adicionarLinha($i, $colunas[2],  $value['cidade'], ['text-left']);
        //     $tabela->adicionarLinha($i, $colunas[3],  $value['tipo_pagamento'] = $value['tipo_pagamento'] == 'A' ? "À vista" : "Parcelado", ['text-left']);
        //     $tabela->adicionarLinha($i, $colunas[4],  $value['cnpj_loja_cartao'], ['text-center']);
        //     $tabela->adicionarLinha($i, $colunas[5],  $value['loja_cartao'], ['text-left']);
        //     $tabela->adicionarLinha($i, $colunas[6],  $value['qtd'], ['text-center']);
        //     $tabela->adicionarLinha($i, $colunas[7],  $value['valor'], ['text-right']);
        // }
        // $tabelaHTML = '
        // <div class="row">
        //     <div class="col-md-12 mb-1 text-left">
        //         <div class="btn-group btn-group-toggle" data-toggle="buttons">
        //             <label class="btn bg-info  color-palette btn-sm text-xs ">
        //                 <input type="radio" name="optionsTabela1[]" autocomplete="off" value="0"> Por Canal
        //             </label>
        //             <label class="btn bg-info  color-palette btn-sm text-xs active">
        //                 <input type="radio" name="optionsTabela1[]" autocomplete="off" value="1"> Por UF
        //             </label>
        //             <label class="btn bg-info  color-palette btn-sm text-xs">
        //                 <input type="radio" name="optionsTabela1[]" autocomplete="off" value="2"> Por Cidade
        //             </label>
        //             <label class="btn bg-info  color-palette btn-sm text-xs">
        //                 <input type="radio" name="optionsTabela1[]" autocomplete="off" value="3"> Por Tipo Pagamento
        //             </label>
        //             <label class="btn bg-info  color-palette btn-sm text-xs">
        //                 <input type="radio" name="optionsTabela1[]" autocomplete="off" value="5"> Por Loja Cartão
        //             </label>
        //         </div>
        //     </div>
        //     <div class="col-md-12 ">
        //         ' . $tabela->gerarTabela() . '
        //     </div>
        // </div>';


        //COLUNAS
        $colunas = [
            'CANAL',
            'UF',
            'CIDADE',
            'TIPO_PAGAMENTO',
            'CNPJ CARTÃO',
            'LOJA CARTÃO',
            'FASE',
            'FASE GRUPO',
            $coluna_name_qtd,
            'VALOR',
        ];
        $body = [];
        foreach ($dados as $value) {
            $body[] = [
                $value['canal'],
                ControllerUtils::retornaUfCompleta($value['uf'], false),
                $value['cidade'],
                $value['tipo_pagamento'] = $value['tipo_pagamento'] == 'A' ? "À vista" : "Parcelado",
                $value['cnpj_loja_cartao'],
                $value['loja_cartao'],
                $value['fase'],
                $value['fase_grupo'],
                $value['qtd'],
                $value['valor']
            ];
        }

        $footer = [8, 9];
        $classes = ["left", "left", "left", "center", "center", "left", "center", "center", "numeric", "money"];

        return ["colunas" => $colunas, "classes" => $classes, "conteudo" => $body, "footer" => $footer];
    }
}
