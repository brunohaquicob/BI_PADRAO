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

/**
 const table = __renderDataTable(...); // sua função que cria a DT
const dtf = new DTFiltrados(table, {
  events: ['search', 'order'],     // só dispara em filtro e ordenação
  compare: { search: true, order: true } // considera mudança de filtro e ordenação
});
const stop = dtf.hookFilteredRows((rows, tbl) => {
  console.log('Mudou! Linhas filtradas:', rows.length);
}, { delay: 300, onlyCurrentPage: false });

// quando não quiser mais escutar:
stop();        // descadastra só esse
// ou
dtf.stopAll(); // descadastra todos
 */
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
    hookFilteredRows(callback, { delay = 300, onlyCurrentPage = false } = {}) {
        if (typeof callback !== 'function') {
            throw new TypeError('DTFiltrados.hookFilteredRows: callback deve ser uma função');
        }

        const debounced = DTFiltrados.debounce(() => {
            if (!this._changed()) return;
            const rows = this.getArray(onlyCurrentPage);
            callback(rows, this.table);
        }, delay);

        const evts = this._eventsStr();
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


