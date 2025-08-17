<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Empresa extends Model {
    use HasFactory;

    protected $table = 'empresa';

    protected $primaryKey = 'emp_codigo';

    public $timestamps = true;

    protected $fillable = [
        'emp_nome',
        'emp_fantasia',
        'emp_logo',
        'emp_api_token',
        'emp_fk_emp_codigo',
        'emp_ativo',
    ];

    protected $casts = [
        'emp_ativo' => 'string',
    ];

}
