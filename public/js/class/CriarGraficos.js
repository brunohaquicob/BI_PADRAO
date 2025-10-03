class CriarGraficos {

    static limparComponente(id) {
        $('#' + id).empty();
    }

    static criarDonutchart(containerId, seriesData, seriesName, title, subtitle, decimal = 0) {
        // Limpa o componente pelo ID
        this.limparComponente(containerId);

        // Cria o gráfico
        Highcharts.chart(containerId, {
            credits: false,
            exporting: { enabled: false },
            chart: {
                type: 'pie',
                custom: { selectedPoints: [], isCtrlPressed: false, totalLabel: null, hoverLabel: null },
                events: {
                    render() {
                        const chart = this;
                        const series = chart.series[0];

                        if (!chart.options.chart.custom) {
                            chart.options.chart.custom = { selectedPoints: [], isCtrlPressed: false, totalLabel: null, hoverLabel: null };
                        }
                        const custom = chart.options.chart.custom;

                        const total = series.data.reduce((sum, point) => sum + point.y, 0);

                        // Se não houver seleção, exibir o total geral
                        if (custom.selectedPoints.length === 0) {
                            if (custom.totalLabel) {
                                custom.totalLabel.destroy();
                            }

                            custom.totalLabel = chart.renderer.label(
                                `Total<br/><strong>${Highcharts.numberFormat(total, decimal, ',', '.')}</strong>`,
                                0, 0
                            )
                                .css({
                                    color: '#000',
                                    textAlign: 'center',
                                    fontWeight: 'bold'
                                })
                                .add();

                            // Centraliza no meio do donut
                            const x = chart.plotLeft + series.center[0] - (custom.totalLabel.getBBox().width / 2);
                            const y = chart.plotTop + series.center[1] - (custom.totalLabel.getBBox().height / 2);

                            custom.totalLabel.attr({ x, y });
                        }
                    }
                }
            },
            accessibility: { point: { valueSuffix: '%' } },
            title: { text: title },
            subtitle: { text: subtitle },
            tooltip: { enabled: false },
            legend: { enabled: false },
            plotOptions: {
                pie: {
                    innerSize: '65%',
                    borderWidth: 2,
                    dataLabels: {
                        enabled: true,
                        distance: 20,
                        format: '{point.name}'
                    },
                    point: {
                        events: {
                            mouseOver: function () {
                                const chart = this.series.chart;
                                const custom = chart.options.chart.custom;

                                if (!custom || custom.selectedPoints.length > 0) return;

                                const total = chart.series[0].data.reduce((sum, point) => sum + point.y, 0);
                                const percentage = (this.y / total * 100).toFixed(2);
                                const labelText = `<b>${Highcharts.numberFormat(this.y, decimal, ',', '.')}</b> (${percentage}%)`;

                                if (custom.hoverLabel) {
                                    custom.hoverLabel.destroy();
                                }

                                custom.hoverLabel = chart.renderer.label(labelText, 0, 0)
                                    .css({
                                        color: '#000',
                                        textAlign: 'center',
                                        fontWeight: 'bold'
                                    })
                                    .add();

                                // Centraliza no meio do donut
                                const x = chart.plotLeft + chart.series[0].center[0] - (custom.hoverLabel.getBBox().width / 2);
                                const y = chart.plotTop + chart.series[0].center[1] - (custom.hoverLabel.getBBox().height / 2);

                                custom.hoverLabel.attr({ x, y });

                                // Esconde o total enquanto o mouse está sobre um ponto
                                if (custom.totalLabel) {
                                    custom.totalLabel.hide();
                                }
                            },
                            mouseOut: function () {
                                const chart = this.series.chart;
                                const custom = chart.options.chart.custom;

                                if (!custom || custom.selectedPoints.length > 0) return;

                                if (custom.hoverLabel) {
                                    custom.hoverLabel.destroy();
                                    custom.hoverLabel = null;
                                }

                                // Reexibe o total quando o mouse sai do ponto
                                if (custom.totalLabel) {
                                    custom.totalLabel.show();
                                }
                            },
                            click: function (event) {
                                const chart = this.series.chart;
                                let custom = chart.options.chart.custom;

                                if (!custom) {
                                    chart.options.chart.custom = { selectedPoints: [], isCtrlPressed: false, totalLabel: null, hoverLabel: null };
                                    custom = chart.options.chart.custom;
                                }

                                let selectedPoints = custom.selectedPoints;

                                if (event.ctrlKey) {
                                    custom.isCtrlPressed = true;

                                    if (selectedPoints.includes(this)) {
                                        selectedPoints = selectedPoints.filter(p => p !== this);
                                        this.select(false, true);
                                    } else {
                                        selectedPoints.push(this);
                                        this.select(true, true);
                                    }
                                } else {
                                    chart.series[0].data.forEach(p => p.select(false, true));
                                    selectedPoints = [this];
                                    this.select(true, true);
                                }

                                custom.selectedPoints = selectedPoints;

                                if (custom.hoverLabel) {
                                    custom.hoverLabel.destroy();
                                    custom.hoverLabel = null;
                                }

                                if (custom.totalLabel) {
                                    custom.totalLabel.destroy();
                                    custom.totalLabel = null;
                                }

                                if (selectedPoints.length === 0) {
                                    chart.update({
                                        chart: { custom: { selectedPoints: [] } }
                                    });
                                    return;
                                }

                                const total = chart.series[0].data.reduce((sum, point) => sum + point.y, 0); // Total geral
                                const sumSelected = selectedPoints.reduce((sum, point) => sum + point.y, 0); // Soma dos selecionados
                                const percentage = (sumSelected / total * 100).toFixed(2); // Calcula a porcentagem

                                // Cria o label com a quantidade e a porcentagem
                                custom.totalLabel = chart.renderer.label(
                                    `Selecionado<br/><strong>${Highcharts.numberFormat(sumSelected, decimal, ',', '.')}</strong><br/><span style="font-size: 12px; color: #555;">(${percentage}%)</span>`,
                                    0, 0
                                )
                                    .css({
                                        color: '#000',
                                        textAlign: 'center',
                                        fontWeight: 'bold'
                                    })
                                    .add();

                                // Centraliza no meio do donut
                                const x = chart.plotLeft + chart.series[0].center[0] - (custom.totalLabel.getBBox().width / 2);
                                const y = chart.plotTop + chart.series[0].center[1] - (custom.totalLabel.getBBox().height / 2);

                                custom.totalLabel.attr({ x, y });
                            }
                        }
                    }
                }
            },
            series: [{
                name: seriesName,
                colorByPoint: true,
                data: seriesData
            }]
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Control") {
                Highcharts.charts.forEach(chart => {
                    if (chart && chart.options && chart.options.chart && chart.options.chart.custom) {
                        chart.options.chart.custom.isCtrlPressed = true;
                    }
                });
            }
        });

        document.addEventListener("keyup", function (e) {
            if (e.key === "Control") {
                Highcharts.charts.forEach(chart => {
                    if (chart && chart.options && chart.options.chart && chart.options.chart.custom) {
                        chart.options.chart.custom.isCtrlPressed = false;
                    }
                });
            }
        });
    }


    //Dual axes, line and column
    static createHighchartsDualAxes(config) {
        const {
            containerId, title, subtitle, xAxisCategories, seriesData,
            tooltipMode = 'total', chartHeight = null,
            unifyYAxis = false,
            unifySource = 'overall',
            primaryAxisGroup = null,
            primarySeries = [],
            exactMax = false        // <— NOVO
        } = config;

        let tickInterval = null;

        // helpers locais
        const getSerieVals = (s) => (s?.data || []).map(v => Array.isArray(v) ? +v[1] : +v).filter(Number.isFinite);
        const niceCeil = (n) => {
            if (!(n > 0)) return 0;
            const k = Math.pow(10, Math.floor(Math.log10(n)));
            const m = n / k;
            const step = m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10;
            return step * k;
        };
        const chooseTick = (max) => {
            if (!(max > 0)) return null;
            const bases = [1, 2, 2.5, 5], target = 5;
            const k = Math.pow(10, Math.floor(Math.log10(max)));
            let best = null, bestDiff = 1e9;
            for (const b of bases) for (const m of [k / 10, k, k * 10]) {
                const step = b * m, ticks = Math.ceil(max / step), diff = Math.abs(ticks - target);
                if (diff < bestDiff) { bestDiff = diff; best = step; }
            }
            return best || k;
        };

        // 1) Descobrir grupos de eixos
        const axisGroups = [];
        seriesData.forEach(s => {
            const group = s.axisGroup || 'default';
            if (!axisGroups.includes(group)) axisGroups.push(group);
        });

        // 1.1) Calcular o max comum (opcional, inicial)
        let commonMax = null;
        if (unifyYAxis) {
            let baseSeries = seriesData;
            if (unifySource === 'group' && primaryAxisGroup) {
                baseSeries = seriesData.filter(s => (s.axisGroup || 'default') === primaryAxisGroup);
            } else if (unifySource === 'series' && primarySeries?.length) {
                const set = new Set(primarySeries);
                baseSeries = seriesData.filter(s => set.has(s.name));
            } // 'overall' => usa todas

            const rawMax = Math.max(0, ...baseSeries.flatMap(getSerieVals));
            const padded = rawMax * 1.10;
            commonMax = exactMax ? padded : niceCeil(padded);
            if (commonMax === 0) commonMax = null;
            // Em modo exato, não fixe tickInterval (deixe o Highcharts decidir)
            tickInterval = exactMax ? null : chooseTick(commonMax);

        }

        // 2) Criar yAxis dinamicamente
        const yAxis = axisGroups.map((group, idx) => {
            const serie = seriesData.find(s => (s.axisGroup || 'default') === group);
            return {
                id: group,
                labels: {
                    style: { color: Highcharts.getOptions().colors[idx] },
                    formatter: function () {
                        const serie = seriesData.find(s => (s.axisGroup || 'default') === group);
                        const dec = serie?.decimals ?? 0;
                        return Highcharts.numberFormat(this.value, dec);
                    }
                },
                title: {
                    text: serie.axisTitle || serie.name,
                    style: { color: Highcharts.getOptions().colors[idx] }
                },
                opposite: serie.position === 'right',
                ...(unifyYAxis && commonMax ? {
                    max: commonMax,
                    ceiling: commonMax,
                    endOnTick: false,
                    startOnTick: true,
                    maxPadding: 0.02,
                    // ↓ adicionados
                    min: 0,                // ou use softMin: 0 se preferir flexibilidade
                    tickAmount: 5,         // sugere ~5 divisões pra garantir labels no 1º render
                    ...(tickInterval ? { tickInterval } : {})
                } : {})
            };
        });

        // 3) Mapear séries para seus eixos
        const series = seriesData.map(serie => ({
            name: serie.name,
            type: serie.type || 'line',
            yAxis: axisGroups.indexOf(serie.axisGroup || 'default'),
            data: serie.data,
            axisGroup: serie.axisGroup || 'default',
            decimals: serie.decimals ?? 0,
            prefix: serie.prefix || '',
            suffix: serie.suffix || '',
            tooltip: { valueSuffix: serie.format || '' }
        }));

        // função local para recalcular teto considerando séries visíveis
        const recalcAndApply = (chart) => {
            if (!unifyYAxis) return;
            let base = chart.series.filter(s => s.visible && !s.isInternal);
            if (unifySource === 'group' && primaryAxisGroup) {
                base = base.filter(s => (s.userOptions.axisGroup || 'default') === primaryAxisGroup);
            } else if (unifySource === 'series' && Array.isArray(primarySeries) && primarySeries.length) {
                const set = new Set(primarySeries);
                base = base.filter(s => set.has(s.name));
            }
            if (!base.length) {
                chart.yAxis.forEach(ax => ax.update({ max: null, ceiling: null, tickInterval: null }, false));
                chart.redraw(false);                 // <— ADD
                return;
            }
            const arrMax = base.flatMap(s => (Array.isArray(s.yData) && s.yData.length ? s.yData : s.userOptions.data || []))
                .map(v => Array.isArray(v) ? +v[1] : +v)
                .filter(Number.isFinite);
            const rawMax = Math.max(0, ...arrMax);
            if (!(rawMax > 0)) {
                chart.yAxis.forEach(ax => ax.update({ max: null, ceiling: null, tickInterval: null }, false));
                chart.redraw(false);                 // <— ADD
                return;
            }
            const padded = rawMax * 1.10;
            const newMax = exactMax ? padded : niceCeil(padded);
            const ti = exactMax ? null : chooseTick(newMax);
            chart.yAxis.forEach(ax => ax.update({
                max: newMax,
                ceiling: newMax,
                endOnTick: false,
                startOnTick: true,
                maxPadding: 0.02,
                min: 0,
                tickAmount: 5,
                ...(ti ? { tickInterval: ti } : {}),
                ...(ax.options?.softMin === undefined ? { softMin: 0 } : {})
            }, false));

            chart.redraw(false);                   // <— ADD AQUI TAMBÉM
        }

        // 4) Render
        Highcharts.chart(containerId, {
            chart: {
                alignTicks: false,
                zooming: { type: '', mouseWheel: false, singleTouch: false },
                panning: false,
                height: chartHeight || undefined,
                events: {
                    load: function () {
                        const c = this;
                        (window.requestAnimationFrame || setTimeout)(() => recalcAndApply(c), 0); // <— ADJUST
                    }
                }
            },
            title: { text: title, align: 'left' },
            subtitle: { text: subtitle, align: 'left' },
            credits: false,
            xAxis: [{ categories: xAxisCategories, crosshair: true }],
            yAxis,
            plotOptions: {
                series: {
                    events: {
                        show: function () { recalcAndApply(this.chart); },
                        hide: function () { recalcAndApply(this.chart); }
                    }
                }
            },
            tooltip: {
                shared: true,
                useHTML: true,
                borderWidth: 0,
                formatter: function () {
                    const fmtNumber = (v, dec) =>
                        new Intl.NumberFormat('pt-BR', {
                            minimumFractionDigits: dec ?? 0,
                            maximumFractionDigits: dec ?? 0
                        }).format(v);

                    let html = `<div class="panel panel-default" style="min-width:230px;margin:0;">
                    <div class="panel-heading" style="font-weight:bold; text-align:center; padding:5px 10px;">
                        ${this.key}
                    </div>
                    <div class="list-group" style="margin:0;">`;

                    let total = 0;
                    if (tooltipMode === 'total') {
                        total = this.points.reduce((sum, p) => sum + (p.y || 0), 0);
                    }

                    this.points.forEach(point => {
                        const uo = point.series.userOptions || {};
                        const dec = uo.decimals ?? 0;
                        const valueStr = fmtNumber(point.y, dec);
                        const suffix = uo.suffix || '';
                        const prefix = uo.prefix || '';

                        let extra = '';
                        if (tooltipMode === 'total') {
                            const perc = total ? (point.y / total * 100) : 0;
                            const percStr = perc.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                            extra = ` <small class="text-muted">(${percStr}%)</small>`;
                        }

                        html += `<div class="list-group-item" style="display:flex;justify-content:space-between;align-items:center;padding:5px 10px;">
                            <span><span style="color:${point.color}">\u25CF</span> ${point.series.name}</span>
                            <span>&nbsp;&nbsp;<b>${prefix}${valueStr}${suffix}</b>${extra}</span>
                        </div>`;
                    });

                    if (tooltipMode === 'total') {
                        const totalStr = fmtNumber(total, 2);
                        html += `<div class="list-group-item" style="font-weight:bold;text-align:right;">Total: ${totalStr}</div>`;
                    }

                    html += `</div></div>`;
                    return html;
                }
            },
            legend: {
                align: 'left',
                verticalAlign: 'top',
                backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || 'rgba(255,255,255,0.25)'
            },
            series
        });
    }

    //
    /**
     * Requer:
     *  <script src="https://code.highcharts.com/highcharts.js"></script>
     *  <script src="https://code.highcharts.com/modules/funnel.js"></script>
     */
    static createHighchartsFunnel(config) {
        const {
            containerId,
            title = '',
            subtitle = '',
            data = [],                // [{ name, value, color? }]
            decimals = 0,
            prefix = '',
            suffix = '',
            locale = 'pt-BR',
            colors = null,            // opcional: ['#...', '#...'] – sobrescreve as cores padrão
            disableZoom = true
        } = config;

        // Prepara pontos (permite cor por etapa)
        const seriesData = data.map(d => ({
            name: d.name,
            y: d.value,
            color: d.color // se existir, Highcharts usa
        }));

        Highcharts.chart(containerId, {
            chart: {
                type: 'funnel',
                backgroundColor: 'transparent',
                ...(disableZoom ? {
                    zooming: { type: '', mouseWheel: false, singleTouch: false },
                    panning: false
                } : {})
            },
            title: { text: title },
            subtitle: { text: subtitle },
            credits: { enabled: false },
            exporting: { enabled: false },
            tooltip: {
                useHTML: true,
                formatter: function () {
                    const first = this.series.data[0]?.y ?? 0;           // total considerado = primeira etapa
                    const idx = this.point.index;
                    const prev = idx > 0 ? this.series.data[idx - 1].y : null;

                    const fmt = (v) => new Intl.NumberFormat(locale, {
                        minimumFractionDigits: decimals,
                        maximumFractionDigits: decimals
                    }).format(v);

                    const pctTotal = first ? (this.y / first * 100).toFixed(1) : '0.0';
                    const pctStep = prev ? (this.y / prev * 100).toFixed(1) : '100.0';

                    return `
                    <div style="min-width:180px">
                        <b>${this.key}</b><br/>
                        Valor: <b>${prefix}${fmt(this.y)}${suffix}</b><br/>
                        % do total: <b>${pctTotal}%</b><br/>
                        ${prev !== null ? `% da etapa anterior: <b>${pctStep}%</b>` : ''}
                    </div>
                    `;
                    // return `
                    // <div>
                    //     <b>${this.key}</b>
                    // </div>
                    // `;
                }
            },

            plotOptions: {
                series: {
                    width: '80%',
                    height: '80%',
                    neckWidth: '30%',
                    neckHeight: '25%',
                    borderWidth: 0,
                    colorByPoint: true, // cada ponto pode ter sua própria cor (ou usa defaults)
                    dataLabels: {
                        enabled: true,
                        softConnector: true,
                        style: {
                            color: '#111',
                            textOutline: 'none',
                            fontSize: '13px',
                            fontWeight: 600
                        },
                        formatter: function () {
                            const first = this.series.data[0]?.y ?? 0;
                            const idx = this.point.index;
                            const prev = idx > 0 ? this.series.data[idx - 1].y : null;

                            const fmt = (v) => new Intl.NumberFormat(locale, {
                                minimumFractionDigits: decimals,
                                maximumFractionDigits: decimals
                            }).format(v);

                            const pctTotal = first ? (this.y / first * 100).toFixed(1) : '0.0';
                            const pctStep = prev ? (this.y / prev * 100).toFixed(1) : '100.0';

                            // return `${this.key}: <b>${prefix}${fmt(this.y)}${suffix}</b> • ${pctTotal}%${prev ? ` • ${pctStep}% etapa` : ''}`;
                            return `${this.key}`;
                        }
                    }
                }
            },

            // Se quiser controlar as cores via parâmetro
            ...(colors ? { colors } : {}),

            series: [{
                name: title || 'Funil',
                data: seriesData
            }]
        });
    }

}

