class dashboardFlash {
    constructor(dados, route, route_detalhes) {
        this.rangeDatas = dados.datas;
        this.clientes = dados.clientes;
        this.route = route;
        this.route_detalhes = route_detalhes;
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
        $("#card_1_2").empty();
        $("#card_1_3").empty();
        $("#info-box-1").empty();
        $("#info-box-2").empty();
        $("#info-box-3").empty();
        $("#container1").hide();
        AjaxRequest.sendRequest(requestParams).then(response => {
            removeLoading("loadingPage");
            if (response.data !== undefined && response.status === true) {
                $("#container1").show();
                this.dados = response.data;
                // iniciarGraficoCard1("card_1_dados", this.dados.grafico1);
                if (this.dados.emp1.grafico_api.totais_api !== undefined && this.dados.emp1.grafico_api.qtd_api > 0) {
                    __montaPieTotais(this.dados.emp1.grafico_api.totais_api, "card_1_3");
                }
                if (this.dados.emp1.tabela !== undefined && Object.keys(this.dados.emp1.tabela).length > 0) {
                    var dados_header = this.dados.emp1.tabela.contadores_info_box;
                    //MOntar Header
                    var total_docs = dados_header.total;
                    // Utilitarios.createInfoBox2('Documentos com a Jall', dados_header.jall,total_docs, 'bg-warning', 'info-box-1');
                    // Utilitarios.createInfoBox2('Documentos em transferência', dados_header.transferencia,total_docs, 'bg-primary', 'info-box-2');
                    // Utilitarios.createInfoBox2('Documentos com a Flash', dados_header.flash,total_docs, 'bg-info', 'info-box-3');
                    // Utilitarios.createInfoBox2('Documentos Entregues', dados_header.entregue,total_docs, 'bg-success', 'info-box-4');

                    Utilitarios.createSmallBox('info-box-1', 'Documentos com a Jall', dados_header.jall, total_docs, 'bg-warning', "NA_JALL");
                    Utilitarios.createSmallBox('info-box-2', 'Documentos em transferência', dados_header.transferencia, total_docs, 'bg-primary', "EM_TRANSFERENCIA");
                    Utilitarios.createSmallBox('info-box-3', 'Documentos com a Flash', dados_header.flash, total_docs, 'bg-info', "NA_FLASH");
                    Utilitarios.createSmallBox('info-box-4', 'Documentos Entregues', dados_header.entregue, total_docs, 'bg-success', "ENTREGUE_DESTINO");

                    const dadosTabela = this.dados.emp1.tabela;
                    const dados = dadosTabela.dados;
                    const centerColumns = dadosTabela.centerColumns;
                    const rightAlignColumns = dadosTabela.rightAlignColumns;
                    const colunasASomar = dadosTabela.colunasASomar;
                    const columnNames = dadosTabela.columnNames;

                    const tabela = new DataTableBuilder(dados, columnNames, centerColumns, rightAlignColumns, colunasASomar, 'card_1_2', {}, this.route_detalhes);
                }

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
                // $("#container1").slideToggle();
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
$(document).on('click', '.smallBoxClick', function () {
    const footerData = this.getAttribute('data-footer-value');
    console.log('Footer Value:', footerData);
    const table = $('#card_1_2Tabela').DataTable();
    table.search(footerData).draw();
    table.columns.adjust();
})

$(document).on('click', '.detalhes_rastreio', function () {
    var codigo_postagem = $(this).attr('codigo_postagem');
    var rota = $(this).attr('route_detalhes');

    const requestParams = {
        method: 'POST',
        url: rota,
        data: {
            'codigo_postagem': codigo_postagem,
        },
        formId: ''
    };

    addLoading("loadingPage");
    AjaxRequest.sendRequest(requestParams).then(response => {
        removeLoading("loadingPage");
        if (response.data !== undefined && response.status === true) {
            
            $('#modalHistoricoBody').empty();
            
            try {
                var historicoCompleto = response.data.detalhes_rastreio;
                var modalTitle      = response.data.detalhes_rastreio_title;

                if (historicoCompleto && historicoCompleto.length > 0) {
                    historicoCompleto.forEach(item => {
                        const timelineItem = `
                    <div class="timeline-item">
                        <span class="time">${item.ocorrencia.split('.')[0]}</span>
                        <h3 class="timeline-header">${item.evento}</h3>
                        <div class="timeline-body">
                            <strong>Evento ID:</strong> ${item.eventoId}<br>
                            <strong>AR Correios:</strong> ${item.arCorreios}<br>
                            <strong>FRQ:</strong> ${item.frq}<br>
                            <strong>Local:</strong> ${item.local}
                        </div>
                    </div>
                `;

                        $('#modalHistoricoBody').append(timelineItem);
                    });
                } else {
                    $('#modalHistoricoBody').append('<p>Nenhum histórico disponível.</p>');
                }

                let ar_infos = modalTitle.split('|');
                let i = 0;
                let html_infos = "";
                while (i < ar_infos.length) {
                    let val_str = ar_infos[i].split(":");
                    html_infos += `<span class="badge badge-secondary">${val_str[0]} : ${val_str[1]}</span>&nbsp;&nbsp;&nbsp;`;
                    i++;
                }
                html_infos += "<br><hr>";

                $('#modalHistoricoTitle').html("Detalhes");
                $('#modalHistoricoInfos').html(html_infos);
                $('#modalHistorico').modal('show');
            } catch (error) {
                console.error('Erro ao analisar JSON:', error);
                $('#modalHistoricoBody').append('<p>Erro ao analisar o histórico.</p>');
            }
        }
    });
});

function __montaPieTotais($dados, $card_id) {
    const _valores = $dados;
    (function (H) {
        H.seriesTypes.pie.prototype.animate = function (init) {
            const series = this,
                chart = series.chart,
                points = series.points,
                {
                    animation
                } = series.options,
                {
                    startAngleRad
                } = series;

            function fanAnimate(point, startAngleRad) {
                const graphic = point.graphic,
                    args = point.shapeArgs;

                if (graphic && args) {
                    graphic
                        // Set initial animation values
                        .attr({
                            start: startAngleRad,
                            end: startAngleRad,
                            opacity: 1
                        })
                        // Animate to the final position
                        .animate({
                            start: args.start,
                            end: args.end
                        }, {
                            duration: animation.duration / points.length
                        }, function () {
                            // On complete, start animating the next point
                            if (points[point.index + 1]) {
                                fanAnimate(points[point.index + 1], args.end);
                            }
                            // On the last point, fade in the data labels, then
                            // apply the inner size
                            if (point.index === series.points.length - 1) {
                                series.dataLabelsGroup.animate({
                                    opacity: 1
                                },
                                    void 0,
                                    function () {
                                        points.forEach(point => {
                                            point.opacity = 1;
                                        });
                                        series.update({
                                            enableMouseTracking: true
                                        }, false);
                                        chart.update({
                                            plotOptions: {
                                                pie: {
                                                    innerSize: '40%',
                                                    borderRadius: 8
                                                }
                                            }
                                        });
                                    });
                            }
                        });
                }
            }

            if (init) {
                // Hide points on init
                points.forEach(point => {
                    point.opacity = 0;
                });
            } else {
                fanAnimate(points[0], startAngleRad);
            }
        };
    }(Highcharts));

    // Prepare data for Highcharts
    const chartData = Object.keys(_valores).map(key => ({
        name: key,
        y: _valores[key]
    }));

    // Calculate total
    const total = chartData.reduce((acc, curr) => acc + curr.y, 0);

    Highcharts.chart($card_id, {
        chart: {
            type: 'pie',
            height: '500px'
        },
        title: {
            text: 'Status dos Documentos na Flash',
            align: 'center'
        },
        subtitle: {
            text: '<b>' + doubleToMoney(total, 0) + '</b> ponstagens encontradas.',
            align: 'center'
        },
        tooltip: {
            //pointFormat: '<b>{point.y}</b>'
        },
        accessibility: {
            point: {
                valueSuffix: ''
            }
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                borderWidth: 2,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b><br>{point.y} ({point.percentage:.2f}%)',
                    distance: 20,
                    style: {
                        fontSize: '9px',
                        fontFamily: 'Verdana, sans-serif'
                    }
                },
                point: {
                    events: {
                        click: function () {
                            const pointName = this.name;
                            // Filter the DataTable 
                            const table = $('#card_1_2Tabela').DataTable();
                            table.search(pointName).draw();
                            table.columns.adjust();
                        }
                    }
                }
            },

        },
        series: [{
            // Disable mouse tracking on load, enable after custom animation
            enableMouseTracking: false,
            animation: {
                duration: 2000
            },
            colorByPoint: true,
            data: chartData,
            name: 'Qtd',
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
