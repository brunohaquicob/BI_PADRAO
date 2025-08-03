function ajaxRequest(routeName, postData = {}, successCallback, errorCallback) {
    var _token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    $('.select-all-group').prop('selected', false);
    $.ajax({
        url: routeName,
        type: 'POST',
        dataType: 'json',
        data: Object.assign({ _token: _token }, postData),
        success: successCallback,
        error: errorCallback
    });
}

function objetoToArray(obj) {
    if (Array.isArray(obj)) {
        // Se for um array, percorrer cada elemento e convertê-lo em array
        return obj.map(element => objetoToArray(element));
    } else if (typeof obj === 'object' && obj !== null) {
        // Se for um objeto, converter os valores em array
        return Object.values(obj).map(value => objetoToArray(value));
    }

    // Se não for um objeto nem um array, retornar o valor original
    return obj;
}

//MODAL
function abrirModal(id, limpa_form = false) {
    if (limpa_form === true) {
        Utilitarios.limparFormulario(id + 'Form');
        $('#' + id + 'Save').data('id', '');
        $('#' + id + 'Update').data('id', '');
    }
    $(`#${id}`).modal("show");
}
function fecharModal(id) {
    $(`#${id}`).modal("hide");
}

function adicionarClassesPorClasse(procurar, classes) {
    const objetos = $(procurar); // Seleciona todos os elementos com a classe procurada
    objetos.each(function () {
        const elemento = $(this);

        // Verifica se o elemento existe
        if (elemento.length) {
            // Itera sobre o array de classes
            classes.forEach(function (classe) {
                // Verifica se a classe já está presente no elemento
                if (!elemento.hasClass(classe)) {
                    // Adiciona a classe ao elemento
                    elemento.addClass(classe);
                }
            });
        }
    });
}

function criaTabelaPadrao(procurar = '', opcoes = {}) {
    procurar = procurar == '' ? '.dataTablePadrao' : procurar;
    const objetos = $(procurar); // Seleciona todos os elementos com a classe procurada
    let classes = ['table', 'table-bordered', 'table-hover', 'table-striped', 'w100perc'];
    objetos.each(function () {
        const elemento = $(this);
        // Verifica se o elemento existe
        if (elemento.length) {
            // Itera sobre o array de classes
            classes.forEach(function (classe) {
                // Verifica se a classe já está presente no elemento
                if (!elemento.hasClass(classe)) {
                    // Adiciona a classe ao elemento
                    elemento.addClass(classe);
                }
            });
        }
    });
    $(procurar).DataTable(opcoes);
    ajustaDataTable();
    $(procurar).on('order.dt', function () {
        $(this).DataTable().columns.adjust();
    });
}
function ajustaDataTable() {
    //Trata dataTable Modal
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        $($.fn.dataTable.tables(true)).DataTable()
            .columns.adjust();
    });

}
//Adicionar loading na div, apaga o conteudo para gerar um novo apos concluido o ajax
function addLoading(id) {
    var divResultados = $(`#${id}`);
    var overlay = $('<div class="overlay"></div>'); // Cria a camada de bloqueio
    var loadingOverlay = $('<div id="loading-overlay"></div>'); // Cria a div para o spinner
    var loadingSpinner = $('<div id="loading-spinner"></div>'); // Cria o spinner

    overlay.append(loadingOverlay); // Adiciona a div do spinner à camada de bloqueio
    loadingOverlay.append(loadingSpinner); // Adiciona o spinner à div do spinner

    divResultados.append(overlay); // Adiciona a camada de bloqueio à div de resultados
}
function removeLoading(id) {
    var divResultados = $(`#${id}`);
    divResultados.find('.overlay').remove(); // Remove a camada de bloqueio
}
function formatarValorMonetario(valor, casasDecimais = 2, mostrarRS = false) {
    if (mostrarRS)
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: casasDecimais });
    else
        return valor.toLocaleString('pt-BR', { minimumFractionDigits: casasDecimais });
}

