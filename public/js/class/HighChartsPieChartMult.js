class HighChartsPieChartMult {
    constructor(options, decimal = 0, seriesName = "Fases", seriesNameSub = "Tipos") {
        this.options = options;
        this.chart = null;
        this.decimal = decimal;
        this.seriesName = seriesName;
        this.seriesNameSub = seriesNameSub;
        this.createChart();
    }

    createChart() {
        const {
            data,
            categories,
            title,
            subtitle,
            totalTodos,
            containerId,
            nameTooltip
        } = this.options;
        var self = this;
        const colors = Highcharts.getOptions().colors,
            browserData = [],
            versionsData = [],
            dataLen = data.length;

        let i, j, drillDataLen, brightness;
        // Build the data arrays
        for (i = 0; i < dataLen; i += 1) {
            // add browser data
            browserData.push({
                name: categories[i],
                y: (data[i].valor / totalTodos) * 100,
                filho: false,
                valor: data[i].valor,
                color: colors[data[i].color]
            });

            // add version data
            drillDataLen = data[i].drilldown.data.length;
            for (j = 0; j < drillDataLen; j += 1) {
                const name = data[i].drilldown.categories[j];
                brightness = 0.2 - (j / drillDataLen) / 5;
                versionsData.push({
                    name,
                    pai: categories[i],
                    filho: true,
                    y: (data[i].drilldown.data[j] / totalTodos) * 100,
                    valor: data[i].drilldown.data[j],
                    color: Highcharts.color(colors[data[i].color]).brighten(brightness).get(),
                    custom: {
                        version: name.split(' ')[1] || name.split(' ')[0]
                    }
                });
            }
        }
        // Create the chart
        this.chart = Highcharts.chart(containerId, {
            chart: {
                type: 'pie',
                height: '600px'
            },
            title: {
                text: title,
                align: 'center'
            },
            subtitle: {
                text: subtitle,
                align: 'center'
            },
            plotOptions: {
                pie: {
                    shadow: false,
                    center: ['50%', '50%']
                }
            },
            tooltip: {
                useHTML: true,
                formatter: function () {
                    //return "Teste"
                    //console.log(this)
                    var sum = 0;
                    var valor = 0;
                    var totalGeral = 0;
                    var percentEsse = 0;
                    var classeRow = ''
                    var namePoint = ''
                    var s = '<table class="w100perc"><thead>';
                    if (this.point.filho === false) {
                        s += '<tr><th colspan="3" class="text-center">' + this.key + '</th></tr>';
                        s += '<tr><th class="text-center">#</th><th class="text-center">Qtd</th><th class="text-center">%</th></tr>';
                        s += '<tboody>';
                        valor = this.point.valor;
                        namePoint = this.key;
                        $.each(this.series.data, function (k, v) {
                            classeRow = ( namePoint === v.name) ? "table-info" : "";
                            s += '<tr style="font-size: 10px;" class="' + classeRow + '">';
                            s += '<td class="text-left borderTable text-left">' + v.name;
                            s += '<td class="text-center borderTable text-center">' + doubleToMoney(v.valor, self.decimal);
                            s += '<td class="text-center borderTable text-center">' + doubleToMoney(v.y, 3) + '%';
                            s += '</tr>';
                            sum += v.valor;
                            totalGeral += v.valor;
                        });
                        s += '</tboody>';
                        s += '<tfooter>';
                        s += '<tr><th class="text-left">Total</th><th class="text-center">' + doubleToMoney(sum, self.decimal) + '</th><th></th><th></th></tr>';
                    } else {
                        s += '<tr><th colspan="4" class="text-center">Tipos</th></tr>';
                        var pai = this.point.pai;
                        valor = this.point.valor;
                        s += '<tr><th class="text-center">#</th><th class="text-center">Qtd</th><th class="text-center">%</th><th class="text-center">% Geral</tr>';
                        s += '<tboody>';
                        namePoint = this.key;
                        $.each(this.series.data, function (k, v) {
                            if (v.pai == pai) {
                                sum += v.valor;
                            }
                        });
                        var contEsse = 0;
                        $.each(this.series.data, function (k, v) {
                            if (v.pai == pai) {
                                contEsse++;
                                if (contEsse <= 10) {
                                    classeRow = (namePoint === v.name) ? "table-info" : "";
                                    percentEsse = v.valor / sum * 100;
                                    s += '<tr style="font-size: 10px;" class="'+ classeRow + '">';
                                    s += '<td class="text-left borderTable text-left">' + v.name;
                                    s += '<td class="text-center borderTable text-center ">' + doubleToMoney(v.valor, self.decimal);
                                    s += '<td class="text-center borderTable text-center ">' + doubleToMoney(percentEsse, 3) + '%';
                                    s += '<td class="text-center borderTable text-center ">' + doubleToMoney(v.y, 3) + '%';
                                    s += '</tr>';
                                }
                            }
                            totalGeral += v.valor;
                        });
                        s += '</tboody>';
                        s += '<tfooter>';
                        s += '<tr><th class="text-left">Total</th><th class="text-center">' + doubleToMoney(sum, self.decimal) + '</th><th></th><th></th><th></th></tr>';
                    }
                    s += '</tfooter>';
                    s += '</table>';
                    // Calcula o percentual com base no valor do item em relação ao valor total
                    var percent = (valor / (sum)) * 100;
                    var retorno = "";
                    retorno += '<div class="info-box bg-gradient-light" style="margin:1px;">'
                    retorno += '<div class="info-box-content">'
                    retorno += '<span class="info-box-text">' + s + '</span>'
                    retorno += '<span class="info-box-number">' + this.key + ': <b>' + (doubleToMoney(valor, self.decimal)) + '</b> <small>' + nameTooltip + '.</small></span>'
                    retorno += '<div class="progress">'
                    retorno += '<div class="progress-bar bg-primary progress-bar-striped" style="width: ' + percent + '%;"></div>'
                    retorno += '</div>'
                    retorno += '<span class="progress-description">'
                    retorno += '<i><b>' + (doubleToMoney(percent, 2)) + '%</b> de <b>' + (doubleToMoney((sum), self.decimal)) + '</b> sobre um total geral de <b>' + (doubleToMoney((totalGeral), self.decimal)) + '</b></i>'
                    retorno += '</span>'
                    retorno += '</div>'
                    retorno += '</div>'
                    return retorno;
                },
            },
            series: [{
                name: self.seriesName,
                data: browserData,
                size: '45%',
                dataLabels: {
                    color: '#ffffff',
                    distance: '-50%'
                }
            }, {
                name: self.seriesNameSub,
                data: versionsData,
                size: '80%',
                innerSize: '60%',
                dataLabels: {
                    format: '<b>{point.name}:</b> <span style="opacity: 0.5">{y:.2f}%</span>',
                    filter: {
                        property: 'y',
                        operator: '>',
                        value: 1.5
                    },
                    style: {
                        fontWeight: 'normal'
                    }
                },
                id: 'secundario'
            }],
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 400
                    },
                    chartOptions: {
                        series: [{
                        }, {
                            id: 'secundario',
                            dataLabels: {
                                distance: 10,
                                format: '{point.custom.secundario}',
                                filter: {
                                    property: 'percentage',
                                    operator: '>',
                                    value: 1.5
                                }
                            }
                        }]
                    }
                }]
            }
        });
    }
}