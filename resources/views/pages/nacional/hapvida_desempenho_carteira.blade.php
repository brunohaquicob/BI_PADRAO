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
                            <div class="row g-2" id="filtrosGraficos">
                            </div>
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

                                            <div class="row margem_cima10">
                                                <div class="col-6" id="card_1"></div>
                                                <div class="col-6" id="card_1_1"></div>
                                            </div>
                                            <div class="row margem_cima10 border-top border-olive pt-2">
                                                <div class="col-6" id="card_2"></div>
                                                <div class="col-6" id="card_2_1"></div>
                                            </div>
                                            <div class="row margem_cima10 border-top border-olive pt-2">
                                                <div class="col-6" id="card_3"></div>
                                                <div class="col-6" id="card_3_1"></div>
                                            </div>
                                            <div class="row margem_cima10 border-top border-olive pt-2">
                                                <div class="col-12" id="card_4"></div>
                                            </div>
                                            <div class="row">
                                            </div>
                                            {{-- <div class="row margem_cima10 border-top border-olive pt-2">
                                                <div class="col-12" id="tabela"></div>
                                            </div> --}}
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

                                tratarRetorno(response.data.tabela, div_retorno_sintetico);
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

            async function tratarRetorno(tabela, divTabela) {

                const table = await __renderDataTable(tabela, divTabela, {
                    ordering: true,
                    order: [
                        [8, 'desc']
                    ],
                    externalFilters: {
                        container: '#filtrosGraficos',
                        columns: tabela.filtrosHeader ?? [], // ou [0,3,5] etc.
                        globalSearch: '#buscaGlobal', // opcional
                        colClass: 'col-12 col-sm-6 col-md-3',
                        // keepHeader: true // manter também os selects no header
                    }
                }, undefined, true);

                const dtf = new DTFiltrados(table);
                lerRowEMontarGraficos(dtf.getArray());
                const stop = dtf.hookFilteredRows((rows, tbl) => {
                    if (rows.length === 0) return;
                    lerRowEMontarGraficos(rows);
                }, {
                    delay: 300,
                    alertOnEmpty: true,
                    alertConfig: {
                        type: "warning",
                        title: "Precisamos de sua atenção",
                        text: "Sem resultados para essa ultima seleção! Desmarque e tente novamente. Ou olhe na aba Sintético os valores disponiveis!",
                        timeout: 10000
                    }
                });
            }

            async function lerRowEMontarGraficos(rows) {

                if (rows.length === 0) {
                    SweetAlert.alertAutoClose("info", "Precisamos de sua atenção", "Sem dados para gerar Graficos!", 5000)
                    return true;
                }
                const ar_valores = {
                    CON: 7,
                    VIDA: 8,
                    VIDAR: 9,
                    VIDAD: 11,
                    //VIDAA: '8-9-11',
                    IMP: 12,
                    IMPA: 13,
                    IMPR: 14,
                }

                //const ar_total          = Utilitarios.sumColumnsFormula(rows, ar_valores);
                const ar_total          = Utilitarios.sumColumns(rows, ar_valores);
                const ar_implantacao    = Utilitarios.sumColumns(rows, ar_valores, 0);
                const ar_cancelado      = Utilitarios.sumColumns(rows, ar_valores, 1);
                const ar_frente         = Utilitarios.sumColumns(rows, ar_valores, 2);
                const ar_operadora      = Utilitarios.sumColumns(rows, ar_valores, 4);
                const ar_porte          = Utilitarios.sumColumns(rows, ar_valores, 5);
                const ar_fase           = Utilitarios.sumColumns(rows, ar_valores, 6);

                //ATUALIZAR CARDS
                const time_animacao = 1500;
                //await animarNumeroBRL('#smallbox1-1', 0, ar_total.IMP, time_animacao, 2, '', '', true);
                await Promise.all([
                    animarNumeroBRL('#smallbox1-1', 0, ar_total.IMP, time_animacao, 2, '', '', true),
                    animarNumeroBRL('#smallbox2-1', 0, ar_total.IMPR, time_animacao, 2, '', '', true),
                    animarNumeroBRL('#smallbox2-2', 0, (ar_total.IMP > 0 ? (ar_total.IMPR / ar_total.IMP * 100) : 0), time_animacao, 2, 'Valor Recuperado (<b>', '%</b>)', true),
                    animarNumeroBRL('#smallbox4-1', 0, ar_total.VIDA, time_animacao, 0, '', '', true),
                    animarNumeroBRL('#smallbox5-1', 0, ar_total.VIDAR, time_animacao, 0, '', '', true),
                    animarNumeroBRL('#smallbox5-2', 0, (ar_total.VIDA > 0 ? ((ar_total.VIDAR) / ar_total.VIDA * 100) : 0), time_animacao, 2, 'Vidas Recuperadas (<b>', '%</b>)', true),
                ]);

                //Renderiza os graficos apos a animação dos cards
                //FUNIL
                CriarGraficos.createHighchartsFunnel({
                    containerId: 'card_1',
                    title: '',
                    data: [{
                            name: 'Implantado',
                            value: ar_total.VIDA
                        },
                        {
                            name: 'Em Aberto',
                            value: ar_total.VIDA - ar_total.VIDAD - ar_total.VIDAR
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
                        '#3c8dbc',
                        '#dc3545',
                        '#3d9970',
                    ], // opcional
                });


                criarGraficoChartsFlexible(ar_implantacao, 'card_1_1', 'Desempenho Implantação', 'Vidas',   0, 'column', rows, 0);
                criarGraficoChartsFlexible(ar_porte, 'card_2', 'Desempenho Porte', 'Vidas',                 0, 'column', rows, 5);
                criarGraficoChartsFlexible(ar_operadora, 'card_2_1', 'Desempenho Operadora', 'Vidas',       0, 'column', rows, 4);
                criarGraficoChartsFlexible(ar_frente, 'card_3', 'Desempenho Frente', 'Vidas',               0, 'column', rows, 2);
                criarGraficoChartsFlexible(ar_cancelado, 'card_3_1', 'Desempenho Cancelados', 'Vidas',      0, 'column', rows, 1);
                criarGraficoChartsFlexible2(ar_fase, 'card_4', 'Desempenho por Fase', 'Vidas',              0, 'column');

            }

            
            function criarGraficoChartsFlexible(ar_dados, id, title, subtitle = 'Aberto/Recebidos', decimal = 2, tipo_grafico = 'areaspline', rows, key_coluna = 1) {

                // 1. Pegar as chaves e ordenar (ano-mês)
                let keys = Object.keys(ar_dados).sort();
                let key_ajust = keys.map(s => s.includes('->') ? s.split('->')[1].trim() : s);
                // 2. Criar arrays separados
                let implantado = keys.map(k => ar_dados[k].VIDA);
                let aberto = keys.map(k => ar_dados[k].VIDA - ar_dados[k].VIDAR - ar_dados[k].VIDAD);
                let recebido = keys.map(k => ar_dados[k].VIDAR);
                let devolvido = keys.map(k => ar_dados[k].VIDAD);

                let tooltipExtraKey = Utilitarios.pieBreakdownBy(rows, {
                    keyCol: key_coluna, // DATA_IMPLANTACAO
                    groupCol: 6, // FASE
                    valueCol: 9, // recuperado
                    keyTransform: k => (k.includes('->') ? k.split('->')[1].trim() : k), // pra casar com key_ajust
                    groupTransform: g => (String(g).includes('->') ? String(g).split('->')[1].trim() : g),
                    // Opcional:
                    topN: 6, // mantém só 8 maiores por key
                    // minPct: 3  // agrupa <3% em "Outros",
                    toNumber: Utilitarios.parsePtNumber
                });
                console.log(tooltipExtraKey)
                let series_ar = [{
                        name: 'Em aberto',
                        type: tipo_grafico,
                        data: aberto,
                        prefix: '',
                        decimals: decimal
                    },
                    {
                        name: 'Devolvido',
                        type: tipo_grafico,
                        data: devolvido,
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
                ];

                const chart = new HighchartsFlexible2({
                    container: id,
                    title: title,
                    subtitle: subtitle,
                    tooltip: {
                        decimals: decimal
                    },
                    tooltipExtraKey: tooltipExtraKey,
                    tooltipMiniPie: {
                        title: 'FASES COM MELHOR RECUPERAÇÃO',
                        width: 400,
                        height: 260,
                        labelDistance: 12,
                        valueFontSize: '10px',
                        valueDecimals: decimal,
                        percentDecimals: 2
                    },
                    //seriesPerc: ['Implantadas'],
                    colors: null,
                    xAxis: {
                        type: 'category',
                        categories: key_ajust
                    },
                    yAxis: {
                        title: '',
                        min: 0
                    },
                    series: series_ar
                }).build();
            }

            function criarGraficoChartsFlexible2(ar_dados, id, title, subtitle = 'Implantado/Aberto/Recuperado', decimal = 2, tipo_grafico = 'areaspline') {
                // 1. Pegar as chaves e ordenar (ano-mês)
                let keys = Object.keys(ar_dados).sort();
                let key_ajust = keys.map(s => s.includes('->') ? s.split('->')[1].trim() : s);
                // 2. Criar arrays separados
                let implantado = keys.map(k => ar_dados[k].VIDA);
                let aberto = keys.map(k => ar_dados[k].VIDA - ar_dados[k].VIDAR - ar_dados[k].VIDAD);
                let recebido = keys.map(k => ar_dados[k].VIDAR);
                let devolvido = keys.map(k => ar_dados[k].VIDAD);

                const chart = new HighchartsFlexible2({
                    container: id,
                    title: title,
                    subtitle: subtitle,
                    tooltip: {
                        decimals: 0
                    },
                    //seriesPerc: ['Implantadas'],
                    colors: null,
                    xAxis: {
                        type: 'category',
                        categories: key_ajust
                    },
                    yAxis: {
                        title: '',
                        min: 0
                    },
                    series: [{
                            name: 'Em aberto',
                            type: tipo_grafico,
                            data: aberto,
                            prefix: '',
                            decimals: decimal
                        },
                        {
                            name: 'Devolvido',
                            type: tipo_grafico,
                            data: devolvido,
                            prefix: '',
                            decimals: decimal
                        },
                        {
                            name: 'Recuperadas',
                            type: 'spline',
                            data: recebido,
                            prefix: '',
                            decimals: decimal
                        },
                        /*{
                             name: 'Implantadas',
                             type: 'column',
                             data: implantado,
                             prefix: '',
                             decimals: decimal
                         }*/
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
