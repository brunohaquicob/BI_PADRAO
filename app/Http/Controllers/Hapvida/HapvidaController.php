<?php

namespace App\Http\Controllers\Hapvida;

use App\Exceptions\ObrigatoriosException;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Utilitarios\ControllerUtils;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class HapvidaController extends Controller {
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
    public function hapvida_desempenho_carteira_dados(Request $request) {
        $post       = [];
        $retorno    = [];
        $pasta_request      = "aqc_bi_nnc";
        $sub_pasta_resquest = "hapvida_desempenho_carteira";
        try {
            // $ar_fields['rel_data_implantacao']  = 'required|array';
            $ar_fields['rel_data_implantacao']  = 'nullable|array';
            $ar_fields['rel_filial']            = 'nullable|array';
            $ar_fields['rel_frente']            = 'nullable|array';
            $ar_fields['rel_operadora']         = 'nullable|array';
            $ar_fields['rel_cancelamento']      = 'nullable|array';
            $ar_fields['rel_porte']             = 'nullable|array';
            $ar_fields['rel_canal']             = 'nullable|array';
            $ar_fields['rel_tipo_importacao']   = 'nullable|array';

            $dadosTratados = ControllerUtils::validateRequestObrigatorios($request, $ar_fields);

            $dados  = [];
            $post   = [];

            foreach ($dadosTratados as $key => $value) {
                $post[$key] = $value ?: "";
            }
            $dados = ControllerUtils::excutarChamadaApiAqc($sub_pasta_resquest, $pasta_request, $post, $this->tempo_execucao, true);
            if (!isset($dados['retorno']) || $dados['retorno'] === false || empty($dados['dados']['json_data'])) {
                return ControllerUtils::jsonResponse(false, [], $dados['mensagem'] ?? "Erro ao buscar dados na API");
            }

            $retorno = $dados['dados']['json_data'];

            //TRATAR LINK
            if (!empty($dados['dados']['link'])) {
                $retorno['htmlDownload'] = ControllerUtils::retornaHtml($dados['dados']['link'], ($dados['dados']['linhas'] ?? ''));
            }
            return ControllerUtils::jsonResponse(true, $retorno, "Tempo da requisição: " . $this->tempo_execucao);
        } catch (ObrigatoriosException $e) {
            return ControllerUtils::jsonResponse(false, [], $e->getMessage());
        } catch (\Exception $e) {
            return ControllerUtils::jsonResponse(false, $post, "File:" . $e->getFile() . " | Linha:" . $e->getLine() . " | Erro: " . $e->getMessage());
        }
    }
}
