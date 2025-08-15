$(document).ready(function () {
    carregarCoresGraficosHapvida();

    gerarSelectPicker2(".selectPickerAntigo");

    $('#btnBuscarDados').click(function () {
        FormValidator.validar('form_filtros_pesquisa').then((isValid) => {
            if (isValid) {
                __buscarDados();
            }
        });

    });

});

function __buscarDados() {
    let idForm = 'form_filtros_pesquisa';
    let div_retorno_sintetico = 'resultado-aba1';
    let div_retorno_analitico = 'resultado-aba2';
    $bt = '#btnBuscarDados';
    startLadda($bt);
    const requestParams = {
        method: 'POST',
        url: window.app.routes.buscarCredor,
        data: {},
        formId: idForm
    };
    AjaxRequest.sendRequest(requestParams).then(response => {
        stopLadda($bt);
        if (response.status) {
            if (response.msg != "") {
                //SweetAlert.info(response.msg);
                alertar(response.msg, '', 'info');
            }
            if (response.data.htmlDownload !== undefined && response.data.htmlDownload != '') {
                // Se o status for verdadeiro, então há um arquivo para download
                var html = response.data.htmlDownload;
                $('#' + div_retorno).html(response.data.htmlDownload);
            } else {
                if (response.data.tabela !== undefined && response.data.tabela != '') {

                    tratarRetorno(response.data.tabela, div_retorno_sintetico);
                }
            }

        } else {
            SweetAlert.alertAutoClose("error", "Precisamos de sua atenção", response.msg, 20000);
        }
    }).catch(error => {
        stopLadda($bt);
        alertar(error, "", "error");
    });
}

document.addEventListener("DOMContentLoaded", function () {

});

async function tratarRetorno(tabela, divTabela) {

    const table = await __renderDataTable(tabela, divTabela, {
        ordering: true,
        order: [
            [8, 'desc']
        ],
        /*externalFilters: {
            container: '#filtrosGraficos',
            columns: tabela.filtrosHeader ?? [], // ou [0,3,5] etc.
            globalSearch: '#buscaGlobal', // opcional
            colClass: 'col-12 col-sm-6 col-md-3',
            // keepHeader: true // manter também os selects no header
        }*/
    }, undefined, true);

    const dtf = new DTFiltrados(table);
    lerRowEMontarGraficos(dtf.getArray());
    const stop = dtf.hookFilteredRows((rows, tbl) => {
        if (rows.length === 0) return;
        lerRowEMontarGraficos(rows);
    }, {
        delay: 300,
        alertOnEmpty: true,
        alertConfig: {
            type: "warning",
            title: "Precisamos de sua atenção",
            text: "Sem resultados para essa ultima seleção! Desmarque e tente novamente. Ou olhe na aba Sintético os valores disponiveis!",
            timeout: 10000
        }
    });
}

