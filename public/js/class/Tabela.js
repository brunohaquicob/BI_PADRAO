class criarDataTableNew {
    constructor(divId, data, columnNames, columnClasses, sumFooterColumns, extraOptions = {}, tabId = "") {
        this.tabelaCriada;
        this.tabId = tabId;
        this.divId = divId;
        this.data = data;
        this.columnNames = columnNames;
        this.columnClasses = columnClasses;
        this.sumFooterColumns = sumFooterColumns;
        this.extraOptions = extraOptions;  // Opções extras para o DataTable
    }

    // Função para limpar a formatação de valores em dinheiro (retirando "R$", milhar e vírgula)
    cleanMoney(value) {
        return parseFloat(value.replace(/[^\d,-]/g, '').replace('.', '').replace(',', '.')) || 0;
    }

    formatMoney(value) {
        if (isNaN(value)) return value; // Retorna o valor original se não for numérico
        return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace('R$', '').trim();
    }

    formatNumeric(value, isDecimal = false) {
        if (isNaN(value)) return value; // Retorna o valor original se não for numérico
        if (isDecimal) {
            // Formatação para número decimal
            return parseFloat(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        // Formatação para número inteiro
        return parseInt(value).toLocaleString('pt-BR');
    }

    calculateFooterTotals(api) {
        let footerTotals = [];
        this.sumFooterColumns.forEach(index => {
            // Verifica se a coluna existe
            if (api.column(index).data().length) {
                let total = api
                    .column(index, { page: 'current' }) // Apenas dados da página atual
                    .data()
                    .reduce((a, b) => {
                        let numericA = typeof a === 'string' ? (a.includes('R$') ? this.cleanMoney(a) : parseFloat(a)) : a;
                        let numericB = typeof b === 'string' ? (b.includes('R$') ? this.cleanMoney(b) : parseFloat(b)) : b;
                        return numericA + numericB;
                    }, 0);

                // Formata após a soma
                let columnClass = this.columnClasses[index] || 'text-left';
                if (columnClass.includes('money')) {
                    footerTotals[index] = this.formatMoney(total);
                } else if (columnClass.includes('numeric')) {
                    footerTotals[index] = this.formatNumeric(total);
                } else if (columnClass.includes('decimal')) {
                    footerTotals[index] = this.formatNumeric(total, true);
                }
            } else {
                footerTotals[index] = ''; // Valor vazio se não houver dados
            }
        });
        return footerTotals;
    }


    applyColumnClasses(row, data, dataIndex) {
        $(row).find('td').each((index, td) => {
            let columnClass = this.columnClasses[index] || 'text-left';
            $(td).removeClass(); // Remove classes antigas 
            if (columnClass.includes('money')) {
                $(td).text(this.formatMoney($(td).text()));  // Formata para dinheiro
                $(td).addClass('text-right');  // Alinha à direita 
            } else if (columnClass.includes('numeric')) {
                $(td).text(this.formatNumeric($(td).text()));  // Formata número conforme tipo
                $(td).addClass('text-center');  // Alinha ao centro 
            } else if (columnClass.includes('decimal')) {
                $(td).text(this.formatNumeric($(td).text(), true));  // Formata número com decimal
                $(td).addClass('text-center');  // Alinha ao centro 
            } else {
                $(td).addClass('text-left');  // Alinha à esquerda para outras colunas
            }
        });
    }

    applyFooterClasses(api) {
        let footerCells = $(api.table().footer()).find('th');
        footerCells.each((index, td) => {
            let columnClass = this.columnClasses[index] || 'text-left';
            $(td).removeClass().addClass(columnClass); // Remove classes antigas e aplica as novas
            if (columnClass.includes('money')) {
                $(td).addClass('text-right');  // Alinha à direita no footer quando for "money"
            } else if (columnClass.includes('numeric') || columnClass.includes('decimal')) {
                $(td).addClass('text-center');  // Alinha ao centro no footer quando for "numeric" ou "decimal"
            } else {
                $(td).addClass('text-left');  // Alinha à esquerda para outras colunas
            }
        });
    }

    build() {
        let tableId = `${this.divId}_table`;
        let tableHtml = `
            <table id="${tableId}" class='table table-bordered table-hover table-striped' style='width:100%; font-size:12px;'>
                <thead>
                    <tr>${this.columnNames.map(name => `<th class="text-center">${name}</th>`).join('')}</tr>
                </thead>
                <tbody></tbody>
                <tfoot>
                    <tr>${this.columnNames.map(() => `<th class="text-center"></th>`).join('')}</tr>
                </tfoot>
            </table>
        `;

        $(`#${this.divId}`).html(tableHtml);

        let instance = this; // Captura o contexto da classe

        // Merge com opções extras passadas
        let options = $.extend({
            data: this.data,
            columns: this.columnNames.map(() => null), // Colunas dinâmicas
            footerCallback: function (row, data, start, end, display) {
                let api = this.api();
                let footerTotals = instance.calculateFooterTotals(api); // Usa a instância da classe

                // Verifica se há totais a serem aplicados
                if (footerTotals && footerTotals.length) {
                    footerTotals.forEach((total, index) => {
                        let footerCell = api.column(index).footer();
                        if (footerCell) { // Garante que a célula do rodapé existe
                            $(footerCell).html(total);
                            // Aplica as classes do rodapé
                            instance.applyFooterClasses(api);
                        }
                    });
                }
            },
            createdRow: function (row, data, dataIndex) {
                // Usa o contexto correto para as funções de formatação
                instance.applyColumnClasses(row, data, dataIndex);
            }
        }, this.extraOptions); // Mescla as opções extras

        this.tabelaCriada = $(`#${tableId}`).DataTable(options);
        // Garante que ajustar será chamado após a inicialização
    }

    ajustar() {
        let instance = this; // Captura o contexto da classe

        // evento para escutar a mudança dos botões de seleção de rádio
        $('input[name="optionsTabela1[]"]').on('change', function () {
            let dataColumn = this.value;
            if (instance.tabelaCriada) { // Verifica se a tabela foi criada
                instance.tabelaCriada.rowGroup().dataSrc(dataColumn).draw();
            }
        });

        // Listener para rowgroup-datasrc
        if (this.tabelaCriada) {
            this.tabelaCriada.on('rowgroup-datasrc', function (e, dt, val) {
                instance.tabelaCriada.order.fixed({
                    pre: [
                        [val, 'desc']
                    ]
                }).draw();
            });
        }

        $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
            $($.fn.dataTable.tables(true)).DataTable().columns.adjust().draw();
        });
    }

}


