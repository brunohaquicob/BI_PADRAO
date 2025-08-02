<?php

namespace App\Http\Controllers\Relatorios;

use App\Http\Class\Utilitarios\GeradorTabela;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Querys\JallQueryExecutor;
use App\Http\Controllers\Utilitarios\ControllerUtils;
use App\Mail\EmailHelper;
use Exception;
use Illuminate\Http\Request;

class RelatorioOportunidadesController extends Controller {
    private $dataInicial;
    private $dataFinal;
    private $tempo_execucao = 0;
    private $array_fases;

    public function __construct() {
        $this->array_fases = ControllerUtils::fases_padrao_senff();
    }

    public function get_rel_oportunidades_ws(Request $request) {
        try {

            $ar_fields['tem_acordo']    = 'required|string';
            $ar_fields['qtd_clicks']    = 'required|numeric';
            $ar_fields['rel_canal']     = 'required|array';
            // $ar_fields['rel_canal']     = 'nullable|array';

            $ar_fields['rangedatas']    = 'required|array';
            $ar_fields['rangedatas.*']  = 'date_format:Y-m-d';

            $dadosTratados = ControllerUtils::validateRequest($request, $ar_fields);

            $this->dataInicial = $dadosTratados['rangedatas'][0] . ' 00:00:00';
            $this->dataFinal   = $dadosTratados['rangedatas'][1] . ' 23:59:59';
            $dados = [];

            $post = [
                "data_ini"      => $this->dataInicial,
                "data_fim"      => $this->dataFinal,
                "tem_acordo"    => $dadosTratados['tem_acordo'],
                "qtd_clicks"    => $dadosTratados['qtd_clicks'],
                "rel_canal"     => !empty($dadosTratados['rel_canal']) ? $dadosTratados['rel_canal'] : []
            ];

            if (isset($dadosTratados['loja_cartao']) && !empty($dadosTratados['loja_cartao'])) {
                $post['loja_cartao'] = $dadosTratados['loja_cartao'];
            }

            $dados = ControllerUtils::excutarChamadaApiAqc('rel_oportunidades_ws', "aqc_bi", $post, $this->tempo_execucao, true);

            if (!isset($dados['retorno']) || $dados['retorno'] === false || empty($dados['dados'])) {
                throw new Exception("Erro ao buscar dados API AQC: " . $dados['mensagem'], 1);
            }
            if(empty($dados['dados']['dados'])){
                return ControllerUtils::jsonResponse(false, [], "Dados não localizados com os parametros informados");
        
            }
            //Dash
            $dashResumo = $this->montarResumoDash($dados['dados']);
            //Retorno
            if (!empty($dados['dados']['link'])) {
                $htmlDownload = ControllerUtils::retornaHtml($dados['dados']['link'], $dados['dados']['linhas']);
                return ControllerUtils::jsonResponse(true, ['dash' => $dashResumo, 'htmlDownload' => $htmlDownload], "Tempo da requisição: " . $this->tempo_execucao);
            }
            return ControllerUtils::jsonResponse(true, ['dash' => $dashResumo, 'htmlDownload' => "", 'tabela' => $this->trataDadosSintetico($dados['dados'])], "Tempo da requisição: " . $this->tempo_execucao);
        } catch (\Exception $e) {
            return ControllerUtils::jsonResponse(false, $dados, "File:" . $e->getFile() . " | Linha:" . $e->getLine() . " | Erro: " . $e->getMessage());
        }
    }

    private function trataDadosSintetico($dados) {

        // $colunas = [
        //     ["alinhamento" => "text-left", "decimalPlaces" => null, "somar_footer" => false],
        //     ["alinhamento" => "text-center", "decimalPlaces" => 'date', "somar_footer" => false],
        //     ["alinhamento" => "text-center", "decimalPlaces" => null, "somar_footer" => false],
        //     ["alinhamento" => "text-center", "decimalPlaces" => null, "somar_footer" => false],
        //     ["alinhamento" => "text-center", "decimalPlaces" => null, "somar_footer" => false],
        //     ["alinhamento" => "text-center", "decimalPlaces" => null, "somar_footer" => false],
        //     ["alinhamento" => "text-center", "decimalPlaces" => 0, "somar_footer" => true],
        //     ["alinhamento" => "text-center", "decimalPlaces" => 0, "somar_footer" => true],
        //     ["alinhamento" => "text-right", "decimalPlaces" => 2, "somar_footer" => true],
        //     ["alinhamento" => "text-right", "decimalPlaces" => 2, "somar_footer" => false],
        // ];

        return ['dados' => $dados['dados'], "colunas_config" => $dados['config']];
    }

    //Dash
    private function montarResumoDash($dados) {
        
        $totais = [
            "clicks"    => 0,
            "cpfs"      => 0,
            "valor"     => 0,
        ];

        $cpf_lidos = [];
        $cpf_lidos_clicks = [];
        $cpf_lidos_contratos = [];

        $array_dados = [];

        foreach ($this->array_fases as $key => $value) {
            $array_dados[$value['name']] = [];
        }

        foreach ($dados['dados'] as $key => $value) {

            $faseGrupo = ControllerUtils::fases_padrao_senff_name($value[6]);
            if (empty($array_dados[$faseGrupo])) {
                $array_dados[$faseGrupo] = [$faseGrupo, 0, 0, 0];
            }
            //Montar totais
            if (!in_array($value[1] . $value[2], $cpf_lidos_clicks)) {
                $cpf_lidos_clicks[] = $value[1] . $value[2];
                $totais['clicks'] += $value[3];

                $array_dados[$faseGrupo][1] += $value[3];
            }
            if (!in_array($value[1], $cpf_lidos)) {
                $cpf_lidos[] = $value[1];
                $totais['cpfs']++;
                $array_dados[$faseGrupo][2]++;
            }
            if (!in_array($value[1] . $value[8], $cpf_lidos_contratos)) {
                $cpf_lidos_contratos[] = $value[1] . $value[8];
                $totais['valor'] += $value[10];
                $array_dados[$faseGrupo][3] += $value[10];
            }
        }
        foreach ($array_dados as $key => $value) {
            if(empty($value)){
                unset($array_dados[$key]);
            }
        }
        $media = [
            "clicks" => round($totais['clicks'] / count($array_dados), 0),
            "cpfs" => round($totais['cpfs'] / count($array_dados), 0),
            "valor" => round($totais['valor'] / count($array_dados), 2),
        ];

        return ["totais" => array_values($totais), "dados" => array_values($array_dados), "media" => array_values($media), "colunas" => array_merge(['fases'], array_keys($media))];
    }
    private function adicionarFaseGrupo(&$dados) {
        $i = 0;
        foreach ($dados as $key => &$value) {
            $value['fase_grupo'] = ControllerUtils::fases_padrao_senff_name($value['fase']);
            $i += $value['qtd'];
        }
        // dd($i);
    }
}
