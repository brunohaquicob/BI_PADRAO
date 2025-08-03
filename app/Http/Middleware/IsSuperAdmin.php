<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class IsSuperAdmin
{
    public function handle($request, Closure $next)
    {
        $user = Auth::user();

        if (!$user || $user->id != 1 || $user->role_id != 1) {
            abort(403, 'Acesso restrito');
        }

        return $next($request);
    }
}
