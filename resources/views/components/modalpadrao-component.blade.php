<div class="modal fade" id="{{ $id }}" tabindex="-1" role="dialog" aria-labelledby="{{ $id }}Title"
    aria-hidden="true" data-backdrop="static" data-keyboard="false">
    <div class="modal-dialog modal-{{ $size }}" role="document">
        <div class="modal-content modal-{{ $color }}">
            <div class="modal-header">
                <h5 class="modal-title" id="{{ $id }}Title">
                    {{ $title }}
                </h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <form id="{{ $id }}Form" onsubmit="return false;">
                    {!! $slot !!}
                </form>
            </div>
            <div class="modal-footer">
                @if ($showSaveButton == "S")
                    <button type="button" class="btn btn-primary" id="{{ $id }}Save" data-id="">Salvar</button>
                @endif
                @if ($showUpdateButton == "S")
                    <button type="button" class="btn btn-warning" id="{{ $id }}Update" data-id="">Atualizar</button>
                @endif
                @if ($showCancelButton == "S")
                    <button type="button" class="btn btn-default" id="{{ $id }}Cancel"
                        data-dismiss="modal">Cancelar</button>
                @endif
            </div>
        </div>
    </div>
</div>