class DashboardModelo1Builder {
    constructor({
        divContainerId,
        containerId,
        textTitle,
        kpis = [],
        pieChartData = [],
        pieChartConfig = {},
        assigneeData = {},
        columnChartConfig = {},
        areaChartConfig = {},
        columnHeaders = [],
        cumulativeData = [],
        decimal = 2,
        blocos = [],
    }) {
        this.divContainerId = divContainerId;
        this.containerId = containerId;
        this.textTitle = textTitle;
        this.kpis = kpis;
        this.pieChartData = pieChartData;
        this.pieChartConfig = pieChartConfig;
        this.assigneeData = assigneeData;
        this.columnChartConfig = columnChartConfig;
        this.areaChartConfig = areaChartConfig;
        this.columnHeaders = columnHeaders;
        this.cumulative = cumulativeData;
        this.decimal = decimal;
        this.blocos = blocos;
        this.init();
    }

    capitalize(str) {
        if (typeof str !== 'string') return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    init() {
        Highcharts.setOptions({
            chart: { styledMode: true },
            credits: { enabled: false },
            title: { text: '' },
            lang: {
                decimalPoint: ',',
                thousandsSep: '.'
            }
        });

        const componentesFixos = [
            this.criarHtml(this.divContainerId, this.containerId, this.textTitle),
            this.createKpiContainers(),
            ...this.kpiComponents(),
            ...this.cumulative.map(item =>
                this.areaChartComponent(
                    item.id,
                    item.renderTo,
                    item.header,
                    item.title,
                    item.titleY,
                    item.valueSuffix,
                    item.plotLines
                )
            )
        ];

        const blocosComponentes = this.blocos.flatMap((bloco, index) => [
            this.pieChartComponent(bloco.pieChartData, bloco.pieChartConfig, index),
            this.columnChartComponent(bloco.assigneeData)
        ]);

        Dashboards.board(this.containerId, {
            dataPool: {
                connectors: [...this.cumulative.map(item => ({
                    id: item.id,
                    type: 'JSON',
                    options: {
                        data: [item.header, ...item.data]
                    }
                }))]
            },
            components: [
                ...componentesFixos,
                ...blocosComponentes
            ]
        });

        setTimeout(() => this.animarKpis(), 500);
    }


    kpiComponents() {
        return this.kpis.map(kpi => ({
            renderTo: kpi.renderTo,
            type: 'KPI',
            title: kpi.title,
            subtitle: kpi.subtitle,
            value: Highcharts.numberFormat(kpi.value, kpi.decimal || this.decimal, ',', '.')
        }));
    }

    animarKpis() {
        this.kpis.forEach(kpi => {
            const kpiContainer = document.getElementById(kpi.renderTo);
            if (!kpiContainer) return;

            const valorSpan = kpiContainer.querySelector('.highcharts-dashboards-component-kpi-value');
            if (!valorSpan) return;

            $(valorSpan).prop("number", 0).animateNumber(
                {
                    number: kpi.value,
                    numberStep: (now, tween) => {
                        const formatted = this.doubleToMoney(now, kpi.decimal || this.decimal);
                        $(valorSpan).text(formatted);
                    }
                },
                {
                    duration: 2000,
                    easing: "swing"
                }
            );
        });
    }

    doubleToMoney(valor, casas = 2) {
        return Number(valor).toLocaleString('pt-BR', {
            minimumFractionDigits: casas,
            maximumFractionDigits: casas
        });
    }



    createKpiContainers() {
        const sprintContainer = document.getElementById('current-sprint');

        if (!sprintContainer) return;

        this.kpis = this.kpis.filter((kpi, index) => {
            if (kpi.value !== null && kpi.value !== undefined) {
                const cell = document.createElement('div');
                cell.className = 'cellDash dashLinha1';
                cell.id = `dashboard-kpi-${index + 1}`;
                kpi.renderTo = cell.id;
                sprintContainer.appendChild(cell);
                return true;
            }
            return false;
        });
    }

    criarHtml(divContainerId, containerId, textTitle = 'ACOMPANHAMENTO DE ACORDOS') {
        const container = document.getElementById(divContainerId);
        if (!container) {
            console.warn(`Elemento com ID "${divContainerId}" não encontrado.`);
            return;
        }

        // Limpa o conteúdo anterior (opcional)
        container.innerHTML = '';

        // Cria o header
        const header = document.createElement('div');
        header.className = 'dashboard-header';

        const title = document.createElement('h2');
        title.className = 'dashboard-title';
        title.textContent = textTitle;

        const desc = document.createElement('p');
        desc.className = 'dashboard-description';

        header.appendChild(title);
        header.appendChild(desc);

        // Cria o container principal
        const mainContainer = document.createElement('div');
        mainContainer.id = containerId;
        mainContainer.className = "containerClasse";

        // Linha 1 - Sprint KPI
        const row1 = document.createElement('div');
        row1.className = 'rowDash';

        const cell1 = document.createElement('div');
        cell1.className = 'cellDash';
        cell1.id = 'current-sprint-kpi';

        const innerRow1 = document.createElement('div');
        innerRow1.className = 'rowDash';
        innerRow1.id = 'current-sprint';

        cell1.appendChild(innerRow1);
        row1.appendChild(cell1);
        mainContainer.appendChild(row1);
        // Linha 2 - Charts 0 e 1
        this.blocos.forEach((_, index) => {
            const row = document.createElement('div');
            row.className = 'rowDash';

            const pie = document.createElement('div');
            pie.className = 'cellDash dashLinha21';
            pie.id = `dashboard-chart-${index}-0`;

            const col = document.createElement('div');
            col.className = 'cellDash dashLinha2';
            col.id = `dashboard-chart-${index}-1`;

            row.appendChild(pie);
            row.appendChild(col);
            mainContainer.appendChild(row);
        });

        // Linha 3 - Chart 2
        const row3 = document.createElement('div');
        row3.className = 'rowDash';

        const chart2 = document.createElement('div');
        chart2.className = 'cellDash dashLinha3';
        chart2.id = 'dashboard-chart-2';

        row3.appendChild(chart2);

        mainContainer.appendChild(row3);
        // Linha 4 - Chart 3
        const row4 = document.createElement('div');
        row4.className = 'rowDash';

        const chart3 = document.createElement('div');
        chart3.className = 'cellDash dashLinha3';
        chart3.id = 'dashboard-chart-3';

        row4.appendChild(chart3);

        // Junta tudo

        mainContainer.appendChild(row4);

        container.appendChild(header);
        container.appendChild(mainContainer);
    }


    pieChartComponent(pieChartData, pieChartConfig, index = 0) {
        return {
            renderTo: pieChartConfig.renderTo,
            type: 'Highcharts',
            title: pieChartConfig.title,
            chartOptions: {
                series: [{
                    type: 'pie',
                    keys: ['name', 'y'],
                    innerSize: '50%',
                    size: '90%',
                    center: ['40%', '50%'],
                    showInLegend: true,
                    dataLabels: {
                        enabled: true,
                        formatter: function () {
                            // Limita a 10 caracteres + reticências
                            let name = this.point.name;
                            if (name.length > 12) {
                                name = name.substring(0, 12) + '…';
                            }
                            return `${name}<br>(${Highcharts.numberFormat(this.percentage, 2)}%)`;
                        }
                    },
                    data: pieChartData
                }],
                legend: {
                    enabled: true,
                    align: 'right',
                    verticalAlign: 'center',
                    layout: 'vertical',
                    itemStyle: {
                        textOverflow: "ellipsis",
                        width: 100 // largura máxima do texto dentro da legenda
                    },
                    labelFormatter: function () {
                        return this.name.length > 12 ? this.name.substring(0, 12) + '…' : this.name;
                    }
                },
                tooltip: {
                    headerFormat: '',
                    pointFormatter: function () {
                        const formatted = Highcharts.numberFormat(this.y, this.series.chart.options.custom.decimal, ',', '.');
                        return `<span style="color:${this.color}">\u25CF</span> ${this.name}: <b>${formatted}</b><br/>`;
                    }
                },
                custom: { decimal: this.decimal },
                responsive: {
                    rules: [{
                        condition: { maxWidth: 450 },
                        chartOptions: {
                            chart: { marginRight: 0 },
                            legend: {
                                align: 'center',
                                verticalAlign: 'bottom',
                                layout: 'horizontal'
                            },
                            series: [{
                                size: '100%'  // no mobile pode crescer de novo
                            }]
                        }
                    }]
                }
            }
        };
    }


    columnChartComponent(assigneeData) {
        const categories = Object.keys(assigneeData.data);
        const columnName = assigneeData.columnName;

        // Descobre o índice da coluna "pago" dinamicamente
        const pagoIndex = columnName.findIndex(name => name.toLowerCase() === 'pago');
        const abertoIndex = columnName.findIndex(name => name.toLowerCase() === 'aberto');

        if (pagoIndex === -1) {
            console.warn("Coluna 'pago' não encontrada. efetividade não será calculada.");
        }

        // Cria as séries de colunas normalmente
        const seriesData = columnName.map((name, index) => ({
            name: this.capitalize(name),
            data: Object.values(assigneeData.data).map(row => row[index]),
            type: 'column'
        }));

        // Adiciona a série de conversão, se "pago" foi encontrado
        if (pagoIndex !== -1) {
            const efetividade = Object.values(assigneeData.data).map(row => {
                const total = row.reduce((a, b) => a + b, 0);
                // return total > 0 ? +(row[pagoIndex] / (total - row[abertoIndex]) * 100).toFixed(2) : 0;
                return total > 0 ? +(row[pagoIndex] / (total) * 100).toFixed(2) : 0;
            });

            seriesData.push({
                name: 'efetividade',
                data: efetividade,
                type: 'line',
                yAxis: 1,
                tooltip: { valueSuffix: '%' },
                marker: {
                    lineWidth: 2,
                    lineColor: Highcharts.getOptions().colors[3],
                    fillColor: 'white'
                }
            });
        }

        return {
            renderTo: assigneeData.renderTo,
            title: assigneeData.title,
            type: 'Highcharts',
            chartOptions: {
                chart: { type: 'column' },
                xAxis: {
                    categories: categories,
                    crosshair: true,
                    labels: {
                        style: {
                            width: '80px', // limite do container virtual
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap'
                        },
                        formatter: function () {
                            return this.value.length > 15 ? this.value.substring(0, 15) + '…' : this.value;
                        }
                    }
                },
                yAxis: [{
                    title: { text: 'Quantidade' }
                }, {
                    title: { text: 'efetividade (%)' },
                    opposite: true
                }],
                legend: {
                    itemStyle: {
                        textOverflow: "ellipsis",
                        width: 100 // largura máxima do texto dentro da legenda
                    },
                    labelFormatter: function () {
                        return this.name.length > 15 ? this.name.substring(0, 15) + '…' : this.name;
                    }
                },
                tooltip: {
                    shared: true,
                    formatter: function () {
                        let tooltip = `<b>${this.category}</b><br/>`;
                        this.points.forEach(point => {
                            const isConversao = point.series.name === 'efetividade';
                            const value = Highcharts.numberFormat(
                                point.y,
                                isConversao ? 2 : (this.series.chart.options.custom.decimal ?? 2),
                                ',',
                                '.'
                            );
                            tooltip += `<span style="color:${point.color}">\u25CF</span> ${point.series.name}: <b>${value}${isConversao ? '%' : ''}</b><br/>`;
                        });
                        return tooltip;
                    }
                },
                plotOptions: {
                    column: {
                        borderRadius: 4,
                        pointPadding: 0.1,
                        groupPadding: 0.1
                    }
                },
                series: seriesData,
                custom: {
                    decimal: this.decimal
                }
            }
        };
    }


    areaChartComponent(id, renderTo, columnHeaders, title, titleY = 'Quantidade/Valor Acordos', valueSuffix = ' acordos', plotLine = '') {
        return {
            renderTo: renderTo,
            type: 'Highcharts',
            title: title,
            connector: {
                id: id,
                columnAssignment: columnHeaders.slice(1).map(col => ({
                    seriesId: col,
                    data: [columnHeaders[0], col]
                }))
            },
            chartOptions: {
                chart: { type: 'area' },
                plotOptions: {
                    series: {
                        stacking: 'normal',
                        label: { enabled: true, useHTML: true }
                    }
                },
                xAxis: {
                    type: 'datetime',
                    plotLines: plotLine
                },
                yAxis: {
                    title: { text: titleY }
                },
                legend: {
                    enabled: true,
                    align: 'left',
                    verticalAlign: 'top'
                },
                tooltip: {
                    shared: true,
                    xDateFormat: '%A, %e %b %Y',
                    formatter: function () {
                        let tooltip = `<b>${Highcharts.dateFormat('%A, %e %b %Y', this.x)}</b><br/>`;
                        this.points.forEach(point => {
                            const value = Highcharts.numberFormat(point.y, this.series.chart.options.custom.decimal, ',', '.');
                            tooltip += `<span style="color:${point.color}">\u25CF</span> ${point.series.name}: <b>${value}${valueSuffix}</b><br/>`;
                        });
                        return tooltip;
                    }
                },
                custom: {
                    decimal: this.decimal
                }
            }
        };
    }

}

class HighchartsFlexible {
    constructor(options) {
        this.options = Object.assign({
            container: 'container',
            chartType: 'spline',
            title: '',
            subtitle: '',
            colors: ['#6CF', '#39F', '#06C', '#036', '#000'],
            xAxis: {
                type: 'datetime', // 'datetime' | 'category' | 'linear'
                title: 'X Axis',
                dateTimeLabelFormats: {
                    month: '%e. %b',
                    year: '%b'
                },
                categories: null // se for category
            },
            yAxis: {
                title: 'Y Axis',
                min: 0
            },
            tooltip: {
                decimals: 2
            },
            plotOptions: {
                series: {
                    marker: {
                        symbol: 'circle',
                        fillColor: 'var(--highcharts-background-color, #ffffff)',
                        enabled: true,
                        radius: 2.5,
                        lineWidth: 1,
                        lineColor: null
                    }
                }
            },
            series: []
        }, options);
    }

