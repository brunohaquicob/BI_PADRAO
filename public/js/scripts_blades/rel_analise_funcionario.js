

$(document).ready(function () {
    carregarCoresGraficos();
    gerarSelectPicker(".selectpickerNovo");

    $('#btnBuscarDados').click(function () {
        FormValidator.validar('form_filtros_pesquisa').then((isValid) => {
            if (isValid) {
                __buscarDados();
            }
        });

    });

});

function __buscarDados() {
    let idForm = 'form_filtros_pesquisa';
    let div_retorno = 'card_1';
    const requestParams = {
        method: 'POST',
        url: window.app.routes.buscarCredor,
        data: {
        },
        formId: idForm
    };
    startLadda();
    AjaxRequest.sendRequest(requestParams).then(response => {
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
                if (response.data.tabela !== undefined && response.data.tabela != '') {

                    tratarRetorno(response.data.tabela, div_retorno);
                }
            }

        } else {
            SweetAlert.alertAutoClose("error", "Precisamos de sua atenção", response.msg, 20000);
        }
        stopLadda();
    }).catch(error => {
        stopLadda();
        alertar(error, "", "error");
    });
}

document.addEventListener("DOMContentLoaded", function () {

});

async function tratarRetorno(dados, divTabela) {
    // dados = objeto no formato que você mandou (múltiplos IDs)
    montarCardsResumo(dados, divTabela, {
        // Forçar que todos os cards usem as mesmas colunas (datas) — opcional:
        // forcedDates: ['2025-08-01','2025-08-02', ...],
        // Opcional: renomear linhas:
        labelsMap: {
            qtd_acionamentos: 'Acionamentos',
            qtd_acionamentos_direto: 'Acion. Direto',
            qtd_acionamentos_direto_acordo: 'Acion. Direto Acordo',
            qtd_devedor_acionado: 'Devedores Acionados',
            qtd_pagamentos_p: 'Primeiro Pagamentos',
            qtd_pagamentos_c: 'Colchão Pagamentos',
            qtd_devedor_pago_p: 'Primeiro Pgto (Devedores)',
            qtd_devedor_pago_c: 'Colchão Pgto (Devedores)'
        },

        // Opcional: ligar DataTables
        useDatatables: false, // true se quiser
        dtOptions: { paging: false, searching: false, info: false, ordering: false, scrollX: true },

        // Placeholder para info-box (vamos preencher depois)
        infoboxRenderer: function ($row, outros, payload) {
            // Exemplo simples de 2 info-box (AdminLTE3)
            const box = (titulo, valor, icon = 'fa-coins', bg = 'bg-info', size = 3) => `
            <div class="col-6 col-md-${size}">
                <div class="info-box ${bg}">
                <span class="info-box-icon"><i class="fas ${icon}"></i></span>
                <div class="info-box-content">
                    <span class="info-box-text">${escapeHtml(titulo)}</span>
                    <span class="info-box-number">${fmtNum(valor)}</span>
                </div>
                </div>
            </div>`;
            $row.html(
                box('Recebido Primeiro Pgto', outros.vl_pago_p || 0, 'fa-hand-holding-usd', 'bg-success') +
                box('Recebido Colchão', outros.vl_pago_c || 0, 'fa-hand-holding-usd', 'bg-success') +
                box('Em Aberto Primeira Parcela', outros.vl_aberto_p || 0, 'fa-hand-holding-usd', 'bg-warning') +
                box('Em Aberto Colchão', outros.vl_aberto_c || 0, 'fa-hand-holding-usd', 'bg-warning') +
                box('Honorario Pgto', outros.vl_honorario_p + outros.vl_honorario_c || 0, 'fa-hand-holding-usd', 'bg-info', 6) +
                box('Comissão  Pgto', outros.vl_comissao_p + outros.vl_comissao_c || 0, 'fa-hand-holding-usd', 'bg-info', 6) +
                ""
            );
        },
        hideZeros: true,            // ficar só com números relevantes
        zeroPlaceholder: '',        // ou '·'
        highlightWeekends: true     // fds amarelinho suave
    });


}

