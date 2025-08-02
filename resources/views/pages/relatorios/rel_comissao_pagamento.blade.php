@extends('adminlte::page')

@section('title', $nameView)

@section('content_header')
    <h4 class="w100perc text-center">{{ $nameView }}</h4>
@stop

@section('content')

    <div class="card">
        <div class="card-header">
            <h3 class="card-title">Filtros</h3>

            <div class="card-tools">
                <button type="button" class="btn btn-tool" data-card-widget="collapse" title="Collapse">
                    <i class="fas fa-minus"></i>
                </button>
            </div>
        </div>
        <div class="card-body">
            <form id="form_filtros_pesquisa">

                <div class="row">
                    <div class="col-md-3">
                        <x-calendario-component id='dateRangePicker' event-name='dateRangeSelected' :options="[]" label='Data Pagamento' type='input' autoApply='false' single='N' />
                    </div>
                    <div class="col-md-3">
                        <div class="form-group">
                            <label for="rel_canal">Canal Origem:</label>
                            <select class="form-control select2" id="rel_canal" name="rel_canal[]" multiple="multiple">
                                @foreach ($canais_senff as $v)
                                    <option value='{{ $v['col1'] }}'>{{ $v['col2'] }}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="loja_cartao">Loja Cartão:</label>
                            <div class="input-group">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">Nome ou CNPJ: </span>
                                </div>
                                <input type="text" class="form-control" id="loja_cartao" name="loja_cartao" value="">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                </div>
                <div class="row">
                    <div class="offset-md-4 col-md-4 offset-md-4 col-12">
                        <div class="form-group">
                            <button type="button" class="btn btn-block bg-gradient-primary btn-lg ladda-button" id="btnBuscarDados" data-style='zoom-out'>
                                <i class="fa fa-search"></i>&nbsp;&nbsp;&nbsp;Procurar
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <div class="card card-primary card-outline">
        <div class="card-header ui-sortable-handle" style="cursor: move;">
            <h3 class="card-title" style="margin-top: 5px;">
                <i class="fas fa-chart-pie mr-1"></i>
                <span>Resultados</span>
            </h3>
            <div class="card-tools align-items-center">
                <ul class="nav nav-pills ml-auto" style="margin-bottom: -1.8rem;">
                    <li class="nav-item">
                        <a class="nav-link btn-sm ladda-button active" data-style="zoom-out" href="#resultado-aba2" data-toggle="tab">Analítico</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link btn-sm ladda-button" data-style="zoom-out" href="#resultado-aba1" data-toggle="tab">Sintético</a>&nbsp;
                    </li>
                    <li class="nav-item">
                        <a class="nav-link btn-sm ladda-button" data-style="zoom-out" href="#resultado-aba3" data-toggle="tab">#</a>&nbsp;
                    </li>
                    <li class="nav-item">
                        <button type="button" class="btn btn-tool ladda-button" data-card-widget="collapse" style="margin-top: 5px;"><i class="fas fa-minus"></i></button>
                    </li>
                    <li class="nav-item">
                        <button type="button" class="btn btn-tool" data-card-widget="maximize" style="margin-top: 5px;"><i class="fas fa-expand"></i>
                        </button>
                    </li>
                </ul>
            </div>
        </div>
        <div class="card-body " id="card_resultados">
            <div class="tab-content">
                <div class="chart tab-pane active" id="resultado-aba2">

                </div>
                <div class="chart tab-pane" id="resultado-aba1" style="overflow-y: auto;height: 700px;">

                </div>
                <div class="chart tab-pane" id="resultado-aba3" style="overflow-y: auto;height: 700px;">
                    <div class="row">
                        <div class="col-md-12 mb-1 text-left" id="resultado-aba3-html">
                        </div>
                        <div class="col-md-12" id='resultado-aba3-tabela'>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card-footer" id="resultado-footer">
        </div>

    </div>
@stop

{{-- @section('plugins.HighCharts', true) --}}

