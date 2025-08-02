class dashboardPadrao {
    constructor(rangeDatas, route, routeDetalhes) {
        this.rangeDatas = rangeDatas;
        this.route = route;
        this.routeDetalhes = routeDetalhes;
        this.dados = [];
        this.buscarDados();
    }

    buscarDados() {
        const self = this;
        const requestParams = {
            method: 'POST',
            url: this.route,
            data: {
                'datas': this.rangeDatas
            },
            formId: ''
        };

        addLoading("loadingPage");
        AjaxRequest.sendRequest(requestParams).then(response => {
            removeLoading("loadingPage");
            if (response.status === true) {
                if (response.data !== undefined) {
                    this.dados = response.data;
                    //MOntar Headers
                    montaDivsHeader(this.dados.header, self.routeDetalhes);
                    // montaGraficoPagamentos("grafico_pagamentos_01", this.dados.grafico_pagamentos.quantidade, "Pagamentos x Quantidade", "", 0);
                    // montaGraficoPagamentos("grafico_pagamentos_02", this.dados.grafico_pagamentos.valores, "Pagamentos x Valores", "", 2);
                    //
                    var card_header_id = "idCardG1";
                    animarCampo(card_header_id + '-footer1', this.dados.header.total_qtd, 0);
                    animarCampo(card_header_id + '-footer2', this.dados.header.total_valor, 2);
                    animarCampo(card_header_id + '-footer3', this.dados.header.tiket_medio, 2);
                    animarCampo(card_header_id + '-footer4', this.dados.header.campeao.valor, 2);
                    $('#' + card_header_id + '-footer44').html(`Maior Valor Gerado: <b>${this.dados.header.campeao.name}`);
                    //Montar Graficos div1
                    var grafico_div1 = this.dados.grafico_fases_qtd;
                    CriarGraficos.criarDonutchart("grafico_01_01", grafico_div1.data, grafico_div1.seriesname, grafico_div1.title, grafico_div1.subtitle);
                    var grafico_div1 = this.dados.grafico_fases_valor;
                    CriarGraficos.criarDonutchart("grafico_02_02", grafico_div1.data, grafico_div1.seriesname, grafico_div1.title, grafico_div1.subtitle, 2);

                    var grafico_div1 = response.data.grafico_tipo_pagamento_qtd;
                    CriarGraficos.criarDonutchart("grafico_03", grafico_div1.data, grafico_div1.seriesname, grafico_div1.title, grafico_div1.subtitle);
                    var grafico_div1 = response.data.grafico_tipo_pagamento_valor;
                    CriarGraficos.criarDonutchart("grafico_04", grafico_div1.data, grafico_div1.seriesname, grafico_div1.title, grafico_div1.subtitle, 2);

                    var grafico_div1 = response.data.grafico_data_qtd;
                    criarStockDiaHora("grafico_05", grafico_div1, "Acordos/Quantidade", 0,);
                    var grafico_div1 = response.data.grafico_data_valor;
                    criarStockDiaHora("grafico_06", grafico_div1, "Acordos/Valores", 2);

                    //PieMult
                    var currentHighChartsPie = null;
                    currentHighChartsPie = new HighChartsPieChartMult(response.data.grafico_pie_mult_qtd, 0, "Fases", "Tipo Pagamento");
                    var currentHighChartsPie2 = null;
                    currentHighChartsPie2 = new HighChartsPieChartMult(response.data.grafico_pie_mult_valor, 2, "Fases", "Tipo Pagamento");
                    if (response.msg != "") {
                        //SweetAlert.info(response.msg);
                        SweetAlert.alertAutoClose("info", "Atenção", response.msg, 20000);
                    }
                }
            } else {
                if (response.msg != "") {
                    SweetAlert.alertAutoClose("warning", "Atenção", response.msg, 20000);
                }
            }
        }).catch(error => {
            console.error(error);
        });
    }


}


