class dashboardProducao {
    constructor(dados, route) {
        this.rangeDatas = dados.datas;
        this.clientes = dados.clientes;
        this.route = route;
        this.dados = [];
        this.buscarDados();
    }

    buscarDados() {
        const requestParams = {
            method: 'POST',
            url: this.route,
            data: {
                'datas': this.rangeDatas,
                'clientes': this.clientes
            },
            formId: ''
        };

        addLoading("loadingPage");
        AjaxRequest.sendRequest(requestParams).then(response => {
            removeLoading("loadingPage");
            if (response.data !== undefined && response.status === true) {
                this.dados = response.data;
                iniciarGraficoCalendarioCalor("grafico_card_1", this.dados.grafico1);
                iniciarGraficoCalendarioCalor("grafico_card_2", this.dados.grafico2);
                iniciarGraficoCalendarioCalor("grafico_card_3", this.dados.grafico3);

                $("#csv1").html(this.dados.hotmap.grafico1.csv);
                $("#csv2").html(this.dados.hotmap.grafico2.csv);
                $("#csv3").html(this.dados.hotmap.grafico3.csv);

                const heatmapChart1 = new HighChartsHotMap(this.dados.hotmap.grafico1, 'csv1');
                const heatmapChart2 = new HighChartsHotMap(this.dados.hotmap.grafico2, 'csv2');
                const heatmapChart3 = new HighChartsHotMap(this.dados.hotmap.grafico3, 'csv3');

                if (this.dados.totais !== undefined) {
                    var idCard = 1;
                    var ar_totais = this.dados.totais;
                    $.each(ar_totais, function (key, ar) {
                        var i = 1;
                        $.each(ar, function (k, v) {
                            var valores = [{
                                label: 'Aguardando',
                                value: v.aguardando
                            },
                            {
                                label: 'Iniciado',
                                value: v.iniciado
                            },
                            {
                                label: 'Finalizado',
                                value: v.finalizado
                            }
                            ];

                            Utilitarios.criarInfoBox(('card_' + idCard + '_header' + i), v.bgcolor, k, valores, v.icon);
                            i++;
                        })
                        idCard++;
                    })
                }

                if (response.msg != "") {
                    //SweetAlert.info(response.msg);
                    alertar(response.msg, '', 'info');
                }
            }
            else if (response.status === false) {
                SweetAlert.alertAutoClose("info", "Atenção", response.msg, 20000);
            }
            else {
                SweetAlert.error('Erro no processamento dos dados.');
            }
        }).catch(error => {
            console.error(error);
        });
    }


}

