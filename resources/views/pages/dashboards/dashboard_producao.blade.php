@extends('adminlte::page')

@section('title', $nameView)

@section('content_header')
    <h4 class="w100perc text-center">{{ $nameView }}</h4>
@stop

@section('content')

    <div class="card card-default" style="padding-top: 5px;">
        <div class="card-header">
            <div class="row">
                <div class="col-sm-8">
                    <div class="input-group">

                        <div class="input-group-append">
                            <?php
                            $startDate = date('01/m/Y');
                            $array_options = [
                                'startDate' => $startDate,
                            ];
                            ?>
                            <x-calendario-component id='dateRangePicker' event-name='dateRangeSelected' :options="$array_options" type='input-group-prepend' autoApply='false' single='N' />
                        </div>
                        <div class="input-group-append">
                            <span class="input-group-text">
                                CLIENTE:
                            </span>
                        </div>
                        <select class="form-control selectpicker" id="clientes" name="clientes[]" placeholder='Selecione um um ou mais clientes' title='Selecione' multiple="multiple">
                            @foreach ($clientes_result as $v)
                                <option class="text-sm" value='{{ $v['col1'] }}'>{{ $v['col2'] }}</option>
                            @endforeach
                        </select>
                        <div class="input-group-append">
                            <button type="button" id="atualizar_dados" class="btn bg-gradient-secondary form-control"><i class="fas fa-sync"></i> Atualizar</button>
                        </div>

                    </div>
                </div>

                <div class="col-sm-4">
                    <div class="row justify-content-end">
                        <div class="col-auto">
                            {{-- <button id="data-refresh" type="button" class="btn btn-tool ladda-button dataRefresh" data-style="zoom-out" numerocard="1e"><i class="fas fa-sync"></i></button> --}}
                            <button type="button" class="btn btn-tool" data-card-widget="maximize"><i class="fas fa-expand"></i></button>
                            <button type="button" class="btn btn-tool" data-card-widget="collapse"><i class="fas fa-minus"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <div class="card-body" style="display: block;" id="loadingPage">

            <div class="container-fluid">
                <div class="row mb-4">
                    <div class="col-lg-3 col-6" id="header-1">
                    </div>
                    <div class="col-lg-3 col-6" id="header-2">
                    </div>
                    <div class="col-lg-3 col-6" id="header-3">
                    </div>
                    <div class="col-lg-3 col-6" id="header-4">
                    </div>
                </div>

                <div class="row mb-4">
                    {{-- <section class="offset-md-1 col-md-10 offset-md-1 col-12"> --}}
                    <section class="col-md-12">
                        @php
                            $identificadorCard = 'card_1';
                        @endphp

                        <x-cardcustom-component tipo="simples" identificador="{{ $identificadorCard }}" footer='S' color='primary' icon="fas fa-chart-pie" title="PARANÁ" style=''>
                            <x-slot name="slotbody">
                                <div class="row mb-4 small">
                                    <div class="col-lg-2 col-4" id="{{ $identificadorCard }}_header1"></div>
                                    <div class="col-lg-2 col-4" id="{{ $identificadorCard }}_header2"></div>
                                    <div class="col-lg-2 col-4" id="{{ $identificadorCard }}_header3"></div>
                                    <div class="col-lg-2 col-4" id="{{ $identificadorCard }}_header4"></div>
                                    <div class="col-lg-2 col-4" id="{{ $identificadorCard }}_header5"></div>
                                    <div class="col-lg-2 col-4" id="{{ $identificadorCard }}_header6"></div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6" id="card_hot_grap_grafico1" data-rota-busca="" style="width: 100%; height: 100%;"></div>
                                    <div class="col-md-6" id="grafico_{{ $identificadorCard }}" style="width: 100%; height: 100%;"></div>
                                </div>
                            </x-slot>
                            <x-slot name="slotfooter">
                                <div class="col-md-6">
                                    <button class="btn btn-primary modalAudit" data-base="PR">TOP USUARIOS AUDIT</button>
                                </div>
                            </x-slot>
                        </x-cardcustom-component>
                    </section>
                    {{-- <section class="offset-md-1 col-md-10 offset-md-1 col-12"> --}}
                    <section class="col-md-12">
                        @php
                            $identificadorCard = 'card_2';
                        @endphp
                        <x-cardcustom-component tipo="simples" identificador="{{ $identificadorCard }}" footer='S' color='primary' icon="fas fa-chart-pie" title="SÃO PAULO" style=''>
                            <x-slot name="slotbody">
                                <div class="row mb-4 small">
                                    <div class="col-lg-2 col-4" id="{{ $identificadorCard }}_header1"></div>
                                    <div class="col-lg-2 col-4" id="{{ $identificadorCard }}_header2"></div>
                                    <div class="col-lg-2 col-4" id="{{ $identificadorCard }}_header3"></div>
                                    <div class="col-lg-2 col-4" id="{{ $identificadorCard }}_header4"></div>
                                    <div class="col-lg-2 col-4" id="{{ $identificadorCard }}_header5"></div>
                                    <div class="col-lg-2 col-4" id="{{ $identificadorCard }}_header6"></div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6" id="card_hot_grap_grafico2" data-rota-busca="" style="width: 100%; height: 100%;"></div>
                                    <div class="col-md-6" id="grafico_{{ $identificadorCard }}" style="width: 100%; height: 100%;"></div>
                                </div>
                            </x-slot>
                            <x-slot name="slotfooter">
                                <div class="col-md-6">
                                    <button class="btn btn-primary modalAudit" data-base="SP">TOP USUARIOS AUDIT</button>
                                </div>
                            </x-slot>
                        </x-cardcustom-component>
                    </section>
                    {{-- <section class="offset-md-1 col-md-10 offset-md-1 col-12"> --}}
                    <section class="col-md-12">
                        @php
                            $identificadorCard = 'card_3';
                        @endphp
                        <x-cardcustom-component tipo="simples" identificador="{{ $identificadorCard }}" footer='S' color='primary' icon="fas fa-chart-pie" title="PERNAMBUCO" style=''>
                            <x-slot name="slotbody">
                                <div class="row mb-4 small">
                                    <div class="col-lg-2 col-4" id="{{ $identificadorCard }}_header1"></div>
                                    <div class="col-lg-2 col-4" id="{{ $identificadorCard }}_header2"></div>
                                    <div class="col-lg-2 col-4" id="{{ $identificadorCard }}_header3"></div>
                                    <div class="col-lg-2 col-4" id="{{ $identificadorCard }}_header4"></div>
                                    <div class="col-lg-2 col-4" id="{{ $identificadorCard }}_header5"></div>
                                    <div class="col-lg-2 col-4" id="{{ $identificadorCard }}_header6"></div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6" id="card_hot_grap_grafico3" data-rota-busca="" style="width: 100%; height: 100%;"></div>
                                    <div class="col-md-6" id="grafico_{{ $identificadorCard }}" style="width: 100%; height: 100%;"></div>
                                </div>
                            </x-slot>
                            <x-slot name="slotfooter">
                                <div class="col-md-6">
                                    <button class="btn btn-primary modalAudit" data-base="PE">TOP USUARIOS AUDIT</button>
                                </div>
                            </x-slot>
                        </x-cardcustom-component>
                    </section>
                </div>


            </div>
        </div>

    </div>
    <x-modalpadrao-component id="modalDetalhes" title="Detalhes" size="90" color="primary" showSaveButton="N" showUpdateButton="N" showCancelButton="S">
        <div class="card">
            <div class="card-body">
                <div class="col-md-12" id="conteudo_modal_detalhes" data-rota-busca="{{ route('buscar.dashboard_producao_detalhes') }}"></div>

            </div>
        </div>

    </x-modalpadrao-component>

    <x-modalpadrao-component id="modalAudit" title="Detalhes" size="90" color="primary" showSaveButton="N" showUpdateButton="N" showCancelButton="S">
        <div class="card">
            <div class="card-body">
                <figure class="highcharts-figure">
                    <div id="parent-container">
                        <div id="play-controls">
                            <button id="play-pause-button" class="fa fa-play" title="play"></button>
                            <input id="play-range" type="range" value="" min="" max="" />
                        </div>
                        <div id="modalAuditGrafico" data-rota-busca=""></div>

                    </div>
                </figure>
                <div class="card-body">
                    <figure class="highcharts-figure">
                        <div id="modalAuditGraficoCliente" data-rota-busca=""></div>
                    </figure>

                </div>

            </div>
        </div>

    </x-modalpadrao-component>
    <pre id="csv1" class="csv_hidden"></pre>
    <pre id="csv2" class="csv_hidden"></pre>
    <pre id="csv3" class="csv_hidden"></pre>
