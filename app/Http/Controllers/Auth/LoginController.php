<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Providers\RouteServiceProvider;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class LoginController extends Controller {
    /*
    |--------------------------------------------------------------------------
    | Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles authenticating users for the application and
    | redirecting them to your home screen. The controller uses a trait
    | to conveniently provide its functionality to your applications.
    |
    */

    use AuthenticatesUsers;

    /**
     * Where to redirect users after login.
     *
     * @var string
     */
    //protected $redirectTo = RouteServiceProvider::HOME;

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct() {
        $this->middleware('guest')->except('logout');
    }
    protected function redirectTo() {
        $user = Auth::user();

        if ($user->hasRole('admin')) {
            return '/';
        } elseif ($user->hasRole('editor')) {
            return '/';
        } elseif ($user->hasRole('user')) {
            return '/';
        }

        // Redirecionamento padrão
        return RouteServiceProvider::HOME;
    }

    protected function authenticated(Request $request, $user) {
        // Verifica se o usuário já possui uma session_id registrada
        if ($user->session_id !== session()->getId()) {
            // Invalida a sessão anterior
            Auth::logoutOtherDevices($request->password);

            // Atualiza o session_id com o novo ID da sessão
            $user->session_id = session()->getId();
            $user->save();
        }

        // Verifica se o IP de acesso está permitido
        $allowedIP = $user->allowed_ip;
        $userIP = $request->getClientIp();

        if ($userIP !== $allowedIP && !in_array($allowedIP, ['*']) && !in_array($userIP, ['::1'])) {
            Log::channel('ip_not_allowed')->info('Login Efetuado', [
                'IP' => $userIP,
                'User' => $user,
                'Session ID' => session()->getId(),
            ]);
            Auth::logout(); // Desconecta o usuário
            return redirect()->route('login')->withErrors(['ip_not_allowed' => 'Seu IP de acesso não está permitido.']);
        }
        //Grava log de acesso
        Log::channel('login')->info('Login Efetuado', [
            'IP' => $userIP,
            'User' => $user,
            'Session ID' => session()->getId(),
        ]);
        // IP de acesso permitido, continua com o login normalmente
        return redirect()->intended($this->redirectPath());
    }
}
