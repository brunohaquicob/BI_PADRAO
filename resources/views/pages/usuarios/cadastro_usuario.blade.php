@extends('adminlte::page')

@section('title', $nameView)

@section('content_header')
    <h4 class="w100perc text-center">{{ $nameView }}</h4>
@stop


@section('content')
    <div class="card">
        <div class="card-header">
            {{-- <h3 class="card-title">Lista de Usuários</h3> --}}
            <div class="card-title">
                <button type="button" class="btn btn-primary" id="btnNovoUsuario">
                    Cadastrar Novo Usuário
                </button>
            </div>
        </div>
        <div class="card-body">
            <div id="usuariosTableWrap"></div>
        </div>
    </div>

    <!-- Modal de Cadastro de Usuário -->
    <x-modalpadrao-component id="modalUsuario" title="Cadastro de Usuário" size="lg" color="primary" showSaveButton="S" showUpdateButton="N" showCancelButton="S">
        <div class="form-group">
            <label for="name">Nome</label>
            <input type="text" name="nome" id="name" class="form-control" required>
        </div>
        <div class="form-group">
            <label for="email">Email</label>
            <input type="email" name="email" id="email" class="form-control" required>
        </div>
        <div class="form-group">
            <label for="password">Senha</label>
            <input id="password" type="password" class="form-control" name="password" required autocomplete="new-password">
        </div>

        <div class="form-group">
            <label for="password_confirmation">Confirmar Senha</label>
            <input id="password_confirmation" type="password" class="form-control" name="password_confirmation" required autocomplete="new-password">
        </div>
        <div class="form-group">
            <label for="role">Grupo</label>
            <select name="permissao" id="role" class="form-control" required>
                @foreach ($roles as $role)
                    <option value="{{ $role->id }}">{{ $role->name }}</option>
                @endforeach
            </select>
        </div>
        <div class="form-group">
            <label for="role">Empresa AQC</label>
            <select name="empresa[]" id="empresa" class="form-control selectpickerNovo" required>
                @foreach ($empresas as $empresa)
                    <option value="{{ $empresa->emp_codigo }}">{{ $empresa->emp_nome }}</option>
                @endforeach
            </select>
        </div>
        <div class="form-group">
            <label for="role">Grupo Credor AQC</label>
            <select name="grupo_credor[]" id="grupo_credor" class="form-control selectpickerNovo" multiple>
                @foreach ($grupoCredor as $credor)
                    <option value="{{ $credor['col1'] }}">{{ $credor['col2'] }}</option>
                @endforeach
            </select>
        </div>
    </x-modalpadrao-component>
    <!-- Modal de Editar de Usuário -->
    <x-modalpadrao-component id="modalEditar" title="Editar Usuário" size="lg" color="primary" showSaveButton="S" showUpdateButton="N" showCancelButton="S">
        <div class="form-group">
            <label for="name">Nome</label>
            <input type="text" name="nome" id="editarName" class="form-control" required>
        </div>
        <div class="form-group">
            <label for="email">Email</label>
            <input type="email" name="email" id="editarEmail" class="form-control" required>
        </div>
        <div class="form-group">
            <label for="role">Grupo</label>
            <select name="permissao" id="editarRole" class="form-control" required></select>
        </div>

        <div class="form-group">
            <label for="editarEmpresa">Empresa</label>
            <select name="empresa[]" id="editarEmpresa" class="form-control selectpickerNovo" multiple>
                @foreach ($empresas as $empresa)
                    <option value="{{ $empresa->emp_codigo }}">{{ $empresa->emp_nome }}</option>
                @endforeach
            </select>
        </div>

        <div class="form-group">
            <label for="editarGrupoCredor">Grupo Credor Acesso AQC</label>
            <select name="grupo_credor[]" id="editarGrupoCredor" class="form-control selectpickerNovo" multiple>
                @foreach ($grupoCredor as $credor)
                    <option value="{{ $credor['col1'] }}">{{ $credor['col2'] }}</option>
                @endforeach
            </select>
        </div>
        <div class="form-group text-center">
            <div class="btn-group" data-toggle="buttons">
                <label class="btn btn-outline-secondary">
                    <input type="radio" name="situacao_usuario" value='B' id="opcao1" autocomplete="off"> Bloqueado
                </label>
                <label class="btn btn-outline-secondary active">
                    <input type="radio" name="situacao_usuario" value='S' id="opcao2" autocomplete="off" checked> Ativo
                </label>
                <label class="btn btn-outline-secondary ">
                    <input type="radio" name="situacao_usuario" value='N' id="opcao3" autocomplete="off"> Desativado
                </label>
            </div>
        </div>
    </x-modalpadrao-component>
    <!-- Modal de Editar Senha -->
    <x-modalpadrao-component id="modalEditarSenha" title="Editar Senha" size="lg" color="primary" showSaveButton="S" showUpdateButton="N" showCancelButton="S">
        <div class="form-group">
            <label for="password">Nova Senha</label>
            <input id="reset_password" type="password" class="form-control" name="password" required autocomplete="new-password">

        </div>

        <div class="form-group">
            <label for="password_confirmation">Confirmar Nova Senha</label>
            <input id="reset_password_confirmation" type="password" class="form-control" name="password_confirmation" required autocomplete="new-password">
        </div>
    </x-modalpadrao-component>


@stop

