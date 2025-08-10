<?php

namespace App\Http\Controllers\Relatorios;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Utilitarios\ControllerUtils;
use Exception;
use Illuminate\Http\Request;

class RelatorioController extends Controller {
    private $dataInicial;
    private $dataFinal;
    private $tempo_execucao = 0;
    private $array_fases;

    public function __construct() {
        $this->array_fases = ControllerUtils::fases_padrao();
    }

    private function adicionarFaseGrupo(&$dados) {
        $i = 0;
        foreach ($dados as $key => &$value) {
            $value['fase_grupo'] = ControllerUtils::fases_padrao_senff_name($value['fase']);
            $i += $value['qtd'];
        }
    }

    /* RELATORIO ANALISE CARTEIRA */
    public function get_relatorio_analise_carteira(Request $request) {
        try {
            $dados = [];

            $ar_fields['rel_equipe_loja']       = 'required|array';
            $ar_fields['rangedatas']            = 'required|array';
            $ar_fields['rangedatas.*']          = 'date_format:Y-m-d';
            $ar_fields['limitar_data']          = 'nullable|string';
            $ar_fields['rel_tipo_data']         = 'required|string';
            $ar_fields['rel_tipo_agrupamento']  = 'required|string';

            $dadosTratados = ControllerUtils::validateRequest($request, $ar_fields);

            $this->dataInicial = $dadosTratados['rangedatas'][0] . ' 00:00:00';
            $this->dataFinal   = $dadosTratados['rangedatas'][1] . ' 23:59:59';

            $post = [
                "data_ini"              => $this->dataInicial,
                "data_fim"              => $this->dataFinal,
                "limitar_data"          => $dadosTratados['limitar_data'],
                "rel_tipo_data"         => $dadosTratados['rel_tipo_data'],
                "rel_tipo_agrupamento"  => $dadosTratados['rel_tipo_agrupamento'],
                "rel_equipe_loja"       => !empty($dadosTratados['rel_equipe_loja']) ? $dadosTratados['rel_equipe_loja'] : [],
            ];

            $dados = ControllerUtils::excutarChamadaApiAqc('rel_analise_carteiras2', "aqc_bi_padrao", $post, $this->tempo_execucao, true);

            if (!isset($dados['retorno']) || $dados['retorno'] === false || empty($dados['dados']['valores'])) {
                return ControllerUtils::jsonResponse(false, [], $dados['mensagem'] ?? "Erro ao buscar dados na API");
            }

            $retorno = $dados['dados']['valores'];
            //Dash
            $dashResumo = $this->montarResumoDash($retorno);
            //Retorno
            if (!empty($dados['dados']['link'])) {
                $htmlDownload = ControllerUtils::retornaHtml($dados['dados']['link'], $dados['dados']['linhas']);
                return ControllerUtils::jsonResponse(true, ['dash' => $dashResumo, 'htmlDownload' => $htmlDownload], "Tempo da requisição: " . $this->tempo_execucao);
            }
            return ControllerUtils::jsonResponse(true, ['dash' => $dashResumo, 'htmlDownload' => "", "tabela" => $this->monta_tabela_analise_carteira($dados['dados']['valores'])], "Tempo da requisição: " . $this->tempo_execucao);
        } catch (\Exception $e) {
            return ControllerUtils::jsonResponse(false, $dados, "File:" . $e->getFile() . " | Linha:" . $e->getLine() . " | Erro: " . $e->getMessage());
        }
    }

    private function monta_tabela_analise_carteira($dados) {

        $ar = [
            "grupo" => ["GRUPO", "text-left", null, false],
            "loj_codigo" => ["COD_LOJ", "text-center", null, false],
            "loj_razao" => ["RAZAO SOCIAL", "text-left", null, false],
            "loj_fantasia" => ["FANTASIA", "text-left", null, false],
            "valor_carteira" => ["VL_CARTEIRA", "text-right", 2, true],
            "valor_em_aberto" => ["VL_ABERTO", "text-right", 2, true],
            "saldo_em_aberto" => ["VL_SALDO", "text-right", 2, true],
            "valor_liquidado" => ["VL_LIQUIDADO", "text-right", 2, true],
            "valor_devolvido" => ["VL_DEVOLVIDO", "text-right", 2, true],
            "qtd_cpf" => ["QTD_CPF", "text-center", null, true],
            "qtd_contratos" => ["QTD_CONTRATOS", "text-center", null, true],
            "qtd_parcelas" => ["QTD_PARCELAS", "text-center", null, true],
            "qtd_parcelas_devolvidas" => ["QTD_DEVOLVIDO", "text-center", null, true],
            "qtd_parcelas_em_acordo" => ["QTD_EM_ACORDO", "text-center", null, true],
            "qtd_cpf_em_acordo" => ["QTD_CPF_ACORDO", "text-center", null, true],
            "valor_baixado" => ["VL_RECUPERADO", "text-right", 2, true],
            "valor_recebibo" => ["VL_RECEBIDO", "text-right", 2, true],
            "valor_comissao" => ["VL_COMISSAO", "text-right", 2, true],
        ];
        return ControllerUtils::ajeitaDadosParaTabela($ar, $dados);
    }