// ===== Helpers =====
function escapeHtml(s) {
    return String(s).replace(/[&<>"'`=\/]/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;'
    }[c]));
}
function fmtHeader(iso) {
    // "YYYY-MM-DD" -> "D/M"
    const [y, m, d] = String(iso).split('-');
    if (!y || !m || !d) return iso;
    return `${parseInt(d, 10)}/${parseInt(m, 10)}`;
}
function fmtNum(v) { return (Number(v) || 0).toLocaleString('pt-BR'); }

function resolveDates(linhas, forcedDates) {
    if (Array.isArray(forcedDates) && forcedDates.length) return forcedDates.slice();
    const set = new Set();
    Object.values(linhas || {}).forEach(row => {
        Object.keys(row || {}).forEach(k => { if (k !== 'total') set.add(k); });
    });
    return Array.from(set).sort(); // YYYY-MM-DD ordena lexicograficamente
}

function orderKeys(keys, desiredOrder) {
    if (!Array.isArray(desiredOrder) || !desiredOrder.length) return keys;
    const wanted = [], rest = [];
    const set = new Set(keys);
    desiredOrder.forEach(k => { if (set.has(k)) { wanted.push(k); set.delete(k); } });
    set.forEach(k => rest.push(k));
    rest.sort();
    return wanted.concat(rest);
}

function prettyLabel(key, labelsMap, prettyLabels) {
    if (labelsMap && labelsMap[key]) return labelsMap[key];
    if (!prettyLabels) return key;
    return String(key)
        .replace(/^qtd_/, '')
        .replace(/_/g, ' ')
        .replace(/\b([a-z])/g, (m) => m.toUpperCase());
}

// ===== Tabela por dataset =====
function isWeekendISO(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    const wd = dt.getUTCDay(); // 0 dom, 6 sáb
    return wd === 0 || wd === 6;
}

function buildTableHTML(linhas, options = {}) {
    const cfg = Object.assign({
        showTotalCol: true,
        prettyLabels: true,
        labelsMap: null,
        lineOrder: null,
        forcedDates: null,
        tableClass: 'table table-bordered table-hover table-striped table-sm table-sticky tabular-nums',
        highlightWeekends: true,
        hideZeros: false,          // true = mostra vazio nos zeros
        zeroPlaceholder: ''        // ou '·'
    }, options);

    const datas = resolveDates(linhas, cfg.forcedDates);
    const hasTotalInSome = Object.values(linhas || {}).some(
        row => Object.prototype.hasOwnProperty.call(row || {}, 'total')
    );

    const allLineKeys = Object.keys(linhas || {});
    const lineKeys = orderKeys(allLineKeys, cfg.lineOrder);

    let html = '';
    html += `<div class="table-responsive"><table class="${cfg.tableClass} js-resumo" style="min-width:900px;">`;

    // THEAD
    html += '<thead class="thead-light"><tr>';
    html += '<th style="white-space:nowrap;">&nbsp;</th>';
    datas.forEach(dt => {
        const wk = (cfg.highlightWeekends && isWeekendISO(dt)) ? ' col-weekend' : '';
        html += `<th title="${escapeHtml(dt)}" class="text-center${wk}" style="white-space:nowrap;">${fmtHeader(dt)}</th>`;
    });
    if (cfg.showTotalCol || hasTotalInSome) {
        html += '<th class="text-center" style="white-space:nowrap;">Total</th>';
    }
    html += '</tr></thead>';

    // TBODY
    html += '<tbody>';
    lineKeys.forEach(chave => {
        const row = linhas[chave] || {};
        let soma = 0;

        html += '<tr>';
        html += `<th style="white-space:nowrap;">${escapeHtml(prettyLabel(chave, cfg.labelsMap, cfg.prettyLabels))}</th>`;

        datas.forEach(dt => {
            const v = Number(row[dt] || 0);
            soma += v;
            const wk = (cfg.highlightWeekends && isWeekendISO(dt)) ? ' col-weekend' : '';
            const display = (cfg.hideZeros && v === 0) ? cfg.zeroPlaceholder : fmtNum(v);
            html += `<td class="text-center${wk}">${display}</td>`;
        });

        if (cfg.showTotalCol || hasTotalInSome) {
            const totalFinal = Object.prototype.hasOwnProperty.call(row, 'total') ? Number(row.total || 0) : soma;
            html += `<td class="text-center font-weight-bold">${fmtNum(totalFinal)}</td>`;
        }
        html += '</tr>';
    });
    html += '</tbody></table></div>';
    return html;
}