function animarCampo(idCampo, valorFinal, casasDecimais = 2) {
    var campo = $("#" + idCampo);

    campo.prop("number", 0).animateNumber(
        {
            number: valorFinal,
            numberStep: function (now, tween) {
                var formattedValue = doubleToMoney(now, casasDecimais);
                campo.text(formattedValue);
            },
        },
        {
            duration: 2000, // Duração da animação em milissegundos
            easing: "swing", // Opções de easing (pode ser ajustado conforme desejado)
        }
    );
}
//Alertar
function alertar(texto, sub = "", tipo = 'success') {
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };

    // Chama a função toastr apropriada com base no valor de tipo
    if (tipo === 'success') {
        toastr.success(texto, sub);
    } else if (tipo === 'error') {
        toastr.error(texto, sub);
    } else if (tipo === 'warning') {
        toastr.warning(texto, sub);
    } else if (tipo === 'info') {
        toastr.info(texto, sub);
    }
}

//DateRangePicker
function getStartDate(id, format = 'YYYY-MM-DD') {
    let dateRangePicker = $('#' + id).data('daterangepicker');
    return dateRangePicker.startDate.format(format);
}
function getEndDate(id, format = 'YYYY-MM-DD') {
    let dateRangePicker = $('#' + id).data('daterangepicker');
    return dateRangePicker.endDate.format(format);
}
function getRangeDate(id) {
    var dateRangePicker = $('#' + id).data('daterangepicker');
    var startDate = dateRangePicker.startDate.format('YYYY-MM-DD');
    var endDate = dateRangePicker.endDate.format('YYYY-MM-DD');

    return [startDate, endDate];

}

//UTIL
/*
 Converte um valor em formato money (. e m) para double
 @param valor(string) - o valor string (1.234,00)
 @return valor(double) - o valor em float
 */
function moneyToDouble2(valor) {
    valor = "" + valor;
    valor = valor.split('.').join('').replace(',', '.');
    return (valor * 1);
}
function moneyToDouble(value) {
    // Verifica se já é um número ou um número válido
    if (typeof value === "number") {
        return value; // Retorna o número se já for um double
    }

    if (typeof value === "string") {
        // Verifica se a string já é um número válido
        let normalizedValue = value.replace(',', '.');
        if (!isNaN(normalizedValue) && !isNaN(parseFloat(normalizedValue))) {
            return parseFloat(normalizedValue);
        }

        // Se não for um número válido, tenta remover os separadores e converter
        let cleanedValue = value.replace(/\./g, '').replace(',', '.');
        if (!isNaN(cleanedValue) && !isNaN(parseFloat(cleanedValue))) {
            return parseFloat(cleanedValue);
        }
    }

    throw new Error("O valor fornecido não pode ser convertido em número.");
}
/*
 Converte um valor em formato float para uma string em formato moeda
 @param valor(float) - o valor float
 @return valor(string) - o valor em moeda
 */
function doubleToMoney(num, decimal = 2, local = "pt-BR") {
    if ($.isNumeric(num)) {
        num = num * 1;
        return num.toLocaleString(local, {
            style: 'decimal',
            minimumFractionDigits: decimal,
            maximumFractionDigits: decimal
        });
    } else return '0,00';
}

/**
 * Juntar 2 objetos
 * @param {*} ar1 
 * @param {*} ar2 
 * @returns {}
 */
function util_mergeObjects(ar1, ar2) {
    return { ...(typeof ar1 === "object" ? ar1 : {}), ...(typeof ar2 === "object" ? ar2 : {}) };
};
function gerarSelectPicker(obj = ".selectpicker, .multiselect-bs4", opt = {}) {
    let options = {
        includeSelectAllOption: true,
        includeSelectAllOptionMin: 3,
        selectAllText: "Todos",
        selectAllDeselectAll: false,
        enableCollapsibleOptGroups: true,
        collapseOptGroupsByDefault: true,
        enableFiltering: true,
        maxHeight: 300,
        fontSize: 14
    };

    return $(obj).multiselect(util_mergeObjects(options, opt));
}
/**
 * Mult Select selectpicker
 * @param {*} obj 
 * @param {*} opt -- https://developer.snapappointments.com/bootstrap-select/options/
 * @returns obj selectPicker
 * Uso: 
 * gerarSelectPicker('.selectPicker', {}); 
 */
