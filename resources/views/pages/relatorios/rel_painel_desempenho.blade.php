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
                        <div class="form-group">
                            <label for="rel_agrupador">Tipo Agrupamento:</label>
                            <select class="form-control" id="rel_agrupador" name="rel_agrupador">
                                <option value="U" selected="">Usuário</option>
                                <option value="L">Loja</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="form-group">
                            <label for="rel_mes_base">Mes Base:</label>
                            <select class="form-control" id="rel_mes_base" name="rel_mes_base">
                                @foreach ($meses as $v)
                                    <option value="{{ $v['col1'] }}">{{ $v['col2'] }}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="form-group">
                            <label for="rel_carteira">Equipe Loja:</label>

                            <select class="form-control selectpickerNovo" id="rel_carteira" name="rel_carteira[]" multiple="multiple">
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
                        <a class="nav-link btn-sm ladda-button" data-style="zoom-out" href="#resultado-aba1" data-toggle="tab">#</a>&nbsp;
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
                                <div class="col-lg-2 col-4">
                                    <x-boxdynamic-component component-name="smallbox" identificador="1" color="lightblue" icon="ion ion-pricetags" text1="0" text2="Quantidade de acionamentos." />
                                </div>
                                <div class="col-lg-2 col-4">
                                    <x-boxdynamic-component component-name="smallbox" identificador="2" color="lightblue" icon="ion ion-pricetags" text1="0" text2="Média nos ultimos meses." />
                                </div>
                                <div class="col-lg-2 col-4">
                                    <x-boxdynamic-component component-name="smallbox" identificador="3" color="lightblue" icon="ion ion-arrow-graph-up-right" text1="0" text2="% Atingido até o momento." />
                                </div>

                                <div class="col-lg-2 col-4">
                                    <x-boxdynamic-component component-name="smallbox" identificador="4" color="info" icon="ion ion-pricetags" text1="0" text2="Quantidade de acordos." />
                                </div>
                                <div class="col-lg-2 col-4">
                                    <x-boxdynamic-component component-name="smallbox" identificador="5" color="info" icon="ion ion-pricetags" text1="0" text2="Média nos ultimos meses." />
                                </div>
                                <div class="col-lg-2 col-4">
                                    <x-boxdynamic-component component-name="smallbox" identificador="6" color="info" icon="ion ion-arrow-graph-up-right" text1="0" text2="% Atingido até o momento." />
                                </div>

                                <div class="col-lg-2 col-4">
                                    <x-boxdynamic-component component-name="smallbox" identificador="7" color="olive" icon="ion ion-social-usd" text1="0" text2="Valor das baixas." />
                                </div>
                                <div class="col-lg-2 col-4">
                                    <x-boxdynamic-component component-name="smallbox" identificador="8" color="olive" icon="ion ion-social-usd" text1="0" text2="Média nos ultimos meses." />
                                </div>
                                <div class="col-lg-2 col-4">
                                    <x-boxdynamic-component component-name="smallbox" identificador="9" color="olive" icon="ion ion-arrow-graph-up-right" text1="0" text2="% Atingido até o momento." />
                                </div>

                                <div class="col-lg-2 col-4">
                                    <x-boxdynamic-component component-name="smallbox" identificador="10" color="success" icon="ion ion-social-usd" text1="0" text2="Valor das comissões." />
                                </div>
                                <div class="col-lg-2 col-4">
                                    <x-boxdynamic-component component-name="smallbox" identificador="11" color="success" icon="ion ion-social-usd" text1="0" text2="Média nos ultimos meses." />
                                </div>
                                <div class="col-lg-2 col-4">
                                    <x-boxdynamic-component component-name="smallbox" identificador="12" color="success" icon="ion ion-arrow-graph-up-right" text1="0" text2="% Atingido até o momento." />
                                </div>
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
                                            <div class="row margem_cima20">
                                                <div class="col-12" id="card_2"></div>
                                                {{-- <div class="col-12" id="card_2_1"></div> --}}
                                            </div>
                                            <div class="row margem_cima20">
                                                <div class="col-12" id="card_3"></div>
                                                <div class="col-12" id="card_3_1"></div>
                                            </div>
                                            <div class="row">
                                                <div class="col-12" id="container"></div>
                                                <div class="col-12" id="container2"></div>
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
        <style>
            .sparkline-container {
                width: 130px;
                height: 35px;
            }

            table.dataTable td {
                vertical-align: middle;
                text-align: center;
            }

            .th-acionamento {
                background-color: #cce5ff;
                /* Azul claro */
            }

            .th-baixa {
                background-color: #d4edda;
                /* Verde claro */
            }

            .th-acordo {
                background-color: #fff3cd;
                /* Amarelo claro */
            }

            .th-comissao {
                background-color: #e2e3e5;
                /* Cinza claro */
            }

            .th-honorario {
                background-color: #f8d7da;
                /* Vermelho claro */
            }

            .table thead th {
                text-align: center !important;
                vertical-align: middle !important;
            }
        </style>
    @endpush
    @push('js')
        {{-- <script src="https://code.highcharts.com/highcharts.js"></script> --}}
        <script src="https://code.highcharts.com/modules/sankey.js"></script>
        <script src="https://code.highcharts.com/modules/funnel.js"></script>
        <script>
            $(document).ready(function() {
                carregarCoresGraficos();
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
                let div_retorno_sintetico = 'resultado-aba1';
                let div_retorno_analitico = 'resultado-aba2';
                addLoading("card_resultados");
                const requestParams = {
                    method: 'POST',
                    url: '{{ route('buscar.rel_painel_desempenho_dados') }}',
                    data: {},
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

                                const table = gerarTabelaComGraficos(response.data.tabela, 'table_performace', 'card_1');
                                const dtf = new DTFiltrados(table);
                                lerRowEMontarGraficos(dtf.getArray());
                                /*
                                let param = {
                                    ordering: false
                                };

                                const table = __renderDataTable(response.data.tabela, div_retorno_sintetico, param);

                                const dtf = new DTFiltrados(table);
                                lerRowEMontarGraficos(dtf.getArray());
                                const stop = dtf.hookFilteredRows((rows, tbl) => {
                                    lerRowEMontarGraficos(rows);
                                }, 3000); // espera 3s 
                                */
                                // parar de escutar:
                                // stop();
                            }
                        }

                    } else {
                        console.log(response.msg)
                        SweetAlert.alertAutoClose("error", "Precisamos de sua atenção", response.msg, 20000);
                    }
                }).catch(error => {
                    console.log(error);
                    alertar(error, "", "error");
                });
            }

            function gerarTabelaComGraficos(jsonData, id_tabela, id_div) {
                if (!jsonData || jsonData.length === 0) return;

                const columnDecimals = [];
                let colIndex = 2; // 0=Usuário, 1=Data

                // Identificar métricas (chaves além de 'usuario')
                const allKeys = Object.keys(jsonData[0]);
                const metrics = allKeys.filter(k => k !== 'descricao');

                // Montar <table> com cabeçalho duplo
                let html = `<table id="${id_tabela}" class="table table-striped table-bordered small sem-quebra" style="width:100%">`;
                html += '<thead>';

                // Primeira linha: Nome dos blocos
                html += '<tr>';
                html += '<th rowspan="2">Descrição</th><th rowspan="2">Data</th>';
                metrics.forEach(metric => {
                    html += `<th colspan="3" class="th-${metric}">${metric.charAt(0).toUpperCase() + metric.slice(1)}</th>`;
                });
                html += '</tr>';

                // Segunda linha: Qtd/Valor + AVG + Histórico
                html += '<tr>';
                metrics.forEach(metric => {
                    const decimals = jsonData[0][metric].decimal || 0;
                    const label = decimals === 0 ? 'Qtd' : 'Valor';
                    html += `<th class="th-${metric}">${label}</th>`;
                    html += `<th class="th-${metric}">AVG</th>`;
                    html += `<th class="th-${metric}">Histórico</th>`;

                    columnDecimals[colIndex++] = decimals; // Qtd/Valor
                    columnDecimals[colIndex++] = 2; // AVG sempre 2 casas
                    columnDecimals[colIndex++] = decimals; // Histórico segue val
                });
                html += '</tr>';
                html += '</thead><tbody>';

                // Linhas
                jsonData.forEach(user => {
                    const base = user[metrics[0]].base;
                    html += `<tr><td>${user.descricao}</td><td>${base}</td>`;
                    metrics.forEach(metric => {
                        const val = Number(user[metric].val);
                        const avg = Number(user[metric].avg);
                        const outros = Object.entries(user[metric].outros)
                            .map(([k, v]) => `${k}:${v}`).join(',');

                        html += `<td>${val}</td><td>${avg}</td>
                     <td class="sparkline-cell no-sort" data-values="${outros}" data-avg="${avg}" data-decimals="${user[metric].decimal || 0}"></td>`;
                    });
                    html += '</tr>';
                });

                html += '</tbody></table>';
                $(`#${id_div}`).html(html);

                // Inicializa DataTable com render dinâmico por coluna
                const table = $(`#${id_tabela}`).DataTable({
                    paging: false,
                    searching: true,
                    info: false,
                    scrollY: "500px",
                    scrollX: true,
                    scrollCollapse: true,
                    responsive: false,
                    autoWidth: false,
                    order: [
                        [5, 'desc']
                    ],
                    ordering: true,
                    columnDefs: [{
                            orderable: false,
                            targets: "no-sort"
                        },
                        {
                            targets: '_all',
                            render: function(data, type, row, meta) {
                                const decimals = columnDecimals[meta.col] !== undefined ? columnDecimals[meta.col] : 2;
                                if (type === 'display' && !isNaN(data) && data !== '') {
                                    return Number(data).toLocaleString('pt-BR', {
                                        minimumFractionDigits: decimals,
                                        maximumFractionDigits: decimals
                                    });
                                }
                                return data;
                            }
                        }
                    ],
                    language: {
                        url: '//cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json'
                    }
                });

                // Renderizar gráficos
                $('.sparkline-cell').each(function() {
                    const rawData = $(this).data('values').split(',');
                    const categories = [];
                    const values = [];

                    rawData.forEach(item => {
                        const [name, value] = item.split(':');
                        categories.push(name);
                        values.push(parseFloat(value));
                    });

                    const avg = parseFloat($(this).data('avg')) || (
                        values.reduce((a, b) => a + b, 0) / values.length
                    );

                    const decimals = parseInt($(this).data('decimals')) || 0;
                    const container = $('<div class="sparkline-container"></div>').appendTo(this);

                    Highcharts.chart(container[0], {
                        chart: {
                            type: 'column',
                            backgroundColor: 'transparent',
                            margin: [0, 0, 0, 0],
                            height: 35
                        },
                        exporting: {
                            enabled: false
                        },
                        colors: ['#3c8dbc'],
                        title: {
                            text: ''
                        },
                        xAxis: {
                            categories: categories,
                            visible: false
                        },
                        yAxis: {
                            visible: false,
                            plotLines: [{
                                color: 'red',
                                width: 1,
                                value: avg,
                                zIndex: 5
                            }]
                        },
                        tooltip: {
                            useHTML: true,
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            borderWidth: 0,
                            style: {
                                color: '#FFF',
                                fontSize: '10px'
                            },
                            formatter: function() {
                                return `
                                <span style="font-size: 8px; opacity: 0.8;">${this.key}: </span>
                                <span style="font-size: 9px; font-weight: bold;">
                                    ${this.y.toLocaleString('pt-BR', {
                                                minimumFractionDigits: decimals,
                                                maximumFractionDigits: decimals
                                            })}
                                </span>`;
                            }
                        },
                        legend: {
                            enabled: false
                        },
                        credits: {
                            enabled: false
                        },
                        plotOptions: {
                            column: {
                                borderWidth: 0
                            }
                        },
                        series: [{
                                name: 'Histórico',
                                data: values
                            },
                            {
                                type: 'line',
                                data: Array(values.length).fill(avg),
                                color: '#f9a825',
                                marker: {
                                    enabled: false
                                },
                                enableMouseTracking: false,
                                showInLegend: false // Oculta da legenda
                            }
                        ]
                    });
                });
                // -------- visibilitychange / resize COM NAMESPACE + CLEANUP --------
                const adjust = () => {
                    const dtInstance = $.fn.DataTable.isDataTable(`#${id_tabela}`) ? $(`#${id_tabela}`).DataTable() : null;
                    if (dtInstance) {
                        dtInstance.columns.adjust().draw(false);
                    }
                };

                arrumaResizeDataTable(id_tabela, table);

                return table;
            }

            function lerRowEMontarGraficos(rows) {
                const analise = Utilitarios.sumColumns(rows, {
                    PEA: 2,
                    PEAM: 3,
                    ACO: 5,
                    ACOM: 6,
                    BAI: 8,
                    BAIM: 9,
                    COM: 11,
                    COMM: 12,
                });
                let time_delay = 3000;
                animarNumeroBRL('#smallbox1-1', 0, analise.PEA, time_delay, 0, '');
                animarNumeroBRL('#smallbox2-1', 0, analise.PEAM, time_delay, 0, '');
                animarNumeroBRL('#smallbox3-1', 0, (analise.PEA > 0 ? (analise.PEA / analise.PEAM * 100) : 0), time_delay, 4, '', ' %');

                animarNumeroBRL('#smallbox4-1', 0, analise.ACO, time_delay, 0, '');
                animarNumeroBRL('#smallbox5-1', 0, analise.ACOM, time_delay, 0, '');
                animarNumeroBRL('#smallbox6-1', 0, (analise.ACOM > 0 ? (analise.ACO / analise.ACOM * 100) : 0), time_delay, 4, '', ' %');

                animarNumeroBRL('#smallbox7-1', 0, analise.BAI, time_delay, 2, '');
                animarNumeroBRL('#smallbox8-1', 0, analise.BAIM, time_delay, 2, '');
                animarNumeroBRL('#smallbox9-1', 0, (analise.BAIM > 0 ? (analise.BAI / analise.BAIM * 100) : 0), time_delay, 4, '', ' %');

                animarNumeroBRL('#smallbox10-1', 0, analise.COM, time_delay, 2, '');
                animarNumeroBRL('#smallbox11-1', 0, analise.COMM, time_delay, 2, '');
                animarNumeroBRL('#smallbox12-1', 0, (analise.COMM > 0 ? (analise.COM / analise.COMM * 100) : 0), time_delay, 4, '', ' %');

                //GRAFICOS
                Highcharts.setOptions({
                    colors: [
                        '#3c8dbc',
                        '#f9a825',,
                    ]
                });
                var ar_dados = Utilitarios.sumColumns(rows, {
                    A: 2,
                    B: 5,
                }, 0);

                // Remove as chaves cujos subobjetos possuem todos os valores zero
                Object.keys(ar_dados).forEach(key => {
                    const subObj = ar_dados[key];
                    const allZero = Object.values(subObj).every(val => !val || val === 0);
                    if (allZero) {
                        delete ar_dados[key];
                    }
                });

                if (Object.keys(ar_dados).length > 0) {
                    // 1. Pegar as chaves e ordenar (ano-mês)
                    let keys = Object.keys(ar_dados).sort();
                    // 2. Criar arrays separados
                    let arrA = keys.map(k => ar_dados[k].A);
                    let arrB = keys.map(k => ar_dados[k].B);
                    //GRAFICO 1
                    let configGrafico1 = {
                        containerId: 'card_2',
                        title: `Análise mês base (${$('#rel_mes_base').val()})`,
                        subtitle: 'Acionamentos/Acordos',
                        xAxisCategories: keys,
                        seriesData: [{
                                name: 'Acionamento',
                                type: 'column',
                                data: arrA,
                                decimals: 0,
                                prefix: '',
                                suffix: '',
                                position: 'left',
                                axisGroup: 'moneyR',
                                //axisTitle: 'Valores em Aberto(R$)'
                            },
                            {
                                name: 'Acordos',
                                type: 'column',
                                data: arrB,
                                decimals: 0,
                                prefix: '',
                                suffix: '',
                                position: 'right',
                                axisGroup: 'moneyR2',
                                //axisTitle: 'Valores em Aberto(R$)'
                            }
                        ],
                        tooltipMode: 'simple',
                        chartHeight: 600
                    };
                    CriarGraficos.createHighchartsDualAxes(configGrafico1);
                }
                //GRAFICO 2
                Highcharts.setOptions({
                    colors: [
                        '#3d9970',
                        '#6c757d',
                    ]
                });
                ar_dados = Utilitarios.sumColumns(rows, {
                    C: 8,
                    D: 11,
                }, 0);
                //Remove objetos sem nada ou com todos os valores zerados
                Object.keys(ar_dados).forEach(key => {
                    const subObj = ar_dados[key];
                    const allZero = Object.values(subObj).every(val => !val || val === 0);
                    if (allZero) {
                        delete ar_dados[key];
                    }
                });
                if (Object.keys(ar_dados).length > 0) {
                    keys = Object.keys(ar_dados).sort();
                    let arrC = keys.map(k => ar_dados[k].C);
                    let arrD = keys.map(k => ar_dados[k].D);
                    configGrafico1 = {
                        containerId: 'card_3', // ID da div onde o gráfico será renderizado
                        title: `Análise mês base (${$('#rel_mes_base').val()})`,
                        subtitle: 'Baixas/Comissão',
                        xAxisCategories: keys,
                        seriesData: [{
                                name: 'Baixas',
                                type: 'column',
                                data: arrC,
                                decimals: 2,
                                prefix: 'R$',
                                suffix: '',
                                position: 'left',
                                axisGroup: 'moneyL',
                                //axisTitle: 'Valores Recuperados(R$)'
                            },
                            {
                                name: 'Comissão',
                                type: 'column',
                                data: arrD,
                                decimals: 2,
                                prefix: 'R$',
                                suffix: '',
                                position: 'right',
                                axisGroup: 'moneyL2',
                                //axisTitle: 'Valores Recuperados(R$)'
                            }
                        ],
                        tooltipMode: 'simple',
                        chartHeight: 600
                    };
                    CriarGraficos.createHighchartsDualAxes(configGrafico1);
                }
            }
        </script>
    @endpush
@endonce
