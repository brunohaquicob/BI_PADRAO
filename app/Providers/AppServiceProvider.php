<?php

namespace App\Providers;

use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider {
    /**
     * Register any application services.
     */
    public function register() {
        // Componente customizado (o que você já usava)
        $this->app->singleton('custom-component', function () {
            return CustomComponent::class;
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot() {
        Schema::defaultStringLength(191);

        if ($this->app->runningInConsole()) {
            return;
        }

        $host = request()->getHost();

        try {
            $empresas = DB::connection('centralizador')->table('empresas')->get();

            $empresa = $empresas->first(function ($e) use ($host) {
                return Str::startsWith($e->dominio, '*')
                    ? Str::endsWith($host, ltrim($e->dominio, '*'))
                    : $e->dominio === $host;
            });

            if (!$empresa) {
                throw new \Exception('Empresa não encontrada');
            }
            DB::purge('mysql');
            Config::set('database.connections.mysql', [
                'driver' => 'mysql',
                'host' => $empresa->db_host,
                'port' => $empresa->db_port,
                'database' => $empresa->db_database,
                'username' => $empresa->db_username,
                'password' => $empresa->db_password,
                'charset' => 'utf8mb4',
                'collation' => 'utf8mb4_unicode_ci',
                'prefix' => '',
                'strict' => true,
                'engine' => null,
            ]);

            Config::set('database.default', 'mysql');

            Config::set('app.name', $empresa->app_name ?? 'BI');
            Config::set('custom.app_img', $empresa->app_img ?? 'default.png');
            Config::set('custom.nome_bi_bruno', $empresa->nome_bi_bruno ?? 'GENÉRICO');

            Config::set('mail.mailer', $empresa->mail_mailer ?? 'smtp');
            Config::set('mail.host', $empresa->mail_host ?? null);
            Config::set('mail.port', $empresa->mail_port ?? 587);
            Config::set('mail.username', $empresa->mail_username ?? null);
            Config::set('mail.password', $empresa->mail_password ?? null);
            Config::set('mail.encryption', $empresa->mail_encryption ?? 'tls');
            Config::set('mail.from.address', $empresa->mail_from_address ?? null);
            Config::set('mail.from.name', $empresa->mail_from_name ?? $empresa->app_name);

            App::instance('empresa', $empresa);

            config([
                'adminlte.title' => 'BI ' . ($empresa->nome_bi_bruno ?? 'GENÉRICO'),
                'adminlte.logo' => '<b>BI</b> ' . config('custom.nome_bi_bruno', ''),
                'adminlte.logo_img' => 'vendor/adminlte/dist/img/' . ($empresa->app_img ?? 'jallbanner90x90.png'),
                // 'adminlte.logo_img' => 'vendor/adminlte/dist/img/jallbanner90x90.png',
            ]);

            // dd([
            //     'host_atual' => $host,
            //     'empresa' => $empresa,
            //     'banco_configurado' => Config::get('database.connections.mysql'),
            // ]);
        } catch (\Throwable $e) {
            if (!app()->runningInConsole()) {
                abort(500, 'Erro ao identificar tenant: ' . $e->getMessage());
            }
        }
    }
}