function montaGraficoPagamentos(containerId, data, title, subtitle, decimalPlaces = 2, decimalSeparator = ',', thousandSeparator = '.') {
    // Ordenar os dados pela soma dos valores (maior para menor)
    data.sort((a, b) => (b.values[0] + b.values[1] + b.values[2]) - (a.values[0] + a.values[1] + a.values[2]));

    // Extrair categorias e dados das medalhas
    let categories = data.map(item => item.name);
    let goldData = data.map(item => item.values[0]);
    let silverData = data.map(item => item.values[1]);
    let bronzeData = data.map(item => item.values[2]);

    // Calcular totais das séries
    let totalGold = goldData.reduce((a, b) => a + b, 0);
    let totalSilver = silverData.reduce((a, b) => a + b, 0);
    let totalBronze = bronzeData.reduce((a, b) => a + b, 0);

    // Total geral de todas as categorias e séries
    let totalOverall = totalGold + totalSilver + totalBronze;

    const valorQuebraY = (totalOverall / 4).toFixed(0);

    Highcharts.chart(containerId, {
        colors: ['#17a2b8', '#28a745', '#ffc107'],
        chart: {
            type: 'column',
            inverted: true,
            polar: true,
            height: '550px'
        },
        title: {
            text: title,
            align: 'center'
        },
        subtitle: {
            text: subtitle,
            align: 'center'
        },
        tooltip: {
            shared: true,
            formatter: function () {
                let totalCategory = 0;
                let totalSeriesVisible = { 'Em Aberto': 0, 'Recebidos': 0, 'Cancelados': 0 };
                let body = '';

                // Calcula o total da categoria
                this.points.forEach(point => {
                    totalCategory += point.y;

                    if (point.series.visible) {
                        if (point.series.name === 'Em Aberto') {
                            totalSeriesVisible['Em Aberto'] += point.y;
                        } else if (point.series.name === 'Recebidos') {
                            totalSeriesVisible['Recebidos'] += point.y;
                        } else if (point.series.name === 'Cancelados') {
                            totalSeriesVisible['Cancelados'] += point.y;
                        }
                    }
                });

                // Função para formatar números e percentuais
                function formatNumber(value) {
                    return Highcharts.numberFormat(value, decimalPlaces, decimalSeparator, thousandSeparator);
                }

                function formatPercentage(value) {
                    return Highcharts.numberFormat(value, decimalPlaces, decimalSeparator, '') + '%';
                }

                // Cria o corpo do tooltip com os totais e percentuais
                let totalVisibleSeries = 0;
                body = this.points.map(point => {
                    if (point.series.visible) {
                        let totalSeriesType = 0;
                        if (point.series.name === 'Em Aberto') {
                            totalVisibleSeries += totalSeriesType = totalGold;
                        } else if (point.series.name === 'Recebidos') {
                            totalVisibleSeries += totalSeriesType = totalSilver;
                        } else if (point.series.name === 'Cancelados') {
                            totalVisibleSeries += totalSeriesType = totalBronze;
                        }
                        let categoryPercentage = ((point.y / totalCategory) * 100).toFixed(decimalPlaces);
                        let seriesPercentage = ((point.y / totalSeriesType) * 100).toFixed(decimalPlaces);
                        let overallPercentage = ((point.y / totalOverall) * 100).toFixed(decimalPlaces);
                        return `${point.series.name}: ${formatNumber(point.y)} (${formatPercentage(categoryPercentage)}) - No Geral: (${formatPercentage(seriesPercentage)} de ${formatNumber(totalSeriesType)})<br/>`;
                    }
                    return '';
                }).join('');

                let categoryTotalLine = `<b>${this.points[0].key}: ${formatNumber(totalCategory)} (${formatPercentage((totalCategory / totalVisibleSeries) * 100)}) de ${formatNumber(totalVisibleSeries)}</b><br/><br/>`;

                return categoryTotalLine + body;
            },
            backgroundColor: '#ffffff', // Fundo branco para o tooltip
            borderColor: '#000000', // Borda preta
            borderRadius: 5, // Bordas arredondadas
            borderWidth: 1, // Largura da borda
            shadow: false, // Adiciona sombra
            zIndex: 10000 // Garantir que o tooltip esteja no topo
        },
        pane: {
            size: '85%',
            innerSize: '20%',
            endAngle: 270
        },
        xAxis: {
            tickInterval: 1,
            labels: {
                align: 'right',
                useHTML: false,
                allowOverlap: true,
                step: 1,
                y: 5, // Aumenta o espaço abaixo dos labels
                style: {
                    fontSize: '13px'
                }
            },
            lineWidth: 0,
            gridLineWidth: 0,
            categories: categories
        },
        yAxis: {
            lineWidth: 0,
            tickInterval: valorQuebraY, // Ajusta o intervalo dos ticks
            reversedStacks: false,
            endOnTick: true,
            showLastLabel: true,
            gridLineWidth: 0
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                borderWidth: 3,
                pointPadding: 0.02, // Aumenta o padding entre barras
                groupPadding: 0, // Aumenta o padding entre grupos de barras
                borderRadius: 5 // Adiciona bordas arredondadas nas barras
            }
        },
        series: [{
            name: 'Em Aberto',
            data: goldData
        }, {
            name: 'Recebidos',
            data: silverData
        }, {
            name: 'Cancelados',
            data: bronzeData
        }]
    });
}

