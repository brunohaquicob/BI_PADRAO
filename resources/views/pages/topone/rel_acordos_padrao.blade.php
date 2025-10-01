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
                        <x-calendario-component id='dateRangePicker' event-name='dateRangeSelected' :options="[]" type='input' autoApply='false' single='N' label='Data Acordo' />

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
                        <a class="nav-link btn-sm ladda-button active" data-style="zoom-out" href="#resultado-aba1" data-toggle="tab">Sintético</a>
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

            </div>
        </div>
        <div class="card-footer" id="resultado-footer">
        </div>

    </div>
@stop

{{-- @section('plugins.HighCharts', true) --}}

@once
    @push('css')
        <style>
        </style>
    @endpush
    @push('js')
        <script>
            $(document).ready(function() {

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
                    url: '{{ route('buscar.rel_acordos_padrao_dados') }}',
                    data: {
                        'datas': datas,
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
                            let opts = {
                                fixedColumns: {
                                    leftColumns: 2
                                }
                            };
                            __renderDataTable(response.data.tabela1, div_retorno, opts);
                        }


                    } else {
                        SweetAlert.alertAutoClose("error", "Precisamos de sua atenção", response.msg, 20000);
                        $('#' + div_retorno).html("");
                    }
                }).catch(error => {
                    alertar(error, "", "error");
                });
            }
        </script>
    @endpush
@endonce
