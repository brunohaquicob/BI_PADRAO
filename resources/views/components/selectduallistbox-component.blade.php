<div class='card card-primary card-outline'>
    <div class='card-header'>
        <h3 class='card-title'><i class='fas fa-edit'></i> {{ $title }}</h3>
    </div>
    <div class='card-body'>
        <div class='form-group'>
            <select id='{{ $id }}' name='{{ $id }}[]' class='selectduallistbox' multiple='multiple' style='display: none;' {{ $required }}>
                @props(['dados'])
                @foreach ($dados as $v)
                    <option value='{{ $v['col1'] }}'>{{ $v['col2'] }}</option>
                @endforeach
            </select>
        </div>
    </div>
</div>