    build() {
        const cfg = {
            chart: { type: this.options.chartType },
            title: { text: this.options.title },
            subtitle: { text: this.options.subtitle },
            // colors: this.options.colors,
            ...(this.options.colors ? { colors } : {}),
            xAxis: this._buildXAxis(),
            yAxis: this.options.yAxis,
            tooltip: this._buildTooltip(),
            plotOptions: this.options.plotOptions,
            series: this._prepareSeries()
        };

        this.chart = Highcharts.chart(this.options.container, cfg);
        return this.chart;
    }

    _buildXAxis() {
        const x = this.options.xAxis;
        const base = { title: { text: x.title || '' } };

        if (x.type === 'datetime') {
            return Object.assign({}, base, {
                type: 'datetime',
                dateTimeLabelFormats: x.dateTimeLabelFormats || {
                    month: '%e. %b',
                    year: '%b'
                }
            });
        }

        if (x.type === 'category') {
            return Object.assign({}, base, {
                type: 'category',
                categories: x.categories || []
            });
        }

        return Object.assign({}, base, { type: 'linear' });
    }

    _prepareSeries() {
        const xType = this.options.xAxis.type;
        return this.options.series.map(s => {
            if (!s.data) s.data = [];
            if (xType === 'datetime') {
                s.data = s.data.map(([x, y]) => [Date.parse(x), y]);
            }
            return s;
        });
    }

    _buildTooltip() {
        const decimals = this.options.tooltip.decimals;
        const seriesMeta = this.options.series; // para prefix/suffix/decimals
        const xType = this.options.xAxis.type;

        return {
            shared: true,
            useHTML: true,
            borderWidth: 0,
            formatter: function () {
                const total = this.points.reduce((sum, p) => sum + (p.y || 0), 0);
                const fmtNumber = (v, dec) =>
                    new Intl.NumberFormat('pt-BR', {
                        minimumFractionDigits: dec ?? 0,
                        maximumFractionDigits: dec ?? 0
                    }).format(v);

                // Label do eixo X
                let keyLabel = this.key;
                if (xType === 'datetime') {
                    keyLabel = Highcharts.dateFormat('%e. %b %Y', this.x);
                }

                let html = `<div class="panel panel-default" style="min-width:230px;margin:0;">
                  <div class="panel-heading" style="font-weight:bold; text-align:center; padding:5px 10px;">
                    ${keyLabel}
                  </div>
                  <div class="list-group" style="margin:0;">`;

                this.points.forEach(point => {
                    const serie = seriesMeta.find(s => s.name === point.series.name) || {};
                    const dec = serie.decimals ?? decimals;
                    const valueStr = fmtNumber(point.y, dec);
                    const perc = total ? (point.y / total * 100) : 0;
                    const percStr = perc.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    const suffix = serie.suffix || '';
                    const prefix = serie.prefix || '';

                    html += `<div class="list-group-item" style="display:flex;justify-content:space-between;align-items:center;padding:5px 10px;">
                        <span><span style="color:${point.color}">\u25CF</span> ${point.series.name}</span>
                        <span>&nbsp;&nbsp;<b>${prefix}${valueStr}${suffix}</b> <small class="text-muted">(${percStr}%)</small></span>
                        </div>`;
                });

                const totalStr = fmtNumber(total, 2);
                html += `<div class="list-group-item" style="font-weight:bold;text-align:right;">Total: ${totalStr}</div>`;
                html += `</div></div>`;
                return html;
            }
        };
    }
}

class HighchartsFlexible2 {
    constructor(options) {
        this.options = Object.assign({
            container: 'container',
            chartType: 'spline',
            title: '',
            subtitle: '',
            seriesPerc: null, // ← default
            colors: null, //['#6CF', '#39F', '#06C', '#036', '#000'],
            xAxis: {
                type: 'datetime', // 'datetime' | 'category' | 'linear'
                title: 'X Axis',
                dateTimeLabelFormats: {
                    month: '%e. %b',
                    year: '%b'
                },
                categories: null // se for category
            },
            yAxis: {
                title: 'Y Axis',
                min: 0
            },
            tooltip: {
                decimals: 2
            },
            plotOptions: {
                series: {
                    marker: {
                        symbol: 'circle',
                        fillColor: 'var(--highcharts-background-color, #ffffff)',
                        enabled: true,
                        radius: 2.5,
                        lineWidth: 1,
                        lineColor: null
                    }
                }
            },
            series: []
        }, options);
    }

    build() {
        const cfg = {
            chart: { type: this.options.chartType },
            title: { text: this.options.title },
            subtitle: { text: this.options.subtitle },
            ...(this.options.colors ? { colors: this.options.colors } : {}),
            xAxis: this._buildXAxis(),
            yAxis: this.options.yAxis,
            tooltip: this._buildTooltip(),
            plotOptions: this.options.plotOptions,
            series: this._prepareSeries()
        };

        this.chart = Highcharts.chart(this.options.container, cfg);

        Highcharts.addEvent(this.chart.tooltip, 'hide', () => {
            if (this._miniPieChart) {
                try { this._miniPieChart.destroy(); } catch (_) { }
                this._miniPieChart = null;
                this._miniPieKey = null;
            }
        });
        return this.chart;
    }

    _buildXAxis() {
        const x = this.options.xAxis;
        const base = { title: { text: x.title || '' } };

        if (x.type === 'datetime') {
            return Object.assign({}, base, {
                type: 'datetime',
                dateTimeLabelFormats: x.dateTimeLabelFormats || {
                    month: '%e. %b',
                    year: '%b'
                }
            });
        }

        if (x.type === 'category') {
            return Object.assign({}, base, {
                type: 'category',
                categories: x.categories || []
            });
        }

        return Object.assign({}, base, { type: 'linear' });
    }

    _prepareSeries() {
        const xType = this.options.xAxis.type;
        return this.options.series.map(s => {
            if (!s.data) s.data = [];
            if (xType === 'datetime') {
                s.data = s.data.map(([x, y]) => [Date.parse(x), y]);
            }
            return s;
        });
    }

    _buildTooltip() {
        const seriesMeta = this.options.series;
        const xType = this.options?.xAxis?.type ?? 'category';
        const seriesPerc = this.options.seriesPerc || [];
        const defaultDecimals = this.options?.tooltip?.decimals ?? 2;

        const extraByKey = this.options.tooltipExtraKey || null;
        const pieOpts = Object.assign({
            show: true,
            title: null,
            width: 210,
            height: 140,
            cardMinWidth: 340,
            dataLabelsDecimals: 0,
            legend: false,
            nameMaxChars: 6,
            outsideDistance: 12,
            insideDistance: -34
        }, this.options.tooltipMiniPie || {});

        const self = this;
        this._miniPieChart = null;
        this._miniPieKey = null;
        // >>> inicializa UID AQUI (antes de usar no pieId)
        this._uid = this._uid || Math.random().toString(36).slice(2);

        // normalizador de chave
        const norm = s => String(s ?? '')
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();

        // mapa normalizado (cria 1x)
        const getExtraForKey = (k) => {
            if (!extraByKey) return null;
            if (!self._extraNormMap) {
                self._extraNormMap = {};
                Object.keys(extraByKey).forEach(key => {
                    self._extraNormMap[norm(key)] = extraByKey[key];
                });
            }
            return extraByKey[k] || extraByKey[String(k)] || self._extraNormMap[norm(k)] || null;
        };

        return {
            shared: true,
            useHTML: true,
            borderWidth: 0,
            outside: true,
            formatter: function () {
                const fmtNumber = (v, dec) =>
                    new Intl.NumberFormat('pt-BR', {
                        minimumFractionDigits: dec ?? 0,
                        maximumFractionDigits: dec ?? 0
                    }).format(v);

                const rawKey = (xType === 'datetime') ? this.x : this.key;
                let keyLabel = this.key;
                if (xType === 'datetime') keyLabel = Highcharts.dateFormat('%e. %b %Y', this.x);

                let totalGeral = 0, totalBase = 0;
                const pontos = [];
                this.points.forEach(p => {
                    totalGeral += (p.y || 0);
                    const isBase = seriesPerc.includes(p.series.name);
                    if (!isBase) totalBase += (p.y || 0);
                    pontos.push({ ...p, isBase });
                });

                // resolve dados extras pela key
                const dataObjResolved = getExtraForKey(rawKey) || getExtraForKey(keyLabel);
                const entries = Object.entries(dataObjResolved || {});
                console.log()
                const totalPie = entries.reduce((s, [, v]) => s + (+v || 0), 0);
                const hasExtra = pieOpts.show && entries.length && totalPie > 0;

                // id único por instância + key
                const pieId = `hc-mini-pie-${self._uid}-${self._slug(rawKey)}`;

                // HTML
                let html = `
                <div class="card shadow-sm small" style="min-width:${pieOpts.cardMinWidth}px;margin:0;">
                    <div class="card-header py-1 text-center font-weight-bold">${keyLabel}</div>
                    <ul class="list-group list-group-flush">`;

                pontos.forEach(point => {
                    const serie = seriesMeta.find(s => s.name === point.series.name) || {};
                    const dec = serie.decimals ?? defaultDecimals;
                    const valueStr = fmtNumber(point.y, dec);
                    const suffix = serie.suffix || '';
                    const prefix = serie.prefix || '';

                    let percStr = '';
                    if (!point.isBase && totalBase) {
                        const perc = (point.y / totalBase * 100);
                        percStr = `<small class="text-muted">(${perc.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%)</small>`;
                    }

                    html += `
                        <li class="list-group-item d-flex justify-content-between align-items-center py-1">
                            <span><span style="color:${point.color}">\u25CF</span> ${point.series.name}</span>
                            <span><b>${prefix}${valueStr}${suffix}</b> ${percStr}</span>
                        </li>`;
                });

                if (!seriesPerc?.length) {
                    const totalStr = fmtNumber(totalGeral, defaultDecimals);
                    html += `<li class="list-group-item text-right"><b>Total:</b> ${totalStr}</li>`;
                }

                if (hasExtra) {
                    const titleHtml = pieOpts.title ? `<div class="small text-muted mb-1 text-center">${pieOpts.title}</div>` : '';
                    html += `
                    <li class="list-group-item">
                        ${titleHtml}
                        <div id="${pieId}" style="width:${pieOpts.width}px;height:${pieOpts.height}px;margin:0 auto;"></div>
                    </li>`;
                }

                html += `</ul></div>`;

                // render do mini-pie (com retry)
                if (hasExtra) {
                    const data = entries.map(([name, val]) => ({ name, y: Number(val) || 0 }));
                    const cacheKey = `${self.options.container}|${rawKey}`;

                    const renderPie = (tries = 15) => {
                        const el = document.getElementById(pieId);
                        if (!el) { if (tries > 0) return setTimeout(() => renderPie(tries - 1), 16); return; }

                        if (self._miniPieChart && self._miniPieKey !== cacheKey) {
                            try { self._miniPieChart.destroy(); } catch (_) { }
                            self._miniPieChart = null;
                        }

                        self._miniPieChart = self._createMiniPie(pieId, data, pieOpts);
                        self._miniPieKey = cacheKey;
                    };

                    renderPie();
                }

                return html;
            }
        };
    }


    _slug(str) {
        return String(str).toLowerCase().replace(/[^a-z0-9]+/gi, '-');
    }
    _createMiniPie(containerId, data, opts = {}) {
        const width = opts.width ?? 210;
        const height = opts.height ?? 140;

        return Highcharts.chart(containerId, {
            chart: {
                type: 'pie', backgroundColor: 'transparent',
                width, height, animation: false
            },
            title: { text: null },
            credits: { enabled: false },
            exporting: { enabled: false, buttons: { contextButton: { enabled: false } } },
            tooltip: { enabled: false },
            legend: { enabled: !!opts.legend },
            plotOptions: {
                pie: {
                    colorByPoint: true,
                    size: '90%',
                    dataLabels: {
                        enabled: true,
                        useHTML: true,
                        softConnector: true,
                        distance: (opts.labelDistance ?? 16),
                        formatter: function () {
                            const fmt = (v, d = 0) => new Intl.NumberFormat('pt-BR', {
                                minimumFractionDigits: d, maximumFractionDigits: d
                            }).format(v);

                            const name = this.point.name;
                            const yStr = fmt(this.point.y, opts.valueDecimals ?? 0);
                            const pStr = Highcharts.numberFormat(this.percentage, opts.percentDecimals ?? 1);

                            return `
                            <div style="text-align:center; line-height:1.1;">
                                <div style="font-weight:600;">${name}</div>
                                <div style="font-size:${opts.valueFontSize ?? '10px'};">
                                ${yStr} <small>(${pStr}%)</small>
                                </div>
                            </div>`;
                        },
                        style: {
                            fontSize: (opts.labelFontSize ?? '10px'),
                            textOutline: 'none'
                        }
                    }
                }
            }
            ,
            series: [{ name: 'Percentage', data }]
        });
    }
}

class HighchartsFlexible3 {
    constructor(options) {
        this.options = Object.assign({
            container: 'container',
            chartType: 'spline',
            title: '',
            subtitle: '',
            seriesPerc: null,
            colors: null,

            xAxis: { type: 'category', title: '', dateTimeLabelFormats: { month: '%e. %b', year: '%b' }, categories: null },
            yAxis: { title: '', min: 0 },

            // >>> somente hover
            tooltip: { decimals: 2, mode: 'hover-native', hoverSummary: true },

            // opções ainda aceitas (só usadas no hover-mini-pie)
            tooltipExtraKey: null,
            tooltipMiniPie: {
                show: true, title: null, width: 400, height: 260, cardMinWidth: 340,
                labelDistance: 12, valueFontSize: '10px', valueDecimals: 0, percentDecimals: 2,
                legend: false, nameMaxChars: 6, outsideDistance: 12, insideDistance: -34
            },

            plotOptions: {
                series: { marker: { symbol: 'circle', fillColor: 'var(--highcharts-background-color,#fff)', enabled: true, radius: 2.5, lineWidth: 1, lineColor: null } }
            },

            series: [],
            hoverCategoryHighlight: {
                enabled: true,
                color: 'rgba(255,140,0,0.12)', // cor do retângulo de hover
                zIndex: 4                      // acima do fundo, atrás das colunas
            },
        }, options);

        this._uid = Math.random().toString(36).slice(2);
    }

