<?php

namespace App\Http\Controllers\Utilitarios;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Config;

class HostControllerCheck extends Controller
{
    public static function checkHostAvailability($connectionName)
    {
        $databaseConfig = Config::get("database.connections.{$connectionName}");
        $host = $databaseConfig['host'];
        $port = $databaseConfig['port'];
        $timeout = 3; // Tempo limite em segundos

        $socket = @fsockopen($host, $port, $errno, $errstr, $timeout);

        if ($socket) {
            fclose($socket);
            return true;
        }

        return false;
    }
}