function iniciarGraficoCalendarioCalor(idCard, dados) {
    const title = dados.title;
    const data = dados.data;
    const weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

    // The function takes in a dataset and calculates how many empty tiles needed
    // before and after the dataset is plotted.
    function generateChartData(data) {

        // Calculate the starting weekday index (0-6 of the first date in the given
        // array)
        const firstWeekday = new Date(data[0].date).getDay(),
            monthLength = data.length,
            lastElement = data[monthLength - 1].date,
            lastWeekday = new Date(lastElement).getDay(),
            lengthOfWeek = 6,
            emptyTilesFirst = firstWeekday,
            chartData = [];

        // Add the empty tiles before the first day of the month with null values to
        // take up space in the chart
        for (let emptyDay = 0; emptyDay < emptyTilesFirst; emptyDay++) {
            chartData.push({
                x: emptyDay,
                y: 5,
                value: null,
                date: null,
                custom: {
                    empty: true
                }
            });
        }

        // Loop through and populate with value and dates from the dataset
        for (let day = 1; day <= monthLength; day++) {
            // Get date from the given data array
            const date = data[day - 1].date;
            // Offset by thenumber of empty tiles
            const xCoordinate = (emptyTilesFirst + day - 1) % 7;
            const yCoordinate = Math.floor((firstWeekday + day - 1) / 7);
            const id = day;

            // Get the corresponding value for the current day from the given
            // array
            const value = data[day - 1].value;
            const dados = data[day - 1].dados;
            const dataFormatada = data[day - 1].data;
            const base = data[day - 1].base;

            chartData.push({
                x: xCoordinate,
                y: 5 - yCoordinate,
                value: value,
                dados: dados,
                dataFormatada: dataFormatada,
                base: base,
                date: new Date(date).getTime(),
                custom: {
                    monthDay: id
                }
            });
        }

        // Fill in the missing values when dataset is looped through.
        const emptyTilesLast = lengthOfWeek - lastWeekday;
        for (let emptyDay = 1; emptyDay <= emptyTilesLast; emptyDay++) {
            chartData.push({
                x: (lastWeekday + emptyDay) % 7,
                y: 0,
                value: null,
                date: null,
                custom: {
                    empty: true
                }
            });
        }
        return chartData;
    }
    const chartData = isNotEmpty(data) ? generateChartData(data) : [];

    Highcharts.chart(idCard, {
        chart: {
            type: 'heatmap'
        },

        title: {
            text: title,
            align: 'center'
        },

        subtitle: {
            text: 'Ordens de produção não finalizadas por Departamentos.',
            align: 'center'
        },

        accessibility: {
            landmarkVerbosity: 'one'
        },

        tooltip: {

            useHTML: true,
            enabled: true,
            outside: true,
            zIndex: 20,
            headerFormat: '',
            nullFormat: 'No data',
            formatter: function () {
                //shared true
                var s = '<table class="w100perc"><thead>';
                s += '<tr><th colspan="5" class="text-center">' + this.point.dataFormatada + ' <i class="fa fa-credit-card " aria-hidden="true"></i></th></tr>';
                s += '<tr><th class="text-center">Departamento</th><th class="text-center">Aguardando</th><th class="text-center">Iniciado</th><th class="text-center">Finalizado</th><th class="text-center">Total</th></tr>';
                s += '<tboody>';

                var iniciado = 0;
                var aguardando = 0;
                var finalizado = 0;
                var sum = 0;
                $.each(this.point.dados, function (k, v) {
                    total = v.iniciado + v.aguardando + v.finalizado;
                    sum += total;
                    finalizado += v.finalizado;
                    aguardando += v.aguardando;
                    iniciado += v.iniciado;
                    s += '<tr style="font-size: 10px;">';
                    s += '<td class="text-left borderTable text-left">' + k;
                    s += '<td class="text-center borderTable text-center">' + doubleToMoney(v.aguardando, 0);
                    s += '<td class="text-center borderTable text-center">' + doubleToMoney(v.iniciado, 0);
                    s += '<td class="text-center borderTable text-center">' + doubleToMoney(v.finalizado, 0);
                    s += '<td class="text-center borderTable text-center">' + doubleToMoney(total, 0);
                    s += '</tr>';
                });

                s += '</tboody>';
                s += '<tfooter>';
                s += '<tr><th class="text-left">Total</th><th class="text-center">' + doubleToMoney(aguardando, 0) + '</th><th class="text-center">' + doubleToMoney(iniciado, 0) + '</th><th class="text-center">' + doubleToMoney(finalizado, 0) + '</th><th class="text-center">' + doubleToMoney(sum, 0) + '</th></tr>';
                s += '</tfooter>';
                s += '</table>';
                // Calcula o percentual com base no valor do item em relação ao valor total
                var percent = (finalizado / (sum)) * 100;

                var retorno = "";
                retorno += '<div class="info-box bg-gradient-light" style="margin:1px;">'
                retorno += '<div class="info-box-content">'
                retorno += '<span class="info-box-text">' + s + '</span>'
                retorno += '<span class="info-box-number"><b>' + (doubleToMoney(finalizado, 0)) + '</b> <small>Cartões Finalizados</small></span>'
                retorno += '<div class="progress">'
                retorno += '<div class="progress-bar bg-primary progress-bar-striped" style="width: ' + percent + '%;"></div>'
                retorno += '</div>'
                retorno += '<span class="progress-description">'
                retorno += '<i>Finalizados: <b>' + (doubleToMoney(percent, 2)) + '%</b> de <b>' + (doubleToMoney((sum), 0)) + '</b> </i>'
                retorno += '</span>'
                retorno += '</div>'
                retorno += '</div>'

                return retorno;
            },
        },

        xAxis: {
            categories: weekdays,
            opposite: true,
            lineWidth: 26,
            offset: 13,
            lineColor: 'rgba(27, 26, 37, 0.2)',
            labels: {
                rotation: 0,
                y: 20,
                style: {
                    textTransform: 'uppercase',
                    fontWeight: 'bold'
                }
            },
        },

        yAxis: {
            min: 0,
            max: 5,
            accessibility: {
                description: 'weeks'
            },
            visible: false
        },

        legend: {
            align: 'right',
            layout: 'vertical',
            verticalAlign: 'middle'
        },

        colorAxis: {
            min: 0,
            stops: [
                [0.1, 'lightblue'],
                [0.2, '#AED5E6'],
                [0.3, '#DBE7C2'],
                [0.4, '#CBDFC8'],
                [0.5, '#CBDFC8'],
                [0.6, '#F3E99E'],
                [0.7, '#F9D879'],
                [0.8, '#F9A05C'],
                [0.9, '#FF851B'],
                [1.0, '#DC3545']
            ],
            // labels: {
            //     format: '{value} °C'
            // }
        },

        series: [{
            point: {
                events: {
                    click: function (event) {
                        // 'this' contém o objeto do ponto de dados clicado
                        var point = this;
                        // Aqui você pode abrir a modal ou realizar outras ações com os dados do ponto
                        __openModal(point.base, point.value, point.dataFormatada);
                    }
                }
            },
            keys: ['x', 'y', 'value', 'date', 'id'],
            data: chartData,
            nullColor: 'rgba(196, 196, 196, 0.2)',
            borderWidth: 2,
            borderColor: 'rgba(196, 196, 196, 0.2)',
            dataLabels: [{
                enabled: true,
                // format: '{#unless point.custom.empty}{point.value:.0f}{/unless}',
                formatter: function () {
                    if (!this.point.custom.empty) {
                        return doubleToMoney(this.point.value, 0);
                    }
                    return '';  // ou qualquer valor padrão que você deseje para pontos vazios
                },
                style: {
                    textOutline: 'none',
                    fontWeight: 'bold',
                    fontSize: '0.7rem'
                },
                y: 4
            }, {
                enabled: true,
                align: 'left',
                verticalAlign: 'top',
                format: '{#unless point.custom.empty}{point.custom.monthDay}{/unless}',
                backgroundColor: 'whitesmoke',
                padding: 2,
                style: {
                    textOutline: 'none',
                    color: 'rgba(70, 70, 92, 1)',
                    fontSize: '0.6rem',
                    fontWeight: 'normal',
                    opacity: 0.5
                },
                x: 1,
                y: 1
            }]
        }]
    });

}

