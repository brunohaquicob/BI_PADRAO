class HighChartsHotMap {
    constructor(dados, csvId) {
        this.chartId = dados.id;
        this.csvId = csvId;
        this.chartTitle = dados.title;
        this.chartSubTitle = dados.subTitle;
        this.chartData = dados.data;//[{x: 2024-01-01, y: 12, value: 123}, ...]
        this.minX = dados.minX;
        this.maxX = dados.maxX;
        this.headerTooltip = dados.headerTooltip;
        this.createChart();
    }

    createChart() {
        Highcharts.chart(this.chartId, {
            chart: {
                type: 'heatmap',
                inverted: false,
            },
            data: {
                csv: document.getElementById(this.csvId).innerHTML
            },
            accessibility: {
                description: ''
            },
            title: {
                text: this.chartTitle,
                align: 'center'
            },

            subtitle: {
                text: this.chartSubTitle,
                align: 'center'
            },

            xAxis: {
                tickPixelInterval: 50,
                min: this.minX,
                max: this.maxX,
            },

            yAxis: {
                accessibility: {
                    description: 'Horas no dia'
                },
                title: {
                    text: null
                },
                labels: {
                    format: '{value}:00'
                },
                lineWidth: 1,
                minPadding: 0,
                maxPadding: 0,
                startOnTick: false,
                endOnTick: false,
                tickPositions: [0, 6, 12, 18, 24],
                tickWidth: 1,
                min: 0,
                max: 23
            },
            legend: {
                align: 'right',
                layout: 'vertical',
                verticalAlign: 'middle'
            },
            colorAxis: {
                stops: [
                    [0.0, 'lightblue'],
                    [0.1, '#DBE7C2'],
                    [0.2, '#CBDFC8'],
                    [0.3, '#F3E99E'],
                    [0.4, '#F9D879'],
                    [0.7, '#F9A05C'],
                    [0.9, '#FF851B'],
                    [1.0, '#DC3545']
                ],
                min: 0
            },

            series: [{
                borderWidth: 0,
                colsize: 24 * 36e5, // one day
                tooltip: {
                    headerFormat: this.headerTooltip + '<br/>',
                    pointFormat: '{point.x:%e %b, %Y} {point.y}:00: <b>{point.value}</b>'
                },
                accessibility: {
                    enabled: false
                }
            }]
        });
    }
}