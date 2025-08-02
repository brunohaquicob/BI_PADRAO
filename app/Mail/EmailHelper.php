<?php

namespace App\Mail;

use App\Models\Email;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;

class EmailHelper {
    public static function enviar($destinatario, $titulo, $corpo) {
        $dadosEmail = [
            'titulo' => $titulo,
            'corpo' => $corpo
        ];

        Mail::to($destinatario)->send(new \App\Mail\ModeloEmailPadrao($dadosEmail));
    }

    public static function enviarEmailService() {
        $emails = Email::where('status', false)->get();

        foreach ($emails as $email) {
            $destinatarios = explode(',', $email->destinatarios);
            $titulo = $email->title;
            $corpo = $email->corpo_email;
            
            foreach ($destinatarios as $destinatario) {
                $dados = [
                    'titulo' => $titulo,
                    'corpo' => $corpo,
                    'destinatario'=> $destinatario
                ];
                self::sendEmailService($dados, "ModeloEmailPadrao");
            }

            $email->status      = true;
            $email->data_envio  = Carbon::now();
            $email->save();
        }

        return count($emails);
    }
    private static function sendEmailService($dados, $view = 'ModeloEmailPadrao') {
        $emailClass = "\App\Mail\\" . $view;
        Mail::to($dados['destinatario'])->send(new $emailClass($dados));
    }
    
}
