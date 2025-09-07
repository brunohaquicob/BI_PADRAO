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
                            <label for="rel_mes_base">Mes Base:</label>
                            <select class="form-control" id="rel_mes_base" name="rel_mes_base">
                                @foreach ($meses as $v)
                                    <option value="{{ $v['col1'] }}">{{ $v['col2'] }}</option>
                                @endforeach
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
                    <div class="col-md-3">
                        <div class="form-group">
                            <label for="refreshInterval">Refresh:</label>
                            <select class="form-control selectpickernovo" id="refreshInterval" data-camponame="Refresh" title='Refresh'>
                                <option value="0">Desativar</option>
                                <option value="60000">1 minuto</option>
                                <option value="300000">5 minutos</option>
                                <option value="600000">10 minutos</option>
                                <option value="900000">15 minutos</option>
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

    <div class="card card-primary card-outline" id="card-resultados">
        <div class="card-header ui-sortable-handle">
            <h3 class="card-title d-flex align-items-center gap-2" style="margin-top:5px;">
                <i class="fas fa-chart-pie mr-1"></i>
                <span>Painel Acompanhamento</span>
                <span id="refreshCountdown" class="refresh-pill refresh-off" title="Auto-refresh">
                    <i class="fas fa-bolt mr-1"></i>
                    Desativado
                </span>
            </h3>
            <div class="card-tools align-items-center">
                <ul class="nav nav-pills ml-auto" style="margin-bottom:-1.8rem;">
                    <li class="nav-item">
                        <button type="button" class="btn btn-tool" data-card-widget="collapse" style="margin-top:5px;">
                            <i class="fas fa-minus"></i>
                        </button>
                    </li>
                    <li class="nav-item">
                        <button type="button" class="btn btn-tool" data-card-widget="maximize" style="margin-top:5px;">
                            <i class="fas fa-expand"></i>
                        </button>
                    </li>
                </ul>
            </div>
        </div>

        <!-- UM ÚNICO BODY -->
        <div class="card-body" id="card_resultados">
            <!-- KPIs -->
            <section class="col-12 px-0">
                <div class="row" id="kpis-row"></div>
            </section>

            <!-- Seus 3 cards -->
            <section class="row mt-3">
                <div class="col-md-4" id="card01"></div>
                <div class="col-md-4" id="card02"></div>
                <div class="col-md-4" id="card03"></div>
            </section>
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
            #card_resultados {
                background: #eef2f7;
            }


            /* ==== Fix maximize AdminLTE ==== */
            .card.maximized-card {
                /* deixa o card ocupar a tela, mas sem travar a altura */
                height: auto !important;
                max-height: none !important;

                /* e usa flex para o body ocupar e rolar */
                display: flex;
                flex-direction: column;
            }

            .card.maximized-card .card-header,
            .card.maximized-card .card-footer {
                flex: 0 0 auto;
            }

            .card.maximized-card .card-body {
                flex: 1 1 auto;
                /* ocupa o restante */
                overflow: auto !important;
                height: auto !important;
                min-height: 0;
                /* evita overflow por cálculo de min-height */
            }


            .rk-card {
                font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif;
                background: #fff;
                border: 1px solid #e9ecef;
                border-radius: 16px;
                box-shadow: 0 4px 14px rgba(0, 0, 0, .06);
                --rk-row-gap: 6px;
                /* espaçamento vertical entre linhas (antes 8px) */
                --rk-progress-h: 24px;
                /* altura das barras (antes 20px) */
            }

            .rk-card+.rk-card {
                margin-top: 12px;
            }

            .rk-title {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                margin: 2px 2px 10px;
                font-weight: 700;
                letter-spacing: .2px;
                font-size: 15px;
                color: #212529;
            }

            .rk-title .rk-icon {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 26px;
                height: 26px;
                border-radius: 50%;
                background: linear-gradient(135deg, #0d6efd, #5bc0ff);
                color: #fff;
                font-size: 14px;
                font-weight: 700;
                box-shadow: 0 2px 8px rgba(13, 110, 253, .35);
            }

            .rk-table {
                width: 100%;
                border-collapse: separate;
                border-spacing: 0 var(--rk-row-gap);
                /* ← usa a variável */
            }

            .rk-table th {
                font-weight: 700;
                color: #495057;
                padding: .35rem .5rem;
                /* mantém a fonte/tamanho */
                border-bottom: 1px solid #e9ecef;
            }

            .rk-table td {
                padding: .15rem .5rem;
                /* ↓ menos padding vertical */
            }



            .rk-name {
                max-width: 180px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            /* célula do progresso */
            .rk-cell {
                min-width: 180px;
            }

            .rk-progress-wrap {
                position: relative;
            }

            .rk-progress {
                height: var(--rk-progress-h);
                /* ← altura controlável */
                border-radius: 9999px;
                background: #f1f3f5;
                overflow: hidden;
                border: 1px solid #e9ecef;
            }


            .rk-bar {
                height: 100%;
                width: 0%;
                border-radius: 9999px;
                transition: width .9s ease;
                /* animação suave */
                background-size: 200% 100%;
                background-image: linear-gradient(90deg, rgba(255, 202, 40, 1) 0%, rgba(255, 179, 0, 1) 50%, rgba(255, 202, 40, 1) 100%);
                /* se quiser listrado animado, dá pra ligar uma animação CSS aqui */
            }

            .rk-bar.rk-green {
                background-image: linear-gradient(90deg, #22c55e 0%, #16a34a 50%, #22c55e 100%);
            }

            .rk-bar.rk-yellow {
                background-image: linear-gradient(90deg, #ffd43b 0%, #f59f00 50%, #ffd43b 100%);
            }

            .rk-bar.rk-red {
                background-image: linear-gradient(90deg, #ff6b6b 0%, #fa5252 50%, #ff6b6b 100%);
            }

            .rk-progress-label {
                position: absolute;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: .82rem;
                font-weight: 700;
                color: #212529;
                text-shadow: 0 1px 0 rgba(255, 255, 255, .55);
                pointer-events: none;
            }

            /* compact mode */
            .rk-card.compacto {
                padding: 10px;
                font-size: 0.82rem;
                /* letras menores */
            }

            .rk-card.compacto .rk-title {
                font-size: 0.9rem;
            }

            .rk-card.compacto .rk-cell {
                min-width: 140px;
                /* antes 180px */
            }

            .rk-card.compacto .rk-name {
                max-width: 120px;
                /* corta mais cedo */
                font-size: 0.82rem;
            }

            /* usa o valor que você passa no inline: --rk-progress-h */
            .rk-card.compacto .rk-progress {
                height: var(--rk-progress-h);
            }

            .rk-card.compacto .rk-progress-label {
                font-size: 0.72rem;
            }
        </style>
    @endpush
    @push('js')
        <script>
            window.app = {
                routes: {
                    buscarCredor: "{{ route('buscar.painel_comercial_01_dados') }}"
                },
            };
        </script>
        <script src="{{ asset('js/painel/painel_comercial_01.js') }}?v={{ time() }}"></script>
    @endpush

@endonce
