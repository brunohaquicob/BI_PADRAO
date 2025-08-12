class Utilitarios {

    static limparFormulario(formId) {
        $('#' + formId + ' :input').val('');
    }

    static preencheSelect(selectId, options) {
        const selectElement = document.getElementById(selectId);
        // Limpa as opções existentes no <select>
        selectElement.innerHTML = '';
        // Adiciona as novas opções ao <select>
        options.forEach(option => {
            const optionElement = document.createElement('option');
            const optionValues = typeof option === 'object' ? Object.values(option) : option;
            optionElement.value = optionValues[0];
            optionElement.textContent = optionValues[1];
            if (optionValues.length >= 3 && optionValues[2] === true) {
                optionElement.selected = true;
            }
            selectElement.appendChild(optionElement);
        });
    }

    static preencheSelectDualListBox(selectId, optDisponiveis, optSelecionadas) {
        var selectElement = $(`#${selectId}`);
        optDisponiveis = objetoToArray(optDisponiveis);
        optSelecionadas = objetoToArray(optSelecionadas);
        //Limpando options
        selectElement.empty();
        // Gerar as opções
        if (Array.isArray(optDisponiveis)) {
            optDisponiveis.forEach(option => {
                const optionValues = option;
                var option = $('<option>', {
                    value: optionValues[0],
                    text: optionValues[1],
                });
                selectElement.append(option);
            });
        }
        if (Array.isArray(optSelecionadas)) {
            //Selecionadas
            optSelecionadas.forEach(option => {
                const optionValues = option;
                var option = $('<option>', {
                    value: optionValues[0],
                    text: optionValues[1],
                    selected: true
                });
                selectElement.append(option);
            });
        }
        // Reinicializar o Bootstrap Dual Listbox
        if (selectElement.data('plugin_bootstrapDualListbox')) {
            selectElement.bootstrapDualListbox('refresh', true);;
        } else {
            selectElement.bootstrapDualListbox();
        }
    }

    static preencherFormularioPeloName(objeto, formId) {
        var formulario = $("#" + formId);

        $.each(objeto, function (chave, valor) {
            var elemento = formulario.find(`[name="${chave}"]`);

            if (elemento.length > 0) {
                elemento.val(valor);
            }
        });
    }

    static criarInfoBox(idDiv, classBg, texto, valores, icone = 'far fa-flag') {

        // Exemplo de uso:
        /*
        var valoresExemplo = [
            { label: 'Aguardando', value: '45.678' },
            { label: 'Iniciado', value: '45.678' },
            { label: 'Finalizado', value: '455.671' }
        ];

        criarInfoBox('DivID', 'bg-success', 'Insertadora', valoresExemplo, 'far fa-flag');
        */

        // Criação do elemento principal
        var infoBox = document.createElement('div');
        infoBox.className = 'info-box shadow-sm';

        // Criação do ícone com a cor de fundo
        var icon = document.createElement('span');
        icon.className = 'info-box-icon ' + classBg;
        icon.innerHTML = '<i class="' + icone + '"></i>';
        infoBox.appendChild(icon);

        // Criação do conteúdo da caixa
        var content = document.createElement('div');
        content.className = 'info-box-content';

        // Adiciona o texto principal
        var textNumber = document.createElement('span');
        textNumber.className = 'info-box-number';
        textNumber.textContent = texto;
        content.appendChild(textNumber);

        // Adiciona os valores usando o array fornecido
        var ar_animate = [];
        for (var i = 0; i < valores.length; i++) {
            var paragraph = document.createElement('p');
            paragraph.className = 'm-0 p-0';
            paragraph.innerHTML = valores[i].label + ': <strong class="float-right" id="' + idDiv + '_campo' + i + '">0</strong>';
            content.appendChild(paragraph);
            ar_animate.push(valores[i].value);
        }
        // Adiciona o estilo line-height ao conteúdo
        content.style.lineHeight = '1.3';
        // Adiciona o conteúdo à caixa principal
        infoBox.appendChild(content);

        // Adiciona a caixa ao elemento com o ID fornecido
        var divContainer = document.getElementById(idDiv);
        divContainer.innerHTML = "";
        divContainer.appendChild(infoBox);
        //Preencher e animar campos
        for (var i = 0; i < ar_animate.length; i++) {
            animarCampo((idDiv + '_campo' + i), ar_animate[i], 0);
        }
    }

    static createInfoBox2(boxText, boxNumber, total, boxColor, parentId) {
        let progressWidth = (boxNumber / total) * 100;
        // Create main info-box div
        let infoBox = document.createElement('div');
        infoBox.className = `info-box ${boxColor}`;

        // Create icon span
        let iconSpan = document.createElement('span');
        iconSpan.className = 'info-box-icon';
        let icon = document.createElement('i');
        icon.className = 'fas fa-credit-card';
        iconSpan.appendChild(icon);

        // Create content div
        let contentDiv = document.createElement('div');
        contentDiv.className = 'info-box-content';

        // Create text span
        let textSpan = document.createElement('span');
        textSpan.className = 'info-box-text';
        textSpan.id = '';
        textSpan.innerText = boxText;

        // Create number span
        let numberSpan = document.createElement('span');
        numberSpan.className = 'info-box-number';
        numberSpan.id = '';
        numberSpan.innerText = `${doubleToMoney(boxNumber, 0)}`;

        // Create progress div
        let progressDiv = document.createElement('div');
        progressDiv.className = 'progress';
        let progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.id = '';
        progressBar.style.width = `${progressWidth}%`;
        progressDiv.appendChild(progressBar);

        // Create description span
        let descriptionSpan = document.createElement('span');
        descriptionSpan.className = 'progress-description';
        descriptionSpan.id = '';
        descriptionSpan.innerText = `${doubleToMoney(progressWidth, 2)}% de um total de ${doubleToMoney(total, 0)}`;

        // Append all elements to content div
        contentDiv.appendChild(textSpan);
        contentDiv.appendChild(numberSpan);
        contentDiv.appendChild(progressDiv);
        contentDiv.appendChild(descriptionSpan);

        // Append icon and content to main info-box div
        infoBox.appendChild(iconSpan);
        infoBox.appendChild(contentDiv);

        // Append infoBox to the specified parent element
        let parentElement = document.getElementById(parentId);
        if (parentElement) {
            parentElement.appendChild(infoBox);
        } else {
            console.error(`Parent element with ID "${parentId}" not found.`);
        }

        return infoBox;
    }

    static createSmallBox(containerId, text, value, total, color, footerValue = "", icon = "fas fa-credit-card", textoFooter = "Filtrar") {
        const percentage = ((value / total) * 100).toFixed(2);
        const total_formatado = doubleToMoney(total, 0);
        const smallBox = `
            <div class="small-box ${color}">
                <div class="inner">
                    <h3><span id='${containerId}_valor'></span> (<span id='${containerId}_percentual'></span><sup style="font-size: 20px">%</sup>)</h3>
                    <p>${text}</p>
                </div>
                <div class="icon">
                    <i class="${icon}"></i>
                </div>
                <a href="#" class="small-box-footer smallBoxClick" data-footer-value="${footerValue}">
                    ${textoFooter} <i class="fas fa-arrow-circle-right"></i>
                </a>
            </div>
        `;

        document.getElementById(containerId).innerHTML = smallBox;
        animarCampo(containerId + '_valor', value, 0);
        animarCampo(containerId + '_percentual', percentage, 2);
        // document.querySelector(`#${containerId} .small-box-footer`).addEventListener('click', function(event) {
        //     event.preventDefault();
        //     const footerData = this.getAttribute('data-footer-value');
        //     console.log('Footer Value:', footerData);
        //     // Adicione aqui o código para capturar o valor do footer ao clicar
        // });
    }

    /**
     * Soma múltiplas colunas, opcionalmente agrupando por uma coluna-chave.
     *
     * @param {any[][]} rows              - Linhas (cada linha é um array).
     * @param {number[]|Object} valueCols - Array de índices ou objeto label->índice.
     * @param {number} [keyCol]           - Índice da coluna-chave (opcional).
     * @returns {Object} Totais gerais ou { chave: { label: soma } }
     */
    static sumColumns(rows, valueCols, keyCol) {
        const toNum = v => Number(v) || 0;

        // Normaliza labels
        const labels = Array.isArray(valueCols)
            ? valueCols.map(col => [String(col), col])
            : Object.entries(valueCols);

        const makeZeroObj = () =>
            Object.fromEntries(labels.map(([label]) => [label, 0]));

        // Se não tem chave, soma total
        if (keyCol == null) {
            const total = makeZeroObj();
            for (const r of rows) {
                for (const [label, col] of labels) {
                    total[label] += toNum(r[col]);
                }
            }
            return total;
        }

        // Com chave, agrupa
        const out = {};
        for (const r of rows) {
            const key = r[keyCol];
            const acc = (out[key] ||= makeZeroObj());
            for (const [label, col] of labels) {
                acc[label] += toNum(r[col]);
            }
        }
        return out;
    }

    static sumColumnsFormula(rows, valueCols, keyCol) {
        const toNum = v => Number(v) || 0;

        const labels = Object.entries(valueCols);

        const makeZeroObj = () =>
            Object.fromEntries(labels.map(([label]) => [label, 0]));

        // Helper: avalia fórmula tipo "6-5+4"
        const evalExpr = (expr, row) => {
            const safeExpr = expr.replace(/(\d+)/g, 'toNum(row[$1])');
            return eval(safeExpr); // ← confia nas colunas (não é user input!)
        };

        if (keyCol == null) {
            const total = makeZeroObj();
            for (const r of rows) {
                for (const [label, col] of labels) {
                    total[label] += typeof col === 'string'
                        ? evalExpr(col, r)
                        : toNum(r[col]);
                }
            }
            return total;
        }

        const out = {};
        for (const r of rows) {
            const key = r[keyCol];
            const acc = (out[key] ||= makeZeroObj());
            for (const [label, col] of labels) {
                acc[label] += typeof col === 'string'
                    ? evalExpr(col, r)
                    : toNum(r[col]);
            }
        }
        return out;
    }

    static parsePtNumber(v) {
        if (typeof v === 'number') return v;
        if (v == null || v === '') return 0;

        let s = String(v).trim()
            .replace(/\s/g, '')
            .replace(/[R$\u00A0€£¥]/g, '');

        // negativo entre parênteses
        let neg = false;
        if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }

        // se tem vírgula decimal e ponto de milhar: 1.234,87 -> 1234.87
        if (/,/.test(s) && /\.\d{3}/.test(s)) s = s.replace(/\./g, '').replace(',', '.');
        // se só tem vírgula: 123,87 -> 123.87
        else if (/,/.test(s)) s = s.replace(',', '.');
        // se só tem ponto (padrão US): 1,234.87 -> 1234.87
        else s = s.replace(/,/g, '');

        const n = parseFloat(s);
        return neg ? -n : (isFinite(n) ? n : 0);
    }

    static pieBreakdownBy(rows, {
        keyCol,          // ex.: 1
        groupCol,        // ex.: 2
        valueCol,        // ex.: 6  | '6 - 7' | 'Recebido - Aberto' | (r,get,num)=>...
        keyTransform = k => k,
        groupTransform = g => g,
        topN = 0,  // mantém só topN grupos por key (resto -> "Outros")
        minPct = 0,  // agrupa < minPct% em "Outros"
        valueClampMin = null, // ex.: 0 para não deixar fatia negativa
        toNumber = v => (typeof v === 'number'
            ? v
            : (Number(String(v).replace(/\./g, '').replace(',', '.')) || 0)),
    } = {}) {
        const get = (r, col) => (typeof col === 'number' ? r[col] : r[col]);

        // calcula valor a partir de índice/nome, expressão "+/-" ou função
        const computeValue = (r, spec) => {
            if (typeof spec === 'function') return spec(r, get, toNumber);

            if (typeof spec === 'string' && /[+\-]/.test(spec)) {
                const expr = spec.replace(/\s+/g, '');
                const terms = expr.match(/([+\-]?)[^+\-]+/g) || [];
                let acc = 0;

                for (let t of terms) {
                    let sign = 1;
                    if (t[0] === '+') t = t.slice(1);
                    else if (t[0] === '-') { sign = -1; t = t.slice(1); }

                    let v;
                    if (/^\d+$/.test(t)) {                  // "5" -> coluna índice 5
                        v = toNumber(get(r, Number(t)));
                    } else if (/^\d+\.\d+$/.test(t)) {      // "1.5" -> literal 1.5
                        v = parseFloat(t);
                    } else {                                // "Recebido" -> nome da coluna
                        v = toNumber(get(r, t));
                    }
                    acc += sign * v;
                }
                return acc;
            }

            // caso simples: índice ou nome
            return toNumber(get(r, spec));
        };

        // 1) agrega por key -> group
        const acc = {};
        for (const r of rows) {
            const keyRaw = get(r, keyCol); if (keyRaw == null) continue;
            const groupRaw = get(r, groupCol); if (groupRaw == null || groupRaw === '') continue;

            let val = computeValue(r, valueCol);
            if (valueClampMin != null && val < valueClampMin) val = valueClampMin; // opcional

            const key = keyTransform(String(keyRaw)).trim();
            if (!key) continue;
            const group = groupTransform(String(groupRaw));

            (acc[key] ??= {});
            acc[key][group] = (acc[key][group] || 0) + val;
        }

        // 2) aplica topN / minPct por key (opcional)
        if (topN > 0 || minPct > 0) {
            for (const k of Object.keys(acc)) {
                const pairs = Object.entries(acc[k]);
                const total = pairs.reduce((s, [, v]) => s + v, 0) || 1;

                let kept = pairs
                    .sort((a, b) => b[1] - a[1])
                    .filter(([, v], i) => (topN ? i < topN : true))
                    .filter(([, v]) => (minPct ? (v / total * 100) >= minPct : true));

                const keptSet = new Set(kept.map(([g]) => g));
                const outrosSum = pairs
                    .filter(([g]) => !keptSet.has(g))
                    .reduce((s, [, v]) => s + v, 0);

                const obj = Object.fromEntries(kept);
                if (outrosSum > 0) obj['Outros'] = (obj['Outros'] || 0) + outrosSum;
                acc[k] = obj;
            }
        }

        return acc; // { '2025-01': { 'Fase X': 123, ... }, ... }
    }

    // ➜ substitua sua função por esta versão (ou aplique as partes marcantes)
    static pieBreakdownByMulti(rows, {
        keyCol,
        groupCol,
        valueCols,
        keyTransform = k => k,
        groupTransform = g => g,
        topN = 0,
        minPct = 0,
        rankBy = null,
        valueClampMin = null,
        toNumber = v => (typeof v === 'number' ? v : (Number(String(v).replace(/\./g, '').replace(',', '.')) || 0)),
        derived = [],
        columnsOrder = null,
        returnAs = 'object',            // 'object' | 'array' | 'rows'
        otherLabel = 'Outros',
        // 🔥 novo: controle da ordem dos grupos
        groupOrder = 'input',           // 'input' | 'asc' | 'desc' | Array<string>
        groupOrderUnknown = 'end',      // 'end' | 'start' | number (posição dos não listados)
        orderNormalize = s => String(s) // normalizador para comparar com groupOrder
    } = {}) {

    const get = (r, col) => (typeof col === 'number' ? r[col] : r[col]);


    const computeValue = (r, spec) => {
        if (typeof spec === 'function') return spec(r, get, toNumber);
        if (typeof spec === 'string' && /[+\-]/.test(spec)) {
            const expr = spec.replace(/\s+/g, '');
            const terms = expr.match(/([+\-]?)[^+\-]+/g) || [];
            let acc = 0;
            for (let t of terms) {
                let sign = 1;
                if (t[0] === '+') t = t.slice(1);
                else if (t[0] === '-') { sign = -1; t = t.slice(1); }
                let v;
                if (/^\d+$/.test(t)) v = toNumber(get(r, Number(t)));
                else if (/^\d+\.\d+$/.test(t)) v = parseFloat(t);
                else v = toNumber(get(r, t));
                acc += sign * v;
            }
            return acc;
        }
        return toNumber(get(r, spec));
    };

    const clampMinFor = (name) => {
        if (valueClampMin == null) return null;
        if (typeof valueClampMin === 'number') return valueClampMin;
        if (typeof valueClampMin === 'object' && valueClampMin[name] != null) return valueClampMin[name];
        return null;
    };

    // --- 1) agrega e guarda ordem de 1ª ocorrência por key ---
    const acc = {};
    const orderByKey = {};           // <- aqui guardamos a ordem real

    for (const r of rows) {
        const keyRaw = get(r, keyCol); if (keyRaw == null) continue;
        const groupRaw = get(r, groupCol); if (groupRaw == null || groupRaw === '') continue;

        const key = keyTransform(String(keyRaw)).trim(); if (!key) continue;
        const group = groupTransform(String(groupRaw));

        (acc[key] ??= {});
        (acc[key][group] ??= {});
        (orderByKey[key] ??= []);
        if (!orderByKey[key].includes(group)) orderByKey[key].push(group); // <- 1ª vez que vemos esse grupo

        for (const vc of valueCols) {
            const name = vc.name ?? String(vc.spec);
            let val = computeValue(r, vc.spec);
            const minClamp = clampMinFor(name);
            if (minClamp != null && val < minClamp) val = minClamp;
            acc[key][group][name] = (acc[key][group][name] || 0) + val;
        }
    }

    // --- 2) topN/minPct (opcional) ---
    if (topN > 0 || minPct > 0) {
        let rankFn;
        if (typeof rankBy === 'function') rankFn = rankBy;
        else if (typeof rankBy === 'string') rankFn = sums => +sums[rankBy] || 0;
        else if (typeof rankBy === 'number') {
            const n = valueCols[rankBy]?.name ?? String(valueCols[rankBy]?.spec);
            rankFn = sums => +sums[n] || 0;
        } else {
            const firstName = valueCols[0]?.name ?? String(valueCols[0]?.spec);
            rankFn = sums => +sums[firstName] || 0;
        }

        for (const k of Object.keys(acc)) {
            const pairs = Object.entries(acc[k]);
            const totalRank = pairs.reduce((s, [, sums]) => s + rankFn(sums), 0) || 1;

            let kept = pairs
                .sort((a, b) => rankFn(b[1]) - rankFn(a[1]))
                .filter(([, sums], i) => (topN ? i < topN : true))
                .filter(([, sums]) => (minPct ? (rankFn(sums) / totalRank * 100) >= minPct : true));

            const keptSet = new Set(kept.map(([g]) => g));
            const outros = {};
            for (const [g, sums] of pairs) {
                if (keptSet.has(g)) continue;
                for (const [name, v] of Object.entries(sums)) {
                    outros[name] = (outros[name] || 0) + v;
                }
            }
            const hasOutros = Object.values(outros).some(v => v > 0);

            const obj = {};
            for (const [g, sums] of kept) obj[g] = sums;
            if (hasOutros) obj[otherLabel] = outros;
            acc[k] = obj;

            // ajusta ordem para manter kept + Outros no fim
            orderByKey[k] = Object.keys(obj);
        }
    }
    // ===== 2.5) ORDENAR grupos conforme groupOrder =====
    const cmpPt = (a, b) => String(a).localeCompare(String(b), 'pt-BR', { numeric: true, sensitivity: 'base' });

    const hasCustomOrder = Array.isArray(groupOrder);
    const orderMap = hasCustomOrder
        ? groupOrder.map(orderNormalize).reduce((m, v, i) => (m[v] = i, m), {})
        : null;

    for (const k of Object.keys(acc)) {
        // separa pares e mantém "Outros" para o fim (se existir)
        let entries = Object.entries(acc[k]);
        let outros = null;
        entries = entries.filter(([g, sums]) => {
            if (g === otherLabel) { outros = [g, sums]; return false; }
            return true;
        });

        // se for 'input', não fazemos nada (a ordem é a de agregação)
        if (hasCustomOrder) {
            // ordena por índice do array fornecido
            const unknownPos = (typeof groupOrderUnknown === 'number')
                ? groupOrderUnknown
                : (groupOrderUnknown === 'start' ? -1 : Number.MAX_SAFE_INTEGER);

            entries.sort(([g1], [g2]) => {
                const i1 = (orderMap[orderNormalize(g1)] ?? unknownPos);
                const i2 = (orderMap[orderNormalize(g2)] ?? unknownPos);
                if (i1 !== i2) return i1 - i2;
                return cmpPt(g1, g2); // desempate estável e legível
            });
        } else if (groupOrder === 'asc' || groupOrder === 'desc') {
            entries.sort((a, b) => groupOrder === 'asc' ? cmpPt(a[0], b[0]) : cmpPt(b[0], a[0]));
        }
        // 'input' => deixa como está

        // remonta acc[k] preservando a ordem calculada (e "Outros" no fim)
        const ordered = {};
        for (const [g, sums] of entries) ordered[g] = sums;
        if (outros) ordered[outros[0]] = outros[1];
        acc[k] = ordered;
    }

    // --- 3) métricas derivadas ---
    if (derived?.length) {
        for (const k of Object.keys(acc)) {
            for (const g of Object.keys(acc[k])) {
                const sums = acc[k][g];
                for (const d of derived) {
                    try { sums[d.name] = d.fn(sums, k, g); }
                    catch { sums[d.name] = 0; }
                }
            }
        }
    }

    // --- 4) ordenação de colunas (métricas) ---
    const baseOrder = valueCols.map(vc => vc.name ?? String(vc.spec));
    const derivOrder = (derived || []).map(d => d.name);
    const finalOrder = (columnsOrder && columnsOrder.length)
        ? columnsOrder.slice()
        : baseOrder.concat(derivOrder);

    for (const k of Object.keys(acc)) {
        for (const g of Object.keys(acc[k])) {
            const sums = acc[k][g];
            const ordered = {};
            for (const name of finalOrder) if (name in sums) ordered[name] = sums[name];
            for (const name of Object.keys(sums)) if (!(name in ordered)) ordered[name] = sums[name];
            acc[k][g] = ordered;
        }
    }

    // --- 5) saída ---
    // decide ordem dos GROUPS
    const orderFor = (k) => {
        if (Array.isArray(groupOrder)) return groupOrder; // ordem custom
        if (typeof groupOrder === 'function') {
            return Object.keys(acc[k]).sort(groupOrder);
        }
        if (groupOrder === 'alpha') {
            return Object.keys(acc[k]).sort((a, b) => String(a).localeCompare(String(b)));
        }
        // default: 'input' => usa exatamente a ordem capturada ao agregar
        return orderByKey[k] || Object.keys(acc[k]);
    };

    // ===== 5) formato de retorno =====
    if (returnAs === 'rows') {
        const out = {};
        for (const k of Object.keys(acc)) {
            out[k] = Object.entries(acc[k]).map(([group, sums]) => ({ group, ...sums }));
        }
        return out;
    }

    if (returnAs === 'array') {
        const out = {};
        for (const k of Object.keys(acc)) {
            out[k] = {};
            for (const g of orderFor(k)) {
                const arr = [];
                const sums = acc[k][g] || {};
                for (const name of finalOrder) if (name in sums) arr.push({ name, value: sums[name] });
                for (const name of Object.keys(sums)) if (!finalOrder.includes(name)) arr.push({ name, value: sums[name] });
                out[k][g] = arr;
            }
        }
        return out;
    }

    // 'object'
    const out = {};
    for (const k of Object.keys(acc)) {
        out[k] = {};
        for (const g of orderFor(k)) out[k][g] = acc[k][g];
    }
    return out;
}



    /**
     * Soma colunas pelo nome (baseado no cabeçalho na primeira linha).
     * Opcionalmente agrupa por uma coluna chave (também pelo nome).
     * 
     * @param {any[][]} rows - Array com o cabeçalho na primeira linha.
     * @param {string[]} sumCols - Nomes das colunas para somar.
     * @param {string} [keyColName] - Nome da coluna para agrupar (opcional).
     * @returns {Object} Objeto com as somas totais ou agrupadas por chave.
     */
    static sumByColumnName(rows, sumCols, keyColName) {
    if (rows.length === 0) return {};

    const header = rows[0];
    const dataRows = rows.slice(1);

    const toNum = v => Number(v) || 0;

    // Mapeia nome para índice
    const colIndexMap = header.reduce((acc, colName, i) => {
        acc[colName] = i;
        return acc;
    }, {});

    // Pega índices das colunas para somar
    const labelsAndIndices = sumCols.map(name => {
        if (!(name in colIndexMap)) {
            throw new Error(`Coluna para somar "${name}" não encontrada no cabeçalho`);
        }
        return [name, colIndexMap[name]];
    });

    // Se keyColName foi passada, pega índice
    let keyColIndex = null;
    if (keyColName) {
        if (!(keyColName in colIndexMap)) {
            throw new Error(`Coluna chave "${keyColName}" não encontrada no cabeçalho`);
        }
        keyColIndex = colIndexMap[keyColName];
    }

    const makeZeroObj = () =>
        Object.fromEntries(labelsAndIndices.map(([label]) => [label, 0]));

    if (keyColIndex === null) {
        // Soma total simples
        const total = makeZeroObj();
        for (const row of dataRows) {
            for (const [label, idx] of labelsAndIndices) {
                total[label] += toNum(row[idx]);
            }
        }
        return total;
    }

    // Agrupado por chave
    const out = {};
    for (const row of dataRows) {
        const key = row[keyColIndex];
        const acc = (out[key] ||= makeZeroObj());
        for (const [label, idx] of labelsAndIndices) {
            acc[label] += toNum(row[idx]);
        }
    }
    return out;
}
}