    build() {
        const mode = this.options.tooltip?.mode || 'hover-native';
        const showHoverSummary = !!this.options.tooltip?.hoverSummary;

        const cfg = {
            chart: { type: this.options.chartType },
            title: { text: this.options.title },
            subtitle: { text: this.options.subtitle },
            ...(this.options.colors ? { colors: this.options.colors } : {}),
            xAxis: this._buildXAxis(),
            yAxis: this.options.yAxis,
            tooltip: showHoverSummary
                ? this._buildTooltipHover()
                : this._buildHighchartsTooltip(),
            plotOptions: (this.options.plotOptions || {}),
            series: this._prepareSeries()
        };

        const target = (typeof this.options.container === 'string')
            ? document.getElementById(this.options.container.replace(/^#/, ''))
            : this.options.container;

        if (!target) { console.error('HighchartsFlexible3: container não encontrado'); return null; }

        this.chart = Highcharts.chart(target, cfg);
        this._bindHoverHighlight();

        // limpar mini-pie ao esconder o tooltip (apenas no hover nativo)
        if (showHoverSummary && mode === 'hover-native') {
            Highcharts.addEvent(this.chart.tooltip, 'hide', () => {
                if (this._miniPieChart) { try { this._miniPieChart.destroy(); } catch (_) { } }
                this._miniPieChart = null;
                this._miniPieKey = null;
            });
        }

        return this.chart;
    }

    _buildTooltipHover() {
        const seriesMeta = this.options.series || [];
        const xType = this.options?.xAxis?.type ?? 'category';
        const seriesPerc = this.options.seriesPerc || [];
        const defaultDecimals = this.options?.tooltip?.decimals ?? 2;

        const pieOpts = Object.assign({
            show: true, title: null, width: 210, height: 140, cardMinWidth: 340,
            dataLabelsDecimals: 0, legend: false, nameMaxChars: 6,
            outsideDistance: 12, insideDistance: -34, valueDecimals: 0, percentDecimals: 2,
            valueFontSize: '10px'
        }, this.options.tooltipMiniPie || {});

        const extraByKey = this.options.tooltipExtraKey || null;
        const self = this;

        const norm = s => String(s ?? '')
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ').trim().toLowerCase();

        const getExtraForKey = (k) => {
            if (!extraByKey) return null;
            if (!self._extraNormMap) {
                self._extraNormMap = {};
                Object.keys(extraByKey).forEach(key => { self._extraNormMap[norm(key)] = extraByKey[key]; });
            }
            return extraByKey[k] || extraByKey[String(k)] || self._extraNormMap[norm(k)] || null;
        };

        const fmtNumber = (v, dec) => new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: dec ?? 0, maximumFractionDigits: dec ?? 0
        }).format(+v || 0);

        return {
            shared: true,
            useHTML: true,
            borderWidth: 0,
            outside: true,
            followPointer: true,   // segue o mouse (menos “sumiços” ao sair do ponto)
            // hideDelay: 200,       // segura um pouco antes de esconder
            animation: false,      // evita piscadas
            formatter: function () {
                const rawKey = (xType === 'datetime') ? this.x : this.key;
                let keyLabel = this.key;
                if (xType === 'datetime') keyLabel = Highcharts.dateFormat('%e. %b %Y', this.x);

                let totalGeral = 0, totalBase = 0;
                const pontos = [];
                this.points.forEach(p => {
                    totalGeral += (p.y || 0);
                    const isBase = seriesPerc.includes(p.series.name);
                    if (!isBase) totalBase += (p.y || 0);
                    pontos.push({ ...p, isBase });
                });

                // extras para mini-pie
                const dataObjResolved = getExtraForKey(rawKey) || getExtraForKey(keyLabel);
                const entries = Object.entries(dataObjResolved || {});
                const totalPie = entries.reduce((s, [, v]) => s + (+v || 0), 0);
                const hasExtra = pieOpts.show && entries.length && totalPie > 0;

                const pieId = `hc-mini-pie-${self._uid}-${String(rawKey).toLowerCase().replace(/[^a-z0-9]+/gi, '-')}`;

                // header + lista
                let html = `
                <div class="card shadow-sm small" style="min-width:${pieOpts.cardMinWidth}px;margin:0;">
                    <div class="card-header py-1 text-center font-weight-bold">${keyLabel}</div>
                    <ul class="list-group list-group-flush">`;

                pontos.forEach(point => {
                    const serie = seriesMeta.find(s => s.name === point.series.name) || {};
                    const dec = serie.decimals ?? defaultDecimals;
                    const valueStr = fmtNumber(point.y, dec);
                    const suffix = serie.suffix || '';
                    const prefix = serie.prefix || '';

                    let percStr = '';
                    if (!point.isBase && totalBase) {
                        const perc = (point.y / totalBase * 100);
                        percStr = `<small class="text-muted">(${Highcharts.numberFormat(perc, 2)}%)</small>`;
                    }

                    html += `
                    <li class="list-group-item d-flex justify-content-between align-items-center py-1">
                    <span><span style="color:${point.color}">●</span> ${point.series.name}</span>
                    <span><b>${prefix}${valueStr}${suffix}</b> ${percStr}</span>
                    </li>`;
                });

                if (!seriesPerc?.length) {
                    const totalStr = fmtNumber(totalGeral, defaultDecimals);
                    html += `<li class="list-group-item text-right"><b>Total:</b> ${totalStr}</li>`;
                }

                // mini-pie
                if (hasExtra) {
                    const titleHtml = pieOpts.title ? `<div class="small text-muted mb-1 text-center">${pieOpts.title}</div>` : '';
                    html += `
                    <li class="list-group-item">
                    ${titleHtml}
                    <div id="${pieId}" style="width:${pieOpts.width}px;height:${pieOpts.height}px;margin:0 auto;"></div>
                    </li>`;
                }

                html += `</ul></div>`;

                // render mini-pie async (com retry)
                if (hasExtra) {
                    const data = entries.map(([name, val]) => ({ name, y: Number(val) || 0 }));
                    const cacheKey = `${self.options.container}|${rawKey}`;
                    const renderPie = (tries = 15) => {
                        const el = document.getElementById(pieId);
                        if (!el) { if (tries > 0) return setTimeout(() => renderPie(tries - 1), 16); return; }
                        if (self._miniPieChart && self._miniPieKey !== cacheKey) {
                            try { self._miniPieChart.destroy(); } catch (_) { }
                            self._miniPieChart = null;
                        }
                        self._miniPieChart = self._createMiniPie(pieId, data, pieOpts);
                        self._miniPieKey = cacheKey;
                    };
                    renderPie();
                }

                return html;
            }
        };
    }

    _bindHoverHighlight() {
        const { chart } = this;
        const opt = this.options.hoverCategoryHighlight || {};
        if (!opt.enabled) return;

        const xType = this.options?.xAxis?.type || 'category';
        if (xType !== 'category') return;

        const xa = chart.xAxis[0];
        if (!xa) return;

        const cats = xa.categories || [];
        if (!cats.length) return;

        const container = chart.container;
        if (!container) return;

        // evita duplo-bind ao recriar
        if (container.dataset.hcHoverBound === '1') return;
        container.dataset.hcHoverBound = '1';

        const BAND_ID = `hc-hover-band-${this._uid}`;
        let lastIdx = null;

        // 1) cursor + title nos elementos principais
        container.style.cursor = 'pointer';
        container.setAttribute('title', 'Clique para mais detalhes');
        container.setAttribute('role', 'button');
        container.setAttribute('aria-label', 'Clique para mais detalhes');

        if (chart.plotBackground) {
            chart.plotBackground.css({ cursor: 'pointer' });
            chart.plotBackground.element.setAttribute('title', 'Clique para mais detalhes');
        }
        if (chart.seriesGroup) {
            chart.seriesGroup.css({ cursor: 'pointer' });
            chart.seriesGroup.element.setAttribute('title', 'Clique para mais detalhes');
        }

        // 2) Tooltip BS4 que segue o mouse (opcional: se jQuery+BS4 estiverem presentes)
        let tipEl = null, $tip = null, tipVisible = false;
        const hasBSTooltip = !!(window.jQuery && jQuery.fn && jQuery.fn.tooltip);
        if (hasBSTooltip) {
            tipEl = document.createElement('div');
            tipEl.className = 'hc-cursor-tip';
            Object.assign(tipEl.style, {
                position: 'absolute',
                width: '1px',
                height: '1px',
                pointerEvents: 'none',
                zIndex: '9999',
                left: '0px',
                top: '0px'
            });
            document.body.appendChild(tipEl);
            $tip = jQuery(tipEl)
                .attr({
                    'data-toggle': 'tooltip',
                    'data-placement': 'top',
                    'data-original-title': 'Clique para mais detalhes'
                })
                .tooltip({ container: 'body', trigger: 'manual' });
        }
        const showTipAt = (pageX, pageY) => {
            if (!$tip) return;
            tipEl.style.left = pageX + 'px';
            tipEl.style.top = (pageY - 8) + 'px'; // um pouco acima do cursor
            if (!tipVisible) { $tip.tooltip('show'); tipVisible = true; }
            else { $tip.tooltip('update'); }
        };
        const hideTip = () => { if ($tip && tipVisible) { $tip.tooltip('hide'); tipVisible = false; } };

        // utilitários
        const insidePlot = (e) =>
            e.chartX >= chart.plotLeft && e.chartX <= chart.plotLeft + chart.plotWidth &&
            e.chartY >= chart.plotTop && e.chartY <= chart.plotTop + chart.plotHeight;

        const indexFromMouse = (e) => {
            // (1) relativo ao plot
            let xVal = xa.toValue(e.chartX - chart.plotLeft, true);
            if (!isFinite(xVal)) {
                // (2) absoluto
                xVal = xa.toValue(e.chartX, false);
            }
            if (isFinite(xVal)) {
                return Math.max(0, Math.min(Math.round(xVal), cats.length - 1));
            }
            // (3) fallback: tick mais próximo
            const ticks = xa.tickPositions || cats.map((_, i) => i);
            let best = 0, bestDist = Infinity;
            for (let i = 0; i < ticks.length; i++) {
                const px = xa.toPixels(ticks[i], true);
                const dist = Math.abs(px - (e.chartX - chart.plotLeft));
                if (dist < bestDist) { bestDist = dist; best = i; }
            }
            return Math.max(0, Math.min(best, cats.length - 1));
        };

        // 3) Hover: highlight + cursor + tooltip que segue o mouse
        const onMove = (domEvt) => {
            const e = chart.pointer.normalize(domEvt);

            // cursor sempre coerente
            const inPlot = insidePlot(e);
            container.style.cursor = inPlot ? 'pointer' : 'default';

            if (!inPlot) {
                xa.removePlotBand(BAND_ID);
                lastIdx = null;
                hideTip();
                return;
            }

            // mostra tooltip na posição do cursor (se BS4 estiver ativo)
            showTipAt(domEvt.pageX, domEvt.pageY);

            const idx = indexFromMouse(e);
            if (idx === lastIdx) return;
            lastIdx = idx;

            xa.removePlotBand(BAND_ID);
            xa.addPlotBand({
                id: BAND_ID,
                from: idx - 0.5,
                to: idx + 0.5,
                color: opt.color || 'rgba(51,92,173,0.12)',
                zIndex: opt.zIndex ?? 4,
                className: 'hc-hover-band'
            });

            // garante que o próprio retângulo tenha "mãozinha" e title
            const bands = xa.plotLinesAndBands || [];
            const bandObj = bands.find(b => b.options && b.options.id === BAND_ID);
            if (bandObj && bandObj.svgElem && bandObj.svgElem.element) {
                bandObj.svgElem.css({ cursor: 'pointer' });
                bandObj.svgElem.element.setAttribute('title', 'Clique para mais detalhes');
            }
        };

        const clear = () => {
            xa.removePlotBand(BAND_ID);
            lastIdx = null;
            container.style.cursor = 'default';
            hideTip();
        };

        Highcharts.addEvent(container, 'mousemove', onMove);
        Highcharts.addEvent(container, 'mouseleave', clear);
        Highcharts.addEvent(chart.tooltip, 'hide', clear);
        Highcharts.addEvent(chart, 'destroy', () => {
            clear();
            if ($tip) {
                try { $tip.tooltip('dispose'); } catch (_) { }
                if (tipEl && tipEl.parentNode) tipEl.parentNode.removeChild(tipEl);
                $tip = null; tipEl = null;
            }
            delete container.dataset.hcHoverBound;
        });
    }

    _buildHighchartsTooltip() {
        // fallback: tooltip simples nativo
        return { shared: true, outside: true };
    }

    _buildXAxis() {
        const x = this.options.xAxis;
        const base = { title: { text: x.title || '' } };
        if (x.type === 'datetime') return { ...base, type: 'datetime', dateTimeLabelFormats: x.dateTimeLabelFormats || { month: '%e. %b', year: '%b' } };
        if (x.type === 'category') return { ...base, type: 'category', categories: x.categories || [] };
        return { ...base, type: 'linear' };
    }

    _prepareSeries() {
        const xType = this.options.xAxis.type;
        return this.options.series.map(s => {
            if (!s.data) s.data = [];
            if (xType === 'datetime') s.data = s.data.map(([x, y]) => [Date.parse(x), y]);
            return s;
        });
    }

    _destroyDT() {
        if (this._dtLastId && window.jQuery && jQuery.fn?.DataTable) {
            const $t = jQuery(`#${this._dtLastId}`);
            if ($t.length && jQuery.fn.DataTable.isDataTable($t[0])) { try { $t.DataTable().destroy(); } catch (_) { } }
        }
        this._dtLastId = null;
    }