async function lerRowEMontarGraficos(rows) {

    if (rows.length === 0) {
        SweetAlert.alertAutoClose("info", "Precisamos de sua atenção", "Sem dados para gerar Graficos!", 5000)
        return true;
    }
    /*
    0 "data"
    1 "cancelamento"
    2 "frente"
    3 "filial"
    4 "operadora"
    5 "porte"
    6 "fase"
    7 "contratos"
    8 "vidas"
    9 "vidas_recuperadas"
    10 "vidas_recuperadas_duplicidade"
    11 "vidas_recuperadas_perc"
    12 "vidas_recuperadas_parcial"
    13 "vidas_recuperadas_parcial_duplicidade"
    14 "vidas_devolvidas"
    15 "vl_implantado"
    16 "vl_aberto"
    17 "vl_recuperado"
    18"qtd_acionamento_direto"    
    19"qtd_vidas_acionadas"       
    20"qtd_vidas_nao_acionadas"   
    21"qtd_contratos_acionados"   
    22"qtd_contratos_n_acionados" 
    */
    const ar_valores = {
        CON: 7,
        VIDA: 8,
        VIDAR: 9,
        VIDARD: 10,
        VIDARP: 12,
        VIDARPD: 13,
        VIDAD: 14,
        //VIDAA: '8-9-11',
        IMP: 15,
        IMPA: 16,
        IMPR: 17,
    }

    //const ar_total          = Utilitarios.sumColumnsFormula(rows, ar_valores);
    const ar_total = Utilitarios.sumColumns(rows, ar_valores);
    console.log(ar_total)
    const ar_implantacao = Utilitarios.sumColumns(rows, ar_valores, 0);
    const ar_cancelado = Utilitarios.sumColumns(rows, ar_valores, 1);
    const ar_frente = Utilitarios.sumColumns(rows, ar_valores, 2);
    const ar_operadora = Utilitarios.sumColumns(rows, ar_valores, 4);
    const ar_porte = Utilitarios.sumColumns(rows, ar_valores, 5);
    const ar_fase = Utilitarios.sumColumns(rows, ar_valores, 6);

    //ATUALIZAR CARDS
    const time_animacao = 1500;
    //await animarNumeroBRL('#smallbox1-1', 0, ar_total.IMP, time_animacao, 2, '', '', true);
    await Promise.all([
        animarNumeroBRL('#smallbox1_1-1', 0, ar_total.IMP, time_animacao, 2, '', '', true),
        animarNumeroBRL('#smallbox1_2-1', 0, ar_total.IMPA, time_animacao, 2, '', '', true),
        animarNumeroBRL('#smallbox1_2-2', 0, (ar_total.IMP > 0 ? (ar_total.IMPA / ar_total.IMP * 100) : 0), time_animacao, 2, 'Valor Aberto (<b>', '%</b>)', true),
        animarNumeroBRL('#smallbox1_3-1', 0, ar_total.IMPR, time_animacao, 2, '', '', true),
        animarNumeroBRL('#smallbox1_3-2', 0, (ar_total.IMP > 0 ? (ar_total.IMPR / ar_total.IMP * 100) : 0), time_animacao, 2, 'Valor Recuperado (<b>', '%</b>)', true),

        animarNumeroBRL('#smallbox2_1-1', 0, ar_total.VIDA, time_animacao, 0, '', '', true),
        animarNumeroBRL('#smallbox2_2-1', 0, ar_total.VIDARP, time_animacao, 0, '', '', true),
        animarNumeroBRL('#smallbox2_2-2', 0, (ar_total.VIDA > 0 ? ((ar_total.VIDARP) / ar_total.VIDA * 100) : 0), time_animacao, 2, 'Recuperadas Parcial(<b>', '%</b>)', true),
        animarNumeroBRL('#smallbox2_3-1', 0, ar_total.VIDARD, time_animacao, 0, '', '', true),
        animarNumeroBRL('#smallbox2_3-2', 0, (ar_total.VIDA > 0 ? ((ar_total.VIDARD) / ar_total.VIDA * 100) : 0), time_animacao, 2, 'Recuperadas Duplicidade(<b>', '%</b>)', true),
        animarNumeroBRL('#smallbox2_4-1', 0, ar_total.VIDAR, time_animacao, 0, '', '', true),
        animarNumeroBRL('#smallbox2_4-2', 0, (ar_total.VIDA > 0 ? ((ar_total.VIDAR) / ar_total.VIDA * 100) : 0), time_animacao, 2, 'Recuperadas (<b>', '%</b>)', true),
    ]);

    //Renderiza os graficos apos a animação dos cards
    //FUNIL
    CriarGraficos.createHighchartsFunnel({
        containerId: 'card_1',
        title: '',
        data: [{
            name: 'Implantado',
            value: ar_total.VIDA
        },
        {
            name: 'Em Aberto',
            value: ar_total.VIDA - ar_total.VIDAD - ar_total.VIDAR - ar_total.VIDARP - ar_total.VIDARD
        },
        {
            name: 'Devolvido',
            value: (ar_total.VIDAD),
            //color: '#22c55e'
        },
        {
            name: 'Rec. Parcial',
            value: ar_total.VIDARP
        },
        {
            name: 'Rec. Duplic',
            value: ar_total.VIDARD
        },
        {
            name: 'Recuperado',
            value: ar_total.VIDAR
        },
        ],
        decimals: 0,
        prefix: '',
        suffix: '',
        colors: [
            '#6c757d',
            '#3c8dbc',
            '#880e4f', // Vinho escuro
            '#f9a825',
            '#3d9970',
            '#00695c', // Verde petróleo
            '#605ca8',
            '#007bff',
            '#17a2b8', // Laranja queimado
            '#e65100', // Laranja escuro
        ], // opcional

    });

    graficoNovo(ar_implantacao, 'card_1_1', 'Desempenho Implantação', 'Vidas', 0, 'column', rows, 0);
    graficoNovo(ar_porte, 'card_2', 'Desempenho Porte', 'Vidas', 0, 'column', rows, 5);
    graficoNovo(ar_operadora, 'card_2_1', 'Desempenho Operadora', 'Vidas', 0, 'column', rows, 4);
    graficoNovo(ar_frente, 'card_3', 'Desempenho Frente', 'Vidas', 0, 'column', rows, 2);
    graficoNovo(ar_cancelado, 'card_3_1', 'Desempenho Cancelados', 'Vidas', 0, 'column', rows, 1);
    criarGraficoChartsFlexible(ar_fase, 'card_4', 'Desempenho por Fase', 'Vidas', 0, 'column');

}


