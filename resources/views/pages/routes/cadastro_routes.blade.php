@extends('adminlte::page')

@section('title', 'Configurações de Rotas e Views')

@section('content_header')
    <h4 class="w100perc text-center">Configurações de Rotas e Views</h4>
@stop

@section('content')
    <div class="card">
        <div class="card-header">
            <ul class="nav nav-tabs">
                <li class="nav-item">
                    <a class="nav-link active" data-toggle="tab" href="#rolesTab">Roles</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" data-toggle="tab" href="#viewTab">Views</a>
                </li>
            </ul>
        </div>
        <div class="card-body">
            <div class="tab-content">
                <div class="tab-pane fade show active" id="rolesTab">
                    <div class="card">
                        <div class="card-body">
                            <table class="dataTablePadrao ">
                                <thead>
                                    <tr>
                                        <th>Role Name</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($roles as $role)
                                        <tr>
                                            <td>{{ $role->name }}</td>
                                            <td class="text-center">
                                                <button class="btn-sm btn-warning btn-edit-views"
                                                    data-role-id="{{ $role->id }}"
                                                    data-role-name="{{ $role->name }}">Editar Vinculos de Views</button>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="tab-pane fade" id="viewTab">
                    <div class="card">
                        <div class="card-header">
                            <button type="button" class="btn btn-primary btn-edit-route" id="addView" data-id=""><i
                                    class="fas fa-plus"></i> Add
                                Route</button>
                        </div>
                        <div class="card-body">
                            <table class="dataTablePadrao" id='tabelaRouteView'>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>URL</th>
                                        <th>Route Name</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($routeViews as $routeView)
                                        <tr>
                                            <td>{{ $routeView->name }}</td>
                                            <td>{{ $routeView->url }}</td>
                                            <td>{{ $routeView->route_name }}</td>
                                            <td class="text-center">
                                                <button class="btn btn-warning btn-edit-route"
                                                    data-id="{{ $routeView->id }}"
                                                    data-name="{{ $routeView->name }}"><i class="fas fa-edit"></i></button>
                                                <button class="btn btn-danger btn-delete-route"
                                                    data-id="{{ $routeView->id }}"
                                                    data-name="{{ $routeView->name }}"><i class="fas fa-trash"></i></button>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal routes x role-->
    <x-modalpadrao-component id="modalPermissao" title="Permissões de grupo" size="80" color="primary"
        showSaveButton="N" showUpdateButton="S" showCancelButton="S">
        <div class="form-group">
            <label for="name">&nbsp;</label>
            <select name="selectRoleRoutes[]" id="selectRoleRoutes" class='selectduallistbox' multiple='multiple'
                style='display: none;' data-role-id=""></select>
        </div>
    </x-modalpadrao-component>
    <!-- Modal routes-->
    <x-modalpadrao-component id="modalRoute" title="Editar/Cadastrar View" size="80" color="primary" showSaveButton="S"
        showUpdateButton="N" showCancelButton="S">
        <div class="card">
            <div class="card-body">
                <div class="form-group">
                    <label for="modalRoute_name">Name</label>
                    <input type="text" class="form-control" id="modalRoute_name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="modalRoute_url">URL</label>
                    <input type="text" class="form-control" id="modalRoute_url" name="url" required>
                </div>
                <div class="form-group">
                    <label for="modalRoute_route_view">Route View</label>
                    <input type="text" class="form-control" id="modalRoute_route_view" name="route_name" required>
                </div>

            </div>
        </div>

    </x-modalpadrao-component>