function gerarSelectPicker2(obj = ".selectpicker", opt = {}) {
    let options = {
        maxOptions: false,
        maxOptionsText: function (numAll, numGroup) {
            return [
                (numAll == 1) ? 'Limite atingido ({n} no maximo)' : 'Limite atingido ({n} no maximo)',
                (numGroup == 1) ? 'Limite do grupo atingido ({n} no maximo)' : 'Limite do grupo atingido ({n} no maximo)'
            ];
        },
        actionsBox: true,
        dropupAuto: false,
        size: 10,
        deselectAllText: "Desmarcar Todos",
        selectAllText: "Selecionar Todos",
        showTick: true,
        liveSearch: true,
        // width: "100%",
        noneSelectedText: "Nenhum registro selecionado",
        noneResultsText: "Sem resultados para o filtro: {0}",
        selectedTextFormat: "count > 2",
        countSelectedText: "Selecionadas: {0} de {1}.",
    };
    return $(obj).selectpicker(util_mergeObjects(options, opt));
}
function isNotEmpty(value) {
    // Verifica se o valor não é nulo nem indefinido
    if (value !== null && value !== undefined) {
        // Se for uma string, verifica se não está vazia após remover espaços em branco do início e do fim
        if (typeof value === 'string') {
            return value.trim() !== '';
        }

        // Se for um array, verifica se tem elementos
        if (Array.isArray(value)) {
            return value.length > 0;
        }

        // Se for um objeto, verifica se tem propriedades
        if (typeof value === 'object') {
            return Object.keys(value).length > 0;
        }

        // Para outros tipos de dados, considera que não estão vazios
        return true;
    }

    // Se for nulo ou indefinido, considera como vazio
    return false;
}

function gerarSelectPickerDataTable(obj = ".selectpicker", opt = {}) {
    $.fn.selectpicker.Constructor.DEFAULTS.liveSearchNormalize = false;
    let options = {
        maxOptions: false,
        maxOptionsText: function (numAll, numGroup) {
            return [
                (numAll == 1) ? 'Limite atingido ({n} no máximo)' : 'Limite atingido ({n} no máximo)',
                (numGroup == 1) ? 'Limite do grupo atingido ({n} no máximo)' : 'Limite do grupo atingido ({n} no máximo)'
            ];
        },
        actionsBox: true,
        dropupAuto: false,
        container: 'body',
        size: 4,
        deselectAllText: "Desmarcar",
        selectAllText: "Todos",
        showTick: true,
        liveSearch: true,
        noneSelectedText: "Nenhum registro selecionado",
        noneResultsText: "Sem resultados para o filtro: {0}",
        selectedTextFormat: "count > 2",
        countSelectedText: "Selecionadas: {0} de {1}.",
    };

    let $select = $(obj);
    $select.addClass('small');
    $select.selectpicker(util_mergeObjects(options, opt));
    $select.parent().addClass('dropdown');

    return $select;
}

