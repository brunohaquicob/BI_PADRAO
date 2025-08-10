$.extend($.fn.dataTable.defaults, {
    "scrollY": "500px",
    "scrollX": true,
    "lengthMenu": [[-1, 15, 25, 50], ['Todos', 15, 25, 50]],
    'pageLength': -1,
    "lengthChange": true,
    "searching": true,
    "ordering": true,
    "info": true,
    "responsive": true,
    "autoWidth": false,
    "scrollCollapse": true,
    "colReorder": true,
    "dom": "<'row'<'col-xs-6 col-md-4'l><'col-xs-6 col-md-4 text-center'B><'col-xs-12 col-md-4'f>>t<'row text-xs'<'col-xs-6 col-md-6'i><'col-xs-6 col-md-6'p>>",
    "buttons": [
        {
            "extend": 'copyHtml5',
            "text": 'Copiar'
        },
        // {
        //     "extend": 'excelHtml5',
        //     "text": 'Excel'
        // },
        {
            "extend": 'csvHtml5',
            "text": 'Csv'
        },
        // {
        //     "text": 'Limpar Pesquisa',
        //     action: function (e, dt, node, config) {

        //         // Redefinir a pesquisa da tabela
        //         dt.search('').draw();
        //     }
        // }
    ],

    'language': {
        'sEmptyTable': 'Nenhum registro encontrado',
        'sInfo': '_START_ até _END_ de _TOTAL_ registros',
        'sInfoEmpty': '0 até 0 de 0 registros',
        'sInfoFiltered': '(Filtrados de _MAX_ registros)',
        'sInfoPostFix': '',
        'sInfoThousands': '.',
        'sLengthMenu': '_MENU_',
        'sLoadingRecords': 'Carregando...',
        'sProcessing': 'Processando...',
        'sZeroRecords': 'Nenhum registro encontrado',
        'sSearch': '',
        'sSearchPlaceholder': 'Pesquisar',
        'oPaginate': {
            'sNext': 'Próximo',
            'sPrevious': 'Anterior',
            'sFirst': 'Primeiro',
            'sLast': 'Último'
        },
        "decimal": ",",
        "thousands": ".",
    },
});

//Ordenação PTBR colunas data
$.fn.dataTable.moment('DD/MM/YYYY', 'pt-br');

function addCell(row, value, colspan = 1, className = '') {
    let cell = document.createElement('td');
    cell.innerHTML = value.replace(/\n/g, '<br>');;
    cell.colSpan = colspan;
    cell.className = className;
    row.appendChild(cell);
}