class AjaxRequest {
    static sendRequest({ method, url, data = {}, formId = '' }) {
        return new Promise((resolve, reject) => {
            let requestData = {};
            if (formId !== '') {
                const formData = new FormData(document.getElementById(formId));
                for (const [key, value] of formData.entries()) {
                    if (requestData.hasOwnProperty(key)) {
                        // Verifique se o nome do campo contém []
                        if (key.includes('[]')) {
                            // Se o valor já for um array, adicione o novo valor a ele.
                            if (Array.isArray(requestData[key])) {
                                requestData[key].push(value);
                            } else {
                                // Se o valor não for um array, crie um novo array com os valores existentes e o novo valor.
                                requestData[key] = [requestData[key], value];
                            }
                        }
                    } else {
                        requestData[key] = value;
                    }
                }
            }
            requestData = { ...requestData, ...data };
            if (!requestData.hasOwnProperty('_token') && method == 'POST') {
                const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
                requestData['_token'] = csrfToken;
            }
            $.ajax({
                method: method,
                url: url,
                data: requestData,
                dataType: 'json',
                success: response => resolve(response),
                error: (xhr, status, error) => {
                    if (xhr.responseJSON && xhr.responseJSON.errors) {
                        // Itera sobre os erros e exibe-os
                        $.each(xhr.responseJSON.errors, function (field, errors) {
                            // Exibe cada erro na console ou em algum elemento HTML
                            console.log('Campo: ' + field);
                            console.log('Erros: ' + errors.join(', '));
                        });
                    }
                    console.log(xhr.responseText);
                    reject(error)
                }
            });
        });
    }
}
