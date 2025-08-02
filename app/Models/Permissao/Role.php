<?php

namespace App\Models\Permissao;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
    ];

    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'role_permission');
    }
    public function users()
    {
        return $this->belongsToMany(User::class);
    }
}
