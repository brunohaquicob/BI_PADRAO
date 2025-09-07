

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

    renderSmallBoxes(dados.cards_total, {
        container: "#kpis-row",
        colClass: "col-4",
        defaultColor: "bg-light",
        defaultIcon: "ion ion-stats-bars"
    });

    renderRankingPanel(dados.rank.acionamento, {
        containerId: "card01",
        title: "Top Acionamentos",
        titleIcon: "📈",            // pode trocar por 💰, ⭐, 📈 ...
        showMode: "value",         // ou "percent"
        prefixHoje: "",
        prefixMes: "",
        decimalsHoje: 0,
        decimalsMes: 0,
        // thresholds: { low: 10, mid: 30 },
        sortBy: "mes",
        useCompactName: true,
        compactLen: 12,
        animateValues: true,
        animateBars: true,
        animDuration: 1200,
        rowGap: 3,            // menos espaço entre as linhas
        progressHeight: 25,   // barras mais altas
        // progressBase: { hoje: "total", mes: "meta" },
        progressBase: { hoje: "meta", mes: "meta" }, // <- barras calculadas vs META
        // metaHoje: 1000,                      // cada pessoa: barra = qtd_hoje / 1000
        // metaMes: 60000,                      // cada pessoa: barra = qtd_mes  / 20000
        metaHojeKey: "meta_hoje",
        metaMesKey: "meta_mes"
    });
    renderRankingPanel(dados.rank.acordo, {
        containerId: "card02",
        title: "Top Acordos",
        titleIcon: "⭐",
        showMode: "value",
        useCompactName: true,
        compactLen: 12,
        prefixHoje: "",
        prefixMes: "",
        decimalsHoje: 0,
        decimalsMes: 0,
        progressBase: { hoje: "meta", mes: "meta" },
        metaHojeKey: "meta_hoje",
        metaMesKey: "meta_mes"
    });
    renderRankingPanel(dados.rank.pagamento, {
        containerId: "card03",
        title: "Top Pagamentos",
        titleIcon: "💰",
        showMode: "value",
        useCompactName: true,
        compactLen: 12,
        progressBase: { hoje: "meta", mes: "meta" },
        metaHojeKey: "meta_hoje",
        metaMesKey: "meta_mes",
        prefixHoje: "R$ ",
        prefixMes: "R$ ",
        decimalsHoje: 2,
        decimalsMes: 2,
    });


}

/* helper opcional para compactar nome */
function compactName(nome, maxLen = 18) {
    if (!nome) return "";
    const parts = nome.replace(/[\.\-_]+/g, " ").replace(/\s+/g, " ").trim()
        .split(" ").filter(Boolean)
        .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());
    if (!parts.length) return "";
    let out = parts[0];
    for (let i = 1; i < parts.length; i++) {
        const next = parts[i];
        if ((out.length + 1 + next.length) <= maxLen) { out += " " + next; continue; }
        const available = maxLen - out.length;
        if (available >= 3) { const take = available - 2; out += " " + next.slice(0, take) + "."; }
        break;
    }
    return out;
}

