<?php

namespace App\View\Components;

use Illuminate\View\Component;

class ModalComponent extends Component
{
    public $id;
    public $size;
    public $color;
    public $title;
    public $showSaveButton;
    public $showUpdateButton;
    public $showCancelButton;

    public function __construct($id, $title, $size = 'md', $color = 'primary', $showSaveButton = "S", $showUpdateButton = "N", $showCancelButton = "S")
    {
        $this->id = $id;
        $this->size = $size;
        $this->color = $color;
        $this->title = $title;
        $this->showSaveButton = $showSaveButton;
        $this->showUpdateButton = $showUpdateButton;
        $this->showCancelButton = $showCancelButton;
    }

    public function render()
    {
        return view('components.modalpadrao-component');
    }
}
