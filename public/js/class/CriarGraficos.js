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
                    const valueDec = chart.valueDecimals ?? self.decimals;
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