function criarGraficoChartsFlexible(ar_dados, id, title, subtitle = 'Aberto/Recebidos', decimal = 2, tipo_grafico = 'areaspline', rows = "", key_coluna = 1) {

    // 1. Pegar as chaves e ordenar (ano-mês)
    let keys = Object.keys(ar_dados).sort();
    let key_ajust = keys.map(s => s.includes('->') ? s.split('->')[1].trim() : s);
    // 2. Criar arrays separados
    let implantado = keys.map(k => ar_dados[k].VIDA);
    let aberto = keys.map(k => ar_dados[k].VIDA - ar_dados[k].VIDAR - ar_dados[k].VIDAD - ar_dados[k].VIDARP - ar_dados[k].VIDARD);
    let recebido = keys.map(k => ar_dados[k].VIDAR);
    let recebido_parcial = keys.map(k => ar_dados[k].VIDARP);
    let recebido_duplicidade = keys.map(k => ar_dados[k].VIDARD);
    let devolvido = keys.map(k => ar_dados[k].VIDAD);

    let tooltipExtraKey = (rows != "") ? Utilitarios.pieBreakdownBy(rows, {
        keyCol: key_coluna, // DATA_IMPLANTACAO
        groupCol: 6, // FASE
        valueCol: '9+10+12', // recuperado
        keyTransform: k => (k.includes('->') ? k.split('->')[1].trim() : k), // pra casar com key_ajust
        groupTransform: g => (String(g).includes('->') ? String(g).split('->')[1].trim() : g),
        // Opcional:
        topN: 6, // mantém só 8 maiores por key
        // minPct: 3  // agrupa <3% em "Outros",
        toNumber: Utilitarios.parsePtNumber
    }) : [];

    let series_ar = [{
        name: 'Em aberto',
        type: tipo_grafico,
        data: aberto,
        prefix: '',
        decimals: decimal
    },
    {
        name: 'Devolvido',
        type: tipo_grafico,
        data: devolvido,
        prefix: '',
        decimals: decimal
    },
    {
        name: 'Recuperadas',
        type: 'areaspline',
        data: recebido,
        prefix: '',
        decimals: decimal
    },
    {
        name: 'Rec.Dupl',
        type: tipo_grafico,
        data: recebido_duplicidade,
        prefix: '',
        decimals: decimal
    }, {
        name: 'Rec.Parcial',
        type: tipo_grafico,
        data: recebido_parcial,
        prefix: '',
        decimals: decimal
    }
    ];

    const chart = new HighchartsFlexible2({
        container: id,
        title: title,
        subtitle: subtitle,
        tooltip: {
            decimals: decimal
        },
        tooltipExtraKey: tooltipExtraKey,
        tooltipMiniPie: {
            title: 'FASES COM MELHOR RECUPERAÇÃO GERAL',
            width: 400,
            height: 260,
            labelDistance: 12,
            valueFontSize: '10px',
            valueDecimals: decimal,
            percentDecimals: 2
        },
        //seriesPerc: ['Implantadas'],
        colors: null,
        xAxis: {
            type: 'category',
            categories: key_ajust
        },
        yAxis: {
            title: '',
            min: 0
        },
        series: series_ar
    }).build();
}

