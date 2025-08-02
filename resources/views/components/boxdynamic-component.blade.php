{{-- colors: https://adminlte.io/themes/v3/pages/UI/general.html --}}
@switch($componentName)
    @case('infobox')
        <div class="info-box bg-{{ $color }}" style="padding:10px;">
            <span class="info-box-icon"><i class="{{ $icon }}"></i></span>
            <div class="info-box-content">
                <span class="info-box-text" id="{{ $componentName }}{{ $identificador }}-1">{{ $text1 }}</span>
                <span class="info-box-number" id="{{ $componentName }}{{ $identificador }}-2">{{ $text2 }}</span>
            </div>
        </div>
    @break

    @case('smallbox')
        <div class="small-box bg-{{ $color }}">
            <div class="inner">
                <h3><span id="{{ $componentName }}{{ $identificador }}-1">{{ $text1 }}</span></h3>
                <p><span class="font_size_12" id="{{ $componentName }}{{ $identificador }}-2">{{ $text2 }}</span></p>
            </div>
            <div class="icon">
                <i class="{{ $icon }}"></i>
            </div>
        </div>
    @break

    @default
        <p>Box-Component not found.</p>
@endswitch
