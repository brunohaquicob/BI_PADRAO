<?php

namespace App\View\Components;

use Illuminate\View\Component;

class ModalComponent extends Component {
    public $id;
    public $title;
    public $required;

    public function __construct($id, $title, $required = '') {
        $this->id       = $id;
        $this->title    = $title;
        $this->required = $required;
    }

    public function render() {
        return view('components.selectduallistbox-component');
    }
}
