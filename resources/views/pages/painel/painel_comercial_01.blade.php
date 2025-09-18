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
                    <!-- Metas: Acionamentos -->
                    <div class="col-md-4">
                        <div class="form-group mb-2">
                            <label class="mb-1">Metas – Acionamentos</label>
                            <div class="form-row">
                                <div class="col">
                                    <div class="input-group input-group-sm">
                                        <div class="input-group-prepend"><span class="input-group-text">Hoje</span></div>
                                        <input type="number" min="0" step="1" class="form-control js-meta" id="meta_acao_hoje" name="meta_acao_hoje" value="0">
                                    </div>
                                </div>
                                <div class="col">
                                    <div class="input-group input-group-sm">
                                        <div class="input-group-prepend"><span class="input-group-text">Mês</span></div>
                                        <input type="number" min="0" step="1" class="form-control js-meta" id="meta_acao_mes" name="meta_acao_mes" value="0">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Metas: Acordos -->
                    <div class="col-md-4">
                        <div class="form-group mb-2">
                            <label class="mb-1">Metas – Acordos</label>
                            <div class="form-row">
                                <div class="col">
                                    <div class="input-group input-group-sm">
                                        <div class="input-group-prepend"><span class="input-group-text">Hoje</span></div>
                                        <input type="number" min="0" step="1" class="form-control js-meta" id="meta_acordo_hoje" name="meta_acordo_hoje" value="0">
                                    </div>
                                </div>
                                <div class="col">
                                    <div class="input-group input-group-sm">
                                        <div class="input-group-prepend"><span class="input-group-text">Mês</span></div>
                                        <input type="number" min="0" step="1" class="form-control js-meta" id="meta_acordo_mes" name="meta_acordo_mes" value="0">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Metas: Pagamentos -->
                    <div class="col-md-4">
                        <div class="form-group mb-2">
                            <label class="mb-1">Metas – Pagamentos</label>
                            <div class="form-row">
                                <div class="col">
                                    <div class="input-group input-group-sm">
                                        <div class="input-group-prepend"><span class="input-group-text">Hoje</span></div>
                                        <input type="number" min="0" step="0.01" class="form-control js-meta" id="meta_pag_hoje" name="meta_pag_hoje" value="0">
                                    </div>
                                </div>
                                <div class="col">
                                    <div class="input-group input-group-sm">
                                        <div class="input-group-prepend"><span class="input-group-text">Mês</span></div>
                                        <input type="number" min="0" step="0.01" class="form-control js-meta" id="meta_pag_mes" name="meta_pag_mes" value="0">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-3">
                        <div class="form-group mb-2">
                            <label class="mb-1">Modo das metas</label>
                            <select class="form-control selectpickernovo" id="modo_metas" name="modo_metas" data-camponame="Modo das metas">
                                <option value="topn">Automáticas (média do Top N)</option>
                                <option value="manual">Fixas (campos acima)</option>
                            </select>
                            <small class="text-muted d-block mt-1">
                                Em “Automáticas”, os campos de meta ficam desabilitados.
                            </small>
                        </div>
                    </div>

                    <div class="col-md-2">
                        <div class="form-group mb-2">
                            <label class="mb-1">Top N</label>
                            <input type="number" min="1" step="1" class="form-control" id="topn_metas" name="topn_metas" value="3">
                        </div>
                    </div>
                </div>


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
                <span id="metaModePill" class="badge badge-info ml-2">Metas: Fixas</span>

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

            .rk-card {
                font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif;
                background: #fff;
                border: 1px solid #e9ecef;
                border-radius: 16px;
                box-shadow: 0 4px 14px rgba(0, 0, 0, .06);
                --rk-row-gap: 4px;
                /* espaçamento vertical entre linhas (antes 8px) */
                --rk-progress-h: 16px;
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
                min-width: 50px;
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

            /* mini por coluna */
            .rk-cell.rk-mini .rk-progress {
                height: 12px;
            }

            /* sem barra: só número */
            .rk-cell-plain {
                text-align: right;
            }

            .rk-cell-plain.center {
                text-align: center;
            }

            .rk-cell-plain.left {
                text-align: left;
            }

            .rk-plain-val {
                font-weight: 700;
            }

            /* badge (pílula sem barra) */
            .rk-cell-badge {
                text-align: center;
            }

            .rk-badge {
                display: inline-block;
                padding: .15rem .55rem;
                border-radius: 9999px;
                background: #f1f3f5;
                font-weight: 700;
            }

            .rk-badge.rk-green {
                background: #d3f9d8;
                color: #0f5132;
            }

            .rk-badge.rk-yellow {
                background: #fff3bf;
                color: #664d03;
            }

            .rk-badge.rk-red {
                background: #ffe3e3;
                color: #842029;
            }

            /* permite scroll horizontal quando necessário */
            .rk-card {
                overflow-x: auto;
            }

            /* evita tabelão gigante e melhora shrink */
            .rk-table {
                width: 100%;
                table-layout: fixed;
            }

            /* o nome ocupa menos quando compacto */
            .rk-card.compacto .rk-name {
                max-width: 140px;
            }

            /* min-width por variante (pode customizar via options) */
            .rk-cell {
                min-width: 0;
            }

            /* default solto, controlado inline pela função */
            .rk-cell.rk-mini .rk-progress {
                height: 12px;
            }

            .rk-cell-badge {
                text-align: center;
            }

            .rk-badge {
                display: inline-block;
                padding: .15rem .55rem;
                border-radius: 9999px;
                font-weight: 700;
            }

            .rk-badge.rk-green {
                background: #d3f9d8;
                color: #0f5132;
            }

            .rk-badge.rk-yellow {
                background: #fff3bf;
                color: #664d03;
            }

            .rk-badge.rk-red {
                background: #ffe3e3;
                color: #842029;
            }

            /* agregados no cabeçalho/rodapé */
            .rk-agg {
                font-weight: 600;
                opacity: .85;
                margin-left: .35rem;
                font-size: .82em;
            }

            .rk-agg-row td {
                font-weight: 700;
            }

            /* Card maximizado ocupa a tela */
            .card.maximized-card {
                position: fixed;
                inset: 0;
                z-index: 1080;
                display: grid;
                grid-template-rows: auto 1fr auto;
            }

            /* Body deve crescer – sem overflow aqui */
            .card.maximized-card>.card-body {
                overflow: initial !important;
                /* ou: visible */
                min-height: 0;
            }

            /* Se quiser rolagem, use um wrapper dentro do body */
            .card.maximized-card>.card-body>.rk-scroll {
                height: 100%;
                min-height: 0;
                overflow: auto;
            }

            /* ====== TOP3 / PÓDIUM ====== */
            .top3-card {
                background: #fff;
                border: 1px solid #e9ecef;
                border-radius: 16px;
                box-shadow: 0 4px 14px rgba(0, 0, 0, .06);
            }

            .top3-head {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: .6rem .8rem;
                font-weight: 700;
                color: #212529;
            }

            .top3-head .left {
                display: flex;
                align-items: center;
                gap: .5rem
            }

            .top3-head .icon {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #0d6efd, #5bc0ff);
                color: #fff;
                font-size: 14px;
                box-shadow: 0 2px 8px rgba(13, 110, 253, .35);
            }

            .top3-list {
                padding: .6rem .8rem;
                padding-top: .2rem
            }

            .top3-item {
                display: grid;
                grid-template-columns: auto 1fr auto;
                grid-column-gap: .6rem;
                grid-row-gap: .15rem;
                align-items: center;
                background: #f8f9fa;
                border: 1px solid #edf0f3;
                border-radius: 12px;
                padding: .45rem .55rem;
                margin: .35rem 0;
            }

            .top3-medal {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 800;
                color: #fff;
                text-shadow: 0 1px 0 rgba(0, 0, 0, .25);
                box-shadow: 0 3px 10px rgba(0, 0, 0, .15);
            }

            .top3-medal.gold {
                background: linear-gradient(135deg, #f6d365, #fda085)
            }

            .top3-medal.silver {
                background: linear-gradient(135deg, #bdc3c7, #e0e0e0)
            }

            .top3-medal.bronze {
                background: linear-gradient(135deg, #d1913c, #a4552a);
            }

            .top3-name {
                font-weight: 700;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 220px;
            }

            .top3-right {
                text-align: right;
                font-weight: 700;
            }

            .top3-sub {
                font-size: .78rem;
                opacity: .85;
                font-weight: 600;
            }

            .top3-bar-wrap {
                grid-column: 2 / span 2;
            }

            .top3-bar {
                height: 12px;
                border-radius: 9999px;
                background: #eef2f7;
                border: 1px solid #e9ecef;
                overflow: hidden;
            }

            .top3-bar>span {
                display: block;
                height: 100%;
                width: 0%;
                transition: width .8s ease;
                background-image: linear-gradient(90deg, #22c55e 0%, #16a34a 50%, #22c55e 100%);
            }

            .top3-item.silver .top3-bar>span {
                background-image: linear-gradient(90deg, #60a5fa 0%, #3b82f6 50%, #60a5fa 100%)
            }

            .top3-item.bronze .top3-bar>span {
                background-image: linear-gradient(90deg, #f59e0b 0%, #d97706 50%, #f59e0b 100%)
            }

            /* responsivo */
            @media (max-width: 991.98px) {
                .top3-name {
                    max-width: 160px
                }
            }

            .top3-item.gold {
                box-shadow: 0 0 0 3px rgba(255, 221, 87, .25) inset;
            }

            /* modo compacto */
            .top3-card.dense .top3-head {
                padding: .45rem .65rem;
            }

            .top3-card.dense .top3-list {
                padding: .45rem .65rem;
            }

            .top3-card.dense .top3-item {
                padding: .35rem .5rem;
            }

            .top3-card.dense .top3-bar {
                height: 10px;
            }

            @media (max-height: 820px) {
                .top3-sub {
                    display: none;
                }
            }

            .rk-row-hide {
                display: none !important;
            }


            .js-meta.disabled {
                background: #f8f9fa !important;
                opacity: .75;
                cursor: not-allowed;
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
