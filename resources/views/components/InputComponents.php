<?php

namespace App\View\Components;

use Illuminate\View\Component;

class InputComponents extends Component {
    public $id;
    public $tamanhoCol;
    public $placeholder;
    public $value;
    public $required;

    /**
     * Create a new component instance.
     *
     * @param  string  $id
     * @param  string  $tamanhoCol
     * @param  string  $placeholder
     * @param  string  $value
     * @param  string  $required
     * @return void
     */
    public function __construct($id, $tamanhoCol, $required = "", $placeholder = "", $value = "") {
        $this->id = $id;
        $this->tamanhoCol = $tamanhoCol;
        $this->placeholder = $placeholder;
        $this->value = $value;
        $this->required = $required;
    }

    /**
     * Get the view / contents that represent the component.
     *
     * @return \Illuminate\Contracts\View\View|\Closure|string
     */
    public function render() {
        return view('components.custom-component');
    }
}
