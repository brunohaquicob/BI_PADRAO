<?php

namespace App\Http\Controllers\Credores;

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

class CredoresController extends Controller {
    private $tempo_execucao;
    private $dataInicial;
    private $dataFinal;

    private $array_fases;

    public function __construct() {
        $this->array_fases = ControllerUtils::fases_padrao();
    }

    //ANALISE CARTEIRA
    public function credor_dash_carteira_desempenho_dados(Request $request) {
        $post       = [];
        $retorno    = [];
        $pasta_request      = "aqc_bi_credores";
        $sub_pasta_resquest = "dash_carteira_desempenho";
        try {

            $ar_fields['rel_carteira']   = 'required|array';
            $ar_fields['rel_tipo_data']  = 'nullable|string';
            $ar_fields['rel_tipo_fase']  = 'required|string';
            $ar_fields['limitar_data']   = 'nullable|string';

            $ar_fields['rangedatas']     = 'required|array';
            $ar_fields['rangedatas.*']   = 'date_format:Y-m-d';

            $dadosTratados = ControllerUtils::validateRequest($request, $ar_fields);

            $this->dataInicial = $dadosTratados['rangedatas'][0] . ' 00:00:00';
            $this->dataFinal   = $dadosTratados['rangedatas'][1] . ' 23:59:59';
            $dados = [];

            $post = [
                "data_ini"      => $this->dataInicial,
                "data_fim"      => $this->dataFinal,
                "rel_tipo_data" => $dadosTratados['rel_tipo_data'],
                "rel_tipo_fase" => $dadosTratados['rel_tipo_fase'],
                "limitar_data"  => $dadosTratados['limitar_data'],
                "rel_carteira"  => !empty($dadosTratados['rel_carteira']) ? $dadosTratados['rel_carteira'] : []
            ];

            if (isset($dadosTratados['loja_cartao']) && !empty($dadosTratados['loja_cartao'])) {
                $post['loja_cartao'] = $dadosTratados['loja_cartao'];
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
        } catch (\Exception $e) {
            return ControllerUtils::jsonResponse(false, $post, "File:" . $e->getFile() . " | Linha:" . $e->getLine() . " | Erro: " . $e->getMessage());
        }
    }

    public function credor_dash_carteira_pagamento_dados(Request $request) {
        $post       = [];
        $retorno    = [];
        $pasta_request      = "aqc_bi_credores";
        $sub_pasta_resquest = "dash_carteira_pagamento";
        try {

            $ar_fields['rel_carteira']      = 'required|array';
            $ar_fields['rel_tipo_data']     = 'nullable|string';
            $ar_fields['limitar_data']      = 'nullable|string';
            $ar_fields['cpf_cnpj']          = 'nullable|string';
            $ar_fields['bor_numero']        = 'nullable|string';
            $ar_fields['aco_codigo']        = 'nullable|string';

            $ar_fields['rangedatas']     = 'required|array';
            $ar_fields['rangedatas.*']   = 'date_format:Y-m-d';

            $dadosTratados = ControllerUtils::validateRequest($request, $ar_fields);

            $this->dataInicial = $dadosTratados['rangedatas'][0] . ' 00:00:00';
            $this->dataFinal   = $dadosTratados['rangedatas'][1] . ' 23:59:59';
            $dados = [];

            $post = [
                "data_ini"      => $this->dataInicial,
                "data_fim"      => $this->dataFinal,
                "rel_tipo_data" => $dadosTratados['rel_tipo_data'],
                "limitar_data"  => $dadosTratados['limitar_data'],
                "rel_carteira"  => !empty($dadosTratados['rel_carteira']) ? $dadosTratados['rel_carteira'] : []
            ];

            if (isset($dadosTratados['bor_numero']) && !empty($dadosTratados['bor_numero'])) {
                $post['bor_numero'] = $dadosTratados['bor_numero'];
            }
            if (isset($dadosTratados['cpf_cnpj']) && !empty($dadosTratados['cpf_cnpj'])) {
                $post['cpf_cnpj'] = $dadosTratados['cpf_cnpj'];
            }
            if (isset($dadosTratados['aco_codigo']) && !empty($dadosTratados['aco_codigo'])) {
                $post['aco_codigo'] = $dadosTratados['aco_codigo'];
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
        } catch (\Exception $e) {
            return ControllerUtils::jsonResponse(false, $post, "File:" . $e->getFile() . " | Linha:" . $e->getLine() . " | Erro: " . $e->getMessage());
        }
    }


    //PADRAO PRA TUDO
    public function padrao_pra_tudo(Request $request) {
        $post       = [];
        $retorno    = [];
        $pasta_request      = "aqc_bi_credores";
        $sub_pasta_resquest = "dash_carteira_desempenho";
        try {

            $ar_fields['rel_carteira']   = 'required|array';
            $ar_fields['rel_tipo_data']  = 'nullable|string';

            $ar_fields['rangedatas']     = 'required|array';
            $ar_fields['rangedatas.*']   = 'date_format:Y-m-d';

            $dadosTratados = ControllerUtils::validateRequest($request, $ar_fields);

            $this->dataInicial = $dadosTratados['rangedatas'][0] . ' 00:00:00';
            $this->dataFinal   = $dadosTratados['rangedatas'][1] . ' 23:59:59';
            $dados = [];

            $post = [
                "data_ini"      => $this->dataInicial,
                "data_fim"      => $this->dataFinal,
                "rel_tipo_data" => $dadosTratados['rel_tipo_data'],
                "rel_carteira"  => !empty($dadosTratados['rel_carteira']) ? $dadosTratados['rel_carteira'] : []
            ];

            if (isset($dadosTratados['loja_cartao']) && !empty($dadosTratados['loja_cartao'])) {
                $post['loja_cartao'] = $dadosTratados['loja_cartao'];
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
        } catch (\Exception $e) {
            return ControllerUtils::jsonResponse(false, $post, "File:" . $e->getFile() . " | Linha:" . $e->getLine() . " | Erro: " . $e->getMessage());
        }
    }

    //DASH GERENCIAL ACORDOS
    public function credor_dash_gerencial_acordos(Request $request) {
        $post       = [];
        $retorno    = [];
        $pasta_request      = "aqc_bi_credores";
        $sub_pasta_resquest = "credor_dash_gerencial_acordos";
        try {

            $ar_fields['tipo_consulta']         = 'required|string';
            $ar_fields['tipo_data']             = 'required|string';
            $ar_fields['cancelados']            = 'required|string';
            $ar_fields['tipo_dados']            = 'required|string';
            $ar_fields['rel_equipe_loja']       = 'required|array';
            $ar_fields['rel_tipo_agrupamento']  = 'required|string';
            $ar_fields['cpf_cnpj']              = 'nullable|string';

            $ar_fields['rangedatas']        = 'required|array';
            $ar_fields['rangedatas.*']      = 'date_format:Y-m-d';
            $ar_fields['rangedatas2']       = 'required|array';
            $ar_fields['rangedatas2.*']     = 'date_format:Y-m-d';

            $ar_fields['limitar_pagamento'] = 'required|string';
            $ar_fields['rangedatas3']       = 'required|array';
            $ar_fields['rangedatas3.*']     = 'date_format:Y-m-d';

            $dadosTratados = ControllerUtils::validateRequest($request, $ar_fields);

            $dados = [];

            $post = [
                "aco_cadastro_ini"      => $dadosTratados['rangedatas'][0]  . ' 00:00:00',
                "aco_cadastro_fim"      => $dadosTratados['rangedatas'][1]  . ' 23:59:59',
                "aci_vencimento_ini"    => $dadosTratados['rangedatas2'][0] . ' 00:00:00',
                "aci_vencimento_fim"    => $dadosTratados['rangedatas2'][1] . ' 23:59:59',
                "dt_pagamento_ini"      => $dadosTratados['rangedatas3'][0],
                "dt_pagamento_fim"      => $dadosTratados['rangedatas3'][1],
                "limitar_pagamento"     => $dadosTratados['limitar_pagamento'],
                "tipo_consulta"         => $dadosTratados['tipo_consulta'],
                "tipo_data"             => $dadosTratados['tipo_data'],
                "cancelados"            => $dadosTratados['cancelados'],
                "tipo_dados"            => $dadosTratados['tipo_dados'],
                "rel_tipo_agrupamento"  => $dadosTratados['rel_tipo_agrupamento'],
                "rel_equipe_loja"       => !empty($dadosTratados['rel_equipe_loja']) ? $dadosTratados['rel_equipe_loja'] : [],
            ];

            if (isset($dadosTratados['cpf_cnpj']) && !empty($dadosTratados['cpf_cnpj'])) {
                $post['cpf_cnpj'] = $dadosTratados['cpf_cnpj'];
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
        } catch (\Exception $e) {
            return ControllerUtils::jsonResponse(false, $post, "File:" . $e->getFile() . " | Linha:" . $e->getLine() . " | Erro: " . $e->getMessage());
        }
    }
}