// --- função principal: cria o gráfico (hover) e liga o click para abrir a modal ---
function graficoNovo(ar_dados, id, title, subtitle = 'Aberto/Recebidos', decimal = 2, tipo_grafico = 'areaspline', rows, keyCol) {
    const ordemFaixas = [
        '-9999 a 30', '31 a 60', '61 a 90', '91 a 120',
        '121 a 150', '151 a 180', '181 a 365', '366 a 730',
        '731 a 1095', '1096 a 1460', '1461 a 1825', 'ACIMA DE 1825'
    ];
    const tooltipExtraKeyTable = calculaArrayTable(rows, keyCol, 6, ordemFaixas);
    console.log(tooltipExtraKeyTable)

    let keys = Object.keys(ar_dados).sort();
    let key_ajust = keys.map(s => s.includes('->') ? s.split('->')[1].trim() : s);
    // 2. Criar arrays separados
    let implantado = keys.map(k => ar_dados[k].VIDA);
    let aberto = keys.map(k => ar_dados[k].VIDA - ar_dados[k].VIDAR - ar_dados[k].VIDAD - ar_dados[k].VIDARP - ar_dados[k].VIDARD);
    let recebido = keys.map(k => ar_dados[k].VIDAR);
    let recebido_parcial = keys.map(k => ar_dados[k].VIDARP);
    let recebido_duplicidade = keys.map(k => ar_dados[k].VIDARD);
    let devolvido = keys.map(k => ar_dados[k].VIDAD);

    const tooltipExtraKey = (rows != "") ? Utilitarios.pieBreakdownBy(rows, {
        keyCol: keyCol, // DATA_IMPLANTACAO
        groupCol: 6, // FASE
        valueCol: '9+10+12', // recuperado
        keyTransform: k => (k.includes('->') ? k.split('->')[1].trim() : k), // pra casar com key_ajust
        groupTransform: g => (String(g).includes('->') ? String(g).split('->')[1].trim() : g),
        // Opcional:
        topN: 6, // mantém só 8 maiores por key
        // minPct: 3  // agrupa <3% em "Outros",
        toNumber: Utilitarios.parsePtNumber
    }) : [];

    let series_ar = [
        {
            name: 'Em aberto',
            type: tipo_grafico,
            data: aberto,
            prefix: '',
            decimals: decimal
        },
        {
            name: 'Devolvido',
            type: tipo_grafico,
            data: devolvido,
            prefix: '',
            decimals: decimal
        },
        {
            name: 'Recuperadas',
            type: 'areaspline',
            data: recebido,
            prefix: '',
            decimals: decimal
        },
        {
            name: 'Rec.Dupl',
            type: tipo_grafico,
            data: recebido_duplicidade,
            prefix: '',
            decimals: decimal
        }, {
            name: 'Rec.Parcial',
            type: tipo_grafico,
            data: recebido_parcial,
            prefix: '',
            decimals: decimal
        }
    ];

    // --- cria o gráfico (apenas hover) ---
    const chart = new HighchartsFlexible3({
        container: id,
        title,
        subtitle,
        xAxis: {
            type: 'category',
            categories: key_ajust
        },
        yAxis: {
            title: '',
            min: 0
        },
        series: series_ar,
        tooltip: {
            mode: 'hover-native',
            decimals: 2,
            hoverSummary: true
        },
        plotOptions: {
            series: {
                marker: {
                    radius: 2.5
                }
            }
        },
        tooltipExtraKey: tooltipExtraKey,
        tooltipMiniPie: {
            show: true,
            title: 'FASES COM MELHOR RECUPERAÇÃO GERAL',
            width: 500,
            height: 280,
            valueDecimals: 2,
            percentDecimals: 2
        }
    }).build();

    // 1) clique na área do plot → categoria
    // helpers já existentes
    const norm = s => String(s ?? '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ').trim().toLowerCase();

    const getRowsFor = (label) => tooltipExtraKeyTable[label] || tooltipExtraKeyTable[norm(label)] || [];
    const getExtraFor = (label) => tooltipExtraKey[label] || tooltipExtraKey[norm(label)] || null;

    // === função que abre a modal para uma categoria ===
    function openDrillForCategory(chart, keyLabel) {
        const rowsKey = getRowsFor(keyLabel);
        const extraKey = getExtraFor(keyLabel);

        const { html, renderAll, tableId } = buildDrilldownHTML({
            keyLabel,
            rows: Array.isArray(rowsKey) ? rowsKey : [],
            extra: extraKey,
            opts: {
                pieTitle: 'FASES COM MELHOR RECUPERAÇÃO',
                pieHeight: 280,
                tableMaxHeight: 500
            }
        });

        const $modal = $('#hcDrillModal');
        $modal.find('.modal-title').text(keyLabel);
        $modal.find('#hcDrillBody').html(html);

        // render depois da modal abrir
        $modal.one('shown.bs.modal', () => renderAll());
        $modal.data('hcTableId', tableId).modal('show');

        // cleanup
        $modal.on('hidden.bs.modal', function () {
            const id = $(this).data('hcTableId');
            if (id && $.fn.DataTable && $.fn.DataTable.isDataTable($('#' + id)[0])) {
                try { $('#' + id).DataTable().destroy(); } catch (_) { }
            }
            $('#hcDrillBody').empty();
            $(this).removeData('hcTableId');
        });
    }

    // evita duplo-bind se recriar o gráfico
    const containerEl = document.getElementById(id);
    if (containerEl && containerEl.dataset.hcClickBound !== '1') {
        containerEl.dataset.hcClickBound = '1';

        Highcharts.addEvent(chart.container, 'click', function (domEvt) {
            // normaliza e garante que o clique foi dentro da área do plot
            const e = chart.pointer.normalize(domEvt);
            if (e.chartX < chart.plotLeft || e.chartX > chart.plotLeft + chart.plotWidth) return;
            if (e.chartY < chart.plotTop || e.chartY > chart.plotTop + chart.plotHeight) return;

            const xa = chart.xAxis[0];
            const cats = xa.categories || [];
            if (!cats.length) return;

            const xVal = xa.toValue(e.chartX - chart.plotLeft, true);
            if (!isFinite(xVal)) return;

            const idx = Math.max(0, Math.min(Math.round(xVal), cats.length - 1));
            const keyLabel = cats[idx];

            if (keyLabel != null) openDrillForCategory(chart, keyLabel);
        });

        // feedback visual opcional
        chart.container.style.cursor = 'pointer';
    }


    // cleanup simples ao fechar a modal
    $('#hcDrillModal').on('hidden.bs.modal', function () {
        $('#hcDrillBody').empty();
    });

    return chart;
}

