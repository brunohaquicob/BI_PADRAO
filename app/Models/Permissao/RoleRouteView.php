<?php

namespace App\Models\Permissao;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoleRouteView extends Model
{
    use HasFactory;
    protected $table = 'role_route_view';
    protected $fillable = ['role_id', 'route_view_id'];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function routeView()
    {
        return $this->belongsTo(RouteView::class);
    }
}
