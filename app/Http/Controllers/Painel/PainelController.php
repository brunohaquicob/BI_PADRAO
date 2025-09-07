<?php

namespace App\Http\Controllers\Painel;

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

class PainelController extends Controller {
    private $tempo_execucao;
    private $dataInicial;
    private $dataFinal;

    private $array_fases;

    public function __construct() {
        $this->array_fases = ControllerUtils::fases_padrao();
    }

    
    public function painel_comercial_01_dados(Request $request) {
        $post       = [];
        $retorno    = [];
        $pasta_request      = "aqc_bi_padrao";
        $sub_pasta_resquest = "painel_comercial_01";
        try {

            $ar_fields['rel_carteira']      = 'required|array';
            $ar_fields['rel_mes_base']      = 'required|string';

            $dadosTratados = ControllerUtils::validateRequest($request, $ar_fields);

            $dados = [];

            $post = [
                "rel_carteira"  => !empty($dadosTratados['rel_carteira']) ? $dadosTratados['rel_carteira'] : [],
                "rel_mes_base"  => $dadosTratados['rel_mes_base'],
            ];


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
        } catch (\Exception $e) {
            return ControllerUtils::jsonResponse(false, $post, "File:" . $e->getFile() . " | Linha:" . $e->getLine() . " | Erro: " . $e->getMessage());
        }
    }


    
}