function calculaArrayTable(rows, keyCol = 1, groupCol = 2, ordemFaixas) {
    /*
    0 "data"
    1 "cancelamento"
    2 "frente"
    3 "filial"
    4 "operadora"
    5 "porte"
    6 "fase"
    7 "contratos"
    8   "vidas"
    9   "vidas_recuperadas"
    10  "vidas_recuperadas_duplicidade"
    11  "vidas_recuperadas_perc"
    12  "vidas_recuperadas_parcial"
    13  "vidas_recuperadas_parcial_duplicidade"
    14  "vidas_devolvidas"
    15  "vl_implantado"
    16  "vl_aberto"
    17  "vl_recuperado"
    18  "qtd_acionamento_direto"    
    19  "qtd_vidas_acionadas"       
    20  "qtd_vidas_nao_acionadas"   
    21  "qtd_contratos_acionados"   
    22  "qtd_contratos_n_acionados" 
    */
    const tooltipExtraKey = Utilitarios.pieBreakdownByMulti(rows, {
        keyCol: keyCol,
        groupCol: groupCol,
        valueCols: [
            { name: 'contratos', spec: 7 },
            { name: 'vidas', spec: 8 },
            { name: 'vidas_recuperadas', spec: 9 },
            { name: 'vidas_recuperadas_duplicidade', spec: 10 },
            { name: 'vidas_recuperadas_parcial', spec: 12 },
            { name: 'vidas_devolvidas', spec: 14 },
            { name: 'qtd_acionamento_direto', spec: 18 },
            { name: 'qtd_vidas_acionadas', spec: 19 },
            { name: 'qtd_vidas_nao_acionadas', spec: 20 },
            { name: 'qtd_contratos_acionados', spec: 21 },
            { name: 'qtd_contratos_n_acionados', spec: 22 },
        ],
        keyTransform: k => (k.includes('->') ? k.split('->')[1].trim() : k),
        groupTransform: g => (String(g).includes('->') ? String(g).split('->')[1].trim() : g),
        toNumber: Utilitarios.parsePtNumber,
        derived: [
            { name: 'pct_contrato_acionado', fn: s => (s.contratos > 0 ? (s.qtd_contratos_acionados / s.contratos) * 100 : 0) },
            { name: 'pct_contrato_nao_acionado', fn: s => (s.contratos > 0 ? (s.qtd_contratos_n_acionados / s.contratos) * 100 : 0) },
        ],
        columnsOrder: [
            "contratos", "vidas", "vidas_recuperadas", "vidas_recuperadas_duplicidade", "vidas_recuperadas_parcial",
            "vidas_devolvidas", "qtd_acionamento_direto", "qtd_vidas_acionadas", "qtd_vidas_nao_acionadas",
            "qtd_contratos_acionados", "pct_contrato_acionado", "qtd_contratos_n_acionados", "pct_contrato_nao_acionado"
        ],
        groupOrder: ordemFaixas,
        groupOrderUnknown: 'end',
        orderNormalize: s => String(s).trim().toLowerCase(),
        returnAs: 'rows',   // se você quer a saída em linhas (igual no calculaArrayTable)
        otherLabel: 'Outros'
    });
    return tooltipExtraKey;
}

