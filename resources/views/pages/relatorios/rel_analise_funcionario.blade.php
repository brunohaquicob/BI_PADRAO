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
                        <a class="nav-link btn-sm ladda-button active" data-style="zoom-out" href="#resultado-aba1" data-toggle="tab">Dados</a>
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
        <div class="card-body" id="card_resultados">
            <div class="tab-content">
                <div class="chart tab-pane active" id="resultado-aba1" style="min-height:600px;">
                    <div class="card-body" style="display: block;">

                        <div class="container-fluid">
                            <div class="row g-2" id="filtrosGraficos">
                            </div>
                            {{-- <div class="row">
                                <div class="col-3">
                                    <x-boxdynamic-component component-name="smallbox" identificador="1" color="lightblue" icon="ion ion-social-usd" text1="0" text2="Valor Implantado." />
                                </div>
                                <div class="col-3">
                                    <x-boxdynamic-component component-name="smallbox" identificador="2" color="success" icon="ion ion-social-usd" text1="0" text2="Valor Recuperado." />
                                </div>
                                <div class="col-3">
                                    <x-boxdynamic-component component-name="smallbox" identificador="4" color="info" icon="ion ion-pricetags" text1="0" text2="Devedores Implantados." />
                                </div>
                                <div class="col-3">
                                    <x-boxdynamic-component component-name="smallbox" identificador="5" color="success" icon="ion ion-pricetags" text1="0" text2="Devedores Recuperados." />
                                </div>
                            </div> --}}

                            <div class="row">
                                <section class="col-12">
                                    <div class="row">
                                        <div class="col-12" id="card_1"></div>
                                    </div>
                                </section>
                            </div>

                        </div>
                    </div>
                </div>
                <div class="chart tab-pane" id="resultado-aba2" style="min-height:600px;"></div>
            </div>
        </div>
        <div class="card-footer" id="resultado-footer">
        </div>

    </div>
    <div class="modal fade " id="hcDrillModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-80 modal-dialog-scrollable" role="document">
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

            /* Sticky header + primeira coluna */
            .table-sticky {
                border-collapse: separate;
                border-spacing: 0;
            }

            .table-sticky thead th {
                position: sticky;
                top: 0;
                z-index: 3;
                background: #f8f9fa;
            }

            .table-sticky tbody th {
                position: sticky;
                left: 0;
                z-index: 2;
                background: #fff;
            }

            .table-sticky thead th:first-child,
            .table-sticky tbody th {
                box-shadow: 2px 0 0 rgba(0, 0, 0, .05);
            }

            /* Fim-de-semana destacado */
            .col-weekend {
                background: #fffbe6;
            }

            /* células */
            .table-sticky thead th.col-weekend {
                background: #fff2b3;
            }

            /* header */

            /* Números alinhados melhor */
            .tabular-nums {
                font-variant-numeric: tabular-nums;
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
                    buscarCredor: "{{ route('buscar.rel_analise_funcionario_dados') }}"
                },
            };
        </script>
        <script src="{{ asset('js/scripts_blades/rel_analise_funcionario.js') }}?v={{ time() }}"></script>
    @endpush
@endonce