function __renderDataTable(data, div_retorno, extraOptions = {}, class_table = 'table display table-bordered table-hover table-striped small sem-quebra') {
    const dados = data.dados;
    const columnConfigs = data.colunas_config;
    const filtrosHeader = data.filtrosHeader ?? [];

    // Gere um ID único para a tabela (evite repetir "dataTable")
    const tableId = `dataTable_${Date.now()}`;
    const ns = `.dtFix-${tableId}`; // namespace pros eventos

    const dataTable = $('<table>', {
        id: tableId,
        class: class_table,
        style: 'width:100%'
    });

    $('#' + div_retorno).html(dataTable);

    // Criar o header e o footer da tabela
    var thead = $('<thead>');
    var tfoot = $('<tfoot>');
    var headerRow = $('<tr>');
    var footerRow = $('<tr>');

    columnConfigs.forEach(function (config) {
        headerRow.append('<th>' + (config.nome || '') + '</th>');
        footerRow.append('<th class="' + (config.alinhamento || '') + '"></th>'); // Aplica alinhamento ao footer
    });

    thead.append(headerRow);
    tfoot.append(footerRow);

    dataTable.append(thead).append(tfoot);

    // Configurações padrão do DataTable
    const defaultOptions = {
        data: dados,
        columns: columnConfigs.map((config, index) => ({
            data: index,
            render: function (data, type) {
                if (type === 'display' || type === 'filter') {
                    if (data == null || data === "") return "";

                    if (config.decimalPlaces === 'date') {
                        return moment(data).isValid() ? moment(data).format('DD/MM/YYYY') : "";
                    }
                    if (config.decimalPlaces === 'datetime') {
                        return moment(data).isValid() ? moment(data).format('DD/MM/YYYY HH:mm:ss') : "";
                    }
                    if (config.decimalPlaces !== null && !isNaN(data) && config.decimalPlaces >= 0 && config.decimalPlaces !== "") {
                        return parseFloat(data).toLocaleString('pt-BR', {
                            minimumFractionDigits: config.decimalPlaces,
                            maximumFractionDigits: config.decimalPlaces
                        });
                    }
                }
                return data;
            }
        })),
        scrollY: "500px",
        scrollX: true,
        destroy: true,
        responsive: false,
        order: [[1, 'desc']],
        columnDefs: [{ targets: '_all', className: 'no-wrap' }],
        footerCallback: function (row, data, start, end, display) {
            const api = this.api();
            columnConfigs.forEach(function (config, index) {
                if (config.somar_footer === true) {
                    let total = 0;
                    display.forEach(function (rowIdx) {
                        const valor = api.cell({ row: rowIdx, column: index }).data();
                        const numero = parseFloat(valor) || 0;
                        total += numero;
                    });

                    const formattedTotal = total.toLocaleString('pt-BR', {
                        minimumFractionDigits: config.decimalPlaces || 0,
                        maximumFractionDigits: config.decimalPlaces || 0
                    });
                    $(api.column(index).footer()).html(formattedTotal);
                } else if (typeof config.somar_footer === 'object') {
                    const colBase = config.somar_footer[1][0];
                    const colComparar = config.somar_footer[1][1];

                    let somaBase = 0;
                    let somaComparar = 0;

                    display.forEach(function (rowIdx) {
                        const valorBase = api.cell({ row: rowIdx, column: colBase }).data();
                        const valorComparar = api.cell({ row: rowIdx, column: colComparar }).data();
                        somaBase += parseFloat(valorBase) || 0;
                        somaComparar += parseFloat(valorComparar) || 0;
                    });

                    let perc = (somaComparar > 0 && somaBase > 0) ? somaComparar / somaBase * 100 : 0;

                    const formattedTotal = perc.toLocaleString('pt-BR', {
                        minimumFractionDigits: config.decimalPlaces || 0,
                        maximumFractionDigits: config.decimalPlaces || 0
                    });
                    $(api.column(index).footer()).html(formattedTotal + (config.somar_footer[0] ?? ""));
                }
            });
        },
        drawCallback: function () {
            const api = this.api();
            const rows = dataTable.find('tbody tr');
            rows.each(function () {
                $(this).find('td').each(function (index) {
                    const config = columnConfigs[index];
                    if (config && config.alinhamento) {
                        $(this).removeClass().addClass(config.alinhamento);
                    }
                });
            });
        },
        initComplete: function () {
            const api = this.api();
            if (filtrosHeader.length > 0) {
                filtrosHeader.forEach(function (idx) {
                    const column = api.column(idx);
                    const header = $(column.header());
                    const title = header.text();
                    header.empty();

                    const container = $('<div class="col-12" style="min-width:180px;"></div>');
                    const titleDiv = $('<div>').text(title);
                    const select = $('<select multiple="multiple" class="form-control small"></select>');

                    container.append(titleDiv).append(select);
                    header.append(container);

                    column.data().unique().sort().each(function (d) {
                        if (d != null && d !== '') {
                            select.append('<option value="' + d + '">' + d + '</option>');
                        }
                    });

                    select.multiselect({
                        includeSelectAllOption: true,
                        includeSelectAllOptionMin: 3,
                        selectAllText: "Todos",
                        selectAllDeselectAll: false,
                        enableFiltering: true,
                        maxHeight: 200,
                        fontSize: 14
                    });

                    select.on('change' + ns, function () {
                        const vals = $(this).val();
                        if (vals && vals.length) {
                            const escapedVals = vals.map(v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
                            column.search(escapedVals.join('|'), true, false).draw();
                        } else {
                            column.search('', true, false).draw();
                        }
                    });
                });
            }
        }
    };

    const options = $.extend(true, {}, defaultOptions, extraOptions);
    const table = dataTable.DataTable(options);

    // -------- visibilitychange / resize COM NAMESPACE + CLEANUP --------
    const adjust = () => {
        table.columns.adjust().draw(false);
        if (table.fixedHeader) {
            table.fixedHeader.adjust();
        }
    };

    // jQuery para poder remover fácil (namespaced)
    $(document).off('visibilitychange' + ns).on('visibilitychange' + ns, function () {
        if (!document.hidden) {
            adjust();
        }
    });

    let resizeObserver = null;

    const tableElement = dataTable.get(0);
    if (window.ResizeObserver) {
        resizeObserver = new ResizeObserver(() => adjust());
        resizeObserver.observe(tableElement);
    } else {
        $(window).off('resize' + ns).on('resize' + ns, adjust);
    }

    // Quando a tabela for destruída, limpa tudo
    table.on('destroy.dt', function () {
        $(document).off('visibilitychange' + ns);
        $(window).off('resize' + ns);
        if (resizeObserver) {
            resizeObserver.disconnect();
            resizeObserver = null;
        }
    });

    return table;
}


function formatarTextoCom_(texto) {
    return texto
        .split('_') // separa por "_"
        .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1)) // capitaliza
        .join(' '); // junta com espaço
}