class Tabela {
    constructor(data, id, columnClasses, divRetorno, useDataTable, options = {}, classesTable = "") {
        this.data = data;
        this.id = id;
        this.divRetorno = divRetorno;
        this.classes = classesTable == "" ? ['table', 'table-bordered', 'table-hover', 'table-striped', 'w100perc'] : classesTable;
        this.useDataTable = useDataTable;
        this.options = options;
        this.columnClasses = columnClasses;

        if (this.useDataTable) {
            this.criarTabelaComDataTable();
        } else {
            this.criarTabela();
        }
    }
    criarCabecalho() {
        const cabecalho = document.createElement('thead');
        const linhaCabecalho = document.createElement('tr');
        const colunas = Object.keys(this.data[0]);
        for (const coluna of colunas) {
            const colunaCabecalho = document.createElement('th');
            colunaCabecalho.textContent = coluna.toUpperCase(); // Converter para maiúsculas
            colunaCabecalho.style.textTransform = 'uppercase'; // Aplicar o estilo CSS
            linhaCabecalho.appendChild(colunaCabecalho);
            linhaCabecalho.classList.add("text-center");
        }
        cabecalho.appendChild(linhaCabecalho);
        return cabecalho;
    }
    criarCorpo() {
        const corpo = document.createElement('tbody');
        for (let i = 0; i < this.data.length; i++) {
            const linhaCorpo = document.createElement('tr');
            const colunas = Object.values(this.data[i]);
            for (let j = 0; j < colunas.length; j++) {
                const colunaCorpo = document.createElement('td');
                colunaCorpo.textContent = Array.isArray(colunas[j]) || typeof colunas[j] === 'object' ? JSON.stringify(colunas[j]) : colunas[j];
                if (this.columnClasses && this.columnClasses[j]) {
                    colunaCorpo.classList.add(this.columnClasses[j]);
                }
                linhaCorpo.appendChild(colunaCorpo);
            }
            corpo.appendChild(linhaCorpo);
        }
        return corpo;
    }
    criarTabela() {
        const tabela = document.createElement('table');
        if (this.id) {
            tabela.id = this.id;
        }
        if (this.classes) {
            tabela.classList.add(...this.classes);
        }
        const cabecalho = this.criarCabecalho();
        const corpo = this.criarCorpo();
        tabela.appendChild(cabecalho);
        tabela.appendChild(corpo);
        if (this.divRetorno != "") {
            const div = document.getElementById(this.divRetorno);
            div.innerHTML = '';
            div.appendChild(tabela);
        }
        return tabela;
    }

    criarTabelaComDataTable() {
        const tabela = this.criarTabela();
        if (this.useDataTable) {
            $(`#${this.id}`).DataTable(this.options);
        }
        return tabela;
    }


}

class DataTableBuilder {
    constructor(data, columnNames, centerColumns, rightAlignColumns, sumColumns, containerId, extraOptions = {}, route_detalhes) {
        this.data = data;
        this.columnNames = columnNames;
        this.centerColumns = centerColumns;
        this.rightAlignColumns = rightAlignColumns;
        this.sumColumns = sumColumns;
        this.containerId = containerId;
        this.extraOptions = extraOptions;
        this.route_detalhes = route_detalhes;
        this.build();
    }

