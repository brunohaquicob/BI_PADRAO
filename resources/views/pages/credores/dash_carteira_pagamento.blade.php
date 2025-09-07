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
                    <div class="col-md-4">
                        <x-calendario-component id='dateRangePicker' event-name='dateRangeSelected' :options="[]" type='input-com-check' autoApply='false' single='N' label='Data Baixa' />
                    </div>
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="rel_tipo_data">Considerar:</label>
                            <select class="form-control selectpickerNovo" id="rel_tipo_data" name="rel_tipo_data">
                                <option value="B" selected="">Data Cadastro da Baixa</option>
                                <option value="C">Data Pagamento Credor</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-4">
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
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="bor_numero">Bordero:</label>
                            <div class="input-group">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">Separador (,) </span>
                                </div>
                                <input type="text" class="form-control" id="bor_numero" name="bor_numero" value="">
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="aco_codigo">Acordo:</label>
                            <div class="input-group">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">Separador (,) </span>
                                </div>
                                <input type="text" class="form-control" id="aco_codigo" name="aco_codigo" value="">
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="cpf_cnpj">CPF/CNPJ:</label>
                            <div class="input-group">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">Separador (,) </span>
                                </div>
                                <input type="text" class="form-control" id="cpf_cnpj" name="cpf_cnpj" value="">
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
        <div class="card-header ui-sortable-handle" style="">
            <h3 class="card-title" style="margin-top: 5px;">
                <i class="fas fa-chart-pie mr-1"></i>
                <span>Resultados</span>
            </h3>
            <div class="card-tools align-items-center">
                <ul class="nav nav-pills ml-auto" style="margin-bottom: -1.8rem;">
                    <li class="nav-item">
                        <a class="nav-link btn-sm ladda-button active" data-style="zoom-out" href="#resultado-aba1" data-toggle="tab">Sintético</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link btn-sm ladda-button" data-style="zoom-out" href="#resultado-aba2" data-toggle="tab">#</a>&nbsp;
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
        <div class="card-header ui-sortable-handle" style="">
            <section class="col-12 px-0">
                <div class="row" id="kpis-row"></div>
            </section>
        </div>
        <div class="card-body" id="card_resultados">
            <div class="tab-content">
                <div class="chart tab-pane active" id="resultado-aba1" style="min-height:600px;">

                </div>
                <div class="chart tab-pane" id="resultado-aba2" style="min-height:600px;"></div>
            </div>
        </div>
        <div class="card-footer">

            <div id="grafico-1" style="height:580px"></div>

        </div>

    </div>
@stop

@section('plugins.HighCharts', true)
@once
    @push('css')
        <style>
        
        </style>
    @endpush
    @push('js')
        <script>
            window.app = {
                routes: {
                    buscarCredor: "{{ route('buscar.credor_dash_carteira_pagamento_dados') }}"
                },
            };
        </script>
        <script src="{{ asset('js/scripts_blades/dash_carteira_pagamento.js') }}?v={{ time() }}"></script>
    @endpush

@endonce
