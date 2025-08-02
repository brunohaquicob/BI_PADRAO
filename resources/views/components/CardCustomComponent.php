<?php

namespace App\View\Components;

use Illuminate\View\Component;

class CardCustomComponent extends Component {
    public $tipo;
    public $identificador;
    public $color;
    public $icon;
    public $btAba1;
    public $btAba2;
    public $footer;
    public $style;
    public $title;


    public function __construct($tipo, $identificador, $color, $icon, $title, $btAba1, $btAba2, $footer, $style) {
        $this->tipo             = $tipo;
        $this->identificador    = $identificador;
        $this->color            = $color;
        $this->icon             = $icon;
        $this->title            = $title;
        $this->btAba1           = $btAba1;
        $this->btAba2           = $btAba2;
        $this->style            = $style;
        $this->footer           = $footer;
    }

    /**
     * Get the view / contents that represent the component.
     *
     * @return \Illuminate\Contracts\View\View|\Closure|string
     */
    public function render() {
        return view('components.cardcustom-component');
    }
}