    build() {
        const self = this;
        const columns = this.columnNames.map((name, index) => {
            const colDef = {
                data: name,
                title: name,
                className: (this.centerColumns.includes(index) ? 'text-center ' : '') +
                    (this.rightAlignColumns.includes(index) ? 'text-right' : '')
            };

            if (name === 'COD_POSTAGEM') {
                colDef.render = (data, type, row) => {
                    if (type === 'display' && typeof data === 'object' && 'display' in data && 'conteudo' in data && data.conteudo !== '') {
                        // let conteudoJson;
                        // if (typeof data.conteudo === 'string') {
                        //     try {
                        //         JSON.parse(data.conteudo); // Verifica se a string é JSON válida
                        //         conteudoJson = data.conteudo;
                        //     } catch (error) {
                        //         console.error('Erro ao analisar JSON:', error);
                        //         conteudoJson = JSON.stringify(data.conteudo); // Converte para JSON
                        //     }
                        // } else if (typeof data.conteudo === 'object' && data.conteudo !== null) {
                        //     conteudoJson = JSON.stringify(data.conteudo); // Converte objeto para JSON
                        // } else {
                        //     console.error('Tipo de conteúdo inválido:', typeof data.conteudo);
                        // }

                        // // Adiciona o ícone com o evento onclick, usando JSON.stringify para garantir a formatação correta da string JSON
                        // return `${data.display}&nbsp;&nbsp;&nbsp;<i class="fas fa-search detalhes_rastreio" style="cursor: pointer;" detalhes_rastreio='${conteudoJson}' detalhes_rastreio_title='${data.title}'></i>`;

                        if (data.conteudo === 'S') {
                            return `${data.display}&nbsp;&nbsp;&nbsp;<i class="fas fa-search detalhes_rastreio" style="cursor: pointer;" codigo_postagem='${data.display}' route_detalhes='${self.route_detalhes}'></i>`;
                        }
                    } else {
                        return data.display;
                    }
                };
            } else if (this.rightAlignColumns.includes(index) || this.centerColumns.includes(index)) {
                colDef.render = (data, type, row) => {
                    if (type === 'display' && !isNaN(parseFloat(data)) && isFinite(data)) {
                        return self.formatValues(data);
                    }
                    return data;
                };
            }

            return colDef;
        });

        const dataTable = $('<table>', {
            id: 'dataTable' + this.containerId,
            class: 'table display table-bordered table-hover table-striped small',
            id: `${this.containerId}Tabela`,
            style: 'width:100%'
        });

        const tfoot = $('<tfoot>').appendTo(dataTable);
        const tfootRow = $('<tr>').appendTo(tfoot);

        columns.forEach((column, index) => {
            const td = $('<td>');
            tfootRow.append(td);
            if (this.centerColumns.includes(index)) {
                td.addClass('text-center');
            }
        });

        $('#' + this.containerId).html(dataTable);

        const defaultOptions = {
            data: this.data,
            columns: columns.map(function (column) {
                if (column.title.toLowerCase().indexOf('data') !== -1 && column.title.toLowerCase() !== 'database') {
                    return {
                        data: column.data,
                        title: column.title,
                        render: function (data, type, row) {
                            if (type === 'display' || type === 'filter') {
                                return moment(data).format('DD/MM/YYYY HH:mm:ss');
                            }
                            return data;
                        }
                    };
                } else if (column.title.toLowerCase().indexOf('_dt_') !== -1 && column.data !== "") {
                    return {
                        data: column.data,
                        title: column.title,
                        render: function (data, type, row) {
                            if (type === 'display' || type === 'filter') {
                                return data.split('.')[0];
                            }
                            return data;
                        }
                    };
                } else {
                    return column;
                }
            }),
            scrollY: "400px",
            scrollX: true,
            destroy: true,
            order: [[1, 'desc']],
            createdRow: function (row, data, dataIndex) {
                $(row).children().each((index, td) => {
                    if (self.centerColumns.includes(index)) {
                        $(td).addClass('text-center');
                    } else if (self.rightAlignColumns.includes(index)) {
                        $(td).addClass('text-right');
                    }
                });
            },
            footerCallback: function (row, data, start, end, display) {
                const api = this.api();
                self.sumColumns.forEach(colIndex => {
                    let sum = 0;
                    const columnData = api.column(colIndex, { page: 'current' }).data();
                    sum += columnData.reduce((a, b) => (parseFloat(a) || 0) + (parseFloat(b) || 0), 0);
                    $(api.column(colIndex).footer()).html(self.formatValues(sum));
                });
            }
        };

        const tableOptions = $.extend(true, {}, defaultOptions, this.extraOptions);

        try {
            const table = dataTable.DataTable(tableOptions);
            return table;
        } catch (error) {
            console.error('Erro ao inicializar DataTable:', error);
        }
    }

    formatValues(value) {
        if (!isNaN(value) && isFinite(value)) {
            if (Number.isInteger(value)) {
                return doubleToMoney(value, 0);
            } else {
                return doubleToMoney(value);
            }
        }
        return value;
    }
}


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