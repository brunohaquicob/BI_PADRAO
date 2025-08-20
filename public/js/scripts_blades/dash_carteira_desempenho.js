

$(document).ready(function () {
    carregarCoresGraficos();
    $('.multiselect-bs4').multiselect({
        includeSelectAllOption: true,
        includeSelectAllOptionMin: 3,
        selectAllText: "Todos",
        selectAllDeselectAll: false,
        enableCollapsibleOptGroups: true,
        collapseOptGroupsByDefault: true,
        enableFiltering: true,
        maxHeight: 300,
        fontSize: 14
    });

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
    addLoading("card_resultados");
    let datas = getRangeDate('dateRangePicker');
    const requestParams = {
        method: 'POST',
        url: window.app.routes.buscarCredor,
        data: {
            'rangedatas': datas,
            'limitar_data': $('#dateRangePicker_check').is(':checked') ? 'S' : 'N'
        },
        formId: idForm
    };
    AjaxRequest.sendRequest(requestParams).then(response => {
        removeLoading("card_resultados");
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
        alertar(error, "", "error");
    });
}

document.addEventListener("DOMContentLoaded", function () {

});

async function tratarRetorno(tabela, divTabela) {

    const table = await __renderDataTable(tabela, divTabela, {
        ordering: true,
        externalFilters: {
            container: '#filtrosGraficos',
            columns: tabela.filtrosHeader ?? [], // ou [0,3,5] etc.
            globalSearch: '#buscaGlobal', // opcional
            colClass: 'col-12 col-sm-6 col-md-3',
            // keepHeader: true // manter também os selects no header
        }
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
    const ar_data_valor = Utilitarios.sumColumns(rows, {
        I: 9,
        R: 11,
        N: 13,
        A: 14,
    }, 1);
    const ar_fase_valor = Utilitarios.sumColumns(rows, {
        I: 9,
        R: 11,
        N: 13,
        A: 14,
    }, 2);
    const ar_data_qtd = Utilitarios.sumColumns(rows, {
        F: 3,
        FA: 4,
        C: 5,
        CA: 6
    }, 1);
    const ar_fase_qtd = Utilitarios.sumColumns(rows, {
        F: 3,
        FA: 4,
        C: 5,
        CA: 6
    }, 2);
    const implantado = Utilitarios.sumColumns(rows, {
        I: 9,
        R: 11,
        A: 14,
        N: 13,
        CA: 6,
        C: 5,
        FA: 4,
        F: 3
    });

    const contratos_fase = Utilitarios.sumColumns(rows, {
        CA: 6,
        C: 5,
        FA: 4,
        F: 3
    }, 2);
    const contratos_data = Utilitarios.sumColumns(rows, {
        CA: 6,
        C: 5,
        FA: 4,
        F: 3
    }, 1);

    animarNumeroBRL('#smallbox1-1', 0, implantado.I, 3000, 2, '');
    animarNumeroBRL('#smallbox2-1', 0, implantado.R, 3000, 2, '');
    animarNumeroBRL('#smallbox2-2', 0, (implantado.I > 0 ? (implantado.R / implantado.I * 100) : 0), 3000, 2, 'Valor Recuperado (<b>', '%</b>)');

    animarNumeroBRL('#smallbox4-1', 0, implantado.C, 3000, 0, '');
    animarNumeroBRL('#smallbox5-1', 0, (implantado.C - implantado.CA), 3000, 0, '');
    animarNumeroBRL('#smallbox5-2', 0, (implantado.F > 0 ? ((implantado.F - implantado.FA) / implantado.F * 100) : 0), 3000, 2, 'Devedores Recuperados (<b>', '%</b>)');

    //console.log(ar_data_valor);
    //console.log(ar_fase_valor);
    //console.log(implantado);

    //MOntar Grafico 1
    criarGraficosRowKey(ar_fase_valor, 'card_1', 'Desempenho por Fase', 'Aberto/Em Negociação/Recebidos');
    //MOntar Grafico 2
    graficoPorImplantacao(ar_data_valor, 'card_2', 'Desempenho Por Implantação', '(Em aberto/Em Acordo/Recuperado)', 2, 'column', rows);
    //MOntar Grafico 3
    graficoPorContratos(contratos_data, 'card_3', 'Desempenho Contratos Por Implantação', '(Contratos que contém parcelas Recebidas vs parcelas em Aberto)', 0, 'areaspline', rows);
    //FUNIL
    CriarGraficos.createHighchartsFunnel({
        containerId: 'card_3_1',
        title: '',
        data: [{
            name: 'Implantado',
            value: implantado.I
        },
        {
            name: 'Em Aberto',
            value: implantado.A
        },
        {
            name: 'Em Acordo',
            value: implantado.N,
            //color: '#22c55e'
        }, // cor opcional por etapa
        {
            name: 'Recuperado',
            value: implantado.R
        }
        ],
        decimals: 2,
        prefix: '',
        suffix: '',
        colors: [
            '#6c757d',
            '#dc3545',
            '#3c8dbc',
            '#3d9970',
        ], // opcional
    });

}

// --- helper: HTML do drilldown (cards + pie + tabela) ---
function buildDrilldownHTML({
    keyLabel,
    rows,
    extra,
    opts = {}
}) {
    const fmtNum = (v, d = 2) => new Intl.NumberFormat('pt-BR', {
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

    const hiImpl = pickMax(rows, 'valor_implantado');
    const hiAberto = pickMax(rows, 'valor_aberto');
    const hiTkt = pickMax(rows, 'ticket_medio');
    const hiRecVl = pickMax(rows, 'valor_recuperado');
    const hiRec = pickMax(rows, 'pct_recuperado');
    const loRec = pickMin(rows, 'pct_recuperado');

    const leftCards = `
                    ${hiImpl ? infoBox('primary', 'Maior valor Implantado (R$)', fmtBRL(hiImpl.v), hiImpl.row.group || '') : ''}
                    ${hiAberto ? infoBox('warning', 'Maior valor em Aberto (R$)', fmtBRL(hiAberto.v), hiAberto.row.group || '') : ''}
                    ${hiTkt ? infoBox('warning', 'Maior Tiket Médio (R$)', fmtBRL(hiTkt.v), hiTkt.row.group || '') : ''}
                `;
    const rightCards = `
                    ${hiRecVl ? infoBox('success', 'Melhor valor de Recuperação (R$)', fmtBRL(hiRecVl.v), hiRecVl.row.group || '') : ''}
                    ${hiRec ? infoBox('success', 'Melhor % Recuperação', fmtPct(hiRec.v), hiRec.row.group || '') : ''}
                    ${loRec ? infoBox('danger', 'Menor % Recuperação', fmtPct(loRec.v), loRec.row.group || '') : ''}
                `;

    // colunas
    const cols = [{
        key: 'group',
        label: 'Faixa',
        type: 'string',
        align: 'text-left'
    },
    {
        key: 'devedor_implantado',
        label: 'Dev.Imp',
        type: 'int',
        align: 'text-center'
    },
    {
        key: 'contrato_implantado',
        label: 'Ctr.Imp',
        type: 'int',
        align: 'text-center'
    },
    {
        key: 'valor_implantado',
        label: 'Implantado',
        type: 'currency',
        align: 'text-right'
    },
    {
        key: 'ticket_medio',
        label: 'Ticket',
        type: 'currency',
        align: 'text-right'
    },
    {
        key: 'valor_aberto',
        label: 'Aberto',
        type: 'currency',
        align: 'text-right'
    },
    {
        key: 'pct_aberto',
        label: '% Aberto',
        type: 'percent',
        align: 'text-center'
    },
    {
        key: 'valor_recuperado',
        label: 'Recuperado',
        type: 'currency',
        align: 'text-right'
    },
    {
        key: 'pct_recuperado',
        label: '% Recup.',
        type: 'percent',
        align: 'text-center'
    },
    {
        key: 'valor_em_acordo',
        label: 'Em Acordo',
        type: 'currency',
        align: 'text-right'
    },
    {
        key: 'valor_sem_acordo',
        label: 'Sem Acordo',
        type: 'currency',
        align: 'text-right'
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
        const totVal = sum('valor_implantado');
        const totCtr = sum('contrato_implantado');
        const totAberto = sum('valor_aberto');
        const totRec = sum('valor_recuperado');
        return {
            devedor_implantado: sum('devedor_implantado'),
            contrato_implantado: totCtr,
            valor_implantado: totVal,
            ticket_medio: totCtr ? (totVal / totCtr) : 0,
            valor_aberto: totAberto,
            pct_aberto: totVal ? (totAberto / totVal * 100) : 0,
            valor_recuperado: totRec,
            pct_recuperado: totVal ? (totRec / totVal * 100) : 0,
            valor_em_acordo: sum('valor_em_acordo'),
            valor_sem_acordo: sum('valor_sem_acordo'),
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



// --- função principal: cria o gráfico (hover) e liga o click para abrir a modal ---
function graficoPorImplantacao(ar_dados, id, title, subtitle = 'Aberto/Recebidos', decimal = 2, tipo_grafico = 'areaspline', rows) {
    const ordemFaixas = [
        '-9999 a 30', '31 a 60', '61 a 90', '91 a 120',
        '121 a 150', '151 a 180', '181 a 365', '366 a 730',
        '731 a 1095', '1096 a 1460', '1461 a 1825', 'ACIMA DE 1825'
    ];
    const tooltipExtraKeyTable = calculaArrayTable(rows, 1, 2, ordemFaixas);

    // 1. Pegar as chaves e ordenar (ano-mês) e ajustar label
    let keys = Object.keys(ar_dados).sort();
    let key_ajust = keys.map(s => s.includes('->') ? s.split('->')[1].trim() : s);
    // 2. Arrays das séries
    let arrA = keys.map(k => ar_dados[k].A);
    let arrN = keys.map(k => ar_dados[k].N);
    let arrR = keys.map(k => ar_dados[k].R);

    // dados do mini-pie (por key)
    const tooltipExtraKey = Utilitarios.pieBreakdownBy(rows, {
        keyCol: 1, // DATA_IMPLANTACAO
        groupCol: 2, // FASE
        valueCol: 11, // valor recebido
        keyTransform: k => (k.includes('->') ? k.split('->')[1].trim() : k),
        groupTransform: g => (String(g).includes('->') ? String(g).split('->')[1].trim() : g),
        topN: 6,
        toNumber: Utilitarios.parsePtNumber
    });

    const series_ar = [{
        name: 'Em Aberto',
        type: tipo_grafico,
        data: arrA,
        prefix: '',
        decimals: decimal
    },
    {
        name: 'Em Acordo',
        type: tipo_grafico,
        data: arrN,
        prefix: '',
        decimals: decimal
    },
    {
        name: 'Recebido',
        type: tipo_grafico,
        data: arrR,
        prefix: '',
        decimals: decimal
    },
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
            title: 'FASES COM MELHOR RECUPERAÇÃO',
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
    bindChartClick(
        id,
        chart,
        (keyLabel) => openDrillForCategory(chart, keyLabel),
        'Clique para mais detalhes'
    );

    // cleanup simples ao fechar a modal
    $('#hcDrillModal').on('hidden.bs.modal', function () {
        $('#hcDrillBody').empty();
    });

    return chart;
}

function bindChartClick(containerId, chart, onCategoryClick, titleText = 'Clique para mais detalhes') {
    const el = document.getElementById(containerId);
    if (!el || !chart || !chart.xAxis || !chart.xAxis[0]) return;

    // Se já havia um handler anterior, remove para evitar duplicidade
    if (el._hcClickHandler) el.removeEventListener('click', el._hcClickHandler);

    const handler = function (domEvt) {
        const e = chart.pointer.normalize(domEvt);

        // limita ao plot
        if (e.chartX < chart.plotLeft || e.chartX > chart.plotLeft + chart.plotWidth) return;
        if (e.chartY < chart.plotTop || e.chartY > chart.plotTop + chart.plotHeight) return;

        const xa = chart.xAxis[0];
        const cats = xa.categories || [];
        if (!cats.length) return;

        // mesmo cálculo que você já tinha
        const xVal = xa.toValue(e.chartX - chart.plotLeft, true);
        if (!isFinite(xVal)) return;

        const idx = Math.max(0, Math.min(Math.round(xVal), cats.length - 1));
        const keyLabel = cats[idx];

        if (keyLabel != null) onCategoryClick(keyLabel);
    };

    // guarda e aplica
    el._hcClickHandler = handler;
    el.addEventListener('click', handler);

    // UX
    el.style.cursor = 'pointer';
    el.setAttribute('title', titleText);

    // se usar tooltip do Bootstrap (opcional)
    if (typeof $ === 'function' && $.fn.tooltip) {
        $(el).tooltip('dispose');
        $(el).tooltip({ container: 'body' });
    }
}



function calculaArrayTable(rows, keyCol = 1, groupCol = 2, ordemFaixas) {

    const tooltipExtraKey = Utilitarios.pieBreakdownByMulti(rows, {
        keyCol: keyCol,
        groupCol: groupCol,
        valueCols: [{
            name: 'devedor_implantado',
            spec: 3
        },
        {
            name: 'contrato_implantado',
            spec: 4
        },
        {
            name: 'valor_implantado',
            spec: 9
        },
        {
            name: 'valor_aberto',
            spec: 10
        },
        {
            name: 'valor_recuperado',
            spec: 11
        },
        {
            name: 'valor_em_acordo',
            spec: 13
        },
        {
            name: 'valor_sem_acordo',
            spec: 14
        },
        ],
        keyTransform: k => (k.includes('->') ? k.split('->')[1].trim() : k),
        groupTransform: g => (String(g).includes('->') ? String(g).split('->')[1].trim() : g),
        toNumber: Utilitarios.parsePtNumber,

        derived: [{
            name: 'ticket_medio',
            fn: s => (s.contrato_implantado > 0 ? s.valor_implantado / s.contrato_implantado : 0)
        },
        {
            name: 'pct_recuperado',
            fn: s => (s.valor_implantado > 0 ? (s.valor_recuperado / s.valor_implantado) * 100 : 0)
        },
        {
            name: 'pct_aberto',
            fn: s => (s.valor_implantado > 0 ? (s.valor_aberto / s.valor_implantado) * 100 : 0)
        },
        ],

        columnsOrder: [
            'devedor_implantado', 'contrato_implantado',
            'valor_implantado', 'ticket_medio',
            'valor_aberto', 'pct_aberto',
            'valor_recuperado', 'pct_recuperado',
            'valor_em_acordo', 'valor_sem_acordo'
        ],

        groupOrder: ordemFaixas, // <- ordem mandada por você
        groupOrderUnknown: 'end', // (qualquer faixa não listada vai pro fim)
        orderNormalize: s => String(s).trim().toLowerCase(),
        returnAs: 'rows',
        otherLabel: 'Outros'
    });
    return tooltipExtraKey;
}




function graficoPorImplantacaoBKP(ar_dados, id, title, subtitle = 'Aberto/Recebidos', decimal = 2, tipo_grafico = 'areaspline', rows) {
    const ordemFaixas = [
        '-9999 a 30', '31 a 60', '61 a 90', '91 a 120',
        '121 a 150', '151 a 180', '181 a 365', '366 a 730',
        '731 a 1095', '1096 a 1460', '1461 a 1825', 'ACIMA DE 1825'
    ];
    const tooltipExtraKeyTable = calculaArrayTable(rows, 1, 2, ordemFaixas);

    // 1. Pegar as chaves e ordenar (ano-mês)
    let keys = Object.keys(ar_dados).sort();
    let key_ajust = keys.map(s => s.includes('->') ? s.split('->')[1].trim() : s);
    // 2. Criar arrays separados
    let arrA = keys.map(k => ar_dados[k].A);
    let arrI = keys.map(k => ar_dados[k].I);
    let arrN = keys.map(k => ar_dados[k].N);
    let arrR = keys.map(k => ar_dados[k].R);

    const tooltipExtraKey = Utilitarios.pieBreakdownBy(rows, {
        keyCol: 1, // DATA_IMPLANTACAO
        groupCol: 2, // FASE
        valueCol: 11, // valor recebido
        keyTransform: k => (k.includes('->') ? k.split('->')[1].trim() : k), // pra casar com key_ajust
        groupTransform: g => (String(g).includes('->') ? String(g).split('->')[1].trim() : g),
        // Opcional:
        topN: 6, // mantém só 8 maiores por key
        // minPct: 3  // agrupa <3% em "Outros",
        toNumber: Utilitarios.parsePtNumber
    });

    const series_ar = [{
        name: 'Em Aberto',
        type: tipo_grafico,
        data: arrA,
        prefix: '',
        decimals: decimal
    },
    {
        name: 'Em Acordo',
        type: tipo_grafico,
        data: arrN,
        prefix: '',
        decimals: decimal
    },
    {
        name: 'Recebido',
        type: tipo_grafico,
        data: arrR,
        prefix: '',
        decimals: decimal
    }
    ];

    new HighchartsFlexible3({
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
            mode: 'click',
            decimals: 2,
            hoverSummary: true
        },
        card: {
            position: 'center',
            offset: {
                y: 8
            },
            width: '70%',
            maxHeight: 800,
            className: 'border-primary small',
            headerClass: 'bg-primary text-white'
        },
        tooltipTable: {
            enabled: true,
            dataByKey: tooltipExtraKeyTable,
            groupColumn: {
                key: 'group',
                label: 'Faixa',
                align: 'text-left'
            },
            resolve: (rawKey, keyLabel, norm) => {
                return tooltipExtraKeyTable[rawKey] ||
                    tooltipExtraKeyTable[keyLabel] ||
                    tooltipExtraKeyTable[norm(keyLabel)] || [];
            },
            columns: [{
                key: 'devedor_implantado',
                label: 'Dev.Imp',
                type: 'int',
                align: 'text-center',
                total: true
            },
            {
                key: 'contrato_implantado',
                label: 'Ctr.Imp',
                type: 'int',
                align: 'text-center',
                total: true
            },
            {
                key: 'valor_implantado',
                label: 'Implantado',
                type: 'currency',
                align: 'text-right',
                decimals: 2,
                total: true
            },
            {
                key: 'ticket_medio',
                label: 'Ticket',
                type: 'currency',
                align: 'text-right',
                decimals: 2,
                total: true,
                formatTotal: (_sum, rows) => {
                    const totVal = rows.reduce((s, r) => s + (+r.valor_implantado || 0), 0);
                    const totCtr = rows.reduce((s, r) => s + (+r.contrato_implantado || 0), 0);
                    const v = totCtr ? (totVal / totCtr) : 0;
                    return 'R$ ' + new Intl.NumberFormat('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }).format(v);
                }
            },
            {
                key: 'valor_aberto',
                label: 'Aberto',
                type: 'currency',
                align: 'text-right',
                decimals: 2,
                total: true
            },
            {
                key: 'pct_aberto',
                label: '% Aberto',
                type: 'percent',
                align: 'text-center',
                decimals: 2,
                total: true,
                formatTotal: (_sum, rows) => {
                    const totAberto = rows.reduce((s, r) => s + (+r.valor_aberto || 0), 0);
                    const totImpl = rows.reduce((s, r) => s + (+r.valor_implantado || 0), 0);
                    const p = totImpl ? (totAberto / totImpl * 100) : 0;
                    return new Intl.NumberFormat('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }).format(p) + '%';
                }
            },
            {
                key: 'valor_recuperado',
                label: 'Recuperado',
                type: 'currency',
                align: 'text-right',
                decimals: 2,
                total: true
            },
            {
                key: 'pct_recuperado',
                label: '% Recup.',
                type: 'percent',
                align: 'text-center',
                decimals: 2,
                total: true,
                formatTotal: (_sum, rows) => {
                    const totRec = rows.reduce((s, r) => s + (+r.valor_recuperado || 0), 0);
                    const totImpl = rows.reduce((s, r) => s + (+r.valor_implantado || 0), 0);
                    const p = totImpl ? (totRec / totImpl * 100) : 0;
                    return new Intl.NumberFormat('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }).format(p) + '%';
                }
            },
            {
                key: 'valor_em_acordo',
                label: 'Em Acordo',
                type: 'currency',
                align: 'text-right',
                decimals: 2,
                total: true
            }, {
                key: 'valor_sem_acordo',
                label: 'Sem Acordo',
                type: 'currency',
                align: 'text-right',
                decimals: 2,
                total: true
            },
            ],
            table: {
                width: 900,
                maxHeight: 500,
                showTotalsRow: true,
                striped: false,
                compact: true,
                useFooterCallback: true,
                dataTable: {
                    enabled: true
                }
            }
        },
        tooltipExtraKey: tooltipExtraKey,
        tooltipMiniPie: {
            show: true,
            title: 'FASES COM MELHOR RECUPERAÇÃO',
            width: 500,
            height: 280,
            valueDecimals: 2,
            percentDecimals: 2
        }
    }).build();

}

function graficoPorContratos(ar_dados, id, title, subtitle = 'Aberto/Recebidos', decimal = 2, tipo_grafico = 'areaspline', rows) {

    let keys = Object.keys(ar_dados).sort();
    let key_ajust = keys.map(s => s.includes('->') ? s.split('->')[1].trim() : s);

    let implantado = keys.map(k => ar_dados[k].C);
    let aberto = keys.map(k => ar_dados[k].CA);
    let recebido = keys.map(k => ar_dados[k].C - ar_dados[k].CA);

    const tooltipExtraKey = Utilitarios.pieBreakdownBy(rows, {
        keyCol: 1, // DATA_IMPLANTACAO
        groupCol: 2, // FASE
        valueCol: '5-6', // CONTRATOS ABERTOS
        keyTransform: k => (k.includes('->') ? k.split('->')[1].trim() : k), // pra casar com key_ajust
        groupTransform: g => (String(g).includes('->') ? String(g).split('->')[1].trim() : g),
        // Opcional:
        topN: 6, // mantém só 8 maiores por key
        // minPct: 3  // agrupa <3% em "Outros"
    });

    const series_ar = [{
        name: 'Em Aberto',
        type: tipo_grafico,
        data: aberto,
        prefix: '',
        decimals: decimal
    },
    {
        name: 'Recebido',
        type: tipo_grafico,
        data: recebido,
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
            title: 'FASES COM MELHOR RECUPERAÇÃO',
            width: 380,
            height: 260,
            labelDistance: 16,
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

function criarGraficosRowKey(ar_dados, id, title, subtitle = 'Aberto/Em Negociação/Recebidos') {
    // 1. Pegar as chaves e ordenar (ano-mês)
    let keys = Object.keys(ar_dados).sort();
    let key_ajust = keys.map(s => s.includes('->') ? s.split('->')[1].trim() : s);
    // 2. Criar arrays separados
    let arrA = keys.map(k => ar_dados[k].A);
    let arrI = keys.map(k => ar_dados[k].I);
    let arrN = keys.map(k => ar_dados[k].N);
    let arrR = keys.map(k => ar_dados[k].R);
    let arrE = keys.map(k => (ar_dados[k].I > 0 ? (ar_dados[k].R / ar_dados[k].I * 100) : 0));
    let configGrafico1 = {
        containerId: id, // ID da div onde o gráfico será renderizado
        title: title,
        subtitle: subtitle,
        xAxisCategories: key_ajust,
        seriesData: [
            {
                name: 'Sem Acordo',
                type: 'column',
                data: arrA,
                decimals: 2,
                prefix: 'R$ ',
                suffix: '',
                position: 'left',
                axisGroup: 'moneyR',
                //axisTitle: 'Valores em Aberto(R$)'
            },
            {
                name: 'Com Acordo',
                type: 'column',
                data: arrN,
                decimals: 2,
                prefix: 'R$ ',
                suffix: '',
                position: 'left',
                axisGroup: 'moneyR2',
                //axisTitle: 'Valores em Aberto(R$)'
            },
            {
                name: 'Recuperado',
                type: 'column',
                data: arrR,
                decimals: 2,
                prefix: 'R$ ',
                suffix: '',
                position: 'right',
                axisGroup: 'moneyL',
                //axisTitle: 'Valores Recuperados(R$)'
            }
        ],
        exactMax: true,
        unifyYAxis: true,                 // ativa a unificação
        unifySource: 'overall',           // 'overall' | 'group' | 'series'
        //primaryAxisGroup: 'moneyR',       // se unifySource === 'group'
        //primarySeries: ['Sem Acordo']     // se unifySource === 'series'
    };
    CriarGraficos.createHighchartsDualAxes(configGrafico1);
}