//MONTA DIV
function montaDivsHeader(dados, routeDetalhes) {
    // FOOTER
    let header = dados.divs;
    let total = dados.total_qtd;
    let i = 0;
    $('#headers-dash').empty();
    $('#headers-dash-subs').empty();
    for (const k in header) {
        i++;
        if (header.hasOwnProperty(k)) {
            let val = header[k];
            // Calcula o percentual com base no valor do item em relação ao valor total
            if (k !== undefined) {
                //Monta Subs
                var class_sub = "";
                var attr_extra = "";
                if (val.sub !== undefined) {
                    let total_main = val.value;
                    var subs = val.sub;
                    for (const k2 in subs) {
                        if (subs.hasOwnProperty(k2)) {
                            let val = subs[k2];
                            let total = total_main;
                            var qtd = (val.value);
                            var valor = (val.valor);
                            var percent = (qtd / total) * 100;
                            var click = val.click;
                            let classe_click = '';
                            if (click == 'S' && qtd > 0) {
                                classe_click = `click_detalhes`;
                            }

                            attr_extra = k.replace(/\s+/g, '_');
                            let icone = val.icone ?? "far fa-handshake";
                            var s = '<table class="w100perc"><thead>';
                            s += `<tr><th colspan="2" class="text-center"><span class="tooltip-text">${k2}</span> <i class="${icone}"></i></th></tr>`;
                            s += '<tbody>';

                            val.fields.forEach(field => {
                                let valorCampo = field.value ?? 0;
                                let classCampo = field.class ?? 'text-right';
                                s += `<tr style="font-size:12px;">`;
                                s += `<td>${field.text}: </td>`;
                                s += `<td class="${classCampo}"><b>${doubleToMoney(valorCampo, field.decimal)}</b></td></tr>`;
                            });
                            s += '</tbody></table>';
                            // Calcula o percentual com base no valor do item em relação ao valor total
                            let click_var1 = val.click_key;
                            let class_col = "col-" + val.size;
                            if (val.size == "" || val.size == 'auto') {
                                class_col = "col";
                            }
                            var retorno = "<div class='" + class_col + " " + attr_extra + " d-none " + classe_click + "' var1='" + click_var1 + "' var_title='" + k + " - " + k2 + "' route='" + routeDetalhes + "'>";
                            retorno += '<div class="info-box bg-' + val.color + '" style="margin:1px;">'
                            retorno += '<div class="info-box-content">'
                            retorno += '<span class="info-box-text">' + s + '</span>'
                            retorno += '<div class="progress">'
                            retorno += '<div class="progress-bar progress-bar-striped" style="width: ' + percent + '%;"></div>'
                            retorno += '</div>'
                            retorno += '<span class="progress-description">'
                            retorno += '<i><b>' + (doubleToMoney(qtd, 0)) + ' acordos</b> [' + (doubleToMoney(percent, 2)) + '%] de <b>' + (doubleToMoney(total, 0)) + '</b> </i>'
                            retorno += '</span>'
                            retorno += '</div>'
                            retorno += '</div>'
                            retorno += '</div>'
                            $('#headers-dash-subs').append(retorno);
                            class_sub = 'tem_subs';
                        }
                    }
                }
                //Monta Principais
                var qtd = (val.value);
                var valor = (val.valor);
                var percent = (qtd / total) * 100;
                var click = val.click;
                let classe_click = '';
                if (click == 'S' && qtd > 0) {
                    classe_click = `click_detalhes`;
                }
                let icone = val.icone ?? "far fa-handshake";
                var s = '<table class="w100perc"><thead>';
                s += `<tr><th colspan="2" class="text-center"><span class="tooltip-text">${k}</span> <i class="${icone}"></i></th></tr>`;
                s += '<tbody>';

                val.fields.forEach(field => {
                    let valorCampo = field.value ?? 0;
                    let classCampo = field.class ?? 'text-right';
                    s += `<tr style="font-size:12px;">`;
                    s += `<td>${field.text}: </td>`;
                    s += `<td class="${classCampo}"><b>${doubleToMoney(valorCampo, field.decimal)}</b></td></tr>`;
                });
                s += '</tbody></table>';
                // Calcula o percentual com base no valor do item em relação ao valor total
                let click_var1 = val.click_key;
                let class_col = "col-" + val.size;
                if (val.size == "" || val.size == 'auto') {
                    class_col = "col";
                }
                var retorno = "<div class='" + class_col + " " + class_sub + " " + classe_click + "' main_card = '" + attr_extra + "' var1='" + click_var1 + "' var_title='" + k + "' route='" + routeDetalhes + "'>";
                retorno += '<div class="info-box bg-' + val.color + '" style="margin:1px;">'
                retorno += '<div class="info-box-content">'
                retorno += '<span class="info-box-text">' + s + '</span>'
                retorno += '<div class="progress">'
                retorno += '<div class="progress-bar progress-bar-striped" style="width: ' + percent + '%;"></div>'
                retorno += '</div>'
                retorno += '<span class="progress-description">'
                retorno += '<i><b>' + (doubleToMoney(qtd, 0)) + ' acordos</b> [' + (doubleToMoney(percent, 2)) + '%] de <b>' + (doubleToMoney(total, 0)) + '</b> </i>'
                retorno += '</span>'
                retorno += '</div>'
                retorno += '</div>'
                retorno += '</div>'
                $('#headers-dash').append(retorno);
            }
        }
    }

    $('.tooltip-text').each(function () {
        const fullText = $(this).text().trim();
        const maxLength = 20;

        if (fullText.length > maxLength) {
            const shortText = fullText.substring(0, maxLength) + '...';
            $(this)
                .text(shortText)
                .attr('title', fullText); // nativo do navegador (tooltip)
        }
    });


    $('.tem_subs').on('click', function () {
        let attr_extra = $(this).attr('main_card');
        // Verifica se as divs filhas associadas estão visíveis
        let isVisible = $(`.${attr_extra}`).first().hasClass('d-none');
        // Esconde todas as divs filhas
        $('#headers-dash-subs').children().addClass('d-none');
        // Se as divs associadas estavam escondidas, mostra-as; caso contrário, mantém-nas escondidas
        if (isVisible) {
            $(`.${attr_extra}`).removeClass('d-none');
        }
    });

    $('.click_detalhes').on('click', function () {
        var codigo = $(this).attr('var1');
        var title = $(this).attr('var_title');
        var rota = $(this).attr('route');

        const requestParams = {
            method: 'POST',
            url: rota,
            data: {
                'codigo': codigo
            },
            formId: ''
        };

        addLoading("loadingPage");
        AjaxRequest.sendRequest(requestParams).then(response => {
            removeLoading("loadingPage");
            if (response.data !== undefined && response.status === true) {

                try {
                    //Montar Graficos div1
                    var grafico_div1 = response.data.grafico_fases_qtd;
                    CriarGraficos.criarDonutchart("grafico_01_01_detalhes", grafico_div1.data, grafico_div1.seriesname, grafico_div1.title, grafico_div1.subtitle);
                    var grafico_div1 = response.data.grafico_fases_valor;
                    CriarGraficos.criarDonutchart("grafico_02_02_detalhes", grafico_div1.data, grafico_div1.seriesname, grafico_div1.title, grafico_div1.subtitle, 2);
                    //PieMult
                    var currentHighChartsPie = null;
                    currentHighChartsPie = new HighChartsPieChartMult(response.data.grafico_pie_mult_qtd, 0, "Fases", "Tipo Pagamento");
                    var currentHighChartsPie2 = null;
                    currentHighChartsPie2 = new HighChartsPieChartMult(response.data.grafico_pie_mult_valor, 2, "Fases", "Tipo Pagamento");

                    var grafico_div1 = response.data.grafico_tipo_pagamento_qtd;
                    CriarGraficos.criarDonutchart("grafico_03_detalhes", grafico_div1.data, grafico_div1.seriesname, grafico_div1.title, grafico_div1.subtitle);
                    var grafico_div1 = response.data.grafico_tipo_pagamento_valor;
                    CriarGraficos.criarDonutchart("grafico_04_detalhes", grafico_div1.data, grafico_div1.seriesname, grafico_div1.title, grafico_div1.subtitle, 2);

                    var grafico_div1 = response.data.grafico_data_qtd;
                    criarStockDiaHora("grafico_05_detalhes", grafico_div1, "Acordos/Quantidade", 0,);
                    var grafico_div1 = response.data.grafico_data_valor;
                    criarStockDiaHora("grafico_06_detalhes", grafico_div1, "Acordos/Valores", 2);


                    $('#modalDetalhesTitle').html("Detalhes " + title);
                    $('#modalDetalhes').modal('show');
                } catch (error) {
                    console.error('Erro ao analisar JSON:', error);
                    //$('#modalHistoricoBody').append('<p>Erro ao analisar o histórico.</p>');
                }
            }
        });
    });
}