function renderRankingPanel(data, opts = {}) {
    const {
        containerId,
        title = "",
        titleIcon = "★",
        useCompactName = true,
        compactLen = 15,

        // formatação de labels
        decimalsHoje = 0, decimalsMes = 0,
        prefixHoje = "", suffixHoje = "",
        prefixMes = "", suffixMes = "",
        showMode = "percent",    // 'percent' | 'value'  (label apenas)

        // cores por faixa (% da barra)
        thresholds = { low: 30, mid: 60 },    // <low = vermelho; <mid = amarelo; >=mid = verde
        sortBy = "mes",
        limit = null,

        // animações
        animateValues = true,
        animDuration = 1200,
        animateBars = true,

        // layout (integram com suas CSS vars)
        progressHeight = 25,
        rowGap = 3,

        // *** progress: base de cálculo das barras (NÃO afeta label) ***
        progressBase = { hoje: "total", mes: "total" },  // 'total' | 'meta'

        // metas (3 formas; prioridade: Fn > Key > Global)
        metaHoje = null, metaHojeKey = null, metaHojeFn = null,
        metaMes = null, metaMesKey = null, metaMesFn = null
    } = opts;

    const $container = document.getElementById(containerId);
    if (!$container) return;

    // prefixo seguro para IDs únicos por card
    const cid = String(containerId).replace(/[^a-z0-9_-]/gi, '');

    // fallback de compactação se usuário não tiver passado compactName global
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

    const arr = (Array.isArray(data) ? data : []).map(r => ({
        ...r,
        name: r.name ?? "",
        qtd_hoje: Number(r.qtd_hoje ?? r.qtdHoje ?? 0) || 0,
        qtd_mes: Number(r.qtd_mes ?? r.qtdMes ?? 0) || 0
    }));

    // totais (para quando progressBase = 'total' ou label = 'percent')
    const totalHoje = arr.reduce((s, r) => s + (r.qtd_hoje || 0), 0);
    const totalMes = arr.reduce((s, r) => s + (r.qtd_mes || 0), 0);

    // helpers de meta
    const getMetaHoje = (row) =>
    (typeof metaHojeFn === "function" ? metaHojeFn(row)
        : (metaHojeKey && row[metaHojeKey] != null ? Number(row[metaHojeKey])
            : (metaHoje != null ? Number(metaHoje) : null)));

    const getMetaMes = (row) =>
    (typeof metaMesFn === "function" ? metaMesFn(row)
        : (metaMesKey && row[metaMesKey] != null ? Number(row[metaMesKey])
            : (metaMes != null ? Number(metaMes) : null)));

    // % utilitárias
    const pctShare = (v, t) => t > 0 ? (v / t) * 100 : 0;
    const pctMeta = (v, m) => (m && m > 0) ? Math.min(100, Math.max(0, (v / m) * 100)) : 0;

    const barClass = p => (p < thresholds.low) ? "rk-red" : (p < thresholds.mid) ? "rk-yellow" : "rk-green";

    // ordenação
    if (sortBy === "mes") arr.sort((a, b) => (b.qtd_mes - a.qtd_mes));
    if (sortBy === "hoje") arr.sort((a, b) => (b.qtd_hoje - a.qtd_hoje));
    const rows = limit ? arr.slice(0, limit) : arr;

    // === HTML
    let html = `<div class="rk-card" style="--rk-progress-h:${progressHeight}px; --rk-row-gap:${rowGap}px;">`;
    if (title) {
        html += `<div class="rk-title"><span class="rk-icon">${titleIcon || ""}</span><span>${title}</span></div>`;
    }
    html += `<table class="rk-table">
        <thead><tr>
        <th>Nome</th><th class="text-center">Hoje</th><th class="text-center">Mês</th>
        </tr></thead><tbody>`;

    rows.forEach((r, i) => {
        const nomeTxt = useCompactName
            ? (typeof window.compactName === 'function' ? window.compactName(r.name, compactLen) : _defaultCompact(r.name, compactLen))
            : r.name;

        // barra (preenchimento + cor) pode usar meta
        const metaH = getMetaHoje(r);
        const metaM = getMetaMes(r);

        const pHojeBar = (progressBase.hoje === "meta")
            ? pctMeta(r.qtd_hoje, metaH)
            : pctShare(r.qtd_hoje, totalHoje);

        const pMesBar = (progressBase.mes === "meta")
            ? pctMeta(r.qtd_mes, metaM)
            : pctShare(r.qtd_mes, totalMes);

        // label (independente do progress)
        const labelHojeFinal = (showMode === 'value') ? r.qtd_hoje : pctShare(r.qtd_hoje, totalHoje);
        const labelMesFinal = (showMode === 'value') ? r.qtd_mes : pctShare(r.qtd_mes, totalMes);
        
        html += `
        <tr>
            <td class="rk-name" title="${r.name}">${nomeTxt}</td>

            <td class="rk-cell">
            <div class="rk-progress-wrap">
                <div class="rk-progress">
                <div class="rk-bar ${barClass(pHojeBar)}" id="${cid}-bar-h-${i}" style="width:0%"></div>
                </div>
                <div class="rk-progress-label">
                <span class="rk-val rk-val-hoje" id="${cid}-val-h-${i}" data-final="${labelHojeFinal}">0</span>
                </div>
            </div>
            </td>

            <td class="rk-cell">
            <div class="rk-progress-wrap">
                <div class="rk-progress">
                <div class="rk-bar ${barClass(pMesBar)}" id="${cid}-bar-m-${i}" style="width:0%"></div>
                </div>
                <div class="rk-progress-label">
                <span class="rk-val rk-val-mes" id="${cid}-val-m-${i}" data-final="${labelMesFinal}">0</span>
                </div>
            </div>
            </td>
        </tr>`;
    });

    html += `</tbody></table></div>`;
    $container.innerHTML = html;

    // === Animações
    rows.forEach((r, i) => {
        const valH = Number(document.getElementById(`${cid}-val-h-${i}`).dataset.final || 0);
        const valM = Number(document.getElementById(`${cid}-val-m-${i}`).dataset.final || 0);

        // labels (sua função)
        if (animateValues) {
            if (showMode === 'value') {
                animarNumeroBRL($(`#${cid}-val-h-${i}`), 0, valH, animDuration, decimalsHoje, prefixHoje, suffixHoje);
                animarNumeroBRL($(`#${cid}-val-m-${i}`), 0, valM, animDuration, decimalsMes, prefixMes, suffixMes);
            } else {
                animarNumeroBRL($(`#${cid}-val-h-${i}`), 0, valH, animDuration, 1, "", "%");
                animarNumeroBRL($(`#${cid}-val-m-${i}`), 0, valM, animDuration, 1, "", "%");
            }
        } else {
            const setTxt = (el, v, dec, pre = "", suf = "") =>
                $(el).text((pre || "") + Number(v || 0).toFixed(dec).replace('.', ',') + (suf || ""));
            if (showMode === 'value') {
                setTxt(`#${cid}-val-h-${i}`, valH, decimalsHoje, prefixHoje, suffixHoje);
                setTxt(`#${cid}-val-m-${i}`, valM, decimalsMes, prefixMes, suffixMes);
            } else {
                setTxt(`#${cid}-val-h-${i}`, valH, 1, "", "%");
                setTxt(`#${cid}-val-m-${i}`, valM, 1, "", "%");
            }
        }

        // barras (meta ou total, conforme progressBase)
        const metaH = getMetaHoje(rows[i]);
        const metaM = getMetaMes(rows[i]);

        const pHojeBar = (progressBase.hoje === "meta")
            ? (metaH ? Math.min(100, Math.max(0, (rows[i].qtd_hoje / metaH) * 100)) : 0)
            : (totalHoje > 0 ? (rows[i].qtd_hoje / totalHoje) * 100 : 0);

        const pMesBar = (progressBase.mes === "meta")
            ? (metaM ? Math.min(100, Math.max(0, (rows[i].qtd_mes / metaM) * 100)) : 0)
            : (totalMes > 0 ? (rows[i].qtd_mes / totalMes) * 100 : 0);

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
    });
}