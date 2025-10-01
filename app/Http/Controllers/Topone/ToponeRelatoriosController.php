<?php

namespace App\Http\Controllers\Topone;

use App\Http\Controllers\Conexoes\sqlServerController;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Utilitarios\ControllerUtils;
use Exception;
use Illuminate\Http\Request;

class ToponeRelatoriosController extends Controller {
    private $tempo_execucao;
    private $dataInicial;
    private $dataFinal;

    private $array_fases;

    public function __construct() {
        $this->array_fases = ControllerUtils::fases_padrao();
    }

    private function query_rel_acordos_padrao() {
        return "WITH PrestMin AS (
            SELECT
                tad.ID_Acordo,
                tad.CONTRATO,
                tc.CARTEIRA,
                MIN(tp.DATA_VENCTO) AS menor_vencimento
            FROM TB_Acordos_Detalhe AS tad
            INNER JOIN TB_Acordos ta ON ta.ID_Acordo = tad.ID_Acordo
            INNER JOIN TB_Contratos tc ON tc.CONTRATO = tad.Contrato AND tc.CPF_CGC = ta.CPF_CGC
            INNER JOIN TB_Prestacoes AS tp ON tp.CONTRATO = tad.Contrato
                AND tp.CPF_CGC = ta.CPF_CGC
                AND tp.NUM_PREST = tad.Num_Prest
            WHERE 1 = 1 
            GROUP BY tad.ID_Acordo, tad.CONTRATO, tc.CARTEIRA
            ),
            Pagamentos AS (
            SELECT
                tap.ID_Acordo,
                MIN(tap.DT_Vencto) as menor_vencimento,
                SUM(tap.VL_Apagar) AS total_apagar,
                SUM(CASE WHEN tap.DT_Pago > 0 THEN tap.VL_Apagar ELSE 0 END) AS total_apagar_pago,
                SUM(CASE WHEN tap.DT_Pago > 0 THEN 1 ELSE 0 END) AS qt_parcelas_pagas,
                SUM(CASE WHEN tap.DT_Pago = 0 THEN 1 ELSE 0 END) AS qt_parcelas_abertas,
                SUM(tap.VL_Pago) AS total_pago,
                -- próximo vencimento >= hoje (se existir)
                MIN(CASE WHEN tap.DT_Pago = 0 AND tap.DT_Vencto >= CAST(CONVERT(varchar(8), GETDATE(), 112) AS int) THEN tap.DT_Vencto END) AS prox_venc_int_ge_hoje,
                -- fallback: menor vencimento em aberto (mesmo que já vencido)
                MIN(CASE WHEN tap.DT_Pago = 0 THEN tap.DT_Vencto END) AS prox_venc_int_any
            FROM TB_Acordos_Pagto AS tap
            GROUP BY tap.ID_Acordo
            )
            SELECT
                ta.ID_Acordo,
                pm.CONTRATO,
                ta.ID_Usuario_Acordo,
                ta.CD_Situacao,
                CD_Natureza,
                to2.strNome as operacao,
                ass.strFantasia as assessoria,
                ISNULL((case when CD_Natureza = 'CAN' then 'CANCELADOS' ELSE to2.strNome  end), 'NAO CADASTRADA') as sub_grupo,
                ISNULL(CASE WHEN CD_Natureza = 'CAN' THEN 'CCAN' ELSE CONVERT(varchar(12), to2.intCodOperacao) END, 'CNA') AS cod_sub_grupo,
                tc.intCodCarteira,
                tc.strFantasia as carteira,
                ISNULL((case when CD_Natureza = 'SER' then 'SERASA' ELSE ass.strFantasia end), 'NAO CADASTRADA') as grupo,
                ISNULL((case when CD_Natureza = 'SER' then 'SER' ELSE CONVERT(varchar(12), c.cod_assessoria) end), 'NA') as cod_grupo,
                op.strNome as operador,
                op.strUsuario as cod_operador,
                ta.VL_Acordo as vl_acordo,
                ta.QT_Parcelas as qt_parcelas,
                ta.VL_Entrada,
                ta.VL_Parcela,
                ta.VL_Financiado,
                ta.DT_Registro as dt_acordo,
                ta.HR_Registro as hr_acordo,
                CONVERT(char(19),
                    DATETIMEFROMPARTS(
                    CAST(ta.DT_Registro / 10000              AS int),         -- ano
                    CAST((ta.DT_Registro / 100) % 100        AS int),         -- mês
                    CAST(ta.DT_Registro % 100                AS int),         -- dia
                    CAST(ta.HR_Registro / 1000000            AS int),         -- hora
                    CAST((ta.HR_Registro / 10000) % 100      AS int),         -- minuto
                    CAST((ta.HR_Registro / 100) % 100        AS int),         -- segundo
                    0                                                        -- milissegundos (ver nota abaixo)
                    ),
                120) AS dt_acordo_dh,
                pgto.menor_vencimento as menor_vencimento_acordo,
                pm.menor_vencimento as menor_vencimento_contrato,
                DATEDIFF( DAY, CONVERT(date, CONVERT(varchar(8), pm.menor_vencimento), 112), CONVERT(date, CONVERT(varchar(8), ta.DT_Registro), 112)) AS fase,
                ta.DT_Cancel as dt_cancelado,
                pgto.qt_parcelas_abertas,
                pgto.qt_parcelas_pagas,
                pgto.total_apagar vl_apagar,
                pgto.total_apagar_pago as vl_pago,
                pgto.total_apagar - pgto.total_apagar_pago as vl_aberto,
                pgto.total_pago as vl_pago_real,
                -- Próximo vencimento em aberto como DATE
                CONVERT(date, CONVERT(varchar(8), COALESCE(pgto.prox_venc_int_ge_hoje, pgto.prox_venc_int_any)), 112) AS prox_vencimento_aberto
            FROM TB_Acordos AS ta
            INNER JOIN PrestMin AS pm ON pm.ID_Acordo = ta.ID_Acordo 
            INNER JOIN Pagamentos AS pgto ON pgto.ID_Acordo = ta.ID_Acordo
            INNER JOIN TB_Operacao to2 on to2.intCodOperacao = ta.OPERACAO
            INNER JOIN TB_Operador op on op.strUsuario = ta.ID_Usuario_Acordo
            INNER JOIN TB_Carteira tc on tc.intCodCarteira = pm.CARTEIRA
            LEFT JOIN controle_asses_acordo_aqc as c ON c.cod_acordo_topone = ta.ID_Acordo 
            LEFT JOIN TB_Assessoria ass ON ass.cod_asses_ext = ISNULL(NULLIF(c.cod_assessoria, 0), 195)
            WHERE 1 = 1 
            AND ta.DT_Registro between ? and ? 
            -- and ta.DT_Cancel = ?
            ";
    }

    public function rel_acordos_padrao_dados(Request $request) {

        try {
            $ar_fields['datas']     = 'required|array';
            $ar_fields['datas.*']   = 'date_format:Y-m-d';
            $dadosTratados = ControllerUtils::validateRequest($request, $ar_fields);
            $this->dataInicial = str_replace("-", "", $dadosTratados['datas'][0]);
            $this->dataFinal   = str_replace("-", "", $dadosTratados['datas'][1]);

            $dados = [];

            $db = new sqlServerController();
            $sql = $this->query_rel_acordos_padrao();
            // $this->dataInicial = "20250903";
            $dados = $db->select($sql, [$this->dataInicial, $this->dataFinal]);
            // dd($dados);
            if (empty($dados)) {
                return ControllerUtils::jsonResponse(false, [], "Dados não localizados!");
            }

            $ar_config = $this->rel_acordos_padrao_config();
            $dados_retorno = ControllerUtils::__arrumaDadosDataTableJS($ar_config, $dados, 'tabela1', [2, 3, 4, 5, 6, 7]);

            return ControllerUtils::jsonResponse(true, $dados_retorno, "");
        } catch (\Throwable $e) {
            return ControllerUtils::jsonResponse(false, [], "File:" . $e->getFile() . " | Linha:" . $e->getLine() . " | Erro: " . $e->getMessage());
        }
    }

    private function rel_acordos_padrao_config() {
        return [
            "ID_Acordo"                 => ["COD.ACORDO", "text-center", null, false],
            "CONTRATO"                  => ["CONTRATO",  "text-center", null, false],
            "grupo"                     => ["GRUPO", "", null, false],
            "sub_grupo"                 => ["SUBGRUPO", "", null, false],
            "CD_Natureza"               => ["NATUREZA", "text-center", null, false],
            "operacao"                  => ["OPERACAO", "text-center", null, false],
            "assessoria"                => ["ASSESSORIA", "", null, false],
            "carteira"                  => ["CARTEIRA",  "text-center", null, false],
            "dt_cancelado"              => ["DT.CANCELADO",  "text-center", 'dateint', false],
            "dt_acordo_dh"              => ["DT.ACORDO",  "text-center", "datetime", false],
            "prox_vencimento_aberto"    => ["DT.PROX.VENC",  "text-center", "date", false],
            "fase"                      => ["FASE",  "text-center", 0, false],
            "qt_parcelas"               => ["QT.PARCELAS",  "text-center", 0, false],
            "vl_acordo"                 => ["VL.ACORDOS",  "text-right", 2, true],
            "VL_Entrada"                => ["VL.ENTRADA",  "text-right", 2, false],
            "VL_Parcela"                => ["VL.PARCELA",  "text-right", 2, false],
            "VL_Financiado"             => ["VL.FINANCIADO",  "text-right", 2, false],
            "vl_pago"                   => ["VL.PAGO",  "text-right", 2, true],
            "vl_aberto"                 => ["VL.ABERTO",  "text-right", 2, true],
        ];
    }
}