function criarStockDiaHora(containerId, data, title, decimalPlaces = 0, separator = '.') {
    // Verifica se o contêiner para o gráfico já existe
    $(`#${containerId}_grafico`).empty();
    $(`#${containerId}_bt`).empty();
    let chartContainer = document.getElementById(`${containerId}_grafico`);
    let buttonContainer = document.getElementById(`${containerId}_bt`);
    if (!chartContainer) {
        console.error(`Container with ID ${containerId} does not exist.`);
        return;
    }

    // Limpa apenas o gráfico, mantendo os botões
    const chartArea = chartContainer.querySelector('.highcharts-container');
    if (chartArea) {
        chartArea.parentNode.removeChild(chartArea);
    }

    // Função para agregar dados por dia
    function aggregateDataByDay(data) {
        const dailyData = [];
        const map = {};

        data.forEach(point => {
            const date = new Date(point[0]);
            const day = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

            if (!map[day]) {
                map[day] = 0;
            }

            map[day] += point[1];
        });

        for (let day in map) {
            dailyData.push([parseInt(day), map[day]]);
        }

        return dailyData;
    }

    // Dados agregados por dia
    const dailyData = aggregateDataByDay(data);

    let chart;

    // Função para criar o gráfico
    function createHighchartsChart(data, unit) {
        if (chart) {
            chart.destroy(); // Remove o gráfico existente
        }
        const total = data.reduce((sum, point) => sum + point[1], 0);
        chart = Highcharts.stockChart(`${containerId}_grafico`, {
            chart: {
                alignTicks: false,
                height: '420px',
                events: {
                    load: function () {
                        // Aplica as classes do Bootstrap aos botões do rangeSelector
                        // $(`#${containerId}_grafico .highcharts-range-selector-buttons button`).each(function () {
                        //     $(this).addClass('btn btn-outline-primary btn-sm');
                        // });
                    }
                }
            },
            title: {
                text: title
            },
            rangeSelector: {
                enabled: true, // Mantém o seletor de datas
                inputEnabled: false, // Desativa os inputs de data
                buttons: [
                    {
                        type: 'all',
                        text: 'Tudo'
                    },
                    {
                        type: 'hour',
                        count: 12,
                        text: '12H'
                    },
                    {
                        type: 'day',
                        count: 1,
                        text: '1D'
                    },
                    {
                        type: 'day',
                        count: 7,
                        text: '7D'
                    },
                    {
                        type: 'month',
                        count: 1,
                        text: '1M'
                    },
                    {
                        type: 'month',
                        count: 3,
                        text: '3M'
                    },
                    {
                        type: 'month',
                        count: 6,
                        text: '6M'
                    },
                    
                ],
                selected: 0 // Seleciona o primeiro botão por padrão
            },
            series: [{
                type: 'column',
                name: title,
                data: data,
                dataGrouping: {
                    units: [[unit, [1]]]
                }
            }],
            yAxis: {
                labels: {
                    formatter: function () {
                        // Formatação dos valores no eixo y
                        return Highcharts.numberFormat(this.value, decimalPlaces, separator, ',');
                    }
                }
            },
            tooltip: {
                formatter: function () {
                    const value = this.y;
                    const percentage = ((value / total) * 100).toFixed(2);
                    const date = Highcharts.dateFormat('%d/%m/%Y %H:%M', this.x);
                    return `<b>${Highcharts.numberFormat(value, decimalPlaces, separator, ',')}</b> (${percentage}%) de <b>${Highcharts.numberFormat(total, decimalPlaces, separator, ',')}</b><br><b>Data:</b> ${date}`;
                }
            },
        });
    }

    // Inicializa com visualização por hora
    createHighchartsChart(data, 'hour');
    buttonContainer.className = 'd-flex justify-content-center mt-3';
    // Cria os botões se não existirem
    const btnHour = document.createElement('button');
    btnHour.className = 'btn btn-outline-primary btn-sm mr-2';
    btnHour.id = `viewByHour-${containerId}`;
    btnHour.textContent = 'Por Hora';
    btnHour.addEventListener('click', () => {
        createHighchartsChart(data, 'hour');
    });

    const btnDay = document.createElement('button');
    btnDay.className = 'btn btn-outline-info btn-sm';
    btnDay.id = `viewByDay-${containerId}`;
    btnDay.textContent = 'Por Dia';
    btnDay.addEventListener('click', () => {
        createHighchartsChart(dailyData, 'day');
    });

    buttonContainer.appendChild(btnHour);
    buttonContainer.appendChild(btnDay);
}