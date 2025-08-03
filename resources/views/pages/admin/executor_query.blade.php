@extends('adminlte::page')

@section('title', 'Executar Query Multibase')

@section('content_header')
    <h4 class="w100perc text-center">Executar Query em Várias Bases</h4>
@stop

@section('content')
    <form method="" action="" id="form_filtros_pesquisa">
        @csrf

        <div class="card card-primary">
            <div class="card-header">
                <h3 class="card-title">Selecione as bases</h3>
            </div>
            <div class="card-body">
                <div class="row">
                    @foreach ($empresas as $empresa)
                        <div class="col-md-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" name="bases[]" value="{{ $empresa->id }}" id="empresa_{{ $empresa->id }}">
                                <label class="form-check-label" for="empresa_{{ $empresa->id }}">
                                    {{ $empresa->app_name }} ({{ $empresa->db_database }})
                                </label>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>

        <div class="card card-secondary">
            <div class="card-header">
                <h3 class="card-title">Query a Executar</h3>
            </div>
            <div class="card-body">
                <div class="form-group">
                    <textarea id="query" name="query" readonly style="height:0;opacity:0;position:absolute;"></textarea>
                    <div id="queryEditorContainer"></div>
                </div>
                <div class="row">
                    <div class="offset-md-4 col-md-4 offset-md-4 col-12">
                        <div class="form-group">
                            <button type="button" class="btn btn-block bg-gradient-primary btn-lg ladda-button" id="btnBuscarDados" data-style='zoom-out'>
                                <i class="fa fa-search"></i>&nbsp;&nbsp;&nbsp;Procurar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>

    <div class="card card-success mt-4" id="card_resultados" style="display:none;">
        <div class="card-header">
            <h3 class="card-title">Resultados</h3>
        </div>
        <div class="card-body" id="resultado_conteudo"></div>
    </div>
@stop
@once
    @push('css')
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/monokai-sublime.min.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/theme/monokai.min.css">
    @endpush
    @push('js')
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/sql.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/sql/sql.min.js"></script>

        <script>
            hljs.highlightAll();
            let editor;
            document.addEventListener('DOMContentLoaded', function() {
                editor = CodeMirror(document.getElementById("queryEditorContainer"), {
                    lineNumbers: true,
                    mode: 'text/x-sql',
                    theme: 'monokai',
                    indentWithTabs: true,
                    smartIndent: true,
                    matchBrackets: true,
                });

                // opcional: ao submeter, sincronizar conteúdo com textarea real
                // No submit, atualiza o conteúdo do textarea
                document.querySelector("form").addEventListener("submit", function() {
                    document.getElementById("query").value = editor.getValue();
                });
            });

            $(document).ready(function() {

                $('#btnBuscarDados').click(function() {
                    FormValidator.validar('form_filtros_pesquisa').then((isValid) => {
                        if (isValid) {
                            __buscarDados();
                        }
                    });

                });

            });

            function __buscarDados() {
                startLadda(".ladda-button");
                let idForm = 'form_filtros_pesquisa';
                const requestParams = {
                    method: 'POST',
                    url: '{{ route('admin.executar-query') }}',
                    data: {
                        'query': editor.getValue(),
                    },
                    formId: idForm
                };
                AjaxRequest.sendRequest(requestParams).then(response => {
                    stopLadda(".ladda-button");
                    if (response.status === true) {
                        if (response.msg != "") {
                            alertar(response.msg, '', 'info');
                        }

                        renderResultados(response.data.resultado);

                    } else {
                        SweetAlert.alertAutoClose("error", "Precisamos de sua atenção", response.msg, 20000);
                        $('#resultado_conteudo').html("");
                    }
                }).catch(error => {
                    stopLadda(".ladda-button");
                    alertar(error, "", "error");
                });
            }

            // Função auxiliar para escapar HTML (evita XSS)
            function escapeHtml(text) {
                return text.replace(/[&<>"']/g, function(m) {
                    return {
                        '&': '&amp;',
                        '<': '&lt;',
                        '>': '&gt;',
                        '"': '&quot;',
                        "'": '&#39;'
                    } [m];
                });
            }

            function renderResultados(resultados) {
                const container = $('#resultado_conteudo');
                container.html('');
                for (const base in resultados) {
                    const output = resultados[base];

                    let content = '';

                    if (typeof output === 'string') {
                        let tipo = 'info';
                        if (/erro/i.test(output)) tipo = 'danger';
                        else if (/ok|sucesso|created|updated|inserted/i.test(output)) tipo = 'success';

                        content = `
                            <div class="alert alert-${tipo} mb-0" role="alert" style="white-space: pre-wrap;">
                                ${escapeHtml(output)}
                            </div>
                        `;
                    } else if (Array.isArray(output) && output.length > 0 && typeof output[0] === 'object') {
                        // Resultado tipo SELECT (array de objetos)
                        content = renderTabelaHTML(output);
                    } else {
                        // Resultado vazio ou não reconhecido
                        content = `<pre><code class="language-sql">Sem dados retornados ou formato desconhecido</code></pre>`;
                    }

                    const card = `
                        <div class="card card-outline card-primary mt-2">
                            <div class="card-header"><strong>${base}</strong></div>
                            <div class="card-body">${content}</div>
                        </div>
                    `;
                    container.append(card);
                }

                $('#card_resultados').fadeIn();
                hljs.highlightAll();
            }
            // Gera tabela HTML a partir de um array de objetos
            function renderTabelaHTML(data) {
                if (!Array.isArray(data) || data.length === 0) return '<div class="text-muted">Sem dados</div>';

                // Gera a lista de colunas baseada na união de todas as chaves
                const allKeys = [...new Set(data.flatMap(row => Object.keys(row)))];

                let thead = '<thead><tr>';
                let tbody = '<tbody>';

                allKeys.forEach(key => thead += `<th>${escapeHtml(key)}</th>`);
                thead += '</tr></thead>';

                data.forEach(row => {
                    tbody += '<tr>';
                    allKeys.forEach(key => {
                        const value = row[key] != null ? row[key] : '';
                        tbody += `<td>${escapeHtml(String(value))}</td>`;
                    });
                    tbody += '</tr>';
                });

                tbody += '</tbody>';


                const tableId = 'tabela_' + Math.random().toString(36).substring(2, 8);

                const html = `
                    <div class="table-responsive">
                        <table id="${tableId}" class="table display table-bordered table-hover table-striped small sem-quebra">
                            ${thead}
                            ${tbody}
                        </table>
                    </div>
                `;

                setTimeout(() => {
                    $(`#${tableId}`).DataTable({
                        "scrollY": "500px",
                        "scrollX": true,
                        'pageLength': -1,
                        "lengthChange": true,
                        "searching": true,
                        "ordering": true,
                        "info": true,
                        "responsive": false,
                        "autoWidth": false,
                        "scrollCollapse": true,
                        "colReorder": true,
                    });
                }, 0);

                return html;

            }
        </script>
    @endpush
@endonce
