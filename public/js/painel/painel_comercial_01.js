

$(document).ready(function () {
    carregarCoresGraficos();
    gerarSelectPicker(".multiselect-bs4");

    $('#btnBuscarDados').click(function () {
        FormValidator.validar('form_filtros_pesquisa').then((isValid) => {
            if (isValid) {
                __buscarDados();
            }
        });

    });

    setupAutoRefresh({
        select: "#refreshInterval",
        badge: "#refreshCountdown",
        onRefresh: __buscarDados
    });

});



async function __buscarDados() {
    let idForm = 'form_filtros_pesquisa';
    addLoading("card_resultados");
    const requestParams = {
        method: 'POST',
        url: window.app.routes.buscarCredor,
        data: {
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
                if (response.data !== undefined && response.data != '') {
                    tratarRetorno2(response.data);
                }
            }

        } else {
            SweetAlert.alertAutoClose("error", "Precisamos de sua atenção", response.msg, 20000);
        }
    }).catch(error => {
        alertar(error, "", "error");
    });
}


async function tratarRetorno2(dados) {

    // renderSmallBoxes(dados.cards_total, {
    //     container: "#kpis-row",
    //     colClass: "col-4",
    //     defaultColor: "bg-light",
    //     defaultIcon: "ion ion-stats-bars"
    // });

    // APAGA os small boxes antigos
    $("#kpis-row").empty();

    // Linha: HOJE
    // renderTop3Row("#kpis-row", [
    //     { id: "ac_hoje", data: dados.rank.acionamento, field: "qtd_hoje", title: "Acionamentos • Hoje", icon: "📞", decimals: 0 },
    //     { id: "acord_hoje", data: dados.rank.acordo, field: "qtd_hoje", title: "Acordos • Hoje", icon: "🤝", decimals: 0 },
    //     { id: "pag_hoje", data: dados.rank.pagamento, field: "qtd_hoje", title: "Pagamentos • Hoje", icon: "💰", decimals: 2, prefix: "R$ " }
    // ]);

    // // Linha: MÊS
    // renderTop3Row("#kpis-row", [
    //     { id: "ac_mes", data: dados.rank.acionamento, field: "qtd_mes", title: "Acionamentos • Mês", icon: "📅", decimals: 0 },
    //     { id: "acord_mes", data: dados.rank.acordo, field: "qtd_mes", title: "Acordos • Mês", icon: "📅", decimals: 0 },
    //     { id: "pag_mes", data: dados.rank.pagamento, field: "qtd_mes", title: "Pagamentos • Mês", icon: "📅", decimals: 2, prefix: "R$ " }
    // ]);

    $("#kpis-row").empty();
    const row = $('<div class="row w-100 mx-0"></div>').appendTo("#kpis-row");

    $('<div class="col-xl-4 col-lg-6 col-12 mb-3"><div id="t3_acao"></div></div>').appendTo(row);
    $('<div class="col-xl-4 col-lg-6 col-12 mb-3"><div id="t3_acor"></div></div>').appendTo(row);
    $('<div class="col-xl-4 col-lg-6 col-12 mb-3"><div id="t3_pag"></div></div>').appendTo(row);

    renderTop3CardToggle({
        container: '#t3_acao', title: 'Top 3 - Acionamentos', icon: '📞', data: dados.rank.acionamento,
        fields: [{ key: 'qtd_hoje', label: 'Hoje', decimals: 0 },
        { key: 'qtd_mes', label: 'Mês', decimals: 0 }]
    });
    renderTop3CardToggle({
        container: '#t3_acor', title: 'Top 3 - Acordos', icon: '🤝', data: dados.rank.acordo,
        fields: [{ key: 'qtd_hoje', label: 'Hoje', decimals: 0 },
        { key: 'qtd_mes', label: 'Mês', decimals: 0 }]
    });
    renderTop3CardToggle({
        container: '#t3_pag', title: 'Top 3 - Pagamentos', icon: '💰', data: dados.rank.pagamento,
        fields: [{ key: 'qtd_hoje', label: 'Hoje', decimals: 2, prefix: 'R$ ' },
        { key: 'qtd_mes', label: 'Mês', decimals: 2, prefix: 'R$ ' }]
    });



    const header_acionamento = [
        { key: "name", label: "Colaborador", type: "name", compact: true, compactLen: 15 },
        { key: "qtd_hoje", label: "Hoje", showMode: "value", decimals: 0, variant: "bar", colorMode: 'percent', progressBase: "total", aggregate: "sum", align: "center", invertColor: false, thresholds: { low: 40, mid: 60 } },
        { key: "qtd_mes", label: "Mês", showMode: "value", decimals: 0, variant: "bar", colorMode: 'percent', progressBase: "total", aggregate: "sum", align: "center", invertColor: false, thresholds: { low: 30, mid: 50 } },

    ];
    const header_acordo = [
        { key: "name", label: "Colaborador", type: "name", compact: true, compactLen: 15 },
        { key: "qtd_hoje", label: "Hoje", showMode: "value", decimals: 0, variant: "bar", colorMode: 'percent', progressBase: "total", aggregate: "sum", align: "center", invertColor: false, thresholds: { low: 40, mid: 60 } },
        { key: "qtd_mes", label: "Mês", showMode: "value", decimals: 0, variant: "bar", colorMode: 'percent', progressBase: "total", aggregate: "sum", align: "center", invertColor: false, thresholds: { low: 30, mid: 50 } },

    ];
    const header_pagamento = [
        { key: "name", label: "Colaborador", type: "name", compact: true, compactLen: 15 },
        { key: "qtd_hoje", label: "Hoje", showMode: "value", decimals: 2, variant: "bar", colorMode: 'percent', progressBase: "total", aggregate: "sum", align: "center", invertColor: false, thresholds: { low: 40, mid: 60 } },
        { key: "qtd_mes", label: "Mês", showMode: "value", decimals: 2, variant: "bar", colorMode: 'percent', progressBase: "total", aggregate: "sum", align: "center", invertColor: false, thresholds: { low: 30, mid: 50 } },

    ];


    renderRankingPanelFlex(dados.rank.acionamento, {
        containerId: "card01",
        title: "Acionamentos",
        titleIcon: "📞",
        // mapeia suas colunas e configura cada uma
        header: header_acionamento,
        // ordenar pela coluna 'val2'
        sortBy: "qtd_mes",
        limit: 12,
        animDuration: 900,
        compact: true,
        fitMode: "scroll",
        minWidthBar: 130, minWidthMini: 96, minWidthBadge: 90, minWidthNone: 80,
        aggregatePlacement: "header",
    });
    renderRankingPanelFlex(dados.rank.acordo, {
        containerId: "card02",
        title: "Acordos",
        titleIcon: "🤝",
        header: header_acordo,
        sortBy: "qtd_mes",
        limit: 12,
        animDuration: 900,
        compact: true,
        fitMode: "scroll",
        minWidthBar: 130, minWidthMini: 96, minWidthBadge: 90, minWidthNone: 80,
        aggregatePlacement: "header",
    });
    renderRankingPanelFlex(dados.rank.pagamento, {
        containerId: "card03",
        title: "Pagamentos",
        titleIcon: "💰",
        header: header_pagamento,
        sortBy: "qtd_mes",
        limit: 12,
        animDuration: 900,
        compact: true,
        fitMode: "scroll",
        minWidthBar: 130, minWidthMini: 96, minWidthBadge: 90, minWidthNone: 80,
        aggregatePlacement: "header",
    });
}