    _createMiniPie(containerId, data, opts = {}) {
        const width = opts.width ?? 210, height = opts.height ?? 140;
        return Highcharts.chart(containerId, {
            chart: { type: 'pie', backgroundColor: 'transparent', width, height, animation: false },
            title: { text: null }, credits: { enabled: false },
            exporting: { enabled: false, buttons: { contextButton: { enabled: false } } },
            tooltip: { enabled: false }, legend: { enabled: !!opts.legend },
            plotOptions: {
                series: { enableMouseTracking: false },
                pie: {
                    colorByPoint: true, size: '90%', dataLabels: {
                        enabled: true, useHTML: true, softConnector: true, distance: (opts.labelDistance ?? 16),
                        formatter: function () {
                            const fmt = (v, d = 0) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
                            const name = this.point.name, yStr = fmt(this.point.y, opts.valueDecimals ?? 0), pStr = Highcharts.numberFormat(this.percentage, opts.percentDecimals ?? 1);
                            return `<div style="text-align:center;line-height:1.1;"><div style="font-weight:600;">${name}</div><div style="font-size:${opts.valueFontSize ?? '10px'};">${yStr} <small>(${pStr}%)</small></div></div>`;
                        }, style: { fontSize: (opts.labelFontSize ?? '10px'), textOutline: 'none' }
                    }
                }
            },
            series: [{ name: 'Percentage', data }]
        });
    }
}


class HighchartsFlexible3BKP {
    constructor(options) {
        this.options = Object.assign({
            container: 'container',
            chartType: 'spline',
            title: '',
            subtitle: '',
            seriesPerc: null,
            colors: null,

            xAxis: { type: 'category', title: '', dateTimeLabelFormats: { month: '%e. %b', year: '%b' }, categories: null },
            yAxis: { title: '', min: 0 },

            tooltip: { decimals: 2, mode: 'click' }, // abre por clique

            // Aparência do card
            card: {
                width: '70%',
                maxHeight: 600,
                className: 'border-primary',
                headerClass: 'bg-primary text-white',
                bodyPadding: '12px',
                position: 'top',              // 'top' | 'center' | 'bottom' | 'topright' | ... | 'pointer'
                offset: { x: 0, y: 8 }        // ajuste fino
            },

            tooltipExtraKey: null,  // mini-pie
            tooltipMiniPie: {
                show: true, title: null, width: 400, height: 260, cardMinWidth: 340,
                labelDistance: 12, valueFontSize: '10px', valueDecimals: 0, percentDecimals: 2,
                legend: false, nameMaxChars: 6, outsideDistance: 12, insideDistance: -34
            },

            // Tabela no card
            tooltipTable: {
                enabled: false,
                dataByKey: null,
                resolve: null,
                groupColumn: { key: 'group', label: 'Grupo', align: 'text-left' },
                columns: [],
                table: {
                    width: 900,
                    striped: true,
                    compact: true,
                    showTotalsRow: true,
                    maxHeight: 420,
                    useFooterCallback: true, // calcula totais no footer via DataTables
                    dataTable: {
                        enabled: true,
                        options: { dom: 't', autoWidth: false, scrollX: true, paging: false, searching: false, info: false, ordering: false }
                    }
                }
            },

            plotOptions: {
                series: { marker: { symbol: 'circle', fillColor: 'var(--highcharts-background-color,#fff)', enabled: true, radius: 2.5, lineWidth: 1, lineColor: null } }
            },

            series: []
        }, options);

        this._uid = Math.random().toString(36).slice(2);
    }

    build() {
        const mode = this.options.tooltip?.mode || 'click';
        const showHoverSummary = !!this.options.tooltip?.hoverSummary;

        const cfg = {
            chart: { type: this.options.chartType },
            title: { text: this.options.title },
            subtitle: { text: this.options.subtitle },
            ...(this.options.colors ? { colors: this.options.colors } : {}),
            xAxis: this._buildXAxis(),
            yAxis: this.options.yAxis,
            tooltip: showHoverSummary
                ? this._buildTooltipHover()                 // <-- resumo no hover
                : (mode === 'hover-native'
                    ? this._buildHighchartsTooltip()
                    : { enabled: false }),
            plotOptions: (mode === 'click')
                ? this._plotOptionsWithClick(this.options.plotOptions)
                : (mode === 'hover'
                    ? this._plotOptionsWithHoverOverlay(this.options.plotOptions)
                    : (this.options.plotOptions || {})),
            series: this._prepareSeries()
        };

        const target = (typeof this.options.container === 'string')
            ? document.getElementById(this.options.container.replace(/^#/, ''))
            : this.options.container;

        if (!target) { console.error('HighchartsFlexible3: container não encontrado'); return null; }

        this.chart = Highcharts.chart(target, cfg);

        // limpar mini-pie ao esconder o tooltip (evita erro #13 / vazamentos)
        if (showHoverSummary && mode === 'hover-native') {
            Highcharts.addEvent(this.chart.tooltip, 'hide', () => {
                if (this._miniPieChart) { try { this._miniPieChart.destroy(); } catch (_) { } }
                this._miniPieChart = null;
                this._miniPieKey = null;
            });
        }


        return this.chart;
    }
    _buildTooltipHover() {
        const seriesMeta = this.options.series || [];
        const xType = this.options?.xAxis?.type ?? 'category';
        const seriesPerc = this.options.seriesPerc || [];
        const defaultDecimals = this.options?.tooltip?.decimals ?? 2;

        const pieOpts = Object.assign({
            show: true, title: null, width: 210, height: 140, cardMinWidth: 340,
            dataLabelsDecimals: 0, legend: false, nameMaxChars: 6,
            outsideDistance: 12, insideDistance: -34, valueDecimals: 0, percentDecimals: 2,
            valueFontSize: '10px'
        }, this.options.tooltipMiniPie || {});

        const extraByKey = this.options.tooltipExtraKey || null;
        const self = this;

        const norm = s => String(s ?? '')
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ').trim().toLowerCase();

        const getExtraForKey = (k) => {
            if (!extraByKey) return null;
            if (!self._extraNormMap) {
                self._extraNormMap = {};
                Object.keys(extraByKey).forEach(key => { self._extraNormMap[norm(key)] = extraByKey[key]; });
            }
            return extraByKey[k] || extraByKey[String(k)] || self._extraNormMap[norm(k)] || null;
        };

        const fmtNumber = (v, dec) => new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: dec ?? 0, maximumFractionDigits: dec ?? 0
        }).format(+v || 0);

        return {
            shared: true,
            useHTML: true,
            borderWidth: 0,
            outside: true,
            formatter: function () {
                const rawKey = (xType === 'datetime') ? this.x : this.key;
                let keyLabel = this.key;
                if (xType === 'datetime') keyLabel = Highcharts.dateFormat('%e. %b %Y', this.x);

                let totalGeral = 0, totalBase = 0;
                const pontos = [];
                this.points.forEach(p => {
                    totalGeral += (p.y || 0);
                    const isBase = seriesPerc.includes(p.series.name);
                    if (!isBase) totalBase += (p.y || 0);
                    pontos.push({ ...p, isBase });
                });

                // extras para mini-pie
                const dataObjResolved = getExtraForKey(rawKey) || getExtraForKey(keyLabel);
                const entries = Object.entries(dataObjResolved || {});
                const totalPie = entries.reduce((s, [, v]) => s + (+v || 0), 0);
                const hasExtra = pieOpts.show && entries.length && totalPie > 0;

                const pieId = `hc-mini-pie-${self._uid}-${self._slug(rawKey)}`;

                // header + lista
                let html = `
                <div class="card shadow-sm small" style="min-width:${pieOpts.cardMinWidth}px;margin:0;">
                <div class="card-header py-1 text-center font-weight-bold">${keyLabel}</div>
                <ul class="list-group list-group-flush">`;

                pontos.forEach(point => {
                    const serie = seriesMeta.find(s => s.name === point.series.name) || {};
                    const dec = serie.decimals ?? defaultDecimals;
                    const valueStr = fmtNumber(point.y, dec);
                    const suffix = serie.suffix || '';
                    const prefix = serie.prefix || '';

                    let percStr = '';
                    if (!point.isBase && totalBase) {
                        const perc = (point.y / totalBase * 100);
                        percStr = `<small class="text-muted">(${Highcharts.numberFormat(perc, 2)}%)</small>`;
                    }

                    html += `
                    <li class="list-group-item d-flex justify-content-between align-items-center py-1">
                        <span><span style="color:${point.color}">●</span> ${point.series.name}</span>
                        <span><b>${prefix}${valueStr}${suffix}</b> ${percStr}</span>
                    </li>`;
                });

                if (!seriesPerc?.length) {
                    const totalStr = fmtNumber(totalGeral, defaultDecimals);
                    html += `<li class="list-group-item text-right"><b>Total:</b> ${totalStr}</li>`;
                }

                // mini-pie
                if (hasExtra) {
                    const titleHtml = pieOpts.title ? `<div class="small text-muted mb-1 text-center">${pieOpts.title}</div>` : '';
                    html += `
                    <li class="list-group-item">
                        ${titleHtml}
                        <div id="${pieId}" style="width:${pieOpts.width}px;height:${pieOpts.height}px;margin:0 auto;"></div>
                    </li>`;
                }

                html += `</ul></div>`;

                // render mini-pie async (com retry)
                if (hasExtra) {
                    const data = entries.map(([name, val]) => ({ name, y: Number(val) || 0 }));
                    const cacheKey = `${self.options.container}|${rawKey}`;
                    const renderPie = (tries = 15) => {
                        const el = document.getElementById(pieId);
                        if (!el) { if (tries > 0) return setTimeout(() => renderPie(tries - 1), 16); return; }
                        if (self._miniPieChart && self._miniPieKey !== cacheKey) {
                            try { self._miniPieChart.destroy(); } catch (_) { }
                            self._miniPieChart = null;
                        }
                        self._miniPieChart = self._createMiniPie(pieId, data, pieOpts);
                        self._miniPieKey = cacheKey;
                    };
                    renderPie();
                }

                return html;
            }
        };
    }

    _plotOptionsWithHoverOverlay(base = {}) {
        const self = this;
        let lastX = null;
        let timer = null;

        return Highcharts.merge(base, {
            series: {
                point: {
                    events: {
                        mouseOver(e) {
                            const chart = this.series.chart;
                            const x = this.x;
                            if (x === lastX) return;      // evita refazer no mesmo ponto
                            lastX = x;

                            clearTimeout(timer);
                            timer = setTimeout(() => {
                                const points = chart.series
                                    .filter(s => s.visible !== false)
                                    .map(s => (s.points || []).find(p => p && p.x === x))
                                    .filter(Boolean);

                                const key = this.category ?? this.x;
                                const html = self._buildCardHTML(this.x, key, points);
                                // ancora sempre no TOPO-CENTRO do gráfico
                                self._openOverlayFixed(chart, html);
                            }, 80); // pequeno debounce
                        },
                        mouseOut() {
                            // opcional: não fechar imediatamente; pode deixar fechar ao clicar fora
                            // self._closeOverlay?.();
                        }
                    }
                }
            }
        });
    }

    _openOverlayFixed(chart, html) {
        // fecha anterior
        this._closeOverlay?.();

        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed; inset:0; z-index:9999; background:rgba(0,0,0,0);';

        const wrap = document.createElement('div');
        wrap.innerHTML = html;
        const cardEl = wrap.firstElementChild;

        // mesmas regras de estilo do click
        cardEl.style.position = 'fixed';
        cardEl.style.zIndex = '10000';
        cardEl.style.width = this.options.card?.width || '70%';
        cardEl.style.maxHeight = (this.options.card?.maxHeight ?? 500) + 'px';
        cardEl.style.maxWidth = '96vw';
        cardEl.style.overflow = 'auto';

        overlay.appendChild(cardEl);
        document.body.appendChild(overlay);

        // posiciona no TOPO-CENTRO do gráfico
        const rect = chart.container.getBoundingClientRect();
        const w = Math.min(cardEl.offsetWidth || 600, window.innerWidth * 0.96);
        const h = Math.min(cardEl.offsetHeight || 300, (this.options.card?.maxHeight ?? 500));
        const left = Math.max(8, rect.left + rect.width / 2 - w / 2);
        const top = Math.max(8, rect.top + 12);

        cardEl.style.left = `${left}px`;
        cardEl.style.top = `${top}px`;

        const close = () => {
            this._destroyDT(); try { overlay.remove(); } catch { } this._closeOverlay = null;
            if (this._miniPieChart) { try { this._miniPieChart.destroy(); } catch (_) { } }
            this._miniPieChart = null;
            this._miniPieKey = null;
        };
        overlay.addEventListener('click', ev => { if (ev.target === overlay) close(); });
        this._closeOverlay = close;
    }


    _buildHighchartsTooltip() {
        const self = this;
        return {
            shared: true,
            useHTML: true,
            borderWidth: 0,
            outside: true,
            formatter: function () {
                const key = (self.options?.xAxis?.type === 'datetime')
                    ? Highcharts.dateFormat('%e. %b %Y', this.x)
                    : this.key;
                return self._buildCardHTML(this.x, key, this.points || [this.point]);
            }
        };
    }

    _plotOptionsWithClick(base = {}) {
        const self = this;
        return Highcharts.merge(base, {
            series: {
                cursor: 'pointer',
                point: {
                    events: {
                        click(e) {
                            const chart = this.series.chart;
                            const x = this.x;
                            const points = chart.series
                                .filter(s => s.visible !== false)
                                .map(s => (s.points || []).find(p => p && p.x === x))
                                .filter(Boolean);

                            const key = this.category ?? this.x;
                            const html = self._buildCardHTML(this.x, key, points);
                            self._openOverlayAtEvent(e, html, chart);
                        }
                    }
                }
            }
        });
    }

    _openOverlayAtEvent(e, html, chart) {
        this._closeOverlay?.(); // fecha anterior

        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed; inset:0; z-index:9999; background:rgba(0,0,0,0);';

        const wrap = document.createElement('div');
        wrap.innerHTML = html;
        const cardEl = wrap.firstElementChild;

        // dimensões/estilo do card
        const cardOpts = this.options.card || {};
        cardEl.style.position = 'fixed';
        cardEl.style.zIndex = '10000';
        cardEl.style.width = cardOpts.width || '70%';
        cardEl.style.maxHeight = (cardOpts.maxHeight ?? 500) + 'px';
        cardEl.style.maxWidth = '96vw';
        cardEl.style.overflow = 'auto';

        overlay.appendChild(cardEl);
        document.body.appendChild(overlay);
        // botão "fechar" no header (quando modo=click)
        const btnClose = cardEl.querySelector('[data-hcf-close]');

        const place = () => {
            // mede após estar no DOM
            const w = Math.min(cardEl.offsetWidth || 600, window.innerWidth * 0.96);
            const h = Math.min(cardEl.offsetHeight || 300, (cardOpts.maxHeight ?? 500));

            const rect = chart.container.getBoundingClientRect();
            const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
            const off = cardOpts.offset || { x: 0, y: 8 };

            let left = 0, top = 0;
            switch ((cardOpts.position || 'pointer').toLowerCase()) {
                case 'center':
                    left = rect.left + (rect.width - w) / 2;
                    top = rect.top + (rect.height - h) / 2;
                    break;
                case 'top':
                    left = rect.left + (rect.width - w) / 2;
                    top = rect.top + 8;
                    break;
                case 'bottom':
                    left = rect.left + (rect.width - w) / 2;
                    top = rect.bottom - h - 8;
                    break;
                case 'topright':
                    left = rect.right - w - 8;
                    top = rect.top + 8;
                    break;
                case 'topleft':
                    left = rect.left + 8;
                    top = rect.top + 8;
                    break;
                case 'bottomright':
                    left = rect.right - w - 8;
                    top = rect.bottom - h - 8;
                    break;
                case 'bottomleft':
                    left = rect.left + 8;
                    top = rect.bottom - h - 8;
                    break;
                case 'pointer':
                default: {
                    // comportamento antigo (perto do clique)
                    const norm = chart.pointer.normalize(e);
                    const clickX = rect.left + norm.chartX;
                    const clickY = rect.top + norm.chartY;
                    left = clickX - w / 2;
                    top = clickY + 12;
                    break;
                }
            }

            // offset + clamp nas bordas da viewport
            left = clamp(left + (off.x || 0), 8, window.innerWidth - w - 8);
            top = clamp(top + (off.y || 0), 8, window.innerHeight - h - 8);

            cardEl.style.left = `${left}px`;
            cardEl.style.top = `${top}px`;
        };

        // posiciona agora e também ao redimensionar
        place();
        const onResize = () => place();
        window.addEventListener('resize', onResize);

        const close = () => {
            this._destroyDT();
            try { overlay.remove(); } catch (_) { }
            window.removeEventListener('resize', onResize);
            this._closeOverlay = null;

            if (this._miniPieChart) { try { this._miniPieChart.destroy(); } catch (_) { } }
            this._miniPieChart = null;
            this._miniPieKey = null;
        };
        if (btnClose) {
            btnClose.addEventListener('click', (ev) => { ev.stopPropagation(); close(); });
        }
        overlay.addEventListener('click', ev => { if (ev.target === overlay) close(); });
        window.addEventListener('keydown', this._escHandler = (k) => { if (k.key === 'Escape') close(); }, { once: true });

        this._closeOverlay = close;
    }