// ===== Cards para múltiplos datasets =====
/**
 * @param {Object} pacote     Ex.: { "3047": { title, linhas, outros }, "4974": {...} }
 * @param {String} targetId   ID da div onde os cards serão injetados
 * @param {Object} [opts]
 *   - forcedDates: []       => força mesmas colunas (datas) em todos os cards
 *   - lineOrder: []         => ordem das linhas
 *   - labelsMap: {}         => renomeia linhas
 *   - showTotalCol: bool
 *   - prettyLabels: bool
 *   - tableClass: string
 *   - useDatatables: bool   => inicializa DataTables nas tabelas geradas
 *   - dtOptions: {}         => opções extras do DataTables
 *   - infoboxRenderer: fn($container, outros, payload) => renderiza info-box personalizados
 */
function montarCardsResumo(pacote, targetId, opts = {}) {
    const cfg = Object.assign({
        showTotalCol: true,
        prettyLabels: true,
        labelsMap: null,
        //lineOrder: ['qtd_acionamentos', 'qtd_devedor_acionado', 'qtd_acionamentos_direto', 'qtd_pagamentos_p', 'qtd_pagamentos_c', 'qtd_devedor_pago_p', 'qtd_devedor_pago_c'],
        forcedDates: null,
        tableClass: 'table table-bordered table-hover table-sm small sem-quebra',
        useDatatables: false,
        dtOptions: { paging: false, searching: false, info: false, ordering: false, scrollX: true, autoWidth: false },
        infoboxRenderer: null
    }, opts);

    // Se quiser unificar datas automaticamente com base no primeiro dataset:
    if (!cfg.forcedDates) {
        const firstKey = Object.keys(pacote || {})[0];
        if (firstKey) cfg.forcedDates = resolveDates((pacote[firstKey] || {}).linhas);
    }
    console.log(pacote)
    let html = '';
    Object.entries(pacote || {}).forEach(([id, payload], idx) => {
        const titulo = (payload && payload.title) ? payload.title : id;
        const linhas = (payload && payload.linhas) || {};
        const outros = (payload && payload.outros) || {};

        const tabelaHTML = buildTableHTML(linhas, {
            showTotalCol: cfg.showTotalCol,
            prettyLabels: cfg.prettyLabels,
            labelsMap: cfg.labelsMap,
            lineOrder: cfg.lineOrder,
            forcedDates: cfg.forcedDates,
            tableClass: cfg.tableClass
        });


        html += `
        <div class="card card-outline card-primary mb-3">
            <div class="card-header ui-sortable-handle" style="cursor: move;">
                <h3 class="card-title" style="margin-top: 5px;">
                    <i class="fas fa-clipboard-check"></i>
                    <span>${escapeHtml(titulo)}</span>
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
            <div class="card-body p-2">
            <!-- Placeholder para INFO-BOX personalizados -->
            <div class="row mb-2" id="infobox-${escapeHtml(id)}">
                <!-- exemplo (será preenchido via infoboxRenderer) -->
            </div>
            ${tabelaHTML}
            </div>
        </div>
        `;
    });

    $('#' + targetId).html(html);

    // Inicializa DataTables (opcional)
    if (cfg.useDatatables && $.fn.DataTable) {
        $('#' + targetId + ' table.js-resumo').each(function () {
            const localOpts = Object.assign({}, cfg.dtOptions);
            $(this).DataTable(localOpts);
        });
    }

    // Chama o renderer de info-box, se fornecido
    if (typeof cfg.infoboxRenderer === 'function') {
        Object.entries(pacote || {}).forEach(([id, payload]) => {
            const $cont = $('#infobox-' + id);
            try { cfg.infoboxRenderer($cont, (payload && payload.outros) || {}, payload); } catch (e) { /* silencioso */ }
        });
    }
}