function buildDrilldownHTML({
    keyLabel,
    rows,
    extra,
    opts = {}
}) {
    const fmtNum = (v, d = 0) => new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: d,
        maximumFractionDigits: d
    }).format(+v || 0);
    const fmtBRL = v => 'R$ ' + fmtNum(v, 2);
    const fmtPct = v => fmtNum(v, 2) + '%';
    const toN = v => +String(v ?? '').replace(/[^\d.-]/g, '') || 0;

    const pickMax = (arr, key) => arr.reduce((b, r) => {
        const v = toN(r[key]);
        return !b || v > b.v ? {
            row: r,
            v
        } : b;
    }, null);
    const pickMin = (arr, key) => arr.reduce((b, r) => {
        const v = toN(r[key]);
        return !b || v < b.v ? {
            row: r,
            v
        } : b;
    }, null);

    const infoBox = (color, title, big, small) => `
                <div class="info-box mb-2" title="${small || ''}">
                <span class="info-box-icon bg-${color}" style="min-width:44px"><i class="fas fa-chart-line"></i></span>
                <div class="info-box-content" style="line-height:1.1">
                    <span class="info-box-text text-truncate" style="max-width:240px">${title}</span>
                    <span class="info-box-number" style="font-size:1.05rem">${big}</span>
                    <div class="text-muted" style="font-size:.85rem">${small || ''}</div>
                </div>
                </div>`;

    const hiImpl = pickMax(rows, 'vidas');
    const hiAberto = pickMax(rows, 'vidas_recuperadas');
    const hiTkt = pickMax(rows, 'vidas_recuperadas_duplicidade');
    const hiRecVl = pickMax(rows, 'contratos');
    const hiRec = pickMax(rows, 'qtd_contratos_acionados');
    const loRec = pickMin(rows, 'qtd_contratos_n_acionados');

    const leftCards = `
                    ${hiImpl ? infoBox('primary', 'Vidas implantadas', fmtNum(hiImpl.v), hiImpl.row.group || '') : ''}
                    ${hiAberto ? infoBox('warning', 'Vidas recuperadas', fmtNum(hiAberto.v), hiAberto.row.group || '') : ''}
                    ${hiTkt ? infoBox('warning', 'Recuperações com duplicidade', fmtNum(hiTkt.v), hiTkt.row.group || '') : ''}
                `;
    const rightCards = `
                    ${hiRecVl ? infoBox('success', 'Contratos', fmtNum(hiRecVl.v), hiRecVl.row.group || '') : ''}
                    ${hiRec ? infoBox('success', 'Contratos acionados %', fmtNum(hiRec.v), hiRec.row.group || '') : ''}
                    ${loRec ? infoBox('danger', 'Contratos não acionados %', fmtNum(loRec.v), loRec.row.group || '') : ''}
                `;

    // colunas
    const cols = [{
        key: 'group',
        label: 'Faixa',
        type: 'string',
        align: 'text-left'
    },
    {
        key: 'contratos',
        label: 'Contratos',
        type: 'int',
        align: 'text-center'
    },
    {
        key: 'vidas',
        label: 'Vidas',
        type: 'int',
        align: 'text-center'
    },
    {
        key: 'vidas_recuperadas',
        label: 'Vidas.Recuperadas',
        type: 'int',
        align: 'text-center'
    },
    {
        key: 'vidas_recuperadas_duplicidade',
        label: 'Rec.Duplicidade',
        type: 'int',
        align: 'text-center'
    },
    {
        key: 'vidas_recuperadas_parcial',
        label: 'Rec.Parcial',
        type: 'int',
        align: 'text-center'
    },
    {
        key: 'vidas_devolvidas',
        label: 'Devolvidas',
        type: 'int',
        align: 'text-right'
    },
    {
        key: 'qtd_acionamento_direto',
        label: 'Qtd.Acto.Direto',
        type: 'int',
        align: 'text-right'
    },
    {
        key: 'qtd_vidas_acionadas',
        label: 'Vidas.Acionadas',
        type: 'int',
        align: 'text-right'
    },
    {
        key: 'qtd_vidas_nao_acionadas',
        label: 'Vidas.N.Acionadas',
        type: 'int',
        align: 'text-center'
    },
    {
        key: 'qtd_contratos_acionados',
        label: 'Crt.Acionado',
        type: 'int',
        align: 'text-right'
    },
    {
        key: 'pct_contrato_acionado',
        label: '%Crt.Acinado',
        type: 'percent',
        align: 'text-center'
    },
    {
        key: 'qtd_contratos_n_acionados',
        label: 'Crt.N.Acionado',
        type: 'int',
        align: 'text-center'
    },
    {
        key: 'pct_contrato_nao_acionado',
        label: '%Crt.N.Acinado',
        type: 'percent',
        align: 'text-center'
    },
    ];

    const fmtValue = (v, t) =>
        t === 'currency' ? fmtBRL(v) :
            t === 'percent' ? fmtPct(v) :
                t === 'int' ? fmtNum(v, 0) : fmtNum(v, 2);

    // tbody
    const thead = '<tr>' + cols.map(c => `<th class="${c.align || ''}">${c.label}</th>`).join('') + '</tr>';
    const tbody = rows.map(r => '<tr>' + cols.map(c => {
        const raw = r[c.key];
        const val = c.type !== 'string' ? toN(raw) : (raw || '');
        return `<td class="${c.align || ''}">${c.type === 'string' ? val : fmtValue(val, c.type)}</td>`;
    }).join('') + '</tr>').join('');

    // --- totais (HTML pronto, igual sua lógica) ---
    const totals = (() => {
        const sum = k => rows.reduce((s, r) => s + toN(r[k]), 0);

        const totContratos = sum('contratos');
        const totVidas = sum('vidas');
        const totVidasRec = sum('vidas_recuperadas');
        const totVidasRecDup = sum('vidas_recuperadas_duplicidade');
        const totVidasRecParc = sum('vidas_recuperadas_parcial');
        const totVidasDev = sum('vidas_devolvidas');
        const totAcDir = sum('qtd_acionamento_direto');
        const totVidasAc = sum('qtd_vidas_acionadas');
        const totVidasNaoAc = sum('qtd_vidas_nao_acionadas');
        const totCtrAc = sum('qtd_contratos_acionados');
        const totCtrNaoAc = sum('qtd_contratos_n_acionados');

        const pctCtrAcAgg = totContratos ? (totCtrAc / totContratos) * 100 : 0;
        const pctCtrNaoAcAgg = totContratos ? (totCtrNaoAc / totContratos) * 100 : 0;

        return {
            // chaves exatamente como estão em `cols`
            contratos: totContratos,
            vidas: totVidas,
            vidas_recuperadas: totVidasRec,
            vidas_recuperadas_duplicidade: totVidasRecDup,
            vidas_recuperadas_parcial: totVidasRecParc,
            vidas_devolvidas: totVidasDev,
            qtd_acionamento_direto: totAcDir,
            qtd_vidas_acionadas: totVidasAc,
            qtd_vidas_nao_acionadas: totVidasNaoAc,
            qtd_contratos_acionados: totCtrAc,
            pct_contrato_acionado: pctCtrAcAgg,     // % agregado
            qtd_contratos_n_acionados: totCtrNaoAc,
            pct_contrato_nao_acionado: pctCtrNaoAcAgg   // % agregado
        };
    })();

    const tfoot = '<tr>' + cols.map((c, idx) => {
        if (idx === 0) return `<th class="${c.align || ''}">Total</th>`;
        const v = totals[c.key];
        if (v == null) return `<th class="${c.align || ''}"></th>`;
        const out = c.type === 'currency' ? fmtBRL(v) :
            c.type === 'percent' ? fmtPct(v) :
                c.type === 'int' ? fmtNum(v, 0) : fmtNum(v, 2);
        return `<th class="${c.align || ''}">${out}</th>`;
    }).join('') + '</tr>';

    // ids únicos
    const pieId = `hc-mini-pie-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const tableId = `hcDrillTable-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const pieData = (extra ? Object.entries(extra).map(([name, val]) => ({
        name,
        y: +val || 0
    })) : []);
    const pieTitle = (opts?.pieTitle) || 'Fases com melhor recuperação';
    const pieHeight = (opts?.pieHeight) || 280;
    const tableMaxH = (opts?.tableMaxHeight) || 500;
    //<div class="h5 mb-2">${keyLabel}</div> 
    const html = `
                    <div class="mb-2">
                    <div class="mt-3" style="max-height:${tableMaxH}px;">
                        <table id="${tableId}" class="table table-sm small table-hover table-bordered mb-0" style="width:100%;white-space:nowrap;">
                        <thead>${thead}</thead>
                        <tbody>${tbody}</tbody>
                        <tfoot>${tfoot}</tfoot>
                        </table>
                    </div>
                    <div class="row align-items-start">
                        <div class="col-md-4 pr-md-2">${leftCards}</div>
                        <div class="col-md-4">
                        <div class="small text-muted mb-1 text-center">${pieTitle}</div>
                        <div id="${pieId}" style="width:100%;height:${pieHeight}px;"></div>
                        </div>
                        <div class="col-md-4 pl-md-2">${rightCards}</div>
                    </div>
                    </div>`;

    // ---------- Renderizadores c/ espera de visibilidade ----------
    const renderPieWhenVisible = (tries = 30) => {
        const el = document.getElementById(pieId);
        if (!el || el.offsetWidth === 0) {
            if (tries > 0) return setTimeout(() => renderPieWhenVisible(tries - 1), 50);
            return;
        }
        if (!pieData.length) {
            el.innerHTML = '<div class="text-center text-muted">Sem dados do pie</div>';
            return;
        }

        Highcharts.chart(pieId, {
            chart: {
                type: 'pie',
                backgroundColor: 'transparent',
                animation: false
            },
            title: {
                text: null
            },
            credits: {
                enabled: false
            },
            exporting: {
                enabled: false,
                buttons: {
                    contextButton: {
                        enabled: false
                    }
                }
            },
            tooltip: {
                enabled: false
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    enableMouseTracking: true
                },
                pie: {
                    colorByPoint: true,
                    size: '90%',
                    dataLabels: {
                        enabled: true,
                        useHTML: true,
                        softConnector: true,
                        distance: 12,
                        formatter: function () {
                            const n = this.point.name,
                                y = this.point.y;
                            const pct = Highcharts.numberFormat(this.percentage, 2);
                            return '<div style="text-align:center;line-height:1.1;"><div style="font-weight:600;">' + n +
                                '</div><div style="font-size:10px;">' + y.toLocaleString('pt-BR') + ' <small>(' + pct + '%)</small></div></div>';
                        },
                        style: {
                            fontSize: '10px',
                            textOutline: 'none'
                        }
                    }
                }
            },
            series: [{
                data: pieData
            }]
        });
    };

    const initDataTableWhenVisible = (tries = 30) => {
        if (!(window.jQuery && jQuery.fn && jQuery.fn.DataTable)) return; // sem DT, não inicializa
        const $t = jQuery('#' + tableId);
        const el = $t[0];
        if (!el || el.offsetWidth === 0) {
            if (tries > 0) return setTimeout(() => initDataTableWhenVisible(tries - 1), 50);
            return;
        }
        if (jQuery.fn.DataTable.isDataTable(el)) return;

        const dt = $t.DataTable({
            autoWidth: false,
            paging: false,
            searching: false,
            info: false,
            ordering: false,
            order: [],
            aaSorting: [],
            orderFixed: null,
            columnDefs: [{ targets: '_all', orderable: false }],
            //scrollX: true,
            retrieve: true,
            "dom": "<'row'<'col-xs-6 col-md-4'><'col-xs-6 col-md-4 text-center'B><'col-xs-12 col-md-4'f>>t",
            // Não usamos footerCallback: o footer já veio calculado no HTML (mais robusto).
        });

        setTimeout(() => {
            try {
                dt.columns().adjust();
            } catch (_) { }
        }, 0);
    };

    const renderAll = () => {
        renderPieWhenVisible();
        initDataTableWhenVisible();
    };

    return {
        html,
        renderAll,
        tableId
    };
}