    _buildXAxis() {
        const x = this.options.xAxis;
        const base = { title: { text: x.title || '' } };
        if (x.type === 'datetime') return { ...base, type: 'datetime', dateTimeLabelFormats: x.dateTimeLabelFormats || { month: '%e. %b', year: '%b' } };
        if (x.type === 'category') return { ...base, type: 'category', categories: x.categories || [] };
        return { ...base, type: 'linear' };
    }

    _prepareSeries() {
        const xType = this.options.xAxis.type;
        return this.options.series.map(s => {
            if (!s.data) s.data = [];
            if (xType === 'datetime') s.data = s.data.map(([x, y]) => [Date.parse(x), y]);
            return s;
        });
    }

    // ---------- CARD ----------
    _buildCardHTML(rawKey, keyLabel, points) {
        const toNum = (window?.Utilitarios?.parsePtNumber) ? Utilitarios.parsePtNumber : (v => +String(v ?? '').replace(/[^\d.-]/g, '') || 0);
        const seriesMeta = this.options.series || [];
        const defaultDecimals = this.options?.tooltip?.decimals ?? 2;

        const pieOpts = Object.assign({
            show: true, title: null, width: 400, height: 260, valueDecimals: 0, percentDecimals: 2, legend: false
        }, this.options.tooltipMiniPie || {});
        const tableOpts = Object.assign({
            enabled: false, dataByKey: null, resolve: null,
            groupColumn: { key: 'group', label: 'Grupo', align: 'text-left' },
            columns: [],
            table: { width: 900, striped: true, compact: true, showTotalsRow: true, maxHeight: 420, useFooterCallback: true, dataTable: { enabled: false, options: {} } }
        }, this.options.tooltipTable || {});
        const extraByKey = this.options.tooltipExtraKey || null;

        const norm = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
        const getExtraForKey = (k) => {
            if (!extraByKey) return null;
            if (!this._extraNormMap) { this._extraNormMap = {}; Object.keys(extraByKey).forEach(key => { this._extraNormMap[norm(key)] = extraByKey[key]; }); }
            return extraByKey[k] || extraByKey[String(k)] || this._extraNormMap[norm(k)] || null;
        };
        const fmtNumber = (v, d = 0) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(+v || 0);
        const fmtValue = (v, c) => {
            const t = c.type || 'number', d = c.decimals ?? (t === 'int' ? 0 : 2);
            if (v == null || v === '') return '';
            if (t === 'currency') return 'R$ ' + fmtNumber(v, d);
            if (t === 'percent') return fmtNumber(v, d) + '%';
            if (t === 'int') return fmtNumber(v, 0);
            if (t === 'number') return fmtNumber(v, d);
            if (t === 'date') return new Date(v).toLocaleDateString('pt-BR');
            if (t === 'datetime') return new Date(v).toLocaleString('pt-BR');
            return String(v);
        };

        // helpers mapeamento de célula
        const getRaw = (row, key) => {
            if (!row) return undefined;
            let v = row[key];
            if (v === undefined && key) v = row[key.toLowerCase()];
            if (v && typeof v === 'object' && 'value' in v) v = v.value;
            return v;
        };

        // ----- conteúdo principal -----
        const wantTable = tableOpts.enabled && tableOpts.dataByKey;
        let primaryHtml = '';
        let pieHtml = '';
        let pieRendered = false;

        if (wantTable) {
            const resolver = tableOpts.resolve || ((rk, kl, nf) => tableOpts.dataByKey[rk] || tableOpts.dataByKey[kl] || tableOpts.dataByKey[nf(kl)]);
            const dataRows = resolver(rawKey, keyLabel, norm) || [];
            const arr = Array.isArray(dataRows) ? dataRows : Object.entries(dataRows).map(([group, vals]) => ({ group, ...(vals || {}) }));
            // === DESTAQUES (após const arr = ...) ===
            const toN = v => +String(v ?? '').replace(/[^\d.-]/g, '') || 0;

            const pickMax = (rows, key) => rows.reduce((best, r) => {
                const v = toN(r[key]); return (!best || v > best.v) ? { row: r, v } : best;
            }, null);
            const pickMin = (rows, key) => rows.reduce((best, r) => {
                const v = toN(r[key]); return (!best || v < best.v) ? { row: r, v } : best;
            }, null);

            // destaques
            const hiRec = pickMax(arr, 'pct_recuperado');     // melhor % recuperação
            const loRec = pickMin(arr, 'pct_recuperado');     // pior % recuperação
            const hiAberto = pickMax(arr, 'valor_aberto');       // maior valor em aberto (R$)
            const hiRecVl = pickMax(arr, 'valor_recuperado');       // maior valor em aberto (R$)
            const hiImpl = pickMax(arr, 'valor_implantado');   // maior implantado (R$)
            const hiTkt = pickMax(arr, 'ticket_medio');   // maior implantado (R$)

            // formatadores
            const fmtPct = v => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v) + '%';
            const fmtBRL = v => 'R$ ' + new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

            // componente AdminLTE info-box
            const infoBox = (color, title, big, small) => `
            <div class="info-box mb-2">
                <span class="info-box-icon bg-${color}" style="min-width:44px"><i class="fas fa-chart-line"></i></span>
                <div class="info-box-content" style="line-height:1.1">
                <span class="info-box-text" style="white-space:normal">${title}</span>
                <span class="info-box-number" style="font-size:1.05rem">${big}</span>
                <div class="text-muted" style="font-size:.85rem">${small}</div>
                </div>
            </div>`;

            const tableId = `hc-tip-table-${this._uid}-${this._slug(rawKey)}`;
            const groupCol = Object.assign({ key: 'group', label: 'Grupo', align: 'text-left' }, tableOpts.groupColumn || {}); groupCol.type = 'string';
            const cols = [groupCol].concat(tableOpts.columns || []);

            // header
            const thead = '<tr>' + cols.map(c => `<th class="${c.align || ''}">${c.label || c.key}</th>`).join('') + '</tr>';

            // body
            let tbody = '';
            arr.forEach(row => {
                tbody += '<tr>';
                cols.forEach(c => {
                    const raw = getRaw(row, c.key);
                    const v = (c.type && c.type !== 'string') ? toNum(raw) : raw;
                    const val = (c.format && typeof c.format === 'function') ? c.format(v, row, c) : fmtValue(v, c);
                    tbody += `<td class="${c.align || ''}">${val}</td>`;
                });
                tbody += '</tr>';
            });

            // footer (sempre cria se showTotalsRow=true)
            let tfoot = '';
            if (tableOpts.table.showTotalsRow) {
                tfoot = '<tr>' + cols.map((c, idx) => {
                    if (!tableOpts.table.useFooterCallback) {
                        if (idx === 0) return `<th class="${c.align || ''}">Total</th>`;
                        if (!c.total) return `<th class="${c.align || ''}"></th>`;
                        const sum = arr.reduce((s, r) => s + toNum(getRaw(r, c.key)), 0);
                        const out = (c.formatTotal && typeof c.formatTotal === 'function') ? c.formatTotal(sum, arr, c) : fmtValue(sum, c);
                        return `<th class="${c.align || ''}">${out}</th>`;
                    }
                    // placeholders (footerCallback preencherá)
                    return `<th class="${c.align || ''}">${idx === 0 ? 'Total' : ''}</th>`;
                }).join('') + '</tr>';
            }

            primaryHtml = `
            <div style="
            max-height:${Math.min(tableOpts.table.maxHeight || 420, 460)}px;
            overflow:auto;
            scrollbar-gutter: stable both-edges;    /* reserva a calha do scroll quando existir */
            padding-right: 12px;                    /* fallback cross-browser p/ não cortar à direita */
            box-sizing: content-box;                /* padding não rouba largura do conteúdo */
            ">
            <div style="overflow-x:auto;">
                <table id="${tableId}" class="table table-sm table-hover table-bordered ${tableOpts.table.striped ? 'table-striped' : ''} ${tableOpts.table.compact ? 'mb-0' : ''}" style="width:100%; white-space:nowrap;"">
                <thead>${thead}</thead>
                <tbody>${tbody}</tbody>
                ${tableOpts.table.showTotalsRow ? `<tfoot>${tfoot}</tfoot>` : ''}
                </table>
            </div>
            </div>`;

            // DataTables (usa os dados crus do arr no footerCallback -> nunca zera)
            if (tableOpts.table?.dataTable?.enabled) {
                const userOpts = tableOpts.table.dataTable.options || {};
                setTimeout(() => {
                    if (!(window.jQuery && jQuery.fn && jQuery.fn.DataTable)) return;
                    const $el = jQuery(`#${tableId}`); if (!$el.length || jQuery.fn.DataTable.isDataTable($el[0])) return;

                    const dtOpts = Object.assign({
                        dom: 't',
                        autoWidth: false,
                        paging: false,
                        searching: false,
                        info: false,
                        ordering: false,
                        order: [],
                        aaSorting: [],
                        orderFixed: null,
                        columnDefs: [{ targets: '_all', orderable: false }],
                        scrollX: true,
                        retrieve: true
                    }, userOpts);

                    if (tableOpts.table.showTotalsRow && tableOpts.table.useFooterCallback) {
                        const colsSpec = cols.slice();        // fecha sobre as colunas
                        const dataCopy = arr.map(r => ({ ...r })); // e sobre os dados crus
                        dtOpts.footerCallback = function () {
                            const api = this.api();
                            colsSpec.forEach((c, idx) => {
                                const cell = api.column(idx).footer();
                                if (!cell) return;
                                if (idx === 0) { cell.innerHTML = 'Total'; return; }
                                if (!c.total) { cell.innerHTML = ''; return; }
                                const total = dataCopy.reduce((s, r) => s + toNum(getRaw(r, c.key)), 0);
                                cell.innerHTML = (c.formatTotal && typeof c.formatTotal === 'function') ? c.formatTotal(total, dataCopy, c) : fmtValue(total, c);
                            });
                        };
                    }

                    const dt = $el.DataTable(dtOpts);
                    setTimeout(() => { try { dt.columns().adjust(); } catch (_) { } }, 0);
                    this._dtLastId = tableId;
                }, 0);
            }

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

            // mini-pie central (usa tooltipExtraKey do ponto atual)
            const dataObjResolved = getExtraForKey(rawKey) || getExtraForKey(keyLabel);
            let midPie = '';
            if (pieOpts.show && dataObjResolved) {
                const entries = Object.entries(dataObjResolved);
                const totalPie = entries.reduce((s, [, v]) => s + (+v || 0), 0);
                if (entries.length && totalPie > 0) {
                    const pieId = `hc-mini-pie-${this._uid}-${this._slug(rawKey)}`;
                    const pieW = Math.min(pieOpts.width || 560, (window.innerWidth * 0.7) - 24);
                    midPie = `
                    ${pieOpts.title ? `<div class="small text-muted mb-1 text-center">${pieOpts.title}</div>` : ''}
                    <div id="${pieId}" style="width:${pieW}px;height:${pieOpts.height}px;margin:0 auto;"></div>
                `;
                    setTimeout(() => {
                        const data = entries.map(([name, val]) => ({ name, y: +val || 0 }));
                        if (this._miniPieChart) { try { this._miniPieChart.destroy(); } catch (_) { } }
                        this._miniPieChart = this._createMiniPie(pieId, data, { ...pieOpts, width: pieW });
                        this._miniPieKey = `${this.options.container}|${rawKey}`;
                    }, 0);
                    pieRendered = true;
                }
            }

            const analyticsHtml = `
            <div class="row align-items-start mt-2">
            <div class="col-md-3 pr-md-2">${leftCards}</div>
            <div class="col-md-6">${midPie}</div>
            <div class="col-md-3 pl-md-2">${rightCards}</div>
            </div>
            `;

            primaryHtml = primaryHtml + analyticsHtml;

        } else {
            // lista simples das séries
            let totalGeral = 0, totalBase = 0;
            const seriesPerc = this.options.seriesPerc || [];
            const pontos = [];
            points.forEach(p => {
                totalGeral += (p.y || 0);
                const isBase = seriesPerc.includes(p.series.name);
                if (!isBase) totalBase += (p.y || 0);
                pontos.push({ ...p, isBase });
            });

            let list = '';
            pontos.forEach(point => {
                const serie = seriesMeta.find(s => s.name === point.series.name) || {};
                const dec = serie.decimals ?? defaultDecimals;
                const valueStr = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(point.y || 0);
                const suffix = serie.suffix || '', prefix = serie.prefix || '';
                const percStr = (!point.isBase && totalBase) ? `<small class="text-muted">(${Highcharts.numberFormat((point.y / totalBase * 100), 2)}%)</small>` : '';
                list += `
                <div class="d-flex justify-content-between align-items-center py-1" style="border-bottom:1px solid rgba(0,0,0,.05);">
                    <span><span style="color:${point.color}">●</span> ${point.series.name}</span>
                    <span><b>${prefix}${valueStr}${suffix}</b> ${percStr}</span>
                </div>`;
            });
            if (!this.options.seriesPerc?.length) {
                const totalStr = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: defaultDecimals, maximumFractionDigits: defaultDecimals }).format(totalGeral);
                list += `<div class="text-right pt-1"><b>Total:</b> ${totalStr}</div>`;
            }
            primaryHtml = list;
        }

        // mini-pie
        // mini-pie (fallback quando NÃO usamos a tabela/analyticsHtml)
        if (!pieRendered) {
            const dataObjResolved2 = getExtraForKey(rawKey) || getExtraForKey(keyLabel);
            if (pieOpts.show && dataObjResolved2) {
                const entries = Object.entries(dataObjResolved2);
                const totalPie = entries.reduce((s, [, v]) => s + (+v || 0), 0);
                if (entries.length && totalPie > 0) {
                    const pieId = `hc-mini-pie-${this._uid}-${this._slug(rawKey)}`;
                    const pieW = Math.min(pieOpts.width || 560, (window.innerWidth * 0.7) - 24);
                    pieHtml = `
                    <div class="mt-2">
                    ${pieOpts.title ? `<div class="small text-muted mb-1 text-center">${pieOpts.title}</div>` : ''}
                    <div id="${pieId}" style="width:${pieW}px;height:${pieOpts.height}px;margin:0 auto;"></div>
                    </div>`;
                    setTimeout(() => {
                        const data = entries.map(([name, val]) => ({ name, y: +val || 0 }));
                        if (this._miniPieChart) { try { this._miniPieChart.destroy(); } catch (_) { } }
                        this._miniPieChart = this._createMiniPie(pieId, data, { ...pieOpts, width: pieW });
                        this._miniPieKey = `${this.options.container}|${rawKey}`;
                    }, 0);
                }
            }
        }


        // card com tema “primário”
        const needsClose = (this.options.tooltip?.mode === 'click');

        const headerHtml = `
        <div class="card-header hc-click-card-header ${this.options.card?.headerClass || ''}">
            <div class="hc-header-title">${keyLabel}</div>
            ${needsClose ? `<button type="button" class="btn-close" aria-label="Fechar" data-hcf-close></button>` : ''}
        </div>
        `;

        return `
            <div class="card shadow-sm small hc-click-card ${this.options.card?.className || ''}" style="margin:0;">
                ${headerHtml}
                <div class="card-body">
                ${primaryHtml}
                ${pieHtml}
                </div>
            </div>
            `;

    }

    _destroyDT() {
        if (this._dtLastId && window.jQuery && jQuery.fn?.DataTable) {
            const $t = jQuery(`#${this._dtLastId}`);
            if ($t.length && jQuery.fn.DataTable.isDataTable($t[0])) { try { $t.DataTable().destroy(); } catch (_) { } }
        }
        this._dtLastId = null;
    }
    _slug(str) { return String(str).toLowerCase().replace(/[^a-z0-9]+/gi, '-'); }

    _createMiniPie(containerId, data, opts = {}) {
        const width = opts.width ?? 210, height = opts.height ?? 140;
        return Highcharts.chart(containerId, {
            chart: { type: 'pie', backgroundColor: 'transparent', width, height, animation: false },
            title: { text: null }, credits: { enabled: false },
            exporting: { enabled: false, buttons: { contextButton: { enabled: false } } },
            tooltip: { enabled: false }, legend: { enabled: !!opts.legend },
            plotOptions: {
                series: { enableMouseTracking: false },
                pie: {
                    colorByPoint: true, size: '90%', dataLabels: {
                        enabled: true, useHTML: true, softConnector: true, distance: (opts.labelDistance ?? 16),
                        formatter: function () {
                            const fmt = (v, d = 0) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
                            const name = this.point.name, yStr = fmt(this.point.y, opts.valueDecimals ?? 0), pStr = Highcharts.numberFormat(this.percentage, opts.percentDecimals ?? 1);
                            return `<div style="text-align:center;line-height:1.1;"><div style="font-weight:600;">${name}</div><div style="font-size:${opts.valueFontSize ?? '10px'};">${yStr} <small>(${pStr}%)</small></div></div>`;
                        }, style: { fontSize: (opts.labelFontSize ?? '10px'), textOutline: 'none' }
                    }
                }
            },
            series: [{ name: 'Percentage', data }]
        });
    }
}


