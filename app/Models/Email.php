<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Email extends Model {
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'emails';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'destinatarios',
        'title',
        'corpo_email',
        'data_criacao',
        'data_envio',
        'status',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'status' => 'boolean',
    ];
}
