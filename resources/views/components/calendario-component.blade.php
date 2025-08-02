@if ($type === 'button')
    <button type="button" class="btn btn-default ladda-button" data-style="zoom-out" title="{{ $label ?? 'Data' }}" id="{{ $id }}" name="{{ $id }}">
        <i class="{{ $icon ?? 'far fa-calendar-alt' }}"></i>
    </button>
@elseif ($type === 'input-group-append')
    <div class="input-group-append">
        <span class="input-group-text">
            <i class="{{ $icon ?? 'far fa-calendar-alt' }}"></i>
        </span>
    </div>
    <input type="text" class="form-control float-right" id="{{ $id }}" name="{{ $id }}">
@elseif ($type === 'input-group-prepend')
    <div class="input-group-prepend">
        <span class="input-group-text">
            <i class="{{ $icon ?? 'far fa-calendar-alt' }}"></i>
        </span>
    </div>
    <input type="text" class="form-control float-right" id="{{ $id }}" name="{{ $id }}">
@else
    <div class="form-group">
        <label for="{{ $id }}">{{ $label ?? 'Data' }}:</label>
        <div class="input-group">
            <div class="input-group-prepend">
                <span class="input-group-text">
                    <i class="{{ $icon ?? 'far fa-calendar-alt' }}"></i>
                </span>
            </div>

            <input type="text" class="form-control float-right" id="{{ $id }}" name="{{ $id }}">
            @if ($type === 'input-com-check')
                <div class="input-group-append">
                    <div class="input-group-text">
                        <input type="checkbox" id="{{ $id }}_check" name="{{ $id }}_check">
                    </div>
                </div>
            @endif
        </div>
    </div>
@endif
<script>
    var options = @json($options);
    if (typeof options === 'string') {
        options = JSON.parse(options);
    }
    var defaultOptions = {
        locale: {
            format: 'DD/MM/YYYY',
            separator: ' - ',
            applyLabel: 'Aplicar',
            cancelLabel: 'Cancelar',
            fromLabel: 'De',
            toLabel: 'Até',
            customRangeLabel: 'Personalizado',
            weekLabel: 'S',
            daysOfWeek: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
            monthNames: [
                'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho',
                'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
            ]
        },
        firstDay: 1,
        showDropdowns: true,
    };
    //Single
    @if ($single === 'S')
        var opt = {
            singleDatePicker: true,
            startDate: moment(),
            autoApply: {{ $autoApply ?? 'true' }}
        }
    @else
        //Dual
        var opt = {
            linkedCalendars: false,
            autoApply: {{ $autoApply ?? 'false' }},
            ranges: {
                'Hoje': [moment(), moment()],
                'Ontem': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Últimos 7 dias': [moment().subtract(6, 'days'), moment()],
                'Últimos 30 dias': [moment().subtract(29, 'days'), moment()],
                'Este mês': [moment().startOf('month'), moment().endOf('month')],
                'Último mês': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            },
            startDate: moment(),
            endDate: moment(),

        }
    @endif
    //Opções usuario
    options = Object.assign({}, defaultOptions, opt, options);

    @if ($type === 'button')
        $('#{{ $id }}').daterangepicker(options).on('apply.daterangepicker', function(ev, picker) {

            @if ($single === 'S')
                let selectedDate = picker.startDate.format('YYYY-MM-DD');

                let eventData = {
                    startDate: selectedDate
                };
                let event = new CustomEvent('{{ $eventName }}', {
                    detail: eventData
                });
                document.dispatchEvent(event);
            @else
                let startDate = picker.startDate.format('YYYY-MM-DD');
                let endDate = picker.endDate.format('YYYY-MM-DD');

                let eventData = {
                    startDate: startDate,
                    endDate: endDate
                };
                let event = new CustomEvent('{{ $eventName }}', {
                    detail: eventData
                });
                document.dispatchEvent(event);
            @endif
        });
    @else
        $('#{{ $id }}').daterangepicker(options);
    @endif
</script>