@stop
@section('js')
    <script>
        $(document).ready(function() {
            //INICIO VINCULO ROTA
            $('#modalPermissaoUpdate').click(function() {
                var roules = $("#selectRoleRoutes").val();
                var role_id = $("#selectRoleRoutes").data('role-id');
                const requestParams = {
                    method: 'POST',
                    url: '{{ route('role.routesview.ajax.editar') }}',
                    data: {
                        'role_id': role_id,
                        'route_ids': roules
                    }
                };
                AjaxRequest.sendRequest(requestParams).then(response => {
                    if (response.status === true) {
                        fecharModal('modalPermissao');
                        SweetAlert.alertAutoClose("success", "Feito", response.msg);
                    } else {
                        SweetAlert.info(response.msg);
                    }
                }).catch(error => {
                    SweetAlert.error(error);
                });
            });

            $('.btn-edit-views').click(function() {
                var roleId = $(this).data('role-id');
                var roleName = $(this).data('role-name').toUpperCase();

                const requestParams = {
                    method: 'POST',
                    url: '{{ route('role.routeview.ajax') }}',
                    data: {
                        'role_id': roleId
                    },
                    formId: ''
                };
                AjaxRequest.sendRequest(requestParams).then(response => {
                    if (response.status === true) {

                        var vinculado = response.data.vinculado;
                        var semvinculo = response.data.semvinculo;

                        Utilitarios.preencheSelectDualListBox("selectRoleRoutes", semvinculo,
                            vinculado);
                        $('#modalPermissaoTitle').html('ALTERAR PERMISSÕES DE: <b>' + roleName +
                            '</b>');
                        abrirModal('modalPermissao');
                        $("#selectRoleRoutes").data('role-id', roleId);
                    }
                }).catch(error => {
                    console.error(error);
                });
            });
            //FIM VINCULO ROTA
            //INICIO ROUTE
            $('.btn-edit-route').click(function() {
                modal = 'modalRoute'
                let id = $(this).data('id');
                if (id != "") {

                    const requestParams = {
                        method: 'POST',
                        url: '{{ route('routeview.ajax') }}',
                        data: {
                            'id': id
                        },
                        formId: ''
                    };
                    AjaxRequest.sendRequest(requestParams).then(response => {
                        console.log(response)
                        if (response.status === true) {
                            Utilitarios.preencherFormularioPeloName(response.data, modal + 'Form');
                            $('#modalRouteSave').data('id', id);
                            abrirModal(modal, false);
                        } else {
                            SweetAlert.info(response.msg);
                        }
                    })
                } else {
                    abrirModal('modalRoute', true);
                }

            })

            $('#modalRouteSave').click(function() {
                insertUpdateRoute($(this).data('id'));
            });
            //Deletar
            $('.btn-delete-route').click(function() {
                let id = $(this).data('id')
                let tabelaRouteView = $('#tabelaRouteView').DataTable();
                let row = $(this).closest('tr');
                SweetAlert.confirm('Deseja prosseguir com a ação?').then((resp) => {
                    if (resp) {
                        const requestParams = {
                            method: 'POST',
                            url: '{{ route('routeview.ajax.delete') }}',
                            data: {
                                'id': id,
                            },
                            formId: ''
                        };
                        AjaxRequest.sendRequest(requestParams).then(response => {
                            console.log(response);
                            if (response.status === true) {
                                SweetAlert.alertAutoClose("success", "Feito", response.msg);
                                tabelaRouteView.row(row).remove().draw();
                            } else {
                                SweetAlert.info(response.msg);
                            }
                        }).catch(error => {
                            SweetAlert.error(error);
                        });
                    } else {
                        SweetAlert.info("Exclusão anulada");
                    }
                });
            });
            //Update
            function insertUpdateRoute(id = "") {
                modal = 'modalRoute'
                FormValidator.validar(modal + 'Form').then((isValid) => {
                    if (isValid) {
                        const requestParams = {
                            method: 'POST',
                            url: '{{ route('routeview.ajax.editar') }}',
                            data: {
                                'id': id,
                            },
                            formId: modal + 'Form'
                        };
                        AjaxRequest.sendRequest(requestParams).then(response => {
                            console.log(response);
                            if (response.status === true) {
                                SweetAlert.alertAutoClose("success", "Feito", response.msg);
                            } else {
                                SweetAlert.info(response.msg);
                            }
                            fecharModal(modal);
                        }).catch(error => {
                            SweetAlert.error(error);
                        });
                    }
                });
            }
            //FIM ROUTE
        });
    </script>

@stop