function __renderDataTable(
    data,
    div_retorno,
    extraOptions = {},
    class_table = 'table display table-bordered table-hover table-striped small sem-quebra',
    returnPromise = false // <- NOVO: se true, retorna Promise que resolve após render completo
) {
    const dados = data.dados;
    const columnConfigs = data.colunas_config;
    const filtrosHeader = data.filtrosHeader ?? [];

    const tableId = `dataTable_${Date.now()}`;
    const ns = `.dtFix-${tableId}`;

    const $table = $('<table>', { id: tableId, class: class_table, style: 'width:100%' });
    $('#' + div_retorno).html($table);

    // Cabeçalho/rodapé
    const $thead = $('<thead>');
    const $tfoot = $('<tfoot>');
    const $headerRow = $('<tr>');
    const $footerRow = $('<tr>');
    columnConfigs.forEach(cfg => {
        $headerRow.append('<th>' + (cfg.nome || '') + '</th>');
        $footerRow.append('<th class="' + (cfg.alinhamento || '') + '"></th>');
    });
    $thead.append($headerRow);
    $tfoot.append($footerRow);
    $table.append($thead).append($tfoot);

    // Promise para o modo assíncrono
    let resolveReady;
    const readyPromise = new Promise(r => { resolveReady = r; });

    // Opções padrão (otimizadas + Scroller)
    const defaultOptions = {
        data: dados,
        columns: columnConfigs.map((cfg, idx) => ({
            data: idx,
            className: ((cfg.alinhamento || '') + ' no-wrap').trim(),
            render: function (d, type) {
                if (d == null || d === '') return '';
                // só formata no display; ordenação/pesquisa usam o valor bruto
                if (type !== 'display') return d;

                if (cfg.decimalPlaces === 'date') return moment(d).isValid() ? moment(d).format('DD/MM/YYYY') : '';
                if (cfg.decimalPlaces === 'datetime') return moment(d).isValid() ? moment(d).format('DD/MM/YYYY HH:mm:ss') : '';
                if (typeof cfg.decimalPlaces === 'number' && !isNaN(d)) {
                    return Number(d).toLocaleString('pt-BR', {
                        minimumFractionDigits: cfg.decimalPlaces,
                        maximumFractionDigits: cfg.decimalPlaces
                    });
                }
                return d;
            }
        })),
        destroy: true,
        responsive: false,
        autoWidth: false,
        deferRender: true,
        processing: true,
        scrollY: '500px',
        scrollX: true,
        scroller: true,  // precisa do JS/CSS do Scroller incluídos
        paging: true,    // Scroller requer paging habilitado (mesmo sem paginação visível)
        // ordering: [[1, 'desc']],
        columnDefs: [{ targets: '_all', className: 'no-wrap' }],

        footerCallback: function () {
            const api = this.api();

            // helper robusto para "1.234.567,89", "1234.56", números ou vazio
            // Substitua seu toNumber por este:
            const toNumber = (v) => {
                if (v == null || v === '') return 0;
                if (typeof v === 'number') return v;

                let s = String(v).trim();
                // mantém apenas dígitos, sinais e separadores
                s = s.replace(/[^\d.,+-]/g, '');

                const hasComma = s.indexOf(',') !== -1;
                const hasDot = s.indexOf('.') !== -1;

                if (hasComma && hasDot) {
                    // o separador decimal é o último que aparecer
                    const lastComma = s.lastIndexOf(',');
                    const lastDot = s.lastIndexOf('.');
                    if (lastComma > lastDot) {
                        // vírgula é decimal (pt-BR): remove pontos de milhar e troca vírgula por ponto
                        s = s.replace(/\./g, '').replace(',', '.');
                    } else {
                        // ponto é decimal (en-US): remove vírgulas de milhar
                        s = s.replace(/,/g, '');
                    }
                } else if (hasComma && !hasDot) {
                    // só vírgula presente -> trate como decimal vírgula
                    s = s.replace(/\./g, '').replace(',', '.');
                } else {
                    // só ponto ou nenhum -> trate ponto como decimal e remova vírgulas (se houver)
                    s = s.replace(/,/g, '');
                }

                const n = parseFloat(s);
                return isNaN(n) ? 0 : n;
            };


            // se quiser permitir escopo por coluna ou global, pode ler de extraOptions.sumScope
            const scope = (idx, cfg) => {
                const colScope = (cfg && cfg.sumScope) || (extraOptions && extraOptions.sumScope) || 'all';
                // 'all' => tudo filtrado; 'page' => só o que está na tela
                return colScope === 'page' ? { page: 'current' } : { search: 'applied' };
            };

            columnConfigs.forEach((cfg, idx) => {
                if (cfg.somar_footer === true) {
                    const arr = api.column(idx, scope(idx, cfg)).data().toArray();
                    const total = arr.reduce((s, v) => s + toNumber(v), 0);
                    $(api.column(idx).footer()).html(
                        Number(total).toLocaleString('pt-BR', {
                            minimumFractionDigits: cfg.decimalPlaces || 0,
                            maximumFractionDigits: cfg.decimalPlaces || 0
                        })
                    );
                } else if (typeof cfg.somar_footer === 'object') {
                    // Ex.: cfg.somar_footer = [' %', [baseIdx, compIdx]]
                    const [baseIdx, compIdx] = cfg.somar_footer[1];

                    const baseArr = api.column(baseIdx, scope(baseIdx, cfg)).data().toArray();
                    const compArr = api.column(compIdx, scope(compIdx, cfg)).data().toArray();

                    const somaBase = baseArr.reduce((s, v) => s + toNumber(v), 0);
                    const somaComp = compArr.reduce((s, v) => s + toNumber(v), 0);
                    const perc = (somaBase > 0 && somaComp > 0) ? (somaComp / somaBase * 100) : 0;

                    $(api.column(idx).footer()).html(
                        Number(perc).toLocaleString('pt-BR', {
                            minimumFractionDigits: cfg.decimalPlaces || 0,
                            maximumFractionDigits: cfg.decimalPlaces || 0
                        }) + (cfg.somar_footer[0] ?? '')
                    );
                }
            });
        },

        initComplete: function () {
            const api = this.api();

            const finalize = () => {
                // ajusta layout e resolve a promise após 2 RAFs (garante paint)
                api.columns.adjust().draw(false);
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => resolveReady && resolveReady(api.table()));
                });
            };

            if (!filtrosHeader.length) {
                finalize();
                return;
            }

            // monta filtros após o primeiro paint
            setTimeout(() => {
                filtrosHeader.forEach((idx) => {
                    const column = api.column(idx);
                    const $header = $(column.header());
                    const title = $header.text();
                    $header.empty();

                    const $container = $('<div class="col-12" style="min-width:180px;"></div>');
                    const $titleDiv = $('<div>').text(title);
                    const $select = $('<select multiple="multiple" class="form-control small"></select>');
                    $container.append($titleDiv).append($select);
                    $header.append($container);

                    const uniques = [...new Set(column.data().toArray().filter(d => d != null && d !== ''))].sort();
                    uniques.forEach(d => $select.append('<option value="' + d + '">' + d + '</option>'));

                    $select.multiselect({
                        includeSelectAllOption: true,
                        includeSelectAllOptionMin: 3,
                        selectAllText: "Todos",
                        selectAllDeselectAll: false,
                        enableFiltering: true,
                        maxHeight: 200,
                        fontSize: 14
                    });

                    $select.on('change' + ns, function () {
                        const vals = $(this).val();
                        if (vals && vals.length) {
                            const escaped = vals.map(v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
                            column.search(escaped.join('|'), true, false).draw(false);
                        } else {
                            column.search('', true, false).draw(false);
                        }
                    });
                });

                finalize();
            }, 0);
        }
    };

    const options = $.extend(true, {}, defaultOptions, extraOptions);
    const table = $table.DataTable(options);

    // Ajustes + cleanup
    const adjust = () => {
        table.columns.adjust();
        if (table.fixedHeader) table.fixedHeader.adjust();
    };

    $(document).off('visibilitychange' + ns).on('visibilitychange' + ns, function () {
        if (!document.hidden) adjust();
    });

    let resizeObserver = null;
    if (window.ResizeObserver) {
        resizeObserver = new ResizeObserver(() => adjust());
        resizeObserver.observe($table.get(0));
    } else {
        $(window).off('resize' + ns).on('resize' + ns, adjust);
    }

    table.on('destroy.dt', function () {
        $(document).off('visibilitychange' + ns);
        $(window).off('resize' + ns);
        if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null; }
    });

    // Compatível + assíncrono opcional
    return returnPromise ? readyPromise : table;
}