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
                <div class="row">
                    <div class="col-md-3">
                        <x-calendario-component id='dateRangePicker' event-name='dateRangeSelected' :options="[]" type='input-com-check' autoApply='false' single='N' label='Data Cancelamento' />
                    </div>
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
                                    <x-boxdynamic-component component-name="smallbox" identificador="1_1" color="lightblue" icon="ion ion-social-usd" text1="0" text2="Valor Implantado." />
                                </div>
                                <div class="col-3">
                                    <x-boxdynamic-component component-name="smallbox" identificador="1_2" color="lightblue" icon="ion ion-social-usd" text1="0" text2="Valor Aberto." />
                                </div>
                                <div class="col-3">
                                    <x-boxdynamic-component component-name="smallbox" identificador="1_3" color="lightblue" icon="ion ion-social-usd" text1="0" text2="Valor Recuperado." />
                                </div>
                                <div class="col-3">
                                    <x-boxdynamic-component component-name="smallbox" identificador="1_4" color="danger" icon="ion ion-social-usd" text1="0" text2="Valor Devolvido." />
                                </div>
                            </div>
                            <div class="row">
                                {{-- <div class="col-2">
                                    <x-boxdynamic-component component-name="smallbox" identificador="3" color="success" icon="ion ion-arrow-graph-up-right" text1="0" text2="% Recuperado." />
                                </div> --}}
                                <div class="col-3">
                                    <x-boxdynamic-component component-name="smallbox" identificador="2_1" color="olive" icon="ion ion-heart-broken" text1="0" text2="Vidas Implantadas." />
                                </div>
                                <div class="col-3">
                                    <x-boxdynamic-component component-name="smallbox" identificador="2_2" color="olive" icon="ion ion-heart" text1="0" text2="Vidas Recuperadas Duplicidade." />
                                </div>
                                <div class="col-3">
                                    <x-boxdynamic-component component-name="smallbox" identificador="2_3" color="olive" icon="ion ion-heart" text1="0" text2="Vidas Recuperadas." />
                                </div>
                                <div class="col-3">
                                    <x-boxdynamic-component component-name="smallbox" identificador="2_4" color="olive" icon="ion ion-heart" text1="0" text2="Vidas Recuperadas Parcial." />
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
    <div class="modal fade " id="hcDrillModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-90 modal-dialog-scrollable" role="document">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white py-2">
                    <h5 class="modal-title">Detalhes</h5>
                    <button type="button" class="close text-white" data-dismiss="modal" aria-label="Fechar">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body p-3">
                    <div id="hcDrillBody"></div>
                </div>
            </div>
        </div>
    </div>
@stop

@section('plugins.HighCharts', true)

@once
    @push('css')
        <style>
            /* Header fix: centraliza e não corta, fica sticky no topo do card */
            .hc-click-card-header {
                position: sticky;
                /* fica colado no topo quando rolar */
                top: 0;
                z-index: 2;

                display: flex;
                align-items: center;
                /* centraliza vertical */
                justify-content: center;
                /* centraliza horizontal */

                padding: 10px 44px;
                /* espaço para o botão fechar dos dois lados */
                min-height: 40px;
                line-height: 1.2;
                border-bottom: 1px solid rgba(0, 0, 0, .06);
            }

            /* título simples (não precisa mais de position absolute) */
            .hc-click-card-header .hc-header-title {
                white-space: nowrap;
                /* evita quebrar (e “subir”) */
                font-weight: 600;
            }

            /* botão fechar à direita, alinhado verticalmente */
            .hc-click-card-header .btn-close {
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                opacity: .9;
            }

            .hc-click-card-header .btn-close:hover {
                opacity: 1;
            }

            .btn-close {
                background: transparent;
                border: 0;
                width: 1.25rem;
                height: 1.25rem;
            }

            .btn-close::before {
                content: "×";
                font-size: 20px;
                line-height: 1;
            }

            .highcharts-plot-band.hc-hover-band,
            .highcharts-series-group,
            .highcharts-plot-background {
                cursor: pointer !important;
            }
        </style>
    @endpush
    @push('js')
        <script src="https://code.highcharts.com/modules/sankey.js"></script>
        <script src="https://code.highcharts.com/modules/funnel.js"></script>
        <script src="https://code.highcharts.com/modules/series-label.js"></script>
        <script>
            window.app = {
                routes: {

                    buscarCredor: "{{ route('buscar.hapvida_desempenho_carteira_dados') }}"
                },
            };
        </script>
        <script src="{{ asset('js/scripts_blades_hapvida/dash_painel_retencao.js') }}?v={{ time() }}"></script>
    @endpush
@endonce