class DashMicro {
    /**
     * @param {Object} opts
     * @param {string} opts.containerId
     * @param {{ columnNames:string[], data:any[][] }} opts.data
     * @param {Array} [opts.kpis]
     * @param {Array} [opts.charts]
     * @param {boolean} [opts.includeGrid=false]
     * @param {number} [opts.decimals=2]
     * @param {number} [opts.pctDecimals=3]
     * @param {Array<string>} [opts.palette] // opcional, senão usa Highcharts.getOptions().colors
     */
    constructor(opts = {}) {
        const {
            containerId,
            data,
            kpis = [],
            charts = [],
            includeGrid = false,
            decimals = 2,
            pctDecimals = 3,
            palette = null
        } = opts;

        this.containerId = containerId;
        this.data = data;
        this.kpis = kpis;
        this.charts = charts;
        this.includeGrid = includeGrid;
        this.decimals = decimals;
        this.pctDecimals = pctDecimals;
        this.palette = palette;

        // validação básica
        if (!this.containerId || !this.data || !this.data.data || !this.data.columnNames) {
            throw new Error('Parâmetros obrigatórios ausentes: containerId, data.columnNames e data.data.');
        }

        // id fixo do conector para o board
        this.connectorId = 'micro-element';
    }

    render() {
        this.#createStructure();
        this.#applyPaletteToScope();
        this.#setGlobalOptions();
        const { kpiTargets, chartTargets } = this.#computeTargets();
        this.#applyContainerColors(kpiTargets, chartTargets);
        this.#mountBoard(kpiTargets, chartTargets);
    }

    // ---------- PRIVATES ----------

    #setGlobalOptions() {
        Highcharts.setOptions({
            chart: { styledMode: true },
            lang: { decimalPoint: ',', thousandsSep: '.' }
        });
    }

    #computeTargets() {
        const kpiTargets = this.kpis.map((k, i) => ({
            ...k,
            renderTo: k.renderTo || `kpi-${i + 1}`,
            colorIndex: (k.colorIndex ?? i)
        }));

        const chartTargets = this.charts.map((c, i) => ({
            ...c,
            renderTo: c.renderTo || `chart-${i + 1}`,
            colorIndex: (c.colorIndex ?? i),
            type: c.type || 'column',
            maxLabelLen: c.maxLabelLen || 12
        }));

        return { kpiTargets, chartTargets };
    }

    #applyContainerColors(kpiTargets, chartTargets) {
        kpiTargets.forEach(k => {
            const el = document.getElementById(k.renderTo);
            if (el) el.style.setProperty('--kpi-color', `var(--highcharts-color-${k.colorIndex})`);
        });
        chartTargets.forEach(c => {
            const el = document.getElementById(c.renderTo);
            if (el) el.style.setProperty('--highcharts-color-0', `var(--highcharts-color-${c.colorIndex})`);
        });
    }

    #applyPaletteToScope() {
        const colors = this.palette ?? (Highcharts.getOptions().colors || []);
        const scope = document.querySelector(`#${this.containerId} .hcdb`);
        if (!scope) return;
        colors.forEach((c, i) => scope.style.setProperty(`--highcharts-color-${i}`, c));
    }

    #createStructure() {
        const container = document.getElementById(this.containerId);
        if (!container) throw new Error(`Container "${this.containerId}" não encontrado.`);
        container.innerHTML = '';

        const wrap = document.createElement('div');
        wrap.className = 'hcdb container-fluid';

        // KPIs
        if (this.kpis.length > 0) {
            const kpiRow = document.createElement('div');
            kpiRow.className = 'row kpi-row';
            for (let i = 1; i <= this.kpis.length; i++) {
                const col = document.createElement('div');
                col.className = 'col-6 col-md-4 col-lg-3 mb-3 px-2';
                const cell = document.createElement('div');
                cell.className = 'hc-cell';
                cell.id = `kpi-${i}`;
                col.appendChild(cell);
                kpiRow.appendChild(col);
            }
            wrap.appendChild(kpiRow);
        }

        // Charts
        if (this.charts.length > 0) {
            const chartRow = document.createElement('div');
            chartRow.className = 'row chart-row';
            for (let i = 1; i <= this.charts.length; i++) {
                const col = document.createElement('div');
                col.className = 'col-12 col-lg-6 col-xl-4 mb-3 px-2';
                const cell = document.createElement('div');
                cell.className = 'hc-cell chart-cell';
                cell.id = `chart-${i}`;
                col.appendChild(cell);
                chartRow.appendChild(col);
            }
            wrap.appendChild(chartRow);
        }

        // Grid opcional
        if (this.includeGrid) {
            const gridRow = document.createElement('div');
            gridRow.className = 'row';
            const col = document.createElement('div');
            col.className = 'col-12';
            const cell = document.createElement('div');
            cell.className = 'hc-cell';
            cell.id = 'grid-1';
            col.appendChild(cell);
            gridRow.appendChild(col);
            wrap.appendChild(gridRow);
        }

        container.appendChild(wrap);
    }

    #mountBoard(kpiTargets, chartTargets) {
        this.board = Dashboards.board(this.containerId, {
            dataPool: {
                connectors: [{
                    id: this.connectorId,
                    type: 'JSON',
                    options: {
                        firstRowAsNames: false,
                        columnNames: this.data.columnNames,
                        data: this.data.data
                    }
                }]
            },
            editMode: { enabled: false, contextMenu: { enabled: false } },
            components: [
                // KPIs
                ...kpiTargets.map(k => ({
                    type: 'KPI',
                    renderTo: k.renderTo,
                    value: k.value ?? 0,
                    valueFormat: k.valueFormat || '{value}',
                    title: k.title || '',
                    subtitle: k.subtitle || ''
                })),

                // Charts
                ...chartTargets.map((chart, idx) => ({
                    renderTo: chart.renderTo,
                    sync: { visibility: true, highlight: true, extremes: true },
                    connector: {
                        id: this.connectorId,
                        columnAssignment: [{
                            seriesId: chart.seriesNameTitle || `Série ${idx + 1}`,
                            data: [this.data.columnNames[0], this.data.columnNames[idx + 1]]
                        }]
                    },
                    type: 'Highcharts',
                    chartOptions: this.#chartOptionsFactory(chart, idx)
                })),

                // DataGrid
                ...(this.includeGrid ? [{
                    renderTo: 'grid-1',
                    connector: { id: this.connectorId },
                    type: 'DataGrid',
                    sync: { highlight: true, visibility: true },
                    dataGridOptions: { credits: { enabled: false } }
                }] : [])
            ]
        }, true);

        this.#waitForKpiDom(kpiTargets).then(() => this.#animateKpis(kpiTargets));


    }
    #findKpiValueEl(renderToId) {
        return document.querySelector(
            `#${renderToId} .highcharts-dashboards-component-kpi-value`
        );
    }

    #waitForKpiDom(kpiTargets, timeoutMs = 1500) {
        const t0 = performance.now();
        return new Promise((resolve) => {
            const tick = () => {
                const ready = kpiTargets.every(k => this.#findKpiValueEl(k.renderTo));
                if (ready || performance.now() - t0 > timeoutMs) return resolve();
                requestAnimationFrame(tick);
            };
            tick();
        });
    }


    #animateKpis(kpiTargets) {
        kpiTargets.forEach(k => {
            const raw = Number(k.value ?? 0);
            const dec = (typeof k.decimals === 'number') ? k.decimals : this.decimals;
            const prefix = (k.prefix ?? '');
            const suffix = (k.suffix ?? '');

            // 3.1 tente via API do componente
            const comp = this.#getKpiComponentByRenderTo(k.renderTo);
            if (comp && typeof comp.setValue === 'function') {
                this.#animateByComponent(
                    comp,
                    0,
                    raw,
                    1000,
                    (v) => `${prefix}${this.#fmt(v, dec)}${suffix}`
                );
                return;
            }

            // 3.2 fallback: anima por DOM
            const el = this.#findKpiValueEl(k.renderTo);
            if (!el) return;
            this.#animarNumero(el, 0, raw, 1000, dec, prefix, suffix);
        });
    }

    #getKpiComponentByRenderTo(renderToId) {
        if (!this.board || !Array.isArray(this.board.mountedComponents)) return null;
        return this.board.mountedComponents.find(c =>
            c.type === 'KPI' && c.options && c.options.renderTo === renderToId
        ) || null;
    }

    #animateByComponent(comp, start, end, duration, formatFn) {
        const t0 = performance.now();
        const step = (now) => {
            const p = Math.min((now - t0) / duration, 1);
            const val = start + (end - start) * p;
            const txt = formatFn(val);
            // alguns KPIs aceitam string em setValue; se não, passe número e ajuste valueFormat
            comp.setValue(txt);
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    #fmt(v, decimals) {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
            useGrouping: true
        }).format(v);
    }

    // fallback DOM (igual ao anterior, só usando o #fmt)
    #animarNumero(el, start, end, duration = 1000, decimals = 0, prefix = '', suffix = '') {
        const t0 = performance.now();
        const step = (now) => {
            const p = Math.min((now - t0) / duration, 1);
            const val = start + (end - start) * p;
            el.textContent = `${prefix}${this.#fmt(val, decimals)}${suffix}`;
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    #chartOptionsFactory(chart, idx) {
        const self = this;
        return {
            chart: {
                animation: false,
                type: chart.type,
                spacing: [20, 20, 20, 20]
            },
            credits: { enabled: false },
            xAxis: {
                type: 'category',
                labels: {
                    rotation: -45,
                    formatter: function () {
                        const s = String(this.value || '');
                        const max = chart.maxLabelLen;
                        return s.length > max ? s.substring(0, max) + '…' : s;
                    }
                }
            },
            yAxis: {
                title: { text: chart.yAxisTitle || '' },
                max: chart.max ?? null,
                plotLines: [{
                    value: chart.plotLineValue || 0,
                    zIndex: 7,
                    dashStyle: 'shortDash',
                    label: {
                        text: chart.plotLineText || '',
                        align: 'right',
                        style: { color: '#B73C28' }
                    }
                }]
            },
            legend: {
                enabled: true,
                verticalAlign: 'top',
                labelFormatter: function () {
                    return chart.seriesNameTitle || this.name || 'Série';
                }
            },
            plotOptions: {
                series: {
                    marker: { radius: 5 },
                    dataLabels: {
                        enabled: true,
                        formatter: function () {
                            return Highcharts.numberFormat(
                                this.y,
                                chart.decimals ?? 0,
                                Highcharts.getOptions().lang.decimalPoint,
                                Highcharts.getOptions().lang.thousandsSep
                            );
                        }
                    }
                }
            },
            tooltip: {
                useHTML: true,
                stickOnContact: true,
                formatter: function () {
                    const pts = this.series.points || [];
                    const total = pts.reduce((s, p) => s + (p.y || 0), 0);
                    const pct = total ? (this.y / total) * 100 : 0;
                    const valueDec = chart.decimals ?? self.decimals;
                    const percentDec = chart.percentDecimals ?? self.pctDecimals;

                    const valFmt = Highcharts.numberFormat(
                        this.y, valueDec,
                        Highcharts.getOptions().lang.decimalPoint,
                        Highcharts.getOptions().lang.thousandsSep
                    );
                    const pctFmt = Highcharts.numberFormat(
                        pct, percentDec,
                        Highcharts.getOptions().lang.decimalPoint,
                        Highcharts.getOptions().lang.thousandsSep
                    );

                    const seriesName = chart.seriesNameTitle || this.series.name;
                    return `<b>${this.key}</b><br/>${seriesName}: <b>${valFmt}</b><br/>${pctFmt}% do total`;
                }
            },
            title: { text: chart.seriesName || '' }
        };
    }

    // util pública (se quiser reaproveitar)
    static formatNumberAdaptive(value, decimals = 2) {
        const isNarrow = window.innerWidth < 576;
        if (isNarrow) {
            return new Intl.NumberFormat('pt-BR', {
                notation: 'compact',
                compactDisplay: 'short',
                minimumFractionDigits: 0,
                maximumFractionDigits: 1
            }).format(value);
        }
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    }
}


