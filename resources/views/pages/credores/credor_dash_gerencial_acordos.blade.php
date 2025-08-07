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
                        <x-calendario-component id='dateRangePicker' event-name='dateRangeSelected' :options="[]" label='Data Acordo' type='input' autoApply='false' single='N' />
                    </div>
                    <div class="col-md-4">
                        <x-calendario-component id='dateRangePicker2' event-name='dateRangeSelected2' :options="[]" label='Data Vencimento' type='input' autoApply='false' single='N' />
                    </div>
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="tipo_consulta">Tipo Consulta:</label>
                            <select class="form-control" id="tipo_consulta" name="tipo_consulta" required="true">
                                <option value="IV">IGNORAR DATA VENCIMENTO (GERAL)</option>
                                <option value="IA">IGNORAR DATA ACORDO (GERAL)</option>
                                <option value="C">Colchão (Ignora campo Data Acordo)</option>
                                <option value="V">Dentro do vencimento informado</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-4">
                        <?php
                        $optExtra = [];
                        ?>
                        <x-calendario-component id='dateRangePicker3' event-name='dateRangeSelected3' :options="$optExtra" label='Limitar Pagamento' type='input-com-check' autoApply='false' single='N' />
                    </div>
                    <div class="col-md-4">
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

                    <div class="col-md-3">
                        <div class="form-group">
                            <label for="tipo_dados">Tipo Resultados:</label>
                            <select class="form-control" id="tipo_dados" name="tipo_dados" required="true">
                                <option value="valor">Por valores</option>
                                <option value="qtd">Por Quantidades</option>
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
                            <label for="tipo_data">Tipo Agrupador:</label>
                            <select class="form-control" id="tipo_data" name="tipo_data" required="true">
                                <option value="T">Dias</option>
                                <option value="M">Meses</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="form-group">
                            <label for="cancelados">Incluir Cancelados:</label>
                            <select class="form-control" id="cancelados" name="cancelados" required="true">
                                <option value="N">Não</option>
                                <option value="S">Sim</option>
                            </select>
                        </div>
                    </div>

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
                        <a class="nav-link btn-sm ladda-button active" data-style="zoom-out" href="#resultado-aba1" data-toggle="tab">Analítico</a>&nbsp;
                    </li>
                    <li class="nav-item">
                        <a class="nav-link btn-sm ladda-button " data-style="zoom-out" href="#resultado-aba2" data-toggle="tab">#</a>
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
                <div class="chart tab-pane active" id="resultado-aba1">

                </div>
                <div class="chart tab-pane" id="resultado-aba2" style="overflow-y: auto;height: 700px;">
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
        <link href="{{ asset('css/dashboard/dash_acordos.css') }}" rel="stylesheet">
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
                    allowClear: true, // Adiciona um botão de limpar seleção
                    width: '100%', // Define a largura do seletor
                });*/
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
                let datas2 = getRangeDate('dateRangePicker2');
                let datas3 = getRangeDate('dateRangePicker3');
                const requestParams = {
                    method: 'POST',
                    url: '{{ route('buscar.credor_dash_gerencial_acordos') }}',
                    data: {
                        'rangedatas': datas,
                        'rangedatas2': datas2,
                        'rangedatas3': datas3,
                        'limitar_pagamento': $('#dateRangePicker3_check').is(':checked') ? 'S' : 'N'
                    },
                    formId: idForm
                };
                AjaxRequest.sendRequest(requestParams).then(response => {
                    removeLoading("card_resultados");
                    if (response.status === true) {
                        if (response.msg != "") {
                            //SweetAlert.info(response.msg);
                            alertar(response.msg, '', 'info');
                        }
                        if (response.data.htmlDownload !== undefined && response.data.htmlDownload != '') {
                            // Se o status for verdadeiro, então há um arquivo para download
                            var html = response.data.htmlDownload;
                            $('#' + div_retorno).html(response.data.htmlDownload);
                        } else {
                            console.log(response.data)
                            const dashboard = new DashboardModelo1Builder(response.data);
                        }



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
