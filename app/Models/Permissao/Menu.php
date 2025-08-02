<?php

namespace App\Models\Permissao;

use Illuminate\Database\Eloquent\Model;

class Menu extends Model {
    protected $table = 'menus';
    protected $fillable = ['parent_id', 'route_view_id', 'text', 'icon', 'iconcolor', 'order', 'active', 'header', 'label','label_color','label_date_active'];

    public function parent() {
        return $this->belongsTo(Menu::class, 'parent_id');
    }

    public function children() {
        return $this->hasMany(Menu::class, 'parent_id');
    }

    public function routeView() {
        return $this->belongsTo(RouteView::class, 'route_view_id');
    }

    public static function getMenuItems() {
        return self::with(['routeView'])
            ->where('parent_id', null)
            ->orderBy('order')
            ->get();
    }
}