class TimeSeriesChartPro {
    // ========== Static ==========
    static _langSet = false;
    static ensureLang() {
        if (TimeSeriesChartPro._langSet) return;
        Highcharts.setOptions({
            lang: {
                decimalPoint: ',', thousandsSep: '.',
                rangeSelectorZoom: "", rangeSelectorFrom: "De", rangeSelectorTo: "Até"
            },
            time: { useUTC: true }
        });
        TimeSeriesChartPro._langSet = true;
    }

    // ========== CTOR ==========
    constructor(opts = {}) {
        TimeSeriesChartPro.ensureLang();

        const def = {
            container: null,
            title: "", subtitle: "",
            colors: ["#2e7d32", "#1565c0", "#ffc107", "#17a2b8", "#007bff", "#6f42c1", "#fd7e14"],

            // Se você não passar seriesConfig, detecto a partir do dataMap.
            // seriesConfig: [{ id, name, type, axis: 'left'|'right', format:{decimals,prefix,suffix}, color }]
            seriesConfig: null,

            // RangeSelector compacto (pode customizar/estender)
            rangeSelector: {
                selected: 0, dropdown: 'responsive', inputEnabled: false, buttonSpacing: 10,
                buttons: [
                    { type: "all", text: "Tudo" },
                    { type: "day", count: 7, text: "7D" },
                    { type: "day", count: 15, text: "15D" },
                    { type: "month", count: 1, text: "1M" },
                    { type: "month", count: 3, text: "3M" },
                    { type: "month", count: 6, text: "6M" },
                    { type: "ytd", text: "YTD" },
                ],
                buttonTheme: { r: 8, padding: 3, style: { fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap" } }
            },

            // Toolbar de agrupamento (Dia/Semana/Mês)
            createToolbar: false,
            toolbarContainer: null, // ex: "#minhaDiv"

            // Formatação default se a série não especificar
            defaultFormat: { decimals: 2, prefix: "", suffix: "" },

            // Tooltip custom opcional: function (ctx) { ...return html/string... }
            tooltipFormatter: null
        };

        this.opts = Object.assign({}, def, opts);
        if (!this.opts.container) throw new Error("container obrigatório");

        this.chart = null;
        this._dataMap = null;
        this._seriesCfgResolved = null; // após resolver cores/format etc
    }

    // ========== Utils ==========
    _fmtVal(v, f) {
        if (v == null || isNaN(v)) return "-";
        const ff = Object.assign({ decimals: 2, prefix: "", suffix: "" }, f || {});
        return (ff.prefix || "") + new Intl.NumberFormat("pt-BR", {
            minimumFractionDigits: ff.decimals, maximumFractionDigits: ff.decimals
        }).format(Number(v)) + (ff.suffix || "");
    }
    _parseUTC(yyyy_mm_dd) {
        const [y, m, d] = (yyyy_mm_dd || "").split("-").map(Number);
        return Date.UTC(y || 1970, (m || 1) - 1, d || 1);
    }

    _detectSeriesKeys(dataMap) {
        // pega a primeira linha com valores e usa as chaves
        for (const k of Object.keys(dataMap || {})) {
            const row = dataMap[k]; if (row && typeof row === "object") {
                return Object.keys(row);
            }
        }
        return [];
    }

    _resolveSeriesConfig(dataMap) {
        // cria config por série com defaults
        const palette = this.opts.colors || [];
        const keys = this.opts.seriesConfig
            ? this.opts.seriesConfig.map(s => s.id)
            : this._detectSeriesKeys(dataMap);

        const inputCfgMap = new Map();
        (this.opts.seriesConfig || []).forEach((s, i) => {
            inputCfgMap.set(s.id, Object.assign({ order: i }, s));
        });

        const resolved = [];
        keys.forEach((id, i) => {
            const base = inputCfgMap.get(id) || {};
            resolved.push({
                id,
                name: base.name || id,
                type: (base.type || "spline"),
                axis: base.axis || ((i % 2 === 0) ? "left" : "right"),
                color: base.color || palette[i % palette.length],
                format: Object.assign({}, this.opts.defaultFormat, base.format || {})
            });
        });
        return resolved;
    }

    _buildToolbar() {
        if (!this.opts.createToolbar) return null;

        const cid = this.opts.container;
        const target = this.opts.toolbarContainer
            ? document.querySelector(this.opts.toolbarContainer)
            : document.getElementById(cid)?.parentElement;

        if (!target) return null;

        const id = `grp-${cid}`;
        if (target.querySelector(`#${id}`)) return `#${id}`;

        const wrap = document.createElement('div');
        wrap.className = 'd-flex justify-content-end mb-2';
        wrap.innerHTML = `
      <div id="${id}" class="btn-group btn-group-sm" role="group" aria-label="Agrupar">
        <button type="button" class="btn btn-outline-secondary active" data-unit="day">Dia</button>
        <button type="button" class="btn btn-outline-secondary" data-unit="week">Semana</button>
        <button type="button" class="btn btn-outline-secondary" data-unit="month">Mês</button>
      </div>`;
        target.insertBefore(wrap, document.getElementById(cid));
        return `#${id}`;
    }

    _attachGrouping(containerSelector) {
        if (!containerSelector) return;
        const $c = $(containerSelector); if (!$c.length) return;

        const DAY = 24 * 3600 * 1000;
        const GROUP = {
            day: { units: [['day', [1]]], range: DAY },
            week: { units: [['week', [1]]], range: 7 * DAY },
            month: { units: [['month', [1]]], range: 30 * DAY }
        };

        const getChart = () => Highcharts.charts.find(c => c && c.renderTo && c.renderTo.id === this.opts.container);

        $c.off("click.tscp").on("click.tscp", "[data-unit]", (ev) => {
            const ch = getChart(); if (!ch || !ch.xAxis || !ch.xAxis[0]) return;

            const unit = ev.currentTarget.dataset.unit || "day";
            const cfg = GROUP[unit] || GROUP.day;

            $c.find("[data-unit]").removeClass("active");
            $(ev.currentTarget).addClass("active");

            ch.xAxis[0].update({ minRange: cfg.range }, false);

            if (Array.isArray(ch.series) && ch.series.length) {
                ch.series.forEach(s => {
                    const type = (s.type || s.options.type || "").toLowerCase();
                    const isColumn = type === "column";
                    s.update({
                        dataGrouping: { forced: true, units: cfg.units, approximation: "sum" },
                        pointRange: isColumn ? cfg.range : null,
                        pointPadding: isColumn ? 0.05 : undefined,
                        groupPadding: isColumn ? 0.02 : undefined,
                        borderWidth: isColumn ? 0 : undefined
                    }, false);
                });
            }
            ch.redraw();
        });
    }

    // monta séries a partir do dataMap e do seriesConfig resolvido
    _buildSeries(dataMap, seriesCfg) {
        const dates = Object.keys(dataMap || {}).sort();
        const buckets = new Map(); // id -> [[t,v],...]

        seriesCfg.forEach(s => buckets.set(s.id, []));

        dates.forEach(dt => {
            const t = this._parseUTC(dt);
            const row = dataMap[dt] || {};
            seriesCfg.forEach(s => {
                const v = row[s.id];
                if (v != null) buckets.get(s.id).push([t, Number(v)]);
            });
        });

        const out = [];
        seriesCfg.forEach((s, idx) => {
            const axisIndex = (s.axis === "right") ? 1 : 0;
            out.push({
                id: s.id,
                name: s.name,
                type: s.type,
                data: buckets.get(s.id),
                color: s.color,
                yAxis: axisIndex,
                lineWidth: 3,
                dashStyle: (s.type === "spline") ? "ShortDash" : "Solid",
                marker: { enabled: false, radius: 2 },
                fillOpacity: (s.type.includes("area") ? 0.08 : 0),
                dataGrouping: { enabled: true },
                _fmt: s.format
            });
        });

        return out;
    }

    // ========== RENDER ==========
    render(dataMap) {
        this._dataMap = dataMap || {};
        this._seriesCfgResolved = this._resolveSeriesConfig(this._dataMap);

        // yAxes de acordo com quantos lados precisamos
        const needsRight = this._seriesCfgResolved.some(s => s.axis === "right");
        const needsLeft = this._seriesCfgResolved.some(s => s.axis !== "right");

        const self = this;
        const yAxes = [];

        if (needsLeft) {
            // pega o 1º da esquerda para título/format padrão
            const leftCfg = this._seriesCfgResolved.find(s => s.axis !== "right") || this._seriesCfgResolved[0];
            yAxes.push({
                title: { text: leftCfg ? leftCfg.name : "" },
                labels: { formatter: function () { return self._fmtVal(this.value, leftCfg.format); } },
                opposite: false
            });
        }
        if (needsRight) {
            const rightCfg = this._seriesCfgResolved.find(s => s.axis === "right") || this._seriesCfgResolved[0];
            yAxes.push({
                title: { text: rightCfg ? rightCfg.name : "" },
                labels: { formatter: function () { return self._fmtVal(this.value, rightCfg.format); } },
                opposite: true
            });
        }

        const series = this._buildSeries(this._dataMap, this._seriesCfgResolved);
        const toolbarSel = this._buildToolbar();

        this.chart = Highcharts.stockChart(this.opts.container, {
            chart: {
                backgroundColor: "transparent",
                spacing: [15, 12, 8, 12],
                style: { fontFamily: 'system-ui, -apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial' }
            },
            credits: { enabled: false },
            title: { text: this.opts.title, align: "center", y: 0, margin: 0, style: { fontWeight: 600, fontSize: "15px" } },
            subtitle: { text: this.opts.subtitle, align: "center", y: 14, style: { color: "#6c757d" } },
            legend: {
                enabled: true, floating: true, layout: "horizontal", align: "center",
                verticalAlign: "top", y: 20, padding: 0, margin: 0, itemDistance: 12,
                symbolRadius: 6, itemStyle: { fontWeight: 500 }
            },

            rangeSelector: this.opts.rangeSelector,

            navigator: {
                height: 20, margin: 2, maskFill: "rgba(13,110,253,0.15)", outlineWidth: 0,
                series: { lineWidth: 1, marker: { enabled: false } }
            },
            scrollbar: {
                barBackgroundColor: "#dee2e6", barBorderRadius: 6, rifleColor: "#adb5bd",
                trackBackgroundColor: "#f1f3f5", trackBorderWidth: 0
            },

            xAxis: { minRange: 24 * 3600 * 1000, labels: { style: { color: "#495057" } } },
            yAxis: yAxes,

            plotOptions: {
                series: {
                    label: { enabled: false }, states: { hover: { lineWidthPlus: 1 } },
                    dataGrouping: { forced: false }, turboThreshold: 0
                },
                column: { dataGrouping: { approximation: "sum" } },
                areaspline: { fillOpacity: 0.08 }
            },

            tooltip: {
                shared: true,
                useHTML: true,
                borderColor: "#dee2e6",
                borderRadius: 8,
                formatter: this.opts.tooltipFormatter
                    ? function () { return self.opts.tooltipFormatter.call(this, self); }
                    : function () {
                        const date = Highcharts.dateFormat("%d/%m/%Y", this.x);
                        let html = `<div style="min-width:220px"><div style="margin-bottom:6px;font-weight:600">${date}</div>`;
                        const pts = (this.points && this.points.length)
                            ? this.points
                            : (this.point ? [{ series: this.series, y: this.point.y, color: this.point.color }] : []);
                        pts.forEach(p => {
                            const f = (p.series && p.series.userOptions && p.series.userOptions._fmt)
                                ? p.series.userOptions._fmt
                                : self.opts.defaultFormat;
                            const dot = `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};margin-right:6px"></span>`;
                            html += `<div style="display:flex;justify-content:space-between;gap:8px">
                  <span>${dot}${p.series ? p.series.name : ""}</span>
                  <b>${self._fmtVal(p.y, f)}</b>
                </div>`;
                        });
                        return html + `</div>`;
                    }
            },

            series
        });

        // toolbar (agrupamento)
        this._attachGrouping(toolbarSel);

        return this.chart;
    }

    // ========== Métodos públicos ==========
    getChart() { return this.chart; }

    updateData(newDataMap, redraw = true) {
        this._dataMap = newDataMap || {};
        const cfg = this._seriesCfgResolved || this._resolveSeriesConfig(this._dataMap);
        const seriesData = this._buildSeries(this._dataMap, cfg);
        if (!this.chart) return;

        // sincroniza série por id (add/remove/replace)
        const existingIds = new Set(this.chart.series.map(s => s.options.id));
        const incomingIds = new Set(seriesData.map(s => s.id));

        // remove as que não existem mais
        this.chart.series.slice().forEach(s => {
            if (!incomingIds.has(s.options.id)) s.remove(false);
        });

        // add/atualiza
        seriesData.forEach(sNew => {
            const sOld = this.chart.series.find(s => s.options.id === sNew.id);
            if (sOld) {
                sOld.update({ data: sNew.data, _fmt: sNew._fmt }, false);
            } else {
                this.chart.addSeries(sNew, false);
            }
        });

        if (redraw) this.chart.redraw();
    }

    setRange(fromMs, toMs) {
        if (this.chart && this.chart.xAxis && this.chart.xAxis[0]) {
            this.chart.xAxis[0].setExtremes(fromMs, toMs);
        }
    }

    // 'day' | 'week' | 'month' (mesmo comportamento da toolbar)
    setGrouping(unit) {
        const DAY = 24 * 3600 * 1000;
        const GROUP = {
            day: { units: [['day', [1]]], range: DAY },
            week: { units: [['week', [1]]], range: 7 * DAY },
            month: { units: [['month', [1]]], range: 30 * DAY }
        };
        const cfg = GROUP[unit] || GROUP.day;
        const ch = this.chart; if (!ch) return;

        if (ch.xAxis && ch.xAxis[0]) ch.xAxis[0].update({ minRange: cfg.range }, false);
        if (Array.isArray(ch.series)) {
            ch.series.forEach(s => {
                const type = (s.type || s.options.type || "").toLowerCase();
                const isColumn = type === "column";
                s.update({
                    dataGrouping: { forced: true, units: cfg.units, approximation: "sum" },
                    pointRange: isColumn ? cfg.range : null,
                    pointPadding: isColumn ? 0.05 : undefined,
                    groupPadding: isColumn ? 0.02 : undefined,
                    borderWidth: isColumn ? 0 : undefined
                }, false);
            });
        }
        ch.redraw();
    }

    // atalhos comuns
    setRangeShortcut(kind) {
        const now = new Date();
        let min, max = now.getTime();

        if (kind === 'thisWeek') {
            const d = new Date(now); const dow = d.getDay(); const back = (dow === 0 ? 6 : dow - 1);
            d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - back); min = d.getTime();
        } else if (kind === '15d') {
            min = max - 15 * 24 * 3600 * 1000;
        } else if (kind === 'thisMonth') {
            const start = new Date(now.getFullYear(), now.getMonth(), 1); min = start.getTime();
        } else if (kind === 'lastMonth') {
            const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
            min = start.getTime(); max = end.getTime();
        } else if (kind === '3m') {
            min = max - 90 * 24 * 3600 * 1000;
        } else if (kind === '6m') {
            min = max - 182 * 24 * 3600 * 1000;
        } else { return; }

        this.setRange(min, max);
    }
}