function __openModal(base, value, data) {
    if (value === undefined) {
        return false;
    }
    const requestParams = {
        method: 'POST',
        url: $("#conteudo_modal_detalhes").attr('data-rota-busca'),
        data: {
            'data': data,
            'base': base,
            'clientes': $("#clientes").val()
        },
        formId: ''
    };

    abrirModal('modalDetalhes');
    addLoading("conteudo_modal_detalhes");
    AjaxRequest.sendRequest(requestParams).then(response => {
        removeLoading("conteudo_modal_detalhes");
        $('#modalDetalhesTitle').html("Processando...");
        $('#conteudo_modal_detalhes').html("");
        if (response.data !== undefined && response.status === true) {
            this.dados = response.data;

            $('#modalDetalhesTitle').html(dados.title);
            $('#conteudo_modal_detalhes').html(dados.tabela);
            let tableCard1Aba1 = $('#tabela-cad1').DataTable({
                scrollY: "500px",
                destroy: true,
                className: 'highcharts-dark',
            });

            // Adicione um evento para escutar a mudança dos botões de seleção de rádio
            $('input[name="optionsTabela1[]"]').on('change', function () {
                let dataColumn = this.value;
                tableCard1Aba1.rowGroup().dataSrc(dataColumn).draw();
            });

            // Change the fixed ordering when the data source is updated
            tableCard1Aba1.on('rowgroup-datasrc', function (e, dt, val) {
                tableCard1Aba1.order.fixed({ pre: [[val, 'asc']] }).draw();
            });

            $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
                //Ajustar as colunas do DataTable em nav tabs secundarias apos inicialização
                //Usar isso quando utilizar o rowGrroup com endRender
                tableCard1Aba1.order([1, 'desc']).draw();
                tableCard1Aba1.columns.adjust();
            });
            if (response.msg != "") {
                //SweetAlert.info(response.msg);
                alertar(response.msg, '', 'info');
            }
        }
        else if (response.status === false) {
            SweetAlert.alertAutoClose("info", "Atenção", response.msg, 20000);
        }
        else {
            SweetAlert.error('Erro no processamento dos dados.');
        }
    }).catch(error => {
        removeLoading("conteudo_modal_detalhes");
        console.error(error);
    });
}