function renderRankingPanelFlex(data, opts = {}) {
    const {
        containerId,
        title = "",
        titleIcon = "★",

        // Layout & responsividade
        compact = false,                 // adiciona classe .compacto no card
        fitMode = "scroll",              // "scroll" | "none"  (scroll horizontal quando precisar)
        progressHeight = 22,
        rowGap = 3,

        // Larguras mínimas por variante (podem ser sobrescritas por coluna via header.minWidth)
        minWidthBar = 140,
        minWidthMini = 110,
        minWidthBadge = 96,
        minWidthNone = 84,

        // Nome compacto (fallback legado)
        useCompactName = true,
        compactLen = 15,

        // Ordenação e limite
        sortBy = "mes",
        limit = null,

        // Animações
        animateValues = true,
        animateBars = true,
        animDuration = 1200,

        // Legado (sem header)
        decimalsHoje = 0, decimalsMes = 0,
        prefixHoje = "", suffixHoje = "",
        prefixMes = "", suffixMes = "",
        showMode = "percent",
        thresholds = { low: 30, mid: 60 },
        progressBase = { hoje: "total", mes: "total" },
        metaHoje = null, metaHojeKey = null, metaHojeFn = null,
        metaMes = null, metaMesKey = null, metaMesFn = null,

        // Novo: colunas
        // header: [{
        //   key, label, type?="name"|"value", compact?, compactLen?, showMode?, decimals?, prefix?, suffix?,
        //   thresholds?, progressBase?, meta:{key|value|fn}?,
        //   variant?="bar"|"mini"|"badge"|"none", align?, invertColor?, minWidth?,
        //   aggregate?="sum"|"avg"|"min"|"max"|function(values,rowArray){},
        //   colorMode?="percent"|"value"   // <--- NOVO
        // }]
        header = null,

        // Onde mostrar agregados quando definidos: "header" | "footer"
        aggregatePlacement = "header",
        aggregateFooterLabel = "Total"
    } = opts;

    const $container = document.getElementById(containerId);
    if (!$container) return;

    const cid = String(containerId).replace(/[^a-z0-9_-]/gi, '');

    const _defaultCompact = (nome, maxLen = 15) => {
        if (!nome) return "";
        const parts = String(nome)
            .replace(/[\.\-_]+/g, " ").replace(/\s+/g, " ").trim()
            .split(" ").filter(Boolean)
            .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());
        if (!parts.length) return "";
        let out = parts[0];
        for (let i = 1; i < parts.length; i++) {
            const next = parts[i];
            if (out.length + 1 + next.length <= maxLen) { out += " " + next; continue; }
            const available = maxLen - out.length;
            if (available >= 3) { out += " " + next.slice(0, available - 2) + "."; }
            break;
        }
        return out;
    };

    // ===== Helpers
    const pctShare = (v, t) => t > 0 ? (v / t) * 100 : 0;
    const pctMeta = (v, m) => (m && m > 0) ? Math.min(100, Math.max(0, (v / m) * 100)) : 0;

    // Nova função de cor: compara percentuais ou valores e respeita invertColor
    const colorByThreshold = (val, th, invert = false) => {
        const t = th || { low: 30, mid: 60 };
        if (invert) {                 // menor é melhor
            if (val <= t.low) return "rk-green";
            if (val <= t.mid) return "rk-yellow";
            return "rk-red";
        } else {                      // maior é melhor
            if (val < t.low) return "rk-red";
            if (val < t.mid) return "rk-yellow";
            return "rk-green";
        }
    };

    const fmtText = (num, dec = 0, pre = "", suf = "") => {
        const n = Number(num || 0);
        const body = n.toLocaleString('pt-BR', {
            minimumFractionDigits: dec,
            maximumFractionDigits: dec
        });
        return (pre || "") + body + (suf || "");
    };

    const computeAggregate = (rows, key, agg, fnFmtDec = 0) => {
        const arr = rows.map(r => Number(r[key]) || 0);
        if (typeof agg === "function") return agg(arr, rows);
        if (!arr.length) return 0;
        switch (agg) {
            case "sum": return arr.reduce((a, b) => a + b, 0);
            case "avg": return arr.reduce((a, b) => a + b, 0) / arr.length;
            case "min": return Math.min.apply(null, arr);
            case "max": return Math.max.apply(null, arr);
            case "avg_sem_zero": {
                const nonZero = arr.filter(v => v !== 0);
                return nonZero.length ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length : 0;
            }
            default: return null;
        }
    };

    // ===== Dados
    const arrRaw = Array.isArray(data) ? data : [];
    let isLegacy = !Array.isArray(header) || header.length === 0;

    // Nome e colunas
    let cols = [];
    let colName = { key: "name", compact: useCompactName, compactLen }; // padrão
    if (!isLegacy) {
        header.forEach(h => {
            if (h.type === "name") {
                colName = { key: h.key, compact: !!h.compact, compactLen: h.compactLen ?? compactLen, label: h.label || "Nome" };
            }
        });
        cols = header
            .filter(h => h.type !== "name")
            .map(h => ({
                key: h.key,
                label: h.label || h.key,
                showMode: h.showMode || "percent",
                decimals: h.decimals ?? (h.showMode === "percent" ? 1 : 0),
                prefix: h.prefix || "",
                suffix: h.suffix || (h.showMode === "percent" ? "%" : ""),
                thresholds: h.thresholds || thresholds,
                progressBase: h.progressBase || "total",
                meta: h.meta || null,
                variant: h.variant || "bar",
                align: h.align || null,
                invertColor: !!h.invertColor,
                minWidth: h.minWidth ?? null,
                aggregate: h.aggregate ?? null,
                colorMode: h.colorMode || "value"    // value | percent
            }));
        if (cols.length === 0) isLegacy = true;
    }

    // Normalização
    const rows = arrRaw.map(r => {
        const base = { ...r };
        if (isLegacy) {
            base.name = r.name ?? "";
            base.qtd_hoje = Number(r.qtd_hoje ?? r.qtdHoje ?? 0) || 0;
            base.qtd_mes = Number(r.qtd_mes ?? r.qtdMes ?? 0) || 0;
        } else {
            base[colName.key] = r[colName.key] ?? (r.name ?? "");
            cols.forEach(c => { base[c.key] = Number(r[c.key] ?? 0) || 0; });
        }
        return base;
    });

    // Totais para % e progressBase=total
    const totals = {};
    if (isLegacy) {
        totals.hoje = rows.reduce((s, r) => s + (r.qtd_hoje || 0), 0);
        totals.mes = rows.reduce((s, r) => s + (r.qtd_mes || 0), 0);
    } else {
        cols.forEach(c => { totals[c.key] = rows.reduce((s, r) => s + (Number(r[c.key]) || 0), 0); });
    }

    // Agregados
    const aggregates = {};
    if (!isLegacy) {
        cols.forEach(c => {
            if (c.aggregate) aggregates[c.key] = computeAggregate(rows, c.key, c.aggregate, c.decimals);
        });
    }

    // Metas
    const getMetaLegacyHoje = row =>
    (typeof metaHojeFn === "function" ? metaHojeFn(row)
        : (metaHojeKey && row[metaHojeKey] != null ? Number(row[metaHojeKey])
            : (metaHoje != null ? Number(metaHoje) : null)));
    const getMetaLegacyMes = row =>
    (typeof metaMesFn === "function" ? metaMesFn(row)
        : (metaMesKey && row[metaMesKey] != null ? Number(row[metaMesKey])
            : (metaMes != null ? Number(metaMes) : null)));
    const getMetaFor = (row, colDef) => {
        if (!colDef || !colDef.meta) return null;
        const m = colDef.meta;
        if (typeof m.fn === "function") return Number(m.fn(row));
        if (m.key && row[m.key] != null) return Number(row[m.key]);
        if (m.value != null) return Number(m.value);
        return null;
    };

    // Ordenação
    const sortKey = (() => {
        if (isLegacy) {
            if (sortBy === "hoje") return { legacy: "qtd_hoje" };
            if (sortBy === "mes") return { legacy: "qtd_mes" };
            return { legacy: "qtd_mes" };
        } else {
            if (cols.some(c => c.key === sortBy)) return { key: sortBy };
            if (sortBy === "hoje") return { legacy: "qtd_hoje" };
            if (sortBy === "mes") return { legacy: "qtd_mes" };
            return { key: cols[0]?.key };
        }
    })();

    rows.sort((a, b) => {
        if (sortKey.legacy) return (b[sortKey.legacy] || 0) - (a[sortKey.legacy] || 0);
        if (sortKey.key) return (Number(b[sortKey.key]) || 0) - (Number(a[sortKey.key]) || 0);
        return 0;
    });

    const rowsCut = limit ? rows.slice(0, limit) : rows;

    // Card classes + estilo
    const cardCls = `rk-card${compact ? " compacto" : ""}`;
    const cardExtraStyle = `${fitMode === "scroll" ? "overflow-x:auto;" : ""} --rk-progress-h:${progressHeight}px; --rk-row-gap:${rowGap}px;`;

    // ==== HTML
    let html = `<div class="${cardCls}" style="${cardExtraStyle}">`;
    if (title) {
        html += `<div class="rk-title"><span class="rk-icon">${titleIcon || ""}</span><span>${title}</span></div>`;
    }
    html += `<table class="rk-table"><thead><tr>`;

    const nameLabel = isLegacy ? "Nome" : (header.find(h => h.type === "name")?.label || "Nome");
    html += `<th>${nameLabel}</th>`;

    if (isLegacy) {
        html += `<th class="text-center">Hoje</th><th class="text-center">Mês</th>`;
    } else {
        cols.forEach(c => {
            let thLabel = c.label;
            if (aggregatePlacement === "header" && c.aggregate) {
                const aggVal = aggregates[c.key];
                if (aggVal != null) thLabel += ` <br><small class="rk-agg">(${fmtText(aggVal, c.decimals, c.prefix, c.suffix)})</small>`;
            }
            html += `<th class="text-center">${thLabel}</th>`;
        });
    }
    html += `</tr></thead><tbody>`;

    // ===== Linhas
    rowsCut.forEach((r, i) => {
        const rawName = isLegacy ? r.name : (r[colName.key] ?? "");
        const nomeTxt = (isLegacy ? useCompactName : colName.compact)
            ? (typeof window.compactName === 'function'
                ? window.compactName(rawName, (isLegacy ? compactLen : colName.compactLen))
                : _defaultCompact(rawName, (isLegacy ? compactLen : colName.compactLen)))
            : rawName;

        html += `<tr><td class="rk-name" title="${String(rawName).replace(/"/g, '&quot;')}">${nomeTxt}</td>`;

        if (isLegacy) {
            const mH = getMetaLegacyHoje(r);
            const pHojeBar = (progressBase.hoje === "meta") ? pctMeta(r.qtd_hoje, mH) : pctShare(r.qtd_hoje, totals.hoje);
            const labelHojeFinal = (showMode === 'value') ? r.qtd_hoje : pctShare(r.qtd_hoje, totals.hoje);

            html += `<td class="rk-cell" style="min-width:${minWidthBar}px">
        <div class="rk-progress-wrap">
          <div class="rk-progress"><div class="rk-bar ${colorByThreshold(pHojeBar, thresholds)}" id="${cid}-bar-h-${i}" style="width:0%"></div></div>
          <div class="rk-progress-label"><span class="rk-val" id="${cid}-val-h-${i}" data-final="${labelHojeFinal}">0</span></div>
        </div>
      </td>`;

            const mM = getMetaLegacyMes(r);
            const pMesBar = (progressBase.mes === "meta") ? pctMeta(r.qtd_mes, mM) : pctShare(r.qtd_mes, totals.mes);
            const labelMesFinal = (showMode === 'value') ? r.qtd_mes : pctShare(r.qtd_mes, totals.mes);

            html += `<td class="rk-cell" style="min-width:${minWidthBar}px">
        <div class="rk-progress-wrap">
          <div class="rk-progress"><div class="rk-bar ${colorByThreshold(pMesBar, thresholds)}" id="${cid}-bar-m-${i}" style="width:0%"></div></div>
          <div class="rk-progress-label"><span class="rk-val" id="${cid}-val-m-${i}" data-final="${labelMesFinal}">0</span></div>
        </div>
      </td>`;

        } else {
            cols.forEach((c, j) => {
                const v = Number(r[c.key]) || 0;
                const metaV = getMetaFor(r, c);

                // Percentual (base para width da barra)
                const pBar = (c.progressBase === "meta")
                    ? (metaV ? Math.min(100, Math.max(0, (v / metaV) * 100)) : 0)
                    : (totals[c.key] > 0 ? (v / totals[c.key]) * 100 : 0);

                // Escolha da referência de cor: valor absoluto OU percentual
                const colorRef = (c.colorMode === "value")
                    ? v
                    : ((c.progressBase === "meta") ? pctMeta(v, metaV) : pctShare(v, totals[c.key]));

                const labelFinal = (c.showMode === "value") ? v : pctShare(v, totals[c.key]);
                const decimals = c.decimals ?? (c.showMode === "percent" ? 1 : 0);
                const prefix = c.prefix || "";
                const suffix = c.suffix || (c.showMode === "percent" ? "%" : "");
                const variant = c.variant || "bar";
                const alignCls = c.align ? c.align : (variant === "none" ? "right" : "center");
                const tdMin = c.minWidth ??
                    (variant === "bar" ? minWidthBar :
                        variant === "mini" ? minWidthMini :
                            variant === "badge" ? minWidthBadge :
                                minWidthNone);

                if (variant === "none") {
                    html += `<td class="rk-cell rk-cell-plain ${alignCls}" style="min-width:${tdMin}px">
            <span class="rk-plain-val" id="${cid}-val-${j}-${i}"
              data-final="${labelFinal}" data-decimals="${decimals}"
              data-prefix="${prefix}" data-suffix="${suffix}">0</span>
          </td>`;

                } else if (variant === "badge") {
                    const colorCls = colorByThreshold(colorRef, c.thresholds, !!c.invertColor);
                    html += `<td class="rk-cell rk-cell-badge ${alignCls}" style="min-width:${tdMin}px">
            <span class="rk-badge ${colorCls}" id="${cid}-val-${j}-${i}"
              data-final="${labelFinal}" data-decimals="${decimals}"
              data-prefix="${prefix}" data-suffix="${suffix}">0</span>
          </td>`;

                } else { // "bar" | "mini"
                    const colorCls = colorByThreshold(colorRef, c.thresholds, !!c.invertColor);
                    const miniCls = (variant === "mini") ? "rk-mini" : "";
                    html += `<td class="rk-cell ${miniCls}" style="min-width:${tdMin}px">
            <div class="rk-progress-wrap">
              <div class="rk-progress">
                <div class="rk-bar ${colorCls}" id="${cid}-bar-${j}-${i}" style="width:0%"></div>
              </div>
              <div class="rk-progress-label">
                <span class="rk-val rk-val-${c.key}" id="${cid}-val-${j}-${i}"
                  data-final="${labelFinal}" data-decimals="${decimals}"
                  data-prefix="${prefix}" data-suffix="${suffix}">0</span>
              </div>
            </div>
          </td>`;
                }
            });
        }

        html += `</tr>`;
    });

    // Footer com agregados (opcional)
    if (!isLegacy && aggregatePlacement === "footer" && Object.values(aggregates).some(v => v != null)) {
        html += `<tr class="rk-agg-row"><td class="rk-name rk-agg-name">${aggregateFooterLabel}</td>`;
        cols.forEach(c => {
            const agg = aggregates[c.key];
            if (agg == null) {
                html += `<td></td>`;
            } else {
                html += `<td class="text-center rk-agg-cell">${fmtText(agg, c.decimals, c.prefix, c.suffix)}</td>`;
            }
        });
        html += `</tr>`;
    }

    html += `</tbody></table></div>`;
    $container.innerHTML = html;

    // ===== Animações
    const setTxt = (el, v, dec, pre = "", suf = "") => $(el).text(fmtText(v, dec, pre, suf));

    rowsCut.forEach((r, i) => {
        if (isLegacy) {
            const valH = Number(document.getElementById(`${cid}-val-h-${i}`).dataset.final || 0);
            const valM = Number(document.getElementById(`${cid}-val-m-${i}`).dataset.final || 0);

            if (animateValues && typeof window.animarNumeroBRL === "function") {
                if (showMode === 'value') {
                    animarNumeroBRL($(`#${cid}-val-h-${i}`), 0, valH, animDuration, decimalsHoje, prefixHoje, suffixHoje);
                    animarNumeroBRL($(`#${cid}-val-m-${i}`), 0, valM, animDuration, decimalsMes, prefixMes, suffixMes);
                } else {
                    animarNumeroBRL($(`#${cid}-val-h-${i}`), 0, valH, animDuration, 1, "", "%");
                    animarNumeroBRL($(`#${cid}-val-m-${i}`), 0, valM, animDuration, 1, "", "%");
                }
            } else {
                if (showMode === 'value') {
                    setTxt(`#${cid}-val-h-${i}`, valH, decimalsHoje, prefixHoje, suffixHoje);
                    setTxt(`#${cid}-val-m-${i}`, valM, decimalsMes, prefixMes, suffixMes);
                } else {
                    setTxt(`#${cid}-val-h-${i}`, valH, 1, "", "%");
                    setTxt(`#${cid}-val-m-${i}`, valM, 1, "", "%");
                }
            }

            const mH = getMetaLegacyHoje(r);
            const mM = getMetaLegacyMes(r);

            const pHojeBar = (progressBase.hoje === "meta")
                ? (mH ? Math.min(100, Math.max(0, (r.qtd_hoje / mH) * 100)) : 0)
                : (totals.hoje > 0 ? (r.qtd_hoje / totals.hoje) * 100 : 0);

            const pMesBar = (progressBase.mes === "meta")
                ? (mM ? Math.min(100, Math.max(0, (r.qtd_mes / mM) * 100)) : 0)
                : (totals.mes > 0 ? (r.qtd_mes / totals.mes) * 100 : 0);

            if (animateBars) {
                $({ w: 0 }).animate({ w: pHojeBar }, {
                    duration: animDuration, easing: 'swing',
                    step: now => { document.getElementById(`${cid}-bar-h-${i}`).style.width = `${now}%`; }
                });
                $({ w: 0 }).animate({ w: pMesBar }, {
                    duration: animDuration, easing: 'swing',
                    step: now => { document.getElementById(`${cid}-bar-m-${i}`).style.width = `${now}%`; }
                });
            } else {
                document.getElementById(`${cid}-bar-h-${i}`).style.width = `${pHojeBar}%`;
                document.getElementById(`${cid}-bar-m-${i}`).style.width = `${pMesBar}%`;
            }

        } else {
            cols.forEach((c, j) => {
                const $val = document.getElementById(`${cid}-val-${j}-${i}`);
                const finalVal = Number($val.dataset.final || 0);
                const dec = Number($val.dataset.decimals || 0);
                const pre = $val.dataset.prefix || "";
                const suf = $val.dataset.suffix || "";

                if (animateValues && typeof window.animarNumeroBRL === "function") {
                    animarNumeroBRL($(`#${cid}-val-${j}-${i}`), 0, finalVal, animDuration, dec, pre, suf);
                } else if (animateValues) {
                    setTimeout(() => setTxt(`#${cid}-val-${j}-${i}`, finalVal, dec, pre, suf), animDuration);
                } else {
                    setTxt(`#${cid}-val-${j}-${i}`, finalVal, dec, pre, suf);
                }

                // manter width da barra por percentual
                const rowV = Number(rowsCut[i][c.key]) || 0;
                const metaV = getMetaFor(rowsCut[i], c);
                const pBar = (c.progressBase === "meta")
                    ? (metaV ? Math.min(100, Math.max(0, (rowV / metaV) * 100)) : 0)
                    : (totals[c.key] > 0 ? (rowV / totals[c.key]) * 100 : 0);

                if (c.variant === "bar" || c.variant === "mini" || !c.variant) {
                    if (animateBars) {
                        $({ w: 0 }).animate({ w: pBar }, {
                            duration: animDuration, easing: 'swing',
                            step: now => { document.getElementById(`${cid}-bar-${j}-${i}`).style.width = `${now}%`; }
                        });
                    } else {
                        document.getElementById(`${cid}-bar-${j}-${i}`).style.width = `${pBar}%`;
                    }
                }
            });
        }
    });
}

