<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Produto extends Model
{
    protected $table = 'produtos'; // Nome da tabela no banco de dados
    protected $fillable = ['nome', 'grupo']; // Campos preenchíveis em massa

    // Se você não estiver usando os timestamps 'created_at' e 'updated_at', defina a propriedade abaixo como false
    public $timestamps = false;
}