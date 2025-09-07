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
                const spec = (vc.spec !== undefined ? vc.spec : vc.spc);
                if (spec === undefined) {
                    if (typeof console !== 'undefined') console.warn('[pieBreakdownByMulti] valueCol sem spec/spc:', vc);
                    continue;
                }
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

function animarNumeroBRL(
    elemento,
    valorInicial,
    valorFinal,
    duracao = 2000,
    decimal = 2,
    prefix = "R$ ",
    sufix = "",
    returnPromise = false // <- NOVO, opcional
) {
    function setValor(el, valorFormatado) {
        var tag = el.prop("tagName").toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "select") {
            el.val(valorFormatado);
        } else {
            el.html(valorFormatado);
        }
    }

    const $els = $(elemento);
    if (!returnPromise) {
        // Comportamento antigo (compatível)
        $els.each(function () { animarUm($(this)); });
        return; // nada retornado, como antes
    }

    // Novo: resolve quando TODOS os elementos terminarem
    const promises = [];
    $els.each(function () {
        promises.push(new Promise((resolve) => animarUm($(this), resolve)));
    });
    return Promise.all(promises);

    function animarUm(el, done) {
        var vi = valorInicial;
        if (vi === undefined || vi === null || vi === "") vi = 0;
        else if (typeof vi === "string") vi = moneyToDouble(vi);
        else if (typeof vi !== "number") vi = 0;

        var vf = valorFinal;
        if (vf === undefined || vf === null || vf === "") {
            var textoAtual = "";
            var tag = el.prop("tagName").toLowerCase();
            if (tag === "input" || tag === "textarea" || tag === "select") {
                textoAtual = el.val() || "0";
            } else {
                textoAtual = el.text() || "0";
            }
            vf = moneyToDouble(textoAtual);
        } else if (typeof vf === "string") vf = moneyToDouble(vf);
        else if (typeof vf !== "number") vf = 0;

        if (vi === vf) {
            setValor(el, doubleToMoney(vf, decimal));
            if (done) done();
            return;
        }

        setValor(el, doubleToMoney(vi, decimal));

        $({ contador: vi }).animate(
            { contador: vf },
            {
                duration: duracao,
                easing: 'swing',
                step: function (now) {
                    numberStepBRL(now, { elem: el[0] });
                },
                complete: function () {
                    numberStepBRL(vf, { elem: el[0] });
                    if (done) done();
                }
            }
        );

        function numberStepBRL(now, tween) {
            var formatted = now.toFixed(decimal).replace('.', ',');
            var parts = formatted.split(',');
            var inteiroComPonto = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            setValor($(tween.elem), prefix + inteiroComPonto + (decimal > 0 ? ',' + parts[1] : '') + sufix);
        }
    }
}

/**
 * Renderiza uma grade de small-box (AdminLTE3) com animação de valores
 * e % opcional no subtítulo.
 *
 * @param {Array} items  -> seu array de objetos
 * @param {Object} opts  -> opções de layout/defalt
 *   - container: seletor do container (ex: "#kpis-row")
 *   - colClass: classes de coluna Bootstrap (default: "col-12 col-sm-6 col-md-3 col-lg-3")
 *   - defaultColor: classe bg-* (default: "bg-success")
 *   - defaultIcon: classe do ícone (default: "ion ion-stats-bars")
 *   - showPercentWhenMissing: se true, reserva o espaço do (%) mesmo sem valor (default: false)
 */
