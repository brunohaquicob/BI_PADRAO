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
        const { containerId, title, subtitle, xAxisCategories, seriesData, tooltipMode = 'total', chartHeight = null } = config;

        // 1. Descobrir grupos de eixos
        const axisGroups = [];
        seriesData.forEach(s => {
            const group = s.axisGroup || 'default';
            if (!axisGroups.includes(group)) axisGroups.push(group);
        });

        // 2. Criar yAxis dinamicamente (1 por grupo)
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
                opposite: serie.position === 'right'
            };
        });

        // 3. Configurar as séries com referência ao eixo correto
        const series = seriesData.map(serie => ({
            name: serie.name,
            type: serie.type || 'line',
            yAxis: axisGroups.indexOf(serie.axisGroup || 'default'),
            data: serie.data,
            tooltip: {
                valueSuffix: serie.format || ''
            }
        }));

        // 4. Renderizar Highcharts
        Highcharts.chart(containerId, {
            chart: {
                zooming: {
                    type: '',
                    mouseWheel: false,
                    singleTouch: false
                },
                panning: false,
                height: chartHeight || undefined // Usa se vier no config
            },
            title: { text: title, align: 'left' },
            subtitle: { text: subtitle, align: 'left' },
            credits: false,
            xAxis: [{ categories: xAxisCategories, crosshair: true }],
            yAxis,
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
                        const serie = seriesData.find(s => s.name === point.series.name) || {};
                        const dec = serie.decimals ?? 0;
                        const valueStr = fmtNumber(point.y, dec);
                        const suffix = serie.suffix || '';
                        const prefix = serie.prefix || '';

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
                backgroundColor:
                    Highcharts.defaultOptions.legend.backgroundColor || 'rgba(255,255,255,0.25)'
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
        const seriesMeta = this.options.series;
        const xType = this.options.xAxis?.type ?? 'category';
        const seriesPerc = this.options.seriesPerc || [];
        const defaultDecimals = this.options?.tooltip?.decimals ?? 2;

        return {
            shared: true,
            useHTML: true,
            borderWidth: 0,
            formatter: function () {
                const fmtNumber = (v, dec) =>
                    new Intl.NumberFormat('pt-BR', {
                        minimumFractionDigits: dec ?? 0,
                        maximumFractionDigits: dec ?? 0
                    }).format(v);

                let keyLabel = this.key;
                if (xType === 'datetime') {
                    keyLabel = Highcharts.dateFormat('%e. %b %Y', this.x);
                }

                let totalGeral = 0;
                let totalBase = 0;
                const pontos = [];

                this.points.forEach(p => {
                    totalGeral += (p.y || 0);
                    const isBase = seriesPerc.includes(p.series.name);
                    if (!isBase) {
                        totalBase += (p.y || 0);
                    }
                    pontos.push({ ...p, isBase });
                });

                let html = `<div class="panel panel-default" style="min-width:230px;margin:0;">
                <div class="panel-heading" style="font-weight:bold; text-align:center; padding:5px 10px;">
                    ${keyLabel}
                </div>
                <div class="list-group" style="margin:0;">`;

                pontos.forEach(point => {
                    const serie = seriesMeta.find(s => s.name === point.series.name) || {};
                    const dec = serie.decimals ?? defaultDecimals;
                    const valueStr = fmtNumber(point.y, dec);
                    const suffix = serie.suffix || '';
                    const prefix = serie.prefix || '';

                    let percStr = '';
                    if (!point.isBase && totalBase) {
                        const perc = (point.y / totalBase * 100);
                        percStr = `<small class="text-muted">(${perc.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}%)</small>`;
                    }

                    html += `<div class="list-group-item" style="display:flex;justify-content:space-between;align-items:center;padding:5px 10px;">
                    <span><span style="color:${point.color}">\u25CF</span> ${point.series.name}</span>
                    <span>&nbsp;&nbsp;<b>${prefix}${valueStr}${suffix}</b> ${percStr}</span>
                </div>`;
                });

                if (!seriesPerc?.length) {
                    const totalStr = fmtNumber(totalGeral, defaultDecimals);
                    html += `<div class="list-group-item" style="font-weight:bold;text-align:right;">Total: ${totalStr}</div>`;
                }
                return html;
            }
        };
    }

}