@section('js')
    <script>
        $(function() {
            gerarSelectPicker2('.selectpickerNovo');

            // carrega na abertura da página
            loadTabelaUsuarios();
            //RESET
            $(document).on('click', '.btn-reset-password', function() {
                let id = $(this).data('id');
                let nome = $(this).data('name');
                $("#modalEditarSenhaSave").data('id_reset', id);
                $("#modalEditarSenhaSave").data('reset', 'S');
                $('#modalEditarSenhaTitle').html('ALTERAR SENHA DE: <b>' + nome + '</b>');
                abrirModal('modalEditarSenha', true);
            });
            $('#modalEditarSenhaSave').click(function() {
                let id = $(this).data('id_reset');
                let reset = $(this).data('reset');
                cadastroUsuario('modalEditarSenha', id, reset);
            })
            //Novo
            $('#btnNovoUsuario').click(function() {
                // limpa selects múltiplos
                $('#empresa').selectpicker('deselectAll').selectpicker('refresh');
                $('#grupo_credor').selectpicker('deselectAll').selectpicker('refresh');
                abrirModal('modalUsuario', true);
            });

            $('#modalUsuarioSave').click(function() {
                cadastroUsuario('modalUsuario');
            });
            //EDITAR
            $(document).on('click', '.edit-user', function() {
                let id = $(this).data('id');
                let requestParams = {
                    method: 'POST',
                    url: '{{ route('usuario.ajax') }}',
                    data: {
                        'id': id
                    },
                    formId: 'modalEditarForm'
                };
                AjaxRequest.sendRequest(requestParams).then(response => {
                    if (response.status === true) {
                        var user = response.data.user;
                        var roles = response.data.roles;
                        var userRole = response.data.userRole;
                        var userEmpresas = (response.data.userEmpresas || []).map(Number);
                        var userGruposAqc = (response.data.userGruposAqc || []).map(Number);

                        // Campos básicos
                        $('#editarName').val(user.name);
                        $('#editarEmail').val(user.email);

                        // Roles (como você já fazia)
                        $('#editarRole').empty();
                        $.each(roles, function(_, role) {
                            $('#editarRole').append(
                                '<option value="' + role.id + '" ' + (role.id === userRole.id ? 'selected' : '') + '>' + role.name + '</option>'
                            );
                        });

                        // Situação (como você já fazia)
                        $("input[name='situacao_usuario']").each(function() {
                            if ($(this).val() === user.active) {
                                $(this).closest("label").addClass("active");
                                $(this).prop("checked", true);
                            } else {
                                $(this).closest("label").removeClass("active");
                                $(this).prop("checked", false);
                            }
                        });

                        // >>> Empresas (multi)
                        // garante que o selectpicker está limpo antes de setar
                        $('#editarEmpresa').selectpicker('deselectAll');
                        $('#editarEmpresa').selectpicker('val', userEmpresas).selectpicker('refresh');

                        // >>> Grupo Credor (multi, opcional)
                        $('#editarGrupoCredor').selectpicker('deselectAll');
                        $('#editarGrupoCredor').selectpicker('val', userGruposAqc).selectpicker('refresh');

                        $("#modalEditarSave").data('id', id);
                        abrirModal('modalEditar', false);
                    }
                });
            });


            $('#modalEditarSave').click(function() {
                let id = $(this).data('id');
                cadastroUsuario('modalEditar', id);
            });

            //Cadastrar, editar, reset senha
            function cadastroUsuario(idModal, id = null, reset = 'N') {
                let requestParams = {
                    method: 'POST',
                    url: '{{ route('usuario.ajax.editar') }}',
                    data: {
                        'id': id,
                        'reset': reset
                    },
                    formId: idModal + 'Form'
                };
                AjaxRequest.sendRequest(requestParams).then(response => {
                    if (response.status === true) {
                        fecharModal(idModal);
                        SweetAlert.alertAutoClose("success", "Feito", response.msg);
                        loadTabelaUsuarios();
                    } else {
                        SweetAlert.alertAutoClose("warning", "Precisamos de sua atenção", response.msg, 20000);
                    }
                }).catch(error => {
                    SweetAlert.error(error);
                });
            }
        })

        function loadTabelaUsuarios() {
            const wrapSel = '#usuariosTableWrap';
            const url = '{{ route('usuario.table') }}';

            try {
                // 1) Se já existe DataTable, destrói e remove o wrapper
                if ($.fn.DataTable && $.fn.DataTable.isDataTable('#tabelaUsuario')) {
                    $('#tabelaUsuario').DataTable().destroy(true); // true = remove DOM gerado
                }
            } catch (e) {
                // ignora qualquer erro de estado aqui
            }

            // 2) placeholder
            $(wrapSel).html('<div class="text-center p-3 text-muted">Carregando...</div>');

            // 3) carrega a TABELA INTEIRA (o parcial _table.blade.php)
            $.ajax({
                    url,
                    method: 'GET',
                    cache: false
                })
                .done(function(html) {
                    // injeta HTML novo (vem <table id="tabelaUsuario">...</table>)
                    $(wrapSel).html(html);

                    // 4) inicializa de novo
                    const $tbl = $('#tabelaUsuario');
                    if ($tbl.length) {
                        $tbl.DataTable({
                            // coloque as mesmas opções que você usa para "dataTablePadrao"
                            pageLength: 25,
                            order: [
                                [0, 'asc']
                            ],
                            // se usar Buttons no "dom", garanta que o JS de Buttons esteja incluído
                            // dom: 'Bfrtip', buttons: ['copy', 'excel', 'csv']
                        });
                    }
                })
                .fail(function(xhr) {
                    console.error('Falha ao carregar a tabela', xhr.status, xhr.responseText);
                    SweetAlert.alertAutoClose("error", "Ops", "Não foi possível carregar a lista de usuários.");
                });
        }
    </script>
@stop