@once
    @push('css')
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
        <link href="{{ asset('css/relatorios/rel_oportunidades_ws.css') }}" rel="stylesheet">
    @endpush
    @push('js')
        <script src="https://code.highcharts.com/highcharts.js"></script>
        <script src="https://code.highcharts.com/dashboards/datagrid.js"></script>
        <script src="https://code.highcharts.com/dashboards/dashboards.js"></script>
        <script src="https://code.highcharts.com/dashboards/modules/layout.js"></script>
        <script src="https://code.highcharts.com/modules/accessibility.js"></script>
        <script>
            $(document).ready(function() {
                $('.select2').select2({
                    placeholder: 'Selecione uma ou mais opções',
                    allowClear: true, // Adiciona um botão de limpar seleção
                    width: '100%', // Define a largura do seletor
                });

                $('#btnBuscarDados').click(function() {
                    FormValidator.validar('form_filtros_pesquisa').then((isValid) => {
                        if (isValid) {
                            __buscarDados();
                        }
                    });

                });

            });

            function __buscarDados() {
                let idForm = 'form_filtros_pesquisa';
                let div_retorno = 'resultado-aba1';
                addLoading("card_resultados");
                let datas = getRangeDate('dateRangePicker');
                const requestParams = {
                    method: 'POST',
                    url: '{{ route('buscar.rel_comissao_pagamento') }}',
                    data: {
                        'rangedatas': datas
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
                            __renderDataTable(response.data.tabela, div_retorno, {});
                        }

                        //Grafico
                        var dados_grafico = response.data.dash;
                        var colunsName = dados_grafico.colunas;
                        var rdaVal = dados_grafico.media;
                        __dashTeste({
                            containerId: 'resultado-aba2',
                            data: {
                                columnNames: colunsName,
                                data: dados_grafico.dados
                            },
                            kpis: [{
                                    renderTo: 'kpi-card1',
                                    title: colunsName[1],
                                    value: formatNumber(dados_grafico.totais[0], 0),
                                    subtitle: 'CPFs unicos',
                                    valueFormat: '{value}'
                                },
                                {
                                    renderTo: 'kpi-card2',
                                    title: colunsName[2],
                                    value: formatNumber(dados_grafico.totais[1], 2),
                                    subtitle: 'Valor Pagamento',
                                    valueFormat: '{value}'
                                },
                                {
                                    renderTo: 'kpi-card3',
                                    title: colunsName[3],
                                    value: formatNumber(dados_grafico.totais[2], 2),
                                    subtitle: 'Valor Comissão',
                                    valueFormat: '{value}'
                                }
                            ],
                            charts: [{
                                    renderTo: 'dashboard-col-0',
                                    yAxisTitle: 'CPF (Qtd)',
                                    seriesNameTitle: colunsName[1],
                                    plotLineValue: rdaVal[0],
                                    plotLineText: 'Media',
                                    tooltipSuffix: '',
                                    max: null,
                                    decimals: 0
                                },
                                {
                                    renderTo: 'dashboard-col-1',
                                    yAxisTitle: 'Valor (R$)',
                                    seriesNameTitle: colunsName[2],
                                    plotLineValue: rdaVal[1],
                                    plotLineText: 'Media',
                                    tooltipSuffix: '',
                                    max: null,
                                    decimals: 2
                                },
                                {
                                    renderTo: 'dashboard-col-2',
                                    yAxisTitle: 'Valor (R$)',
                                    seriesNameTitle: colunsName[3],
                                    plotLineValue: rdaVal[2],
                                    plotLineText: 'Media',
                                    tooltipSuffix: '',
                                    max: null,
                                    decimals: 2
                                }
                            ],
                            dataGridRenderTo: 'dashboard-col-3'
                        });

                    } else {
                        SweetAlert.alertAutoClose("error", "Precisamos de sua atenção", response.msg, 20000);
                        $('#' + div_retorno).html("");
                    }
                }).catch(error => {
                    alertar(error, "", "error");
                });
            }

            //SELECTS
            document.addEventListener("DOMContentLoaded", function() {

            });

            function __dashTeste({
                containerId,
                data,
                kpis = [],
                charts = [],
                dataGridRenderTo
            } = {}) {
                if (!containerId || !data || !data.data || !data.columnNames) {
                    console.error('Parâmetros obrigatórios não fornecidos: containerId, data, columnNames e data são necessários.');
                    return;
                }
                dataGridRenderTo = null;
                createDashboardStructure(containerId);
                // Configuração principal do Dashboard
                Highcharts.setOptions({
                    chart: {
                        styledMode: true
                    }
                });

                Dashboards.board(containerId, {
                    dataPool: {
                        connectors: [{
                            id: 'micro-element',
                            type: 'JSON',
                            options: {
                                firstRowAsNames: false,
                                columnNames: data.columnNames,
                                data: data.data
                            }
                        }]
                    },
                    editMode: {
                        enabled: false,
                        contextMenu: {
                            enabled: false
                        }
                    },
                    components: [
                        // Configuração de KPIs
                        ...kpis.map(kpi => ({
                            type: 'KPI',
                            renderTo: kpi.renderTo,
                            value: kpi.value || 0,
                            valueFormat: kpi.valueFormat || '{value}',
                            title: kpi.title || 'Default Title',
                            subtitle: kpi.subtitle || ''
                        })),
                        // Configuração de gráficos
                        ...charts.map(chart => ({
                            renderTo: chart.renderTo,
                            sync: {
                                visibility: true,
                                highlight: true,
                                extremes: true
                            },
                            connector: {
                                id: 'micro-element',
                                columnAssignment: [{
                                    seriesId: chart.seriesNameTitle,
                                    data: [data.columnNames[0], data.columnNames[charts.indexOf(chart) + 1]]
                                }]
                            },
                            type: 'Highcharts',
                            chartOptions: {
                                xAxis: {
                                    type: 'category',
                                    accessibility: {
                                        description: 'Groceries'
                                    }
                                },
                                yAxis: {
                                    title: {
                                        text: chart.yAxisTitle || ''
                                    },
                                    max: chart.max || null,
                                    plotLines: [{
                                        value: chart.plotLineValue || 0,
                                        zIndex: 7,
                                        dashStyle: 'shortDash',
                                        label: {
                                            text: chart.plotLineText || '',
                                            align: 'right',
                                            style: {
                                                color: '#B73C28'
                                            }
                                        }
                                    }]
                                },
                                credits: {
                                    enabled: false
                                },
                                plotOptions: {
                                    series: {
                                        marker: {
                                            radius: 6
                                        },
                                        dataLabels: {
                                            enabled: true,
                                            formatter: function() {
                                                return Highcharts.numberFormat(this.y, chart.decimals || 0);
                                            }
                                        }
                                    }
                                },
                                title: {
                                    text: chart.seriesName || ''
                                },
                                legend: {
                                    enabled: true,
                                    verticalAlign: 'top'
                                },
                                chart: {
                                    animation: false,
                                    type: 'column',
                                    spacing: [30, 30, 30, 20]
                                },
                                tooltip: {
                                    valueSuffix: chart.tooltipSuffix || '',
                                    stickOnContact: true,
                                    formatter: function() {
                                        return `${this.series.name}: ${Highcharts.numberFormat(this.y, chart.decimals || 0)}`;
                                    }
                                }
                            }
                        })),
                        // Configuração da DataGrid
                        dataGridRenderTo ? {
                            renderTo: dataGridRenderTo,
                            connector: {
                                id: 'micro-element'
                            },
                            type: 'DataGrid',
                            sync: {
                                highlight: true,
                                visibility: true
                            },
                            dataGridOptions: {
                                credits: {
                                    enabled: false
                                }
                            }
                        } : null
                    ].filter(Boolean) // Remove componentes nulos
                }, true);
            }

            function formatNumber(value, decimals = 2) {
                return new Intl.NumberFormat('pt-BR', {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals
                }).format(value);
            }

            function createDashboardStructure(containerId) {
                const container = document.getElementById(containerId);
                if (!container) {
                    console.error(`Container with ID "${containerId}" not found.`);
                    return;
                }

                // Limpa o container antes de adicionar os elementos
                container.innerHTML = '';

                // Define a estrutura de IDs para os elementos
                const structure = [
                    ['kpi-card1', 'kpi-card2', 'kpi-card3'],
                    ['dashboard-col-0', 'dashboard-col-1', 'dashboard-col-2'],
                    ['dashboard-col-3']
                ];

                // Cria a estrutura
                structure.forEach(rowIds => {
                    const row = document.createElement('div');
                    row.className = 'row';

                    rowIds.forEach(cellId => {
                        const cell = document.createElement('div');
                        cell.className = 'cell';
                        cell.id = cellId;
                        row.appendChild(cell);
                    });

                    container.appendChild(row);
                });
            }
        </script>
    @endpush
@endonce
