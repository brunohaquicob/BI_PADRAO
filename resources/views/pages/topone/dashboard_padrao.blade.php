@extends('adminlte::page')

@section('title', 'Dashboard')

@section('content_header')
    <h4 class="w100perc text-center">Dashboard</h4>
@stop

@section('content')

    <div class="card card-default" style="padding-top: 5px;">
        <div class="card-header">
            <div class="card-tools">
                <x-calendario-component id='dateRangePicker' event-name='dateRangeSelected' :options='[]' type='button' autoApply='false' single='N' />
                <button type="button" class="btn btn-tool" data-card-widget="maximize"><i class="fas fa-expand"></i>
                </button>
                <button id="data-refresh" type="button" class="btn btn-tool ladda-button dataRefresh" data-style="zoom-out" numerocard="1e"><i class="fas fa-sync"></i></button>
                <button type="button" class="btn btn-tool" data-card-widget="collapse">
                    <i class="fas fa-minus"></i>
                </button>

            </div>
        </div>

        <div class="card-body" style="display: block;" id="loadingPage">
            @php
                $heightGraficos = '450px';
            @endphp
            <div class="container-fluid">
                <div class="row mb-4">
                    <section class="col-12 px-0"> <!-- <= vira coluna e pode tirar o padding com px-0 -->
                        <div class="dash-section">
                            <!-- MAINS -->
                            <div class="mains-wrap">
                                <div id="headers-dash" class="mains-grid"></div>
                            </div>

                            <!-- SUBS -->
                            <div id="subs-section" class="subs-wrap d-none">
                                <div class="subs-header d-flex align-items-center justify-content-between">
                                    <div>
                                        <strong id="subs-title">Detalhes</strong>
                                        <small id="subs-subtitle" class="ml-2 text-muted">
                                            clique em um card para ver os sub-itens
                                        </small>
                                    </div>
                                    <button type="button" class="btn btn-sm btn-light close-subs">&times;</button>
                                </div>
                                <div id="headers-dash-subs" class="subs-grid"></div>
                            </div>
                        </div>
                    </section>
                </div>

                <div class="row mb-4">
                    <!-- Lado Esquerdo -->
                    <section class="col-12">
                        @php
                            $identificadorCard = 'idCardG1';
                        @endphp
                        <x-cardcustom-component tipo="simples" identificador="{{ $identificadorCard }}" footer='S' color='primary' icon="fas fa-chart-pie" title="Acordos por dia" style=''>
                            <x-slot name="slotbody">
                                <div class="row mb-4">
                                    <section class="col-6" style="width: 100%; height:{{ $heightGraficos }};">
                                        <div class="col-12" id="grafico_05_bt"></div>
                                        <div class="col-12" id="grafico_05_grafico"></div>
                                    </section>
                                    <section class="col-6" style="width: 100%; height:{{ $heightGraficos }};">
                                        <div class="col-12" id="grafico_06_bt"></div>
                                        <div class="col-12" id="grafico_06_grafico"></div>
                                    </section>

                                </div>
                            </x-slot>
                            <x-slot name="slotfooter">
                                <div class="row text-sm">
                                    <div class="col-sm-3 col-6">
                                        <div class="description-block border-right">
                                            <span class="description-percentage text-lightblue"><i class="fas fa-handshake"></i> - <span class="description-text" id="{{ $identificadorCard }}-footer11"></span>Quantidade Total
                                                Acordos</span>
                                            <h5 class="description-header"><span id="{{ $identificadorCard }}-footer1"></span></h5>
                                        </div>
                                    </div>

                                    <div class="col-sm-3 col-6">
                                        <div class="description-block border-right">
                                            <span class="description-percentage text-olive"><i class="fas fa-hand-holding-usd"></i> - <span class="description-text" id="{{ $identificadorCard }}-footer22"></span>Valor Total
                                                Acordos</span>
                                            <h5 class="description-header"><span id="{{ $identificadorCard }}-footer2"></span></h5>
                                        </div>
                                    </div>

                                    <div class="col-sm-3 col-6">
                                        <div class="description-block border-right">
                                            <span class="description-percentage text-gray"><i class="fas fa-ticket-alt"></i> - <span class="description-text" id="{{ $identificadorCard }}-footer33"></span>Tiket Médio</span>
                                            <h5 class="description-header"><span id="{{ $identificadorCard }}-footer3"></span></h5>
                                        </div>
                                    </div>

                                    <div class="col-sm-3 col-6">
                                        <div class="description-block">
                                            <span class="description-percentage text-navy"><i class="fas fa-trophy"></i> - <span class="description-text" id="{{ $identificadorCard }}-footer44">Maior Valor
                                                    Gerado</span></span>
                                            <h5 class="description-header"><span id="{{ $identificadorCard }}-footer4"></span></h5>
                                        </div>
                                    </div>
                                </div>
                            </x-slot>
                        </x-cardcustom-component>
                    </section>
                    <section class="col-12">
                        @php
                            $identificadorCard = 'idCardG2';
                        @endphp
                        <x-cardcustom-component tipo="simples" identificador="{{ $identificadorCard }}" footer='S' color='primary' icon="fas fa-chart-pie" title="Acordos por fase" style=''>
                            <x-slot name="slotbody">
                                <div class="row mb-4">
                                    <section class="col-6" id="grafico_01_01">
                                    </section>
                                    <section class="col-6" id="grafico_02_02">
                                    </section>
                                    <section class="col-6" id="grafico_01">
                                    </section>
                                    <section class="col-6" id="grafico_02">
                                    </section>
                                    <section class="col-6" id="grafico_03">
                                    </section>
                                    <section class="col-6" id="grafico_04">
                                    </section>
                                </div>
                            </x-slot>
                            {{-- <x-slot name="slotfooter">
                                <p>conteudo footer</p>
                            </x-slot> --}}
                        </x-cardcustom-component>
                    </section>
                    <section class="col-12 d-none">
                        @php
                            $identificadorCard = 'idCardG3';
                            $heightGraficos = '600px';
                        @endphp
                        <x-cardcustom-component tipo="simples" identificador="{{ $identificadorCard }}" footer='S' color='success' icon="fas fa-chart-pie" title="Pagamentos" style=''>
                            <x-slot name="slotbody">
                                <div class="row mb-4">
                                    <section class="col-6" style="width: 100%; height:{{ $heightGraficos }};">
                                        <div class="col-12" id="grafico_pagamentos_01"></div>
                                    </section>
                                    <section class="col-6" style="width: 100%; height:{{ $heightGraficos }};">
                                        <div class="col-12" id="grafico_pagamentos_02"></div>
                                    </section>
                                </div>
                            </x-slot>
                            {{-- <x-slot name="slotfooter">
                                <p>conteudo footer</p>
                            </x-slot> --}}
                        </x-cardcustom-component>
                    </section>
                    <!-- Fim Lado Esquerdo -->
                    <!-- Lado direito -->
                    <section class="col-12 connectedSortable ui-sortable d-none">
                        @php
                            $identificadorCard2 = 'card1d';
                        @endphp
                        <x-cardcustom-component tipo="duplo" identificador="{{ $identificadorCard2 }}" footer='S' btAba1='Por Dia' btAba2='Por Estados' style='height: 500px;'>
                            <x-slot name="slotfooter">
                                <div class="row text-sm">
                                    <div class="col-sm-3 col-6">
                                        <div class="description-block border-right">
                                            <span class="description-percentage text-lightblue"><i class="fas fa-credit-card"></i> - <span class="description-text" id="{{ $identificadorCard2 }}-footer11"></span></span>
                                            <h5 class="description-header"><span id="{{ $identificadorCard2 }}-footer1"></span></h5>
                                        </div>
                                    </div>

                                    <div class="col-sm-3 col-6">
                                        <div class="description-block border-right">
                                            <span class="description-percentage text-olive"><i class="fas fa-store-alt"></i> - <span class="description-text" id="{{ $identificadorCard2 }}-footer22"></span></span>
                                            <h5 class="description-header"><span id="{{ $identificadorCard2 }}-footer2"></span></h5>
                                        </div>
                                    </div>

                                    <div class="col-sm-3 col-6">
                                        <div class="description-block border-right">
                                            <span class="description-percentage text-gray"><i class="fas fa-store-alt"></i> - <span class="description-text" id="{{ $identificadorCard2 }}-footer33"></span></span>
                                            <h5 class="description-header"><span id="{{ $identificadorCard2 }}-footer3"></span></h5>
                                        </div>
                                    </div>

                                    <div class="col-sm-3 col-6">
                                        <div class="description-block">
                                            <span class="description-percentage text-navy"><i class="fas fa-store-alt"></i> - <span class="description-text" id="{{ $identificadorCard2 }}-footer44"></span></span>
                                            <h5 class="description-header"><span id="{{ $identificadorCard2 }}-footer4"></span></h5>
                                        </div>
                                    </div>
                                </div>
                            </x-slot>
                        </x-cardcustom-component>
                    </section>
                    <!-- Fim lado direito -->
                </div>


            </div>
        </div>


    </div>

    <x-modalpadrao-component id="modalDetalhes" title="Detalhes" size="90" color="primary" showSaveButton="N" showUpdateButton="N" showCancelButton="S">
        <div class="card">
            <div class="container-fluid">
                <div class="row mb-4">
                    <section class="col-6" style="width: 100%; height:{{ $heightGraficos }};">
                        <div class="col-12" id="grafico_05_detalhes_bt"></div>
                        <div class="col-12" id="grafico_05_detalhes_grafico"></div>
                    </section>
                    <section class="col-6" style="width: 100%; height:{{ $heightGraficos }};">
                        <div class="col-12" id="grafico_06_detalhes_bt"></div>
                        <div class="col-12" id="grafico_06_detalhes_grafico"></div>
                    </section>
                </div>
                <div class="row mb-4">
                    <section class="col-6" id="grafico_01_01_detalhes">
                    </section>
                    <section class="col-6" id="grafico_02_02_detalhes">
                    </section>
                    <section class="col-6" id="grafico_01_detalhes">
                    </section>
                    <section class="col-6" id="grafico_02_detalhes">
                    </section>
                    <section class="col-6" id="grafico_03_detalhes">
                    </section>
                    <section class="col-6" id="grafico_04_detalhes">
                    </section>
                </div>
            </div>
        </div>
    </x-modalpadrao-component>
@endsection

@section('plugins.HighCharts', true)
{{-- @section('plugins.HighChartsDashboards', true) --}}

@once
    @push('css')
        <link href="{{ asset('css/dashboard/dash_padrao.css') }}" rel="stylesheet">
    @endpush
    @push('js')
        <script src="{{ asset('js/pages/dashboard/dashboard_padrao.js') }}"></script>
        <script src="{{ asset('js/class/HighChartsPieChartMult.js') }}"></script>
        <script>
            var buscarDadosRouteDashboardPadrao = "{{ route('buscar.dashboard_padrao') }}";
            var rota_detalhes = "{{ route('buscar.dashboard_padrao_detalhes') }}";
            $(document).ready(function() {
                atualizaDados();
                $(document).on('dateRangeSelected', function(event) {
                    atualizaDados();
                });

                $('.dataRefresh').on('click', function() {
                    atualizaDados();
                });

                function atualizaDados() {
                    let datas = getRangeDate('dateRangePicker');
                    objDash = new dashboardPadrao(datas, buscarDadosRouteDashboardPadrao, rota_detalhes);
                }
            })
        </script>
    @endpush
@endonce