// ===== Helpers
function compactNameDefault(nome, maxLen = 15) {
    if (!nome) return "";
    const parts = String(nome).replace(/[\.\-_]+/g, " ").replace(/\s+/g, " ").trim()
        .split(" ").filter(Boolean)
        .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());
    if (!parts.length) return "";
    let out = parts[0];
    for (let i = 1; i < parts.length; i++) {
        const next = parts[i]; if (out.length + 1 + next.length <= maxLen) { out += " " + next; continue; }
        const avail = maxLen - out.length; if (avail >= 3) { out += " " + next.slice(0, avail - 2) + "."; }
        break;
    }
    return out;
}
function fmt(num, dec = 0, pre = "", suf = "") {
    const n = Number(num || 0);
    return pre + n.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
}

// ===== Renderiza uma linha com 3 cards (colunas bootstrap)
function renderTop3Row(targetRowSel, cards) {
    const $row = $(targetRowSel);
    const cols = cards.map((c, i) => `<div class="col-md-4 col-12 mb-3"><div id="__top3_${c.id || ('c' + i)}"></div></div>`).join("");
    $row.append(`<div class="row w-100 mx-0">${cols}</div>`);
    cards.forEach((cfg, i) => {
        renderTop3Card({
            container: `#__top3_${cfg.id || ('c' + i)}`,
            data: cfg.data, field: cfg.field,
            title: cfg.title, icon: cfg.icon,
            decimals: cfg.decimals || 0, prefix: cfg.prefix || "", suffix: cfg.suffix || ""
        });
    });
}

