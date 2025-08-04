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

            //Pra ajudar a saber em que base estou programando
            if (strpos(strtoupper($empresa->app_name), "PADRAO") !== false) {
                $empresa->nome_bi_bruno .= "({$empresa->db_database})";
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
                'adminlte.logo' => config('custom.nome_bi_bruno', ''),
                // 'adminlte.logo_img' => 'img/logo.png', // para o topo
                'adminlte.logo_img' => 'img/' . ($empresa->app_img ?? 'logo.png'),

                //LOGIN
                'adminlte.auth_logo.enabled'    => true,
                'adminlte.auth_logo.img.path'   => 'img/' . ($empresa->app_img ?? 'logo.png'),
                'adminlte.auth_logo.img.alt'    => '',
                // 'adminlte.auth_logo.img.class' => 'elevation-3',
                'adminlte.auth_logo.img.class'  => '',
                'adminlte.auth_logo.img.width'  => 90,
                'adminlte.auth_logo.img.height' => 90,

                //LOADING
                'adminlte.preloader.enabled'    => true,
                'adminlte.preloader.img.path'   => 'img/' . ($empresa->app_img ?? 'logo.png'),
                'adminlte.preloader.img.alt'    => 'Loading',
                'adminlte.preloader.img.effect' => 'animation__shake',
                'adminlte.preloader.img.width'  => 90,
                'adminlte.preloader.img.height' => 90,

                //EMAIL
                // Mailer padrão
                'mail.default' => $empresa->mail_mailer ?? 'smtp',
                // Configuração de todos os mailers
                'mail.mailers.smtp' => [
                    'transport' => 'smtp',
                    'host' => $empresa->mail_host ?? 'smtp.gmail.com',
                    'port' => $empresa->mail_port ?? 587,
                    'encryption' => $empresa->mail_encryption ?? 'tls',
                    'username' => $empresa->mail_username ?? null,
                    'password' => $empresa->mail_password ?? null,
                    'timeout' => null,
                    'auth_mode' => null,
                ],
                'mail.mailers.sendmail' => [
                    'transport' => 'sendmail',
                    'path' => '/usr/sbin/sendmail -bs',
                ],
                'mail.mailers.log' => [
                    'transport' => 'log',
                    'channel' => $empresa->mail_log_channel ?? env('MAIL_LOG_CHANNEL', 'stack'),
                ],
                'mail.mailers.array' => [
                    'transport' => 'array',
                ],
                'mail.mailers.mailgun' => [
                    'transport' => 'mailgun',
                ],
                'mail.mailers.ses' => [
                    'transport' => 'ses',
                ],
                'mail.mailers.postmark' => [
                    'transport' => 'postmark',
                ],
                // Remetente global
                'mail.from.address' => $empresa->mail_from_address ?? 'no-reply@empresa.com',
                'mail.from.name' => $empresa->mail_from_name ?? ($empresa->app_name ?? 'BI'),
                // Configuração markdown
                'mail.markdown.theme' => 'default',
                'mail.markdown.paths' => [
                    resource_path('views/vendor/mail'),
                ],

            ]);
            
            // dd([
            //     'host_atual' => $host,
            //     'empresa' => $empresa,
            //     'banco_configurado' => Config::get('database.connections.mysql'),
            // ]);
        } catch (\Throwable $e) {
            if (!app()->runningInConsole()) {
                session()->flash('custom_error', 'Erro ao identificar empresa: ' . $e->getMessage());
                abort(500);
            }
        }
    }
}
