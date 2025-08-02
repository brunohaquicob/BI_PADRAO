<?php

namespace App\Models;

use App\Models\Permissao\Role;
use App\Models\Permissao\Permission;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable {
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'session_id',
        'role_id',
        'active', //S N B
        'allowed_ip'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];
    // Outros atributos e métodos...

    // Relacionamento com a tabela roles
    public function role() {
        return $this->belongsTo(Role::class, 'role_id');
    }

    // Verifica se o usuário possui a role especificada
    public function hasRole($roles) {
        $userRole = $this->role->name;
        if (is_string($roles)) {
            $roles = explode(",", $roles);
        }
        return in_array($userRole, $roles);
    }

    // Relacionamento com a tabela permissions através da tabela role_permission
    public function permissions() {
        return $this->role->permissions();
    }

    // Verifica se o usuário possui a permissão especificada
    public function hasPermission($permission) {
        return $this->permissions->contains('name', $permission);
    }

    // app/Models/User.php
    public function empresas() {
        return $this->belongsToMany(Empresa::class, 'user_empresa', 'use_fk_id_user', 'use_fk_emp_empresa');
    }
}
