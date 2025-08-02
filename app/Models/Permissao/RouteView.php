<?php

namespace App\Models\Permissao;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RouteView extends Model
{
    use HasFactory;

    // Defina os campos que podem ser preenchidos em massa
    protected $fillable = ['name', 'url', 'route_name', 'controller', 'method', 'active'];

    // Relacionamento com a tabela de roles
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_route_view');
    }
}
