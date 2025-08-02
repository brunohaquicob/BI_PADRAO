<?php

namespace App\View\Components;

use Illuminate\View\Component;

class BoxDynamicComponent extends Component {
    public $componentName;
    public $identificador;
    public $color;
    public $icon;
    public $text1;
    public $text2;
    public $text3;


    public function __construct($componentName, $identificador, $color, $icon = "", $text1 = "", $text2 = "", $text3 = "") {
        $this->identificador    = $componentName;
        $this->identificador    = $identificador;
        $this->color            = $color;
        $this->icon             = $icon;
        $this->text1            = $text1;
        $this->text2            = $text2;
        $this->text3            = $text3;
    }

    /**
     * Get the view / contents that represent the component.
     *
     * @return \Illuminate\Contracts\View\View|\Closure|string
     */
    public function render() {
        return view('components.boxdynamic-component');
    }
}
