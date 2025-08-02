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
                        <x-calendario-component id='dateRangePicker' event-name='dateRangeSelected' :options="[]" type='input-com-check' autoApply='false' single='N' label='Data Implantação' />

                    </div>
                    <div class="col-md-3">
                        <div class="form-group">
                            <label for="rel_tipo_data">Tipo Implantação:</label>
                            <select class="form-control " id="rel_tipo_data" name="rel_tipo_data">
                                <option value="P" selected="">Implantação Parecela</option>
                                <option value="C">Implantação Contrato</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="form-group">
                            <label for="rel_tipo_agrupamento">Agrupar por:</label>
                            <select class="form-control " id="rel_tipo_agrupamento" name="rel_tipo_agrupamento">
                                <option value="E" selected="">Equipe</option>
                                <option value="L">Loja</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="form-group">
                            <label for="rel_carteira">Carteira:</label>
                            @php
                                $grouped = collect($lojas)->groupBy('grupo');
                            @endphp

                            <select class="form-control selectpickerNovo" id="rel_carteira" name="rel_carteira[]" multiple="multiple">
                                @foreach ($grouped as $grupo => $itens)
                                    <optgroup label="{{ $grupo }}">
                                        @foreach ($itens as $v)
                                            <option value="{{ $v['col1'] }}">{{ $v['col3'] }}</option>
                                        @endforeach
                                    </optgroup>
                                @endforeach
                            </select>
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
                /*$('.select2').select2({
                    placeholder: 'Selecione uma ou mais opções',
                    allowClear: true, 
                    width: '100%', 
                });*/

                gerarSelectPicker(".selectpickerNovo");

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
                    url: '{{ route('buscar.rel_analise_carteira') }}',
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
                            __renderDataTable(response.data.tabela, div_retorno, {});
                        }

                        //Grafico
                        var dados_grafico = response.data.dash;
                        var colunsName = dados_grafico.colunas;
                        var colunsNameKap = dados_grafico.colunasKap;
                        var rdaVal = dados_grafico.media;
                        __dashTeste({
                            containerId: 'resultado-aba2',
                            data: {
                                columnNames: colunsName,
                                data: dados_grafico.dados
                            },
                            kpis: [{
                                    renderTo: 'kpi-card1',
                                    title: formatarTextoCom_(colunsNameKap[0]),
                                    value: formatNumber(dados_grafico.totais[0], 2),
                                    subtitle: 'Valor implantado',
                                    valueFormat: '{value}'
                                },
                                {
                                    renderTo: 'kpi-card2',
                                    title: formatarTextoCom_(colunsNameKap[1]),
                                    value: formatNumber(dados_grafico.totais[1], 2),
                                    subtitle: 'Valor em Aberto',
                                    valueFormat: '{value}'
                                },
                                {
                                    renderTo: 'kpi-card3',
                                    title: formatarTextoCom_(colunsNameKap[2]),
                                    value: formatNumber(dados_grafico.totais[2], 2),
                                    subtitle: 'Valor Baixado',
                                    valueFormat: '{value}'
                                },
                                {
                                    renderTo: 'kpi-card4',
                                    title: formatarTextoCom_(colunsNameKap[3]),
                                    value: formatNumber(dados_grafico.totais[3], 2),
                                    subtitle: 'Valor Recebido',
                                    valueFormat: '{value}'
                                },
                                {
                                    renderTo: 'kpi-card5',
                                    title: formatarTextoCom_(colunsNameKap[4]),
                                    value: formatNumber(dados_grafico.totais[4], 2),
                                    subtitle: 'Valor Comissao',
                                    valueFormat: '{value}'
                                },
                                {
                                    renderTo: 'kpi-card6',
                                    title: formatarTextoCom_(colunsNameKap[5]),
                                    value: formatNumber(dados_grafico.totais[5], 2),
                                    subtitle: 'Valor Devolvido',
                                    valueFormat: '{value}'
                                },
                                {
                                    renderTo: 'kpi-card7',
                                    title: formatarTextoCom_(colunsNameKap[6]),
                                    value: formatNumber(dados_grafico.totais[6], 0),
                                    subtitle: 'CPFs Unicos',
                                    valueFormat: '{value}'
                                }
                            ],
                            charts: [{
                                    renderTo: 'dashboard-col-0',
                                    yAxisTitle: 'Implantado (R$)',
                                    seriesNameTitle: formatarTextoCom_(colunsName[1]),
                                    plotLineValue: rdaVal[0],
                                    plotLineText: 'Media',
                                    tooltipSuffix: '',
                                    max: null,
                                    decimals: 0
                                },
                                {
                                    renderTo: 'dashboard-col-1',
                                    yAxisTitle: 'Aberto (R$)',
                                    seriesNameTitle: formatarTextoCom_(colunsName[2]),
                                    plotLineValue: rdaVal[1],
                                    plotLineText: 'Media',
                                    tooltipSuffix: '',
                                    max: null,
                                    decimals: 0
                                },
                                {
                                    renderTo: 'dashboard-col-2',
                                    yAxisTitle: 'Baixado (R$)',
                                    seriesNameTitle: formatarTextoCom_(colunsName[3]),
                                    plotLineValue: rdaVal[2],
                                    plotLineText: 'Media',
                                    tooltipSuffix: '',
                                    max: null,
                                    decimals: 2
                                }
                            ],
                            dataGridRenderTo: 'dashboard-col-3',
                            decimals: 2,
                            pctDecimals: 3
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
                dataGridRenderTo,
                decimals = 2, // casas para o valor
                pctDecimals = 3 // casas para a %
            } = {}) {
                if (!containerId || !data || !data.data || !data.columnNames) {
                    console.error('Parâmetros obrigatórios não fornecidos: containerId, data, columnNames e data são necessários.');
                    return;
                }
                dataGridRenderTo = null;
                const totalColunas = data.data.length;
                createDashboardStructure(containerId, totalColunas);
                // Configuração principal do Dashboard
                Highcharts.setOptions({
                    chart: {
                        styledMode: true
                    }
                });
                Highcharts.setOptions({
                    chart: {
                        styledMode: true
                    },
                    lang: {
                        decimalPoint: ',',
                        thousandsSep: '.'
                    }
                });
                const truncate = (str = '', max = 12) => str.length > max ? (str.substring(0, max) + '…') : str;

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
                                    labels: {
                                        rotation: -45, // opcional
                                        formatter: function() {
                                            return truncate(this.value, chart.maxLabelLen || 12);
                                        }
                                    },
                                    accessibility: {
                                        description: 'Categorias'
                                    }
                                },

                                tooltip: {
                                    useHTML: true,
                                    stickOnContact: true,
                                    formatter: function() {
                                        // Pega todos os pontos da série atual
                                        const points = this.series.points || [];
                                        const total = points.reduce((acc, p) => acc + (p.y || 0), 0);
                                        const pct = total ? (this.y / total) * 100 : 0;
                                        const valueDec = chart.valueDecimals ?? decimals;
                                        const percentDec = chart.percentDecimals ?? pctDecimals;
                                        const valFmt = Highcharts.numberFormat(
                                            this.y,
                                            valueDec,
                                            Highcharts.getOptions().lang.decimalPoint,
                                            Highcharts.getOptions().lang.thousandsSep
                                        );

                                        const pctFmt = Highcharts.numberFormat(
                                            pct,
                                            percentDec,
                                            Highcharts.getOptions().lang.decimalPoint,
                                            Highcharts.getOptions().lang.thousandsSep
                                        );

                                        const categoria = this.key; // Nome completo da categoria

                                        return `
                                            <b>${categoria}</b><br/>
                                            ${this.series.name}: <b>${valFmt}</b><br/>
                                            ${pctFmt}% do total
                                            `;
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
                                                return Highcharts.numberFormat(
                                                    this.y,
                                                    chart.decimals || 0,
                                                    Highcharts.getOptions().lang.decimalPoint,
                                                    Highcharts.getOptions().lang.thousandsSep
                                                );
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

            function createDashboardStructure(containerId, totalColunas) {
                const container = document.getElementById(containerId);
                if (!container) {
                    console.error(`Container with ID "${containerId}" not found.`);
                    return;
                }

                // Limpa o container antes de adicionar os elementos
                container.innerHTML = '';

                // Define a estrutura de IDs para os elementos
                const chartRow =
                    totalColunas > 12 ? [
                        ['dashboard-col-0'],
                        ['dashboard-col-1'],
                        ['dashboard-col-2']
                    ] : [
                        ['dashboard-col-0', 'dashboard-col-1', 'dashboard-col-2']
                    ];
                const structure = [
                    ['kpi-card1', 'kpi-card2', 'kpi-card3', 'kpi-card4', 'kpi-card5', 'kpi-card6', 'kpi-card7'],
                    ...chartRow,
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
