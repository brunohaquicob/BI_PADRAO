@extends('adminlte::page')

@section('title', 'Usuários')

@section('content_header')
    <h4 class="w100perc text-center">Configurações de Usuários</h4>
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
            <table class="dataTablePadrao" id="tabelaUsuario">
                <thead>
                    <tr class="text-center">
                        <th>Código</th>
                        <th>Nome</th>
                        <th>E-mail</th>
                        <th>Grupo</th>
                        <th>Situação</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($users as $user)
                        <tr>
                            <td class="text-center">{{ $user->id }}</td>
                            <td>{{ $user->name }}</td>
                            <td>{{ $user->email }}</td>
                            <td class="text-center">{{ $user->role->name }}</td>
                            <td class="text-center">
                                @if ($user->active == 'S')
                                    Ativo
                                @elseif ($user->active == 'N')
                                    Desativado
                                @elseif ($user->active == 'B')
                                    Bloqueado
                                @else
                                    Outro valor
                                @endif
                            </td>

                            <td class="text-center">
                                <button type="btn" class="btn btn-warning edit-user" data-id="{{ $user->id }}" data-name="{{ $user->name }}" title="Editar Dados"><i class="fas fa-user-edit"></i></button>&nbsp&nbsp
                                <button type="btn" class="btn btn-info btn-reset-password" data-id="{{ $user->id }}" data-name="{{ $user->name }}" title="Alterar Senha"><i class="fas fa-unlock-alt"></i></button>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
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
            //RESET
            $('.btn-reset-password').click(function() {
                let id = $(this).data('id');
                let nome = $(this).data('name');
                $("#modalEditarSenhaSave").data('id_reset', id);
                $("#modalEditarSenhaSave").data('reset', 'S');
                $('#modalEditarSenhaTitle').html('ALTERAR SENHA DE: <b>' + nome + '</b>');
                abrirModal('modalEditarSenha', true);
            })
            $('#modalEditarSenhaSave').click(function() {
                let id = $(this).data('id_reset');
                let reset = $(this).data('reset');
                cadastroUsuario('modalEditarSenha', id, reset);
            })
            //Novo
            $('#btnNovoUsuario').click(function() {
                abrirModal('modalUsuario', true);
            })
            $('#modalUsuarioSave').click(function() {
                cadastroUsuario('modalUsuario');
            });
            //EDITAR
            $('.edit-user').click(function() {
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
                        // Preencha os campos da modal com os dados do usuário
                        $('#editarName').val(user.name);
                        $('#editarEmail').val(user.email);
                        $('#editarRole').val(userRole.id);

                        // Atualize as opções do select de grupos (roles)
                        $('#editarRole').empty();
                        $.each(roles, function(index, role) {
                            var selected = (role.id === userRole.id) ? 'selected' : '';
                            $('#editarRole').append('<option value="' + role.id + '" ' + selected + '>' +
                                role.name + '</option>');
                        });
                        $("input[name='situacao_usuario']").each(function() {
                            if ($(this).val() === user.active) {
                                $(this).closest("label").addClass("active");
                                $(this).prop("checked", true);
                            } else {
                                $(this).closest("label").removeClass("active");
                                $(this).prop("checked", false);
                            }
                        });
                        $("#modalEditarSave").data('id', id);
                        abrirModal('modalEditar', false);
                    }
                });
            })

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
                    } else {
                        SweetAlert.alertAutoClose("warning", "Precisamos de sua atenção", response.msg, 20000);
                    }
                }).catch(error => {
                    SweetAlert.error(error);
                });
            }
        })
    </script>
@stop
