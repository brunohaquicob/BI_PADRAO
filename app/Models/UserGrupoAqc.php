<?php
// app/Models/UserGrupoAqc.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserGrupoAqc extends Model
{
    protected $table = 'user_grupo_aqc';
    public $timestamps = false;
    public $incrementing = false;      // não tem auto-increment
    protected $primaryKey = null;      // sem PK única (apenas leitura/insert simples)

    protected $fillable = ['uga_fk_id_user', 'uga_fk_bbcg_codigo'];
}
