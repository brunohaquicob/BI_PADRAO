<?php

namespace App\Console\Commands;

use App\Mail\EmailHelper;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class EnviarEmailsCommand extends Command {
    protected $signature = 'emails:enviar';
    protected $description = 'Envia e-mails pendentes';

    public function handle() {
        $enviosRealizados = EmailHelper::enviarEmailService();

        $this->info('E-mails enviados com sucesso! Total de envios: ' . $enviosRealizados);
    }
}