@endsection

@once
    @push('css')
        <style>
            .highcharts-figure {
                margin: 0;
            }

            pre.csv_hidden {
                display: none;
            }

            #play-controls {
                max-width: 1000px;
                margin: 1em auto;
            }

            #play-pause-button {
                margin-left: 10px;
                width: 50px;
                height: 50px;
                cursor: pointer;
                border: 1px solid rgba(2, 117, 255, 1);
                border-radius: 25px;
                color: white;
                background-color: rgba(2, 117, 255, 1);
                transition: background-color 250ms;
            }

            #play-pause-button:hover {
                background-color: rgba(2, 117, 255, 0.5);
            }

            #play-range {
                transform: translateY(2.5px);
                width: calc(100% - 90px);
                background: #f8f8f8;
            }
        </style>
    @endpush
@endonce
@section('plugins.HighCharts', true)
{{-- @section('plugins.HighChartsDashboards', true) --}}

@once
    @push('js')
        <script src="{{ asset('js/pages/dashboard/dashboard_producao.js') }}"></script>
        <script src="{{ asset('js/class/HighChartsPlayCount.js') }}"></script>
        <script src="{{ asset('js/class/HighChartsHotMap.js') }}"></script>
        <script src="{{ asset('js/class/HighChartsPieChartMult.js') }}"></script>
        <script>
            var buscarDadosRouteDashboard = "{{ route('buscar.dashboard_producao') }}";
            var currentHighChartsInstance = null;
            var currentHighChartsPie = null;
            $(document).ready(function() {
                gerarSelectPicker();
                $(document).on('dateRangeSelected', function(event) {
                    //atualizaDados();
                });

                $("#atualizar_dados").on("click", function() {
                    atualizaDados();
                })

                function atualizaDados() {
                    let dados = {
                        datas: getRangeDate('dateRangePicker'),
                        clientes: $("#clientes").val()
                    }
                    objDash = new dashboardProducao(dados, buscarDadosRouteDashboard);
                }

                $(document).on('click', '.modalAudit', function() {
                    var base = $(this).attr('data-base');
                    let datas = getRangeDate('dateRangePicker');
                    var requestParams = {
                        method: 'POST',
                        url: "{{ route('buscar.dashboard_producao_modalAudit') }}",
                        data: {
                            'base': base,
                            'datas': datas,
                            'clientes': $("#clientes").val()
                        },
                        formId: ''
                    };

                    abrirModal('modalAudit');
                    $('#modalAuditGrafico').html("");
                    addLoading("modalAuditGrafico");
                    AjaxRequest.sendRequest(requestParams).then(response => {
                        removeLoading("modalAuditGrafico");
                        $('#modalAuditTitle').html("Processando...");
                        if (response.data !== undefined && response.status === true) {
                            var dados = response.data;

                            $('#modalAuditTitle').html(dados.audit_user.title);

                            $("#play-range").attr("min", dados.audit_user.min)
                            $("#play-range").attr("max", dados.audit_user.max)

                            iniciarGraficoTopUsers("modalAuditGrafico", dados.audit_user);
                            iniciarGraficoTopClientes(dados.audit_cliente);
                            if (response.msg != "") {
                                //SweetAlert.info(response.msg);
                                alertar(response.msg, '', 'info');
                            }
                        } else if (response.status === false) {
                            SweetAlert.alertAutoClose("info", "Atenção", response.msg, 20000);
                        } else {
                            SweetAlert.error('Erro no processamento dos dados.');
                        }
                    }).catch(error => {
                        removeLoading("modalAuditGrafico");
                        console.error(error);
                    });
                })

                function iniciarGraficoTopUsers(id, dados) {
                    // Destrua a instância anterior se existir
                    if (currentHighChartsInstance) {
                        currentHighChartsInstance.destroy();
                    }

                    // Crie uma nova instância
                    currentHighChartsInstance = new HighChartsPlayCount(id, dados);
                }

                function iniciarGraficoTopClientes(dados) {
                    // Destrua a instância anterior se existir
                    if (currentHighChartsPie) {
                        currentHighChartsPie = null;
                    }

                    // Crie uma nova instância
                    currentHighChartsPie = new HighChartsPieChartMult(dados);
                }
            })
        </script>
    @endpush
@endonce