function animarNumeroBRL(elemento, valorInicial, valorFinal, duracao = 2000, decimal = 2, prefix = "R$ ", sufix = "") {

    function setValor(el, valorFormatado) {
        var tag = el.prop("tagName").toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "select") {
            el.val(valorFormatado);
        } else {
            el.text(valorFormatado);
        }
    }

    $(elemento).each(function () {
        var el = $(this);

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

        // Se valorInicial e valorFinal forem iguais, só mostra e retorna
        if (vi === vf) {
            setValor(el, doubleToMoney(vf, decimal));
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
                }
            }
        );

        function numberStepBRL(now, tween) {
            var formatted = now.toFixed(decimal).replace('.', ',');
            var parts = formatted.split(',');
            var inteiroComPonto = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            setValor($(tween.elem), prefix + inteiroComPonto + (decimal > 0 ? ',' + parts[1] : '') + sufix);
        }
    });
}

function carregarCoresGraficos() {
    Highcharts.setOptions({
        //Tudo q tem
        colors: [
            '#2e7d32', // Verde folha
            '#1565c0', // Azul profundo
            '#f57c00', // Laranja forte
            '#558b2f', // Verde amarelado escuro
            '#c62828', // Vermelho intenso
            '#0288d1', // Azul mais escuro
            '#388e3c', // Verde escuro
            '#d84315', // Laranja avermelhado escuro
            '#0277bd', // Azul forte
            '#ef6c00', // Laranja intenso
            '#e64a19', // Laranja avermelhado
            '#b71c1c', // Vermelho profundo
            '#01579b', // Azul marinho
            '#0277bd', // Azul intenso
            '#00695c', // Verde petróleo
            '#2e7d32', // Verde escuro
            '#558b2f', // Verde oliva escuro
            '#ef6c00', // Laranja queimado
            '#e65100', // Laranja escuro
            '#bf360c', // Laranja-avermelhado escuro
            '#b71c1c', // Vermelho profundo
            '#880e4f', // Vinho escuro
            '#0d47a1', // Azul escuro
            '#1976d2', // Azul intenso
            '#00695c', // Verde petróleo
            '#2e7d32', // Verde floresta
            '#558b2f', // Verde oliva
            '#9e9d24', // Verde-amarelado
            '#f9a825', // Amarelo escuro
            '#f57c00', // Laranja escuro
            '#e65100', // Laranja queimado
            '#bf360c', // Laranja-avermelhado
            '#b71c1c', // Vermelho profundo
            '#880e4f', // Rosa escuro / Vinho
            '#4a148c', // Roxo escuro
            '#6a1b9a', // Roxo vibrante
            '#8e24aa', // Violeta
            '#5d4037', // Marrom
            '#424242', // Cinza escuro
            '#616161', // Cinza médio
            '#37474f', // Cinza-azulado
            '#263238' // Preto azulado
        ],
        //Padrao Graficos ao chamar, sobreescreve
        colors: [
            '#dc3545',
            '#3c8dbc',
            '#3d9970',
            '#6c757d',
            '#f9a825',
            '#605ca8',
            '#007bff',
            '#880e4f', // Vinho escuro
            '#00695c', // Verde petróleo
            '#17a2b8', // Laranja queimado
            '#e65100', // Laranja escuro
        ]
    });
}
function arrumaResizeDataTable(id_tabela, table) {
    const ns = `.dtFix-${id_tabela}`; // namespace pros eventos
    // jQuery para poder remover fácil (namespaced)
    $(document).off('visibilitychange' + ns).on('visibilitychange' + ns, function () {
        if (!document.hidden) {
            adjust();
        }
    });

    let resizeObserver = null;

    const tableElement = $(`#${id_tabela}`).get(0);
    if (window.ResizeObserver && tableElement) {
        let firstTrigger = true;
        resizeObserver = new ResizeObserver(() => {
            if (firstTrigger) {
                firstTrigger = false;
                return; // ignora o primeiro disparo
            }
            if ($.fn.DataTable.isDataTable(`#${id_tabela}`)) {
                const dtInstance = $(`#${id_tabela}`).DataTable();
                dtInstance.columns.adjust().draw(false);
            }
        });
        resizeObserver.observe(tableElement);
    }
    // Quando a tabela for destruída, limpa tudo
    table.on('destroy.dt', function () {
        $(document).off('visibilitychange' + ns);
        $(window).off('resize' + ns);
        if (resizeObserver) {
            resizeObserver.disconnect();
            resizeObserver = null;
        }
    });
}
//LADDA
function startLadda(targetSelector) {
    const buttons = document.querySelectorAll(targetSelector);
    buttons.forEach(button => {
        const laddaInstance = Ladda.create(button);
        button._laddaInstance = laddaInstance; // guarda a instância
        laddaInstance.start();
    });
}

function stopLadda(targetSelector) {
    const buttons = document.querySelectorAll(targetSelector);
    buttons.forEach(button => {
        if (button._laddaInstance) {
            button._laddaInstance.stop();
        }
    });
}

//Apos carregar a pagina
$(function () {
    //Criar Tabelas padrão usa a classe .dataTablePadrao
    criaTabelaPadrao();

    $('.selectduallistbox').bootstrapDualListbox();
});