@switch($tipo)
    @case('duplo')
        <div class="card card-{{ $color ?? 'primary' }} card-outline">
            <div class="card-header ui-sortable-handle" style="cursor: move;">
                <h3 class="card-title" style="margin-top: 5px;">
                    <i class="{{ $icon ?? 'fas fa-chart-pie' }} mr-1"></i>
                    <span id="{{ $identificador }}-title">{{ $title ?? ''}}</span>
                </h3>
                <div class="card-tools align-items-center">
                    <ul class="nav nav-pills ml-auto" style="margin-bottom: -1.8rem;">
                        <li class="nav-item">
                            <a class="nav-link btn-sm ladda-button active" data-style="zoom-out" href="#{{ $identificador }}-aba1" data-toggle="tab">{{ $btAba1 ?? 'Gráfico' }}</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link btn-sm ladda-button" data-style="zoom-out" href="#{{ $identificador }}-aba2" data-toggle="tab">{{ $btAba2 ?? 'Tabela' }}</a>&nbsp;
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
            <div class="card-body" id="{{ $identificador }}-body">
                <div class="tab-content p-0">
                    <div class="chart tab-pane active" id="{{ $identificador }}-aba1" style="position: relative; {{ $style ?? '' }}"></div>
                    <div class="chart tab-pane" id="{{ $identificador }}-aba2" style="overflow-y: auto; {{ $style ?? '' }}"></div>
                </div>
            </div>
            @if (isset($footer) && $footer == 'S')
                <div class="card-footer" id="{{ $identificador }}-footer">
                    @if ($slotfooter)
                        {{ $slotfooter }}
                    @endif
                </div>
            @endif

        </div>
    @break

    @case('simples')
        <div class="card card-{{ $color ?? 'primary' }} card-outline">
            <div class="card-header ui-sortable-handle" style="cursor: move;">
                <h3 class="card-title" style="margin-top: 5px;">
                    <i class="{{ $icon ?? 'fas fa-chart-pie' }} mr-1"></i>
                    <span id="{{ $identificador }}-title">{{ $title ?? '' }}</span>
                </h3>
                <div class="card-tools align-items-center">
                    <ul class="nav nav-pills ml-auto" style="margin-bottom: -1.8rem;">
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
            <div class="card-body" id="{{ $identificador }}-body" style="overflow: auto; {{ $style ?? '' }}">
                @if ($slotbody)
                    {{ $slotbody }}
                @endif
            </div>
            @if (isset($footer) && $footer == 'S')
                <div class="card-footer" id="{{ $identificador }}-footer">
                    @if (isset($slotfooter) && $slotfooter)
                        {{ $slotfooter }}
                    @endif
                </div>
            @endif

        </div>
    @break

    @default
        <p>Card-Component not found.</p>
@endswitch