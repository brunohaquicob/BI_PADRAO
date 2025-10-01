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
    returnPromise = false
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

    // ==== Helpers para totais (cacheados) ====
    let totalsCache = {};

    // Parser numérico tolerante a "1.234.567,89" ou "1234567.89"
    const toNumber = (v) => {
        if (v == null || v === '') return 0;
        if (typeof v === 'number') return v;
        let s = String(v).trim().replace(/[^\d.,+-]/g, '');
        const hasComma = s.includes(',');
        const hasDot = s.includes('.');
        if (hasComma && hasDot) {
            const lastComma = s.lastIndexOf(',');
            const lastDot = s.lastIndexOf('.');
            if (lastComma > lastDot) s = s.replace(/\./g, '').replace(',', '.'); // vírgula decimal
            else s = s.replace(/,/g, ''); // ponto decimal
        } else if (hasComma) {
            s = s.replace(/\./g, '').replace(',', '.');
        } else {
            s = s.replace(/,/g, '');
        }
        const n = parseFloat(s);
        return isNaN(n) ? 0 : n;
    };

    // escopo da soma: 'all' (default) ou 'page'
    const scopeFor = (cfg) => {
        const colScope = (cfg && cfg.sumScope) || (extraOptions && extraOptions.sumScope) || 'all';
        return colScope === 'page' ? { page: 'current' } : { search: 'applied' };
    };

    const computeTotals = (api) => {
        totalsCache = {};
        columnConfigs.forEach((cfg, idx) => {
            if (cfg.somar_footer === true) {
                const arr = api.column(idx, scopeFor(cfg)).data().toArray();
                totalsCache[idx] = arr.reduce((s, v) => s + toNumber(v), 0);
            } else if (typeof cfg.somar_footer === 'object') {
                // cfg.somar_footer = [' sufixo', [baseIdx, compIdx]]
                const [baseIdx, compIdx] = cfg.somar_footer[1];
                const baseArr = api.column(baseIdx, scopeFor(cfg)).data().toArray();
                const compArr = api.column(compIdx, scopeFor(cfg)).data().toArray();
                const somaBase = baseArr.reduce((s, v) => s + toNumber(v), 0);
                const somaComp = compArr.reduce((s, v) => s + toNumber(v), 0);
                totalsCache[idx] = (somaBase > 0 && somaComp > 0) ? (somaComp / somaBase * 100) : 0;
            }
        });
        updateFooterFromCache(api);
    };

    const updateFooterFromCache = (api) => {
        columnConfigs.forEach((cfg, idx) => {
            if (totalsCache[idx] == null) return;
            const dec = (typeof cfg.decimalPlaces === 'number') ? cfg.decimalPlaces : 0;
            const sufix = Array.isArray(cfg.somar_footer) ? (cfg.somar_footer[0] ?? '') : '';
            $(api.column(idx).footer()).html(
                Number(totalsCache[idx]).toLocaleString('pt-BR', {
                    minimumFractionDigits: dec,
                    maximumFractionDigits: dec
                }) + sufix
            );
        });
    };
    // =========================================
    // Dentro de __renderDataTable, acima do defaultOptions:
    function buildExternalFilters(api, {
        container,
        columns,
        globalSearch,
        multiselectOpts = {},
        ns,
        colClass = 'col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2' // <<< ajuste aqui
    }) {
        const $host = $(container);
        if (!$host.length) return;

        // garante uma .row
        const $row = $host.hasClass('row')
            ? $host.empty().addClass('g-2')              // garante espaçamento se já for .row
            : $('<div class="row g-2"></div>').appendTo($host.empty());

        // Busca global externa (opcional)
        if (globalSearch && $(globalSearch).length) {
            $(globalSearch).off('input' + ns).on('input' + ns, function () {
                api.search(this.value || '').draw(false);
            });
        }

        const esc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Se usar ColReorder e as colunas passadas forem do índice original:
        const transpose = (idx) =>
            (api.colReorder && typeof api.colReorder.transpose === 'function')
                ? api.colReorder.transpose(idx)
                : idx;

        columns.forEach((rawIdx) => {
            const idx = transpose(rawIdx);
            const column = api.column(idx);
            const title = ($(column.header()).text() || `Col ${idx + 1}`).toUpperCase();

            const $col = $(`<div class="${colClass}"></div>`).appendTo($row);
            const $group = $(`
            <div class="form-group mb-2">
                <label class="small font-weight-bold mb-1">${title}</label>
                <select multiple class="form-control form-control-sm"></select>
            </div>
            `).appendTo($col);

            const $select = $group.find('select');

            const uniques = [...new Set(column.data().toArray().filter(d => d != null && d !== ''))].sort();
            uniques.forEach(v => $select.append(`<option value="${String(v)}">${String(v)}</option>`));

            // Inicializa o componente disponível
            if ($.fn.multiselect) {
                // bootstrap-multiselect
                $select.multiselect({
                    includeSelectAllOption: true,
                    includeSelectAllOptionMin: 3,
                    selectAllText: "Todos",
                    selectAllDeselectAll: false,
                    enableFiltering: true,
                    maxHeight: 240,
                    buttonWidth: '100%',
                    ...multiselectOpts
                });
                // change já é disparado pelo plugin
                $select.on('change' + ns, function () {
                    const vals = $(this).val();
                    if (vals && vals.length) column.search(vals.map(esc).join('|'), true, false).draw(false);
                    else column.search('', true, false).draw(false);
                });
            } else if ($.fn.select2) {
                // fallback: select2
                $select.select2({
                    width: '100%',
                    placeholder: 'Todos',
                    closeOnSelect: false
                }).on('change' + ns, function () {
                    const vals = $(this).val();
                    if (vals && vals.length) column.search(vals.map(esc).join('|'), true, false).draw(false);
                    else column.search('', true, false).draw(false);
                });
            } else {
                // nativo
                $select.on('change' + ns, function () {
                    const vals = Array.from(this.selectedOptions).map(o => o.value);
                    if (vals.length) column.search(vals.map(esc).join('|'), true, false).draw(false);
                    else column.search('', true, false).draw(false);
                });
            }

            // evita clique bolhar (só por segurança)
            $select.on('click' + ns, (e) => e.stopPropagation());
        });

        // se recarregar via xhr (serverSide), reconstruir
        $(api.table().node()).off('xhr.dt' + ns).on('xhr.dt' + ns, () =>
            buildExternalFilters(api, { container, columns, globalSearch, multiselectOpts, ns, colClass })
        );
    }

    // Opções padrão (otimizadas + Scroller)
    const defaultOptions = {
        data: dados,
        columns: columnConfigs.map((cfg, idx) => ({
            data: idx,
            orderable: !filtrosHeader.includes(idx), // desativa ordenação nas colunas com filtro
            className: ((cfg.alinhamento || '') + ' no-wrap').trim(),
            render: function (d, type) {
                if (d == null || d === '') return '';
                if (type !== 'display') return d;

                // datas normais (ISO, timestamp, etc.)
                if (cfg.decimalPlaces === 'date') {
                    return moment(d).isValid() ? moment(d).format('DD/MM/YYYY') : '';
                }

                // inteiros no formato YYYYMMDD (ex.: 20250931)
                if (cfg.decimalPlaces === 'dateint') {
                    const s = String(d).trim();
                    // aceita exatamente 8 dígitos YYYYMMDD
                    if (/^\d{8}$/.test(s)) {
                        const m = moment(s, 'YYYYMMDD', true); // parse estrito
                        return m.isValid() ? m.format('DD/MM/YYYY') : '';
                    }
                    return '';
                }

                if (cfg.decimalPlaces === 'datetime') {
                    return moment(d).isValid() ? moment(d).format('DD/MM/YYYY HH:mm:ss') : '';
                }
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
        scroller: true,
        paging: true,
        columnDefs: [{ targets: '_all', className: 'no-wrap' }],

        // Agora o footer só escreve a partir do cache (barato)
        footerCallback: function () {
            updateFooterFromCache(this.api());
        },

        initComplete: function () {
            const api = this.api();
            const ext = extraOptions.externalFilters;

            const finalize = () => {
                api.columns.adjust().draw(false);
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => resolveReady && resolveReady(api.table()));
                });
            };

            const bindTotalRecalcEvents = () => {
                const $tableNode = $(api.table().node());
                const evts = [
                    'search.dt',               // filtros globais/por coluna
                    'order.dt',                // ordenação
                    'column-visibility.dt',    // show/hide col
                    'column-reorder.dt',       // se usar ColReorder
                    'xhr.dt'                   // recarregou dados
                ].map(e => e + ns).join(' ');
                $tableNode.off(evts).on(evts, () => computeTotals(api));
            };

            if (ext && ext.container) {
                // ===== Filtros EXTERNOS =====
                buildExternalFilters(api, {
                    container: ext.container,
                    columns: (ext.columns && ext.columns.length) ? ext.columns : (filtrosHeader || []),
                    globalSearch: ext.globalSearch,
                    multiselectOpts: ext.multiselectOpts || {},
                    ns,
                    colClass: ext.colClass || 'col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2'
                });
                computeTotals(api);       // primeiro cálculo
                bindTotalRecalcEvents();  // recalcula quando dataset mudar
                finalize();
                return;
            }

            // ===== Filtros NO HEADER (teu fluxo atual) =====
            if (filtrosHeader.length) {
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

                        // evita bolha de clique no TH
                        $select.on('click' + ns, (e) => e.stopPropagation());
                    });

                    computeTotals(api);       // primeiro cálculo
                    bindTotalRecalcEvents();  // listeners p/ recálculo
                    finalize();
                }, 0);
            } else {
                // Sem filtros
                computeTotals(api);
                bindTotalRecalcEvents();
                finalize();
            }
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
        // remove listeners de recálculo
        const api = table; // já destruindo
        const $tableNode = $(api.table().node());
        $tableNode.off(ns); // remove todos eventos com namespace
    });

    return returnPromise ? readyPromise : table;
}

class DTFiltrados {
    /**
     * @param {string|object} tableOrSelector - '#idDaTabela' ou instância DataTable
     * @param {{
     *   serverSide?: boolean,
     *   events?: string[],            // ['search', 'order', 'page', 'length']
     *   compare?: {                   // o que considerar pra disparar o callback
     *     search?: boolean,
     *     order?: boolean,
     *     page?: boolean,
     *     length?: boolean
     *   }
     * }} opts
     */
    constructor(tableOrSelector, opts = {}) {
        this.opts = {
            serverSide: false,
            events: ['search', 'order', 'page', 'length'],
            compare: { search: true, order: false, page: false, length: false },
            ...opts
        };

        this.table = (typeof tableOrSelector === 'string')
            ? $(tableOrSelector).DataTable()
            : tableOrSelector;

        if (!this.table) throw new Error('DTFiltrados: DataTable não encontrado.');

        this._unsubs = [];
        this._lastState = this._snapshot();

        // >>> FALTAVA ISTO <<<
        this._runSeq = 0;          // garante número para "last call wins"
        this._lastHadRows = null;  // usado pelo alerta "sem dados"
    }


    static fromId(id, opts) {
        return new DTFiltrados('#' + id.replace(/^#/, ''), opts);
    }

    // ---------- API pública ----------

    /**
     * Pega os dados brutos atualmente filtrados.
     */
    get(onlyCurrentPage = false) {
        const selector = { search: 'applied' };
        if (onlyCurrentPage) selector.page = 'current';
        return this.table.rows(selector).data().toArray();
    }

    /**
     * Garante um array REAL dos dados crus (útil quando o DataTables devolve objetos complexos).
     */
    getArray(onlyCurrentPage = false) {
        const selector = { search: 'applied' };
        if (onlyCurrentPage) selector.page = 'current';
        const idx = this.table.rows(selector).indexes().toArray();
        return idx.map(i => this.table.row(i).data());
    }

    /**
     * Liga e chama seu callback apenas quando o estado realmente mudar.
     *
     * @param {(rows:any[], table:any)=>void} callback
     * @param {{ delay?: number, onlyCurrentPage?: boolean }} options
     * @returns {() => void} unsubscribe
     */
    hookFilteredRows(callback, options = {}) {
        // atalho: permitir passar número direto como delay
        if (typeof options === 'number') options = { delay: options };

        const mySeq = (++this._runSeq || (this._runSeq = 1)); // evita NaN por via das dúvidas

        const {
            delay = 300,
            onlyCurrentPage = false,
            // habilita alerta quando resultado ficar vazio
            alertOnEmpty = false,           // boolean ou function()
            alertConfig = {}                // { type, title, text, timeout }
        } = options;

        const maybeAlert = (hasRows) => {
            if (!alertOnEmpty) return;

            // alerta apenas na transição -> 0 linhas (ou já começa vazio)
            const shouldAlert =
                (this._lastHadRows === null && !hasRows) ||
                (this._lastHadRows === true && !hasRows);

            if (!shouldAlert) return;

            if (typeof alertOnEmpty === 'function') {
                // callback custom do usuário
                try { alertOnEmpty(); } catch (e) { }
            } else if (window.SweetAlert && typeof SweetAlert.alertAutoClose === 'function') {
                const {
                    type = "info",
                    title = "Precisamos de sua atenção",
                    text = "Seus filtros não obtiveram resultados",
                    timeout = 5000
                } = alertConfig || {};
                SweetAlert.alertAutoClose(type, title, text, timeout);
            }
        };

        const debounced = DTFiltrados.debounce(() => {
            if (!this._changed()) return;

            const mySeq = ++this._runSeq;

            const fire = () => {
                if (mySeq !== this._runSeq) return; // uma mudança mais nova chegou
                const rows = this.getArray(onlyCurrentPage);
                const hasRows = rows.length > 0;

                maybeAlert(hasRows);
                this._lastHadRows = hasRows;

                callback(rows, this.table);
            };

            // dispara após o PRÓXIMO draw (quando o filtro de fato aplicou)
            const once = () => { this.table.off('draw.dt', once); fire(); };
            this.table.on('draw.dt', once);

            // fallback: se por algum motivo não vier draw, roda no próximo tick
            setTimeout(() => {
                this.table.off('draw.dt', once);
                fire();
            }, 0);
        }, delay);

        const evts = this._eventsStr(); // 'search.dt order.dt page.dt length.dt'
        this.table.on(evts, debounced);

        const unsubscribe = () => this.table.off(evts, debounced);
        this._unsubs.push(unsubscribe);
        return unsubscribe;
    }



    /**
     * Desregistra todos os listeners criados por esta instância.
     */
    stopAll() {
        this._unsubs.forEach(u => u());
        this._unsubs = [];
    }

    // ---------- Helpers ----------

    _eventsStr() {
        return this.opts.events.map(e => `${e}.dt`).join(' ');
    }

    _snapshot() {
        const api = this.table;
        return {
            global: api.search(),
            columns: api.columns().indexes().toArray().map(i => api.column(i).search()).join('\u0001'),
            order: JSON.stringify(api.order()),
            page: api.page(),
            length: api.page.len(),
        };
    }

    _changed() {
        const now = this._snapshot();
        const cmp = this.opts.compare;
        const changed =
            (cmp.search && (now.global !== this._lastState.global || now.columns !== this._lastState.columns)) ||
            (cmp.order && now.order !== this._lastState.order) ||
            (cmp.page && now.page !== this._lastState.page) ||
            (cmp.length && now.length !== this._lastState.length);

        this._lastState = now;
        return changed;
    }

    static debounce(fn, wait = 250) {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), wait);
        };
    }
}