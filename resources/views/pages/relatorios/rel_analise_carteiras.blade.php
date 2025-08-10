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
                    <div class="col-6 col-md-3">
                        <x-calendario-component id='dateRangePicker' event-name='dateRangeSelected' :options="[]" type='input-com-check' autoApply='false' single='N' label='Data Implantação' />

                    </div>
                    <div class="col-6 col-md-3">
                        <div class="form-group">
                            <label for="rel_tipo_data">Tipo Implantação:</label>
                            <select class="form-control " id="rel_tipo_data" name="rel_tipo_data">
                                <option value="P" selected="">Implantação Parecela</option>
                                <option value="C">Implantação Contrato</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-6 col-md-3">
                        <div class="form-group">
                            <label for="rel_tipo_agrupamento">Agrupar por:</label>
                            <select class="form-control " id="rel_tipo_agrupamento" name="rel_tipo_agrupamento">
                                <option value="E" selected="">Equipe</option>
                                <option value="L">Loja</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-6 col-md-3">
                        <div class="form-group">
                            <label for="rel_equipe_loja">Equipe/Loja:</label>
                            <select class="form-control selectPickerNovo" id="rel_equipe_loja" name="rel_equipe_loja[]" multiple="multiple" required="true">
                                @php
                                    $grouped = collect($equipes_loja)->groupBy('grupo');
                                @endphp
                                @foreach ($grouped as $grupo => $itens)
                                    <optgroup label="{{ $grupo }}">
                                        @foreach ($itens as $v)
                                            <option value="{{ $v['grupo_codigo'] . '-' . $v['col1'] }}">{{ $v['col3'] }}</option>
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
        <link href="{{ asset('css/relatorios/rel_daboards_highcharts.css') }}" rel="stylesheet">
        <style>
            /* evita quebra e ajusta fontes conforme a largura do viewport */
            .kpi .highcharts-kpi .highcharts-value {
                white-space: nowrap;
                /* NÃO quebrar o número */
                line-height: 1.1;
                font-weight: 700;
                font-size: clamp(18px, 4.5vw, 28px);
                /* escala: 18px..28px */
            }

            .kpi .highcharts-kpi .highcharts-title {
                margin-bottom: .25rem;
                font-size: clamp(14px, 3.2vw, 20px);
            }

            .kpi .highcharts-kpi .highcharts-subtitle {
                margin-top: .25rem;
                font-size: clamp(12px, 2.4vw, 14px);
                opacity: .85;
            }

            /* opcional: esconder subtítulo no mobile muito estreito */
            @media (max-width: 480px) {
                .kpi .highcharts-kpi .highcharts-subtitle {
                    display: none;
                }
            }
        </style>
    @endpush
    @push('js')
        <script src="https://code.highcharts.com/highcharts.js"></script>
        <script src="https://code.highcharts.com/dashboards/datagrid.js"></script>
        <script src="https://code.highcharts.com/dashboards/dashboards.js"></script>
        <script src="https://code.highcharts.com/dashboards/modules/layout.js"></script>
        <script src="https://code.highcharts.com/modules/accessibility.js"></script>
        <script>
            $(document).ready(function() {

                carregarCoresGraficos();
                gerarSelectPicker(".selectPickerNovo");

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
                        const dash = new DashMicro({
                            containerId: 'resultado-aba2',
                            data: {
                                columnNames: colunsName,
                                data: dados_grafico.dados
                            },
                            kpis: [{
                                    title: formatarTextoCom_(colunsNameKap[0]),
                                    subtitle: 'Valor implantado',
                                    value: dados_grafico.totais[0],
                                    colorIndex: 2,
                                    decimals: 2,
                                    prefix: 'R$ ',
                                    suffix: ''
                                },
                                {
                                    title: formatarTextoCom_(colunsNameKap[1]),
                                    subtitle: 'Valor em Aberto',
                                    value: dados_grafico.totais[1],
                                    colorIndex: 3,
                                    decimals: 2,
                                    prefix: 'R$ ',
                                    suffix: ''
                                },
                                {
                                    title: formatarTextoCom_(colunsNameKap[2]),
                                    subtitle: 'Valor Baixado',
                                    value: dados_grafico.totais[2],
                                    colorIndex: 4,
                                    decimals: 2,
                                    prefix: 'R$ ',
                                    suffix: ''
                                },
                                {
                                    title: formatarTextoCom_(colunsNameKap[3]),
                                    subtitle: 'Valor Recebido',
                                    value: dados_grafico.totais[3],
                                    colorIndex: 5,
                                    decimals: 2,
                                    prefix: 'R$ ',
                                    suffix: ''
                                },
                                {
                                    title: formatarTextoCom_(colunsNameKap[4]),
                                    subtitle: 'Valor Comissão',
                                    value: dados_grafico.totais[4],
                                    colorIndex: 6,
                                    decimals: 2,
                                    prefix: 'R$ ',
                                    suffix: ''
                                },
                                {
                                    title: formatarTextoCom_(colunsNameKap[5]),
                                    subtitle: 'Valor Devolvido',
                                    value: dados_grafico.totais[5],
                                    colorIndex: 7,
                                    decimals: 2,
                                    prefix: 'R$ ',
                                    suffix: ''
                                },
                                {
                                    title: formatarTextoCom_(colunsNameKap[6]),
                                    subtitle: 'CPFs Únicos',
                                    value: dados_grafico.totais[6],
                                    colorIndex: 8,
                                    decimals: 0,
                                    prefix: '',
                                    suffix: ''
                                },
                                {
                                    title: formatarTextoCom_(colunsNameKap[7]),
                                    subtitle: 'Contratos Únicos',
                                    value: dados_grafico.totais[7],
                                    colorIndex: 9,
                                    decimals: 0,
                                    prefix: '',
                                    suffix: ''
                                }
                            ],
                            charts: [{
                                    yAxisTitle: 'Implantado (R$)',
                                    seriesNameTitle: formatarTextoCom_(colunsName[1]),
                                    plotLineValue: rdaVal[0],
                                    plotLineText: 'Média',
                                    decimals: 0,
                                    colorIndex: 2
                                },
                                {
                                    yAxisTitle: 'Aberto (R$)',
                                    seriesNameTitle: formatarTextoCom_(colunsName[2]),
                                    plotLineValue: rdaVal[1],
                                    plotLineText: 'Média',
                                    decimals: 0,
                                    colorIndex: 3
                                },
                                {
                                    yAxisTitle: 'Baixado (R$)',
                                    seriesNameTitle: formatarTextoCom_(colunsName[3]),
                                    plotLineValue: rdaVal[2],
                                    plotLineText: 'Média',
                                    decimals: 2,
                                    colorIndex: 4
                                }
                            ],
                            includeGrid: false,
                            decimals: 2, // default global (usado quando KPI não seta `decimals`)
                            pctDecimals: 3, // tooltips de gráfico
                            kpiAdaptive: true // deixa ligado para usar formatNumberAdaptive automaticamente
                        });
                        dash.render();


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
        </script>
    @endpush
@endonce
