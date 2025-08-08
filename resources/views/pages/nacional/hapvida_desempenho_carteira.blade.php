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

                    @foreach ($filtros as $key => $itens)
                        <div class="col-md-3">
                            <div class="form-group">
                                <label for="rel_{{ $key }}">{{ ucwords(str_replace('_', ' ', $key)) }}:</label>
                                <select class="form-control selectPickerAntigo" id="rel_{{ $key }}" name="rel_{{ $key }}[]" multiple="multiple">
                                    @foreach ($itens as $v)
                                        @continue(empty($v))
                                        <option value="{{ $v }}">{{ $v }}</option>
                                    @endforeach
                                </select>
                            </div>
                        </div>
                    @endforeach
                </div>
                <div class="row margem_cima20">
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
        <div class="card-body" id="card_resultados">
            <div class="tab-content">
                <div class="chart tab-pane active" id="resultado-aba2" style="min-height:600px;">
                    <div class="card-body" style="display: block;">

                        <div class="container-fluid">
                            <div class="row">
                                <div class="col-3">
                                    <x-boxdynamic-component component-name="smallbox" identificador="1" color="lightblue" icon="ion ion-social-usd" text1="0" text2="Valor Implantado." />
                                </div>
                                <div class="col-3">
                                    <x-boxdynamic-component component-name="smallbox" identificador="2" color="lightblue" icon="ion ion-social-usd" text1="0" text2="Valor Recuperado." />
                                </div>
                                {{-- <div class="col-2">
                                    <x-boxdynamic-component component-name="smallbox" identificador="3" color="success" icon="ion ion-arrow-graph-up-right" text1="0" text2="% Recuperado." />
                                </div> --}}
                                <div class="col-3">
                                    <x-boxdynamic-component component-name="smallbox" identificador="4" color="olive" icon="ion ion-heart-broken" text1="0" text2="Vidas Implantadas." />
                                </div>
                                <div class="col-3">
                                    <x-boxdynamic-component component-name="smallbox" identificador="5" color="olive" icon="ion ion-heart" text1="0" text2="Vidas Recuperadas." />
                                </div>
                                {{-- <div class="col-2">
                                    <x-boxdynamic-component component-name="smallbox" identificador="6" color="success" icon="ion ion-arrow-graph-up-right" text1="0" text2="% Recuperado." />
                                </div> --}}
                            </div>

                            <div class="row">
                                <section class="col-12">
                                    @php
                                        $identificadorCard = 'car1';
                                    @endphp
                                    <x-cardcustom-component tipo="simples" identificador="{{ $identificadorCard }}" footer='S' color='primary' icon="fas fa-chart-pie" title="DESEMPENHO CARTEIRAS"
                                        style='min-height: 600px; p-0'>
                                        <x-slot name="slotbody">
                                            <div class="row">
                                                <div class="col-12" id="card_1"></div>
                                                {{-- <div class="col-4" id="card_1_1"></div> --}}
                                            </div>
                                            <div class="row">
                                                <div class="col-12" id="card_2"></div>
                                                {{-- <div class="col-12" id="card_2_1"></div> --}}
                                            </div>
                                            <div class="row">
                                                <div class="col-6" id="card_3"></div>
                                                <div class="col-6" id="card_3_1"></div>
                                            </div>
                                            <div class="row">
                                                <div class="col-6" id="container"></div>
                                                <div class="col-6" id="container2"></div>
                                                {{-- <div class="col-4" id="card_3_1"></div> --}}
                                            </div>
                                        </x-slot>
                                        {{-- <x-slot name="slotfooter">
                                <p>conteudo footer</p>
                            </x-slot> --}}
                                    </x-cardcustom-component>
                                </section>
                            </div>

                        </div>
                    </div>
                </div>
                <div class="chart tab-pane" id="resultado-aba1" style="min-height:600px;"></div>
            </div>
        </div>
        <div class="card-footer" id="resultado-footer">
        </div>

    </div>
@stop

