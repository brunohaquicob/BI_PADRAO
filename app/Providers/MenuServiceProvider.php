<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Permissao\Menu;
use App\Models\Permissao\RouteView;
use DateTime;
use Illuminate\Pagination\Paginator;
use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Support\Facades\Auth;
use JeroenNoten\LaravelAdminLte\Events\BuildingMenu;

class MenuServiceProvider extends ServiceProvider {
    /**
     * Register services.
     *
     * @return void
     */
    public function register() {
        //
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot(Dispatcher $events) {
        // Salvar os itens do menu na configuração compartilhada

        Paginator::useBootstrap();

        $events->listen(BuildingMenu::class, function (BuildingMenu $event) {
            $menuItems = $this->buildMenuItems();
            $event->menu->addAfter(
                'menuProcura',
                ...$menuItems
            );
        });
    }

    /**
     * Build the menu items.
     *
     * @param  int|null  $parentId
     * @return array
     */
    private function buildMenuItems($parentId = null) {
        $menuItems = [];

        $menus = Menu::where('parent_id', $parentId)
            ->where('active', 1)
            ->orderBy('order')
            ->get();

        foreach ($menus as $menu) {
            $menuItem = [
                'text' => html_entity_decode($menu->text),
                'icon' => $menu->icon,
                'icon_color' => $menu->iconcolor,
                'myHeader' => $menu->header,
            ];
            //Monta Label
            $this->montaLabel($menuItem, $menu);

            if ($menu->route_view_id === null) {
                $submenuItems = $this->buildMenuItems($menu->id);

                if (!empty($submenuItems)) {
                    $menuItem['submenu'] = $submenuItems;
                }
            } else {
                $routeView = RouteView::join('role_route_view', 'route_views.id', '=', 'role_route_view.route_view_id')
                    ->where('role_route_view.role_id', Auth::user()->role_id)
                    ->find($menu->route_view_id);

                if ($routeView) {
                    $menuItem['route'] = $routeView->route_name;
                    $menuItem['url'] = $routeView->url;
                    $menuItem['text'] = html_entity_decode($routeView->name);
                }
            }
            $menuItems[] = $menuItem;
        }
        // Filtrar os itens indesejados
        $menuItems = array_filter($menuItems, function ($menuItem) {
            return !empty($menuItem['route']) || !empty($menuItem['submenu']);
        });

        // Adicionar headers
        $menuItemsWithHeaders = [];
        $lastHeader = null;
        foreach ($menuItems as $menuItem) {
            if (!empty($menuItem['myHeader'])) {
                if ($menuItem['myHeader'] !== $lastHeader) {
                    $menuItemsWithHeaders[] = ['header' => $menuItem['myHeader']];
                    $lastHeader = $menuItem['myHeader'];
                }
            }
            $menuItemsWithHeaders[] = $menuItem;
        }

        return $menuItemsWithHeaders;
    }

    private function montaLabel(&$menuItem, $menu) {
        if (isset($menu->label_date_active) && !empty($menu->label_date_active)) {
            $campoDatetime = $menu->label_date_active;
            // Cria um objeto DateTime contendo a data e hora atuais
            $dataAtual = new DateTime(); 
            // Cria um objeto DateTime a partir do valor do campo datetime do banco de dados
            $campoDatetimeObj = DateTime::createFromFormat('Y-m-d H:i:s', $campoDatetime); 
            if ($campoDatetimeObj > $dataAtual && !empty($menu->label)) {
                $menuItem['label']          = $menu->label;
                $menuItem['label_color']    = $menu->label_color;
            }
        }
    }
}
