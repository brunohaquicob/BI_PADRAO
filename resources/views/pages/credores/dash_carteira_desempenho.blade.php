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
                            <select class="form-control selectpickerNovo" id="rel_tipo_data" name="rel_tipo_data">
                                <option value="P" selected="">Implantação Parcela</option>
                                <option value="C">Implantação Contrato</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="form-group">
                            <label for="rel_tipo_fase">Considerar:</label>
                            <select class="form-control selectpickerNovo" id="rel_tipo_fase" name="rel_tipo_fase">
                                <option value="T" selected="">Todas as fases agrupadas</option>
                                <option value="A">Fase mais antiga agrupada</option>
                            </select>
                        </div>
                    </div>
                    {{-- <div class="col-md-3">
                        <div class="form-group">
                            <label for="rel_carteira">Loja/Carteira:</label>
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
                    </div> --}}
                    <div class="col-md-3">
                        <div class="form-group">
                            <label for="rel_carteira">Equipe Loja:</label>

                            <select class="form-control multiselect-bs4" id="rel_carteira" name="rel_carteira[]" multiple="multiple">
                                @php
                                    $grouped = collect($equipe_lojas)->groupBy('grupo');
                                @endphp
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
                                    <x-boxdynamic-component component-name="smallbox" identificador="2" color="success" icon="ion ion-social-usd" text1="0" text2="Valor Recuperado." />
                                </div>
                                {{-- <div class="col-2">
                                    <x-boxdynamic-component component-name="smallbox" identificador="3" color="success" icon="ion ion-arrow-graph-up-right" text1="0" text2="% Recuperado." />
                                </div> --}}
                                <div class="col-3">
                                    <x-boxdynamic-component component-name="smallbox" identificador="4" color="info" icon="ion ion-pricetags" text1="0" text2="Contratos Implantados." />
                                </div>
                                <div class="col-3">
                                    <x-boxdynamic-component component-name="smallbox" identificador="5" color="success" icon="ion ion-pricetags" text1="0" text2="Contratos Recuperados." />
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
                carregarCoresGraficos();
                $('.multiselect-bs4').multiselect({
                    includeSelectAllOption: true,
                    includeSelectAllOptionMin: 3,
                    selectAllText: "Todos",
                    selectAllDeselectAll: false,
                    enableCollapsibleOptGroups: true,
                    collapseOptGroupsByDefault: true,
                    enableFiltering: true,
                    maxHeight: 300,
                    fontSize: 14
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
                let div_retorno_sintetico = 'resultado-aba1';
                let div_retorno_analitico = 'resultado-aba2';
                addLoading("card_resultados");
                let datas = getRangeDate('dateRangePicker');
                const requestParams = {
                    method: 'POST',
                    url: '{{ route('buscar.credor_dash_carteira_desempenho_dados') }}',
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
                    alertar(error, "", "error");
                });
            }

            document.addEventListener("DOMContentLoaded", function() {

            });

            function lerRowEMontarGraficos(rows) {
                const ar_data_valor = Utilitarios.sumColumns(rows, {
                    I: 9,
                    R: 11,
                    N: 13,
                    A: 14,
                }, 1);
                const ar_fase_valor = Utilitarios.sumColumns(rows, {
                    I: 9,
                    R: 11,
                    N: 13,
                    A: 14,
                }, 2);
                const ar_data_qtd = Utilitarios.sumColumns(rows, {
                    F: 3,
                    FA: 4,
                    C: 5,
                    CA: 6
                }, 1);
                const ar_fase_qtd = Utilitarios.sumColumns(rows, {
                    F: 3,
                    FA: 4,
                    C: 5,
                    CA: 6
                }, 2);
                const implantado = Utilitarios.sumColumns(rows, {
                    I: 9,
                    R: 11,
                    A: 14,
                    N: 13,
                    CA: 6,
                    C: 5,
                    FA: 4,
                    F: 3
                });

                const contratos_fase = Utilitarios.sumColumns(rows, {
                    CA: 6,
                    C: 5,
                    FA: 4,
                    F: 3
                }, 2);
                const contratos_data = Utilitarios.sumColumns(rows, {
                    CA: 6,
                    C: 5,
                    FA: 4,
                    F: 3
                }, 1);

                animarNumeroBRL('#smallbox1-1', 0, implantado.I, 3000, 2, '');
                animarNumeroBRL('#smallbox2-1', 0, implantado.R, 3000, 2, '');
                animarNumeroBRL('#smallbox2-2', 0, (implantado.I > 0 ? (implantado.R / implantado.I * 100) : 0), 3000, 2, 'Valor Recuperado (<b>', '%</b>)');

                animarNumeroBRL('#smallbox4-1', 0, implantado.C, 3000, 0, '');
                animarNumeroBRL('#smallbox5-1', 0, (implantado.C - implantado.CA), 3000, 0, '');
                animarNumeroBRL('#smallbox5-2', 0, (implantado.C > 0 ? ((implantado.C - implantado.CA) / implantado.C * 100) : 0), 3000, 2, 'Contratos Recuperados (<b>', '%</b>)');

                //console.log(ar_data_valor);
                //console.log(ar_fase_valor);
                //console.log(implantado);

                //MOntar Grafico 1
                criarGraficosRowKey(ar_fase_valor, 'card_1', 'Desempenho por Fase', 'Aberto/Em Negociação/Recebidos');
                //MOntar Grafico 2
                criarGraficosRowKey(ar_data_valor, 'card_2', 'Desempenho por Data', 'Aberto/Em Negociação/Recebidos');


                criarGraficoChartsFlexible(contratos_data, 'card_3', 'Desempenho Contratos', 'Por Fase', 0);
                //FUNIL
                CriarGraficos.createHighchartsFunnel({
                    containerId: 'card_3_1',
                    title: '',
                    data: [{
                            name: 'Implantado',
                            value: implantado.I
                        },
                        {
                            name: 'Em Aberto',
                            value: implantado.A
                        },
                        {
                            name: 'Em Acordo',
                            value: implantado.N,
                            //color: '#22c55e'
                        }, // cor opcional por etapa
                        {
                            name: 'Recuperado',
                            value: implantado.R
                        }
                    ],
                    decimals: 2,
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

            function criarGraficoChartsFlexible(ar_dados, id, title, subtitle = 'Aberto/Recebidos', decimal = 2) {
                // 1. Pegar as chaves e ordenar (ano-mês)
                let keys = Object.keys(ar_dados).sort();
                // 2. Criar arrays separados
                let implantado = keys.map(k => ar_dados[k].C);
                let aberto = keys.map(k => ar_dados[k].CA);
                let recebido = keys.map(k => ar_dados[k].C - ar_dados[k].CA);

                const chart = new HighchartsFlexible({
                    container: id,
                    title: title,
                    subtitle: subtitle,
                    colors: null, //['#6CF', '#39F', '#06C', '#036', '#000'],
                    xAxis: {
                        type: 'category',
                        categories: keys
                    },
                    yAxis: {
                        title: '(R$)',
                        min: 0
                    },
                    series: [{
                            name: 'Em Aberto',
                            type: 'areaspline',
                            data: aberto,
                            prefix: '',
                            decimals: decimal
                        },
                        {
                            name: 'Recebido',
                            type: 'areaspline',
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