@section('plugins.HighCharts', true)

@once
    @push('css')
    @endpush
    @push('js')
        <script src="https://code.highcharts.com/modules/sankey.js"></script>
        <script src="https://code.highcharts.com/modules/funnel.js"></script>
        <script src="https://code.highcharts.com/modules/series-label.js"></script>
        <script>
            $(document).ready(function() {
                carregarCoresGraficosHapvida();

                gerarSelectPicker2(".selectPickerAntigo");

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
                let div_retorno_sintetico = 'resultado-aba1';
                let div_retorno_analitico = 'resultado-aba2';
                $bt = '#btnBuscarDados';
                startLadda($bt);
                const requestParams = {
                    method: 'POST',
                    url: '{{ route('buscar.hapvida_desempenho_carteira_dados') }}',
                    data: {},
                    formId: idForm
                };
                AjaxRequest.sendRequest(requestParams).then(response => {
                    stopLadda($bt);
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
                            if (response.data.tabela !== undefined && response.data.tabela != '') {

                                let param = {
                                    ordering: false
                                };

                                const table = __renderDataTable(response.data.tabela, div_retorno_sintetico, param);

                                const dtf = new DTFiltrados(table);
                                lerRowEMontarGraficos(dtf.getArray());
                                const stop = dtf.hookFilteredRows((rows, tbl) => {
                                    lerRowEMontarGraficos(rows);
                                }, 3000); // espera 3s 

                                // parar de escutar:
                                // stop();
                            }
                        }

                    } else {
                        SweetAlert.alertAutoClose("error", "Precisamos de sua atenção", response.msg, 20000);
                    }
                }).catch(error => {
                    stopLadda($bt);
                    alertar(error, "", "error");
                });
            }

            document.addEventListener("DOMContentLoaded", function() {

            });

            function lerRowEMontarGraficos(rows) {

                const ar_valores = {
                    CON: 6,
                    VIDA: 7,
                    VIDAR: 8,
                    VIDAD: 10,
                    VIDAA: '7-8-10',
                    IMP: 11,
                    IMPA: 12,
                    IMPR: 13,
                }

                const ar_total = Utilitarios.sumColumnsFormula(rows, ar_valores);
                const ar_cancelado = Utilitarios.sumColumnsFormula(rows, ar_valores, 1);
                const ar_operadora = Utilitarios.sumColumnsFormula(rows, ar_valores, 4);
                const ar_porte     = Utilitarios.sumColumnsFormula(rows, ar_valores, 5);


                animarNumeroBRL('#smallbox1-1', 0, ar_total.IMP, 3000, 2, '');
                animarNumeroBRL('#smallbox2-1', 0, ar_total.IMPR, 3000, 2, '');
                animarNumeroBRL('#smallbox2-2', 0, (ar_total.IMP > 0 ? (ar_total.IMPR / ar_total.IMP * 100) : 0), 3000, 2, 'Valor Recuperado (<b>', '%</b>)');

                animarNumeroBRL('#smallbox4-1', 0, ar_total.VIDA, 3000, 0, '');
                animarNumeroBRL('#smallbox5-1', 0, (ar_total.VIDAR), 3000, 0, '');
                animarNumeroBRL('#smallbox5-2', 0, (ar_total.VIDA > 0 ? ((ar_total.VIDAR) / ar_total.VIDA * 100) : 0), 3000, 2, 'Vidas Recuperadas (<b>', '%</b>)');


                criarGraficoChartsFlexible(ar_cancelado, 'card_1', 'Desempenho Cancelados', 'Vidas', 0);
                criarGraficoChartsFlexible(ar_operadora, 'card_2', 'Desempenho Operadora', 'Vidas', 0);
                criarGraficoChartsFlexible(ar_porte, 'card_3', 'Desempenho Porte', 'Vidas', 0);
                //FUNIL
                CriarGraficos.createHighchartsFunnel({
                    containerId: 'card_3_1',
                    title: '',
                    data: [{
                            name: 'Implantado',
                            value: ar_total.VIDA
                        },
                        {
                            name: 'Em Aberto',
                            value: ar_total.VIDAA
                        },
                        {
                            name: 'Devolvido',
                            value: (ar_total.VIDAD),
                            //color: '#22c55e'
                        }, // cor opcional por etapa
                        {
                            name: 'Recuperado',
                            value: ar_total.VIDAR
                        }
                    ],
                    decimals: 0,
                    prefix: '',
                    suffix: '',
                    colors: [
                        '#6c757d',
                        '#dc3545',
                        '#3c8dbc',
                        '#3d9970',
                    ], // opcional
                });

            }

            function criarGraficoChartsFlexible(ar_dados, id, title, subtitle = 'Implantado/Aberto/Recuperado', decimal = 2) {
                // 1. Pegar as chaves e ordenar (ano-mês)
                let keys = Object.keys(ar_dados).sort();
                // 2. Criar arrays separados
                let implantado = keys.map(k => ar_dados[k].VIDA);
                let aberto = keys.map(k => ar_dados[k].VIDAA);
                let recebido = keys.map(k => ar_dados[k].VIDAR);

                const chart = new HighchartsFlexible2({
                    container: id,
                    title: title,
                    subtitle: subtitle,
                    tooltip: {
                        decimals: 0
                    },
                    seriesPerc: ['Implantadas'],
                    colors: null,
                    xAxis: {
                        type: 'category',
                        categories: keys
                    },
                    yAxis: {
                        title: '',
                        min: 0
                    },
                    series: [{
                            name: 'Implantadas',
                            type: 'column',
                            data: implantado,
                            prefix: '',
                            decimals: decimal
                        },
                        {
                            name: 'Em aberto',
                            type: 'column',
                            data: aberto,
                            prefix: '',
                            decimals: decimal
                        },
                        {
                            name: 'Recuperadas',
                            type: 'spline',
                            data: recebido,
                            prefix: '',
                            decimals: decimal
                        }
                    ]
                }).build();
            }

            function criarGraficosRowKey(ar_dados, id, title, subtitle = 'Aberto/Em Negociação/Recebidos') {
                // 1. Pegar as chaves e ordenar (ano-mês)
                let keys = Object.keys(ar_dados).sort();
                // 2. Criar arrays separados
                let arrA = keys.map(k => ar_dados[k].A);
                let arrI = keys.map(k => ar_dados[k].I);
                let arrN = keys.map(k => ar_dados[k].N);
                let arrR = keys.map(k => ar_dados[k].R);
                let arrE = keys.map(k => (ar_dados[k].I > 0 ? (ar_dados[k].R / ar_dados[k].I * 100) : 0));
                let configGrafico1 = {
                    containerId: id, // ID da div onde o gráfico será renderizado
                    title: title,
                    subtitle: subtitle,
                    xAxisCategories: keys,
                    seriesData: [{
                            name: 'Sem Acordo',
                            type: 'column',
                            data: arrA,
                            decimals: 2,
                            prefix: 'R$ ',
                            suffix: '',
                            position: 'left',
                            axisGroup: 'moneyR',
                            //axisTitle: 'Valores em Aberto(R$)'
                        },
                        {
                            name: 'Com Acordo',
                            type: 'column',
                            data: arrN,
                            decimals: 2,
                            prefix: 'R$ ',
                            suffix: '',
                            position: 'left',
                            axisGroup: 'moneyR2',
                            //axisTitle: 'Valores em Aberto(R$)'
                        },
                        {
                            name: 'Recuperado',
                            type: 'column',
                            data: arrR,
                            decimals: 2,
                            prefix: 'R$ ',
                            suffix: '',
                            position: 'right',
                            axisGroup: 'moneyL',
                            //axisTitle: 'Valores Recuperados(R$)'
                        }
                    ]
                };
                CriarGraficos.createHighchartsDualAxes(configGrafico1);
            }
        </script>
    @endpush
@endonce
