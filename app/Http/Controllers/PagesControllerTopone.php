<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use App\Models\Permissao\RouteView;
use Illuminate\Support\Facades\Route;

class PagesControllerTopone extends Controller {
    /**
     * Create a new controller instance.
     *
     * @return void
     */

    private $empresa;

    public function __construct() {
        $this->middleware('auth');
        $this->empresa = app('empresa');
    }

    public function rel_acordos_padrao() {
        if (!Auth::check()) {
            return redirect()->route('login');
        }
        
        $data = [
        ];
        // dd($data);
        $routeName          = Route::currentRouteName();
        $nameView           = RouteView::where('route_name', $routeName)->first();
        $data['nameView']   = $nameView->name;
        return view('pages.topone.rel_acordos_padrao', $data);
        
    }



}