function renderTop3Card({
    container, data, field, title, icon = "🏆",
    decimals = 0, prefix = "", suffix = "", compactLen = 16,
    bare = false // <= novo
}) {
    const rows = Array.isArray(data) ? data.slice() : [];
    rows.sort((a, b) => (Number(b[field]) || 0) - (Number(a[field]) || 0));
    const top3 = rows.slice(0, 3);
    const total = rows.reduce((s, r) => s + (Number(r[field]) || 0), 0);
    const maxVal = top3.reduce((m, r) => Math.max(m, Number(r[field]) || 0), 0) || 1;

    let open = "", head = "", close = "";
    if (!bare) {
        open = `<div class="top3-card">`;
        head = `<div class="top3-head">
              <div class="left"><span class="icon">${icon}</span><span>${title || ""}</span></div>
            </div>`;
        close = `</div>`;
    }

    let html = `${open}${head}<div class="top3-list">`;
    const medalCls = ["gold", "silver", "bronze"];

    function line(i, r) {
        const v = r ? Number(r[field]) || 0 : 0;
        const share = total > 0 ? (v / total) * 100 : 0;
        const name = r ? compactNameDefault(r.name, compactLen) : "—";
        const barPct = maxVal > 0 ? (v / maxVal) * 100 : 0;
        const rankCls = i === 0 ? 'gold' : (i === 1 ? 'silver' : 'bronze');
        return `
      <div class="top3-item ${rankCls}">
        <div class="top3-medal ${medalCls[i]}">${i + 1}</div>
        <div>
          <div class="top3-name" title="${r ? (r.name || '').replace(/"/g, '&quot;') : ''}">${name}</div>
          <div class="top3-sub">${r ? fmt(share, 1, "", "%") : "—"} de participação</div>
        </div>
        <div class="top3-right">${r ? fmt(v, decimals, prefix, suffix) : "—"}</div>
        <div class="top3-bar-wrap"><div class="top3-bar"><span style="width:0%"></span></div></div>
      </div>`;
    }

    for (let i = 0; i < 3; i++) html += line(i, top3[i]);
    html += `</div>${close}`;

    $(container).html(html);

    // anima a barra
    $(container).find(".top3-item").each(function (i) {
        const $bar = $(this).find(".top3-bar > span");
        const v = top3[i] ? Number(top3[i][field]) || 0 : 0;
        const pct = maxVal > 0 ? (v / maxVal) * 100 : 0;
        setTimeout(() => $bar.css("width", pct + "%"), 50 + i * 80);
    });
}


