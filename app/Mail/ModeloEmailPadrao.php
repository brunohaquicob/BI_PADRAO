<?php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ModeloEmailPadrao extends Mailable
{
    use Queueable, SerializesModels;

    public $dadosEmail;

    public function __construct($dadosEmail)
    {
        $this->dadosEmail = $dadosEmail;
    }

    public function build()
    {
        return $this->view('pages.modelos_email.modelo_email_padrao')->with($this->dadosEmail);
    }
}