function renderSmallBoxes(items, opts = {}) {
    const {
        container = "#kpis-row",
        colClass = "col-12 col-sm-6 col-md-3 col-lg-3",
        defaultColor = "bg-success",
        defaultIcon = "ion ion-stats-bars",
        showPercentWhenMissing = false
    } = opts;
    $(container).empty();
    const $wrap = $(container);
    if (!$wrap.length) {
        console.warn("Container não encontrado:", container);
        return;
    }

    items.forEach(it => {
        const idVal = it.animar_id;                       // id do span do valor
        const idPct = it.animar_id + "-pct";              // id do span do percentual
        const color = (it.color && it.color.trim()) ? it.color.trim() : defaultColor; // ex: "bg-success", "bg-info"
        const icon = (it.icon && it.icon.trim()) ? it.icon.trim() : defaultIcon;  // ex: "ion ion-social-usd"
        const text = it.text || "";
        const prefix = (typeof it.animar_prefix === "string") ? it.animar_prefix : "";
        const sufix = (typeof it.animar_sufix === "string") ? it.animar_sufix : "";
        const tempo = Number(it.animar_tempo) || 2000;
        const dec = Number(it.animar_decimal) || 0;

        // % opcional (passe em it.percent_value como número: 11.82 para "11,82%")
        const hasPercent = typeof it.percent_value === "number";
        const pctDec = Number(it.percent_decimals != null ? it.percent_decimals : 2);
        const pctSuffix = it.percent_suffix != null ? String(it.percent_suffix) : "%";
        const pctPrefix = it.percent_prefix != null ? String(it.percent_prefix) : "";

        const pctText = hasPercent
            ? formatPercentBR(it.percent_value, pctDec, pctPrefix, pctSuffix)
            : (showPercentWhenMissing ? "<b id='" + idPct + "'></b>" : "");

        // monta o bloco
        const html = `
        <div class="${colClass}">
            <div class="small-box ${color}">
            <div class="inner">
                <h3><span id="${idVal}">0</span></h3>
                <p>
                <span class="sbx-label">${escapeHTML(text)}</span>
                ${hasPercent || showPercentWhenMissing ? ` (<b id="${idPct}">${pctText || ""}</b>)` : ""}
                </p>
            </div>
            <div class="icon">
                <i class="${icon}"></i>
            </div>
            </div>
        </div>
        `;

        const $node = $(html);
        $wrap.append($node);

        // anima o valor
        // começa do zero por padrão; se quiser inicial diferente, passe em it.animar_valor_inicial
        const vi = (typeof it.animar_valor_inicial === "number") ? it.animar_valor_inicial : 0;
        animarNumeroBRL(
            "#" + idVal,
            vi,
            Number(it.animar_valor) || 0,
            tempo,
            dec,
            prefix,
            sufix
        );

        // se percent_value veio depois/assíncrono, pode-se atualizar com updateSmallBoxPercent(...)
    });

    // util: atualiza valor com animação, depois de já renderizado
    //   ex.: updateSmallBoxValue("68bb3d2ad13ab", 9999.99, {decimal:2, tempo:1500, prefix:"R$ "});
    window.updateSmallBoxValue = function (animar_id, novoValor, cfg = {}) {
        animarNumeroBRL(
            "#" + animar_id,
            cfg.valorInicial != null ? Number(cfg.valorInicial) : undefined,
            Number(novoValor) || 0,
            cfg.tempo != null ? Number(cfg.tempo) : 1200,
            cfg.decimal != null ? Number(cfg.decimal) : 2,
            cfg.prefix != null ? String(cfg.prefix) : "",
            cfg.sufix != null ? String(cfg.sufix) : ""
        );
    };

    // util: atualiza o % depois (caso calcule depois do render)
    //   ex.: updateSmallBoxPercent("68bb3d2ad13ab", 11.82)
    window.updateSmallBoxPercent = function (animar_id, percentNumber, decs = 2, prefix = "", suffix = "%") {
        const $pct = $("#" + animar_id + "-pct");
        if ($pct.length) {
            $pct.html(formatPercentBR(percentNumber, decs, prefix, suffix));
        }
    };

    // helpers
    function formatPercentBR(num, decs, prefix, suffix) {
        if (typeof num !== "number" || isNaN(num)) return "";
        const f = num.toFixed(decs).replace(".", ",");
        return `${prefix}${f}${suffix}`;
    }

    function escapeHTML(s) {
        return String(s).replace(/[&<>"']/g, m => (
            { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]
        ));
    }
}

/**
 * Cria um controlador de auto-refresh com contador visual
 *
 * @param {Object} opts
 * @param {string|HTMLElement} opts.select - seletor ou elemento <select> com os intervalos (em ms)
 * @param {string|HTMLElement} opts.badge  - seletor ou elemento <span> para mostrar o countdown
 * @param {Function} opts.onRefresh        - função a ser executada a cada refresh
 */
function setupAutoRefresh({ select, badge, onRefresh }) {
    const $select = typeof select === "string" ? document.querySelector(select) : select;
    const $badge = typeof badge === "string" ? document.querySelector(badge) : badge;

    let refreshMs = 0;
    let countdownId = null;
    let remainingMs = 0;

    function fmtMMSS(ms) {
        const s = Math.max(0, Math.floor(ms / 1000));
        const m = Math.floor(s / 60);
        const ss = String(s % 60).padStart(2, "0");
        return `${m}:${ss}`;
    }

    function setBadgeHTML(html) {
        if ($badge) $badge.innerHTML = html;
    }

    function updatePillState(msRemaining, active) {
        if (!$badge) return;

        $badge.classList.remove("refresh-on", "refresh-off", "refresh-soon");

        if (!active) {
            $badge.classList.add("refresh-off");
            setBadgeHTML(`<i class="fas fa-bolt mr-1"></i>Desativado`);
            return;
        }

        const secs = Math.max(0, Math.floor(msRemaining / 1000));
        const m = Math.floor(secs / 60);
        const s = String(secs % 60).padStart(2, "0");
        const label = `${m}:${s}`;

        if (secs <= 10) {
            $badge.classList.add("refresh-soon");
            setBadgeHTML(`<i class="fas fa-hourglass-half mr-1"></i>Atualiza em ${label}`);
        } else {
            $badge.classList.add("refresh-on");
            setBadgeHTML(`<i class="fas fa-sync-alt mr-1"></i>Atualiza em ${label}`);
        }
    }

    function stopAutoRefresh() {
        if (countdownId) { clearInterval(countdownId); countdownId = null; }
        remainingMs = 0;
        updatePillState(remainingMs, false);
    }

    function startAutoRefresh(ms) {
        stopAutoRefresh();
        refreshMs = ms;
        remainingMs = ms;
        updatePillState(remainingMs, true);

        countdownId = setInterval(async () => {
            remainingMs -= 1000;
            if (remainingMs <= 0) {
                try {
                    if (typeof onRefresh === "function") await onRefresh();
                } finally {
                    remainingMs = refreshMs;
                }
            }
            updatePillState(remainingMs, true);
        }, 1000);
    }

    // eventos
    if ($select) {
        $select.addEventListener("change", function () {
            const valor = parseInt(this.value, 10) || 0;
            if (valor > 0) startAutoRefresh(valor);
            else stopAutoRefresh();
        });

        // init no load
        const valor = parseInt($select.value, 10) || 0;
        if (valor > 0) startAutoRefresh(valor); else stopAutoRefresh();
    }

    // retorno: permite controle manual se precisar
    return { startAutoRefresh, stopAutoRefresh };
}