function renderTop3CardToggle({ container, data, title, icon = "🏆", fields }) {
    $(container).html(`
    <div class="top3-card dense">
      <div class="top3-head">
        <div class="left"><span class="icon">${icon}</span><span>${title}</span></div>
        <div class="btn-group btn-group-sm modes" role="group">
          ${fields.map((f, i) => `
            <button class="btn btn-xs ${i ? 'btn-light' : 'btn-primary active'}"
                    data-field="${f.key}" data-decimals="${f.decimals || 0}"
                    data-prefix="${f.prefix || ''}" data-suffix="${f.suffix || ''}">
              ${f.label}
            </button>`).join("")}
        </div>
      </div>
      <div class="top3-slot"></div>
    </div>`);

    const renderMode = f => renderTop3Card({
        container: container + " .top3-slot",
        data, field: f.key, decimals: f.decimals || 0, prefix: f.prefix || "", suffix: f.suffix || "",
        bare: true // <= aqui! só a lista, sem cabeçalho/ícone
    });

    renderMode(fields[0]);
    $(container).on('click', '.modes .btn', function () {
        $(this).addClass('btn-primary active').removeClass('btn-light')
            .siblings().removeClass('btn-primary active').addClass('btn-light');
        renderMode({
            key: $(this).data('field'),
            decimals: Number($(this).data('decimals') || 0),
            prefix: $(this).data('prefix') || '',
            suffix: $(this).data('suffix') || '',
        });
    });
}


