<table class="dataTablePadrao table table-striped" id="tabelaUsuario">
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
        <tr data-id="{{ $user->id }}">
            <td class="text-center">{{ $user->id }}</td>
            <td>{{ $user->name }}</td>
            <td>{{ $user->email }}</td>
            <td class="text-center">{{ $user->role->name ?? '-' }}</td>
            <td class="text-center">
                @if ($user->active == 'S') Ativo
                @elseif ($user->active == 'N') Desativado
                @elseif ($user->active == 'B') Bloqueado
                @else Outro valor
                @endif
            </td>
            <td class="text-center">
                <button type="button" class="btn btn-warning edit-user"
                        data-id="{{ $user->id }}" data-name="{{ $user->name }}"
                        title="Editar Dados">
                    <i class="fas fa-user-edit"></i>
                </button>
                &nbsp;
                <button type="button" class="btn btn-info btn-reset-password"
                        data-id="{{ $user->id }}" data-name="{{ $user->name }}"
                        title="Alterar Senha">
                    <i class="fas fa-unlock-alt"></i>
                </button>
            </td>
        </tr>
    @endforeach
    </tbody>
</table>