    //Dash
    private function montarResumoDash($dados) {

        $totais = [
            "carteira"     => 0,
            "aberto"       => 0,
            "recuperado"   => 0,
            "recebido"     => 0,
            "comissao"     => 0,
            "devolvido"    => 0,
            "cpfs"         => 0,
            "contratos"    => 0,
        ];

        $array_dados = [];
        $agrupador = 'grupo';
        foreach ($dados as $key => $value) {

            if (empty($array_dados[$value[$agrupador]])) {
                $array_dados[$value[$agrupador]] = [$value[$agrupador], 0, 0, 0];
            }
            //Montar totais
            $totais['carteira'] += $value['valor_carteira'];
            $array_dados[$value[$agrupador]][1] += $value['valor_carteira'];

            $totais['aberto'] += $value['valor_em_aberto'];
            $array_dados[$value[$agrupador]][2] += $value['valor_em_aberto'];

            $totais['recuperado'] += $value['valor_baixado'];
            $array_dados[$value[$agrupador]][3] += $value['valor_baixado'];

            $totais['recebido']  += $value['valor_recebibo'];

            $totais['comissao']  += $value['valor_comissao'];

            $totais['devolvido'] += $value['valor_devolvido'];

            $totais['cpfs'] += $value['qtd_cpf'];

            $totais['contratos'] += $value['qtd_contratos'];

        }

        $media = [
            "valor_carteira" => round($totais['carteira'] / count($array_dados), 2),
            "valor_aberto" => round($totais['aberto'] / count($array_dados), 2),
            "valor_recuperado" => round($totais['recuperado'] / count($array_dados), 2),
        ];

        return ["totais" => array_values($totais), "dados" => array_values($array_dados), "media" => array_values($media), "colunasKap" => array_keys($totais), "colunas" => array_merge(['grupos'], array_keys($media))];
    }

    public function rel_painel_desempenho_dados(Request $request) {
        $post       = [];
        $retorno    = [];
        $pasta_request      = "aqc_bi_padrao";
        $sub_pasta_resquest = "rel_painel_desempenho";
        try {

            $ar_fields['rel_carteira']      = 'required|array';
            $ar_fields['rel_mes_base']      = 'required|string';
            $ar_fields['rel_agrupador']     = 'required|string';

            $dadosTratados = ControllerUtils::validateRequest($request, $ar_fields);

            $dados = [];

            $post = [
                "rel_agrupador" => $dadosTratados['rel_agrupador'],
                "rel_mes_base"  => $dadosTratados['rel_mes_base'],
                "rel_carteira"  => !empty($dadosTratados['rel_carteira']) ? $dadosTratados['rel_carteira'] : []
            ];

            $dados = ControllerUtils::excutarChamadaApiAqc($sub_pasta_resquest, $pasta_request, $post, $this->tempo_execucao, true);
            if (!isset($dados['retorno']) || $dados['retorno'] === false || empty($dados['dados']['json_data'])) {
                return ControllerUtils::jsonResponse(false, [], $dados['mensagem'] ?? "Erro ao buscar dados na API");
            }

            $retorno['tabela'] = $dados['dados']['json_data'];

            //TRATAR LINK
            if (!empty($dados['dados']['link'])) {
                $retorno['htmlDownload'] = ControllerUtils::retornaHtml($dados['dados']['link'], ($dados['dados']['linhas'] ?? ''));
            }
            return ControllerUtils::jsonResponse(true, $retorno, "Tempo da requisição: " . $this->tempo_execucao);
        } catch (\Exception $e) {
            return ControllerUtils::jsonResponse(false, $post, "File:" . $e->getFile() . " | Linha:" . $e->getLine() . " | Erro: " . $e->getMessage());
        }
    }
}
