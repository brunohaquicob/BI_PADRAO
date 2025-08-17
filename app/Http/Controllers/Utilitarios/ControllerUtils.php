<?php

namespace App\Http\Controllers\Utilitarios;

use App\Exceptions\ObrigatoriosException;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Users\EmpresaController;
use App\Models\Empresa;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;

class ControllerUtils extends Controller {

    public static function jsonResponse($bolean, $data, $msg = "", $status = 200) {
        return response()->json([
            'status' => $bolean,
            'data' => $data,
            'msg' => $msg
        ], $status, [], JSON_PRETTY_PRINT);
    }

    public static function salvaDadosCsv($bolean, $data, $msg = "", $fileName = "", $status = 200) {
        if (empty($fileName)) {
            $fileName = uniqid();
        }
        $fileName .= ".csv";
        $filePath = "public/{$fileName}"; // Define o caminho do arquivo relativo ao disco 'public'

        // Abre o arquivo CSV para escrita
        $csvFile = fopen(storage_path("app/{$filePath}"), 'w');

        if ($csvFile === false) {
            return response()->json([
                'status' => false,
                'data' => [],
                'fileUrl' => '',
                'msg' => 'Não foi possível criar o arquivo CSV.'
            ], 500);
        }

        $loop = 0;
        foreach ($data as $linha) {
            if ($loop == 0) {
                $header = array_keys($linha); // Pega as chaves do primeiro elemento do array
                fputcsv($csvFile, $header); // Escreve o cabeçalho no arquivo CSV
            }
            fputcsv($csvFile, $linha); // Escreve cada linha no arquivo CSV
            $loop++;
        }

        fclose($csvFile);

        // Obtém a URL do arquivo
        $fileUrl = Storage::url($filePath);

        return response()->json([
            'status' => $bolean,
            'data' => [],
            'fileUrl' => $fileUrl,
            'msg' => $msg
        ], $status);
    }

    /**
     * @return Array
     */
    public static function validateRequest(Request $request, array $ar_fields) {
        try {
            return $request->validate($ar_fields);
        } catch (ValidationException $e) {
            // Acesso aos erros de validação
            $html = '';
            foreach ($e->errors() as $field => $messages) {
                $html .= '<div class="callout callout-danger">';
                $html .= '<h4>' . ucfirst(str_replace('password', 'senha', $field)) . '</h4>';
                foreach ($messages as $message) {
                    $html .= '<p><small>' . str_replace('password', 'senha', $message) . '</small></p>';
                }
                $html .= '</div>';
            }
            throw new Exception($html, 1);
        } catch (\Exception $e) {
            throw new Exception($e->getMessage(), 1);;
        }
    }
    public static function validateRequestObrigatorios(Request $request, array $ar_fields) {
        try {
            return $request->validate($ar_fields);
        } catch (ValidationException $e) {
            // Acesso aos erros de validação
            $html = '';
            foreach ($e->errors() as $field => $messages) {
                $html .= '<div class="callout callout-danger">';
                $html .= '<h4>' . ucfirst(str_replace('password', 'senha', $field)) . '</h4>';
                foreach ($messages as $message) {
                    $html .= '<p><small>' . str_replace('password', 'senha', $message) . '</small></p>';
                }
                $html .= '</div>';
            }
            throw new ObrigatoriosException($html, 1);
        } catch (\Exception $e) {
            throw new Exception($e->getMessage(), 1);;
        }
    }

    public static function validaNecessarios(array $keys, array $request) {

        foreach ($keys as $key) {
            if (!array_key_exists($key, $request)) {
                throw new Exception("Key obrigatória não informada: {$key}", 1);
            }
        }
        return true;
    }
    public static function tratarDados(Request $request) {
        $dados = $request->all();
        return array_map(function ($valor) {
            // Verificar se o valor é um array
            if (is_array($valor)) {
                // Se for um array, aplicar recursivamente a função de tratamento em cada elemento
                return array_map([self::class, 'tratarValor'], $valor);
            }
            // Se não for um array, aplicar a função de tratamento no valor
            return self::tratarValor($valor);
        }, $dados);
    }

    public static function mysql2date($data, $format = 'd/m/Y') {
        return Carbon::parse($data)->format($format);
    }

    public static function fases_padrao() {
        return [
            ["name" => "-0", "ini" => -9999, "fim" => -1], //0
            ["name" => "0 - 15", "ini" => 0, "fim" => 15], //0
            ["name" => "16 - 30", "ini" => 16, "fim" => 30], //1
            ["name" => "31 - 44", "ini" => 31, "fim" => 44], //2
            ["name" => "45 - 60", "ini" => 45, "fim" => 60], //3
            ["name" => "61 - 90", "ini" => 61, "fim" => 90], //4
            ["name" => "91 - 180", "ini" => 91, "fim" => 180], //5
            ["name" => "181 - 365", "ini" => 181, "fim" => 365], //6
            ["name" => "366 - 730", "ini" => 366, "fim" => 730], //7
            ["name" => "731 - 1095", "ini" => 731, "fim" => 1095], //8
            ["name" => "1096 - 1460", "ini" => 1096, "fim" => 1460], //9
            ["name" => "1461 - 1825", "ini" => 1461, "fim" => 1825], //10
            ["name" => "1826 - 99999", "ini" => 1826, "fim" => 9999], //11
        ];
    }

    public static function fases_padrao_name($valor) {
        foreach (self::fases_padrao() as $fase) {
            if (self::isBetween($valor, $fase['ini'], $fase['fim'])) {
                return $fase['name'];
            }
        }
        return "Não Localizada.";
    }

    public static function fases_padrao_senff() {
        return [
            ["name" => "-0", "ini" => -9999, "fim" => -1], //0
            ["name" => "0 - 15", "ini" => 0, "fim" => 15], //0
            ["name" => "16 - 30", "ini" => 16, "fim" => 30], //1
            ["name" => "31 - 44", "ini" => 31, "fim" => 44], //2
            ["name" => "45 - 60", "ini" => 45, "fim" => 60], //3
            ["name" => "61 - 90", "ini" => 61, "fim" => 90], //4
            ["name" => "91 - 180", "ini" => 91, "fim" => 180], //5
            ["name" => "181 - 365", "ini" => 181, "fim" => 365], //6
            ["name" => "366 - 730", "ini" => 366, "fim" => 730], //7
            ["name" => "731 - 1095", "ini" => 731, "fim" => 1095], //8
            ["name" => "1096 - 1460", "ini" => 1096, "fim" => 1460], //9
            ["name" => "1461 - 1825", "ini" => 1461, "fim" => 1825], //10
            ["name" => "1826 - 99999", "ini" => 1826, "fim" => 9999], //11
        ];
    }

    public static function fases_padrao_senff_name($valor) {
        foreach (self::fases_padrao_senff() as $fase) {
            if (self::isBetween($valor, $fase['ini'], $fase['fim'])) {
                return $fase['name'];
            }
        }
        return "Não Localizada.";
    }

    public static function isBetween($num, $start, $end) {
        return ($num >= $start && $num <= $end);
    }

    public static function convertData($dataHora, $formatIn = 'd/m/Y H:i:s', $formatOut = 'Y-m-d H:i:s') {
        return Carbon::createFromFormat($formatIn, $dataHora)->format($formatOut);
    }

    //NAO ESTOU USANDO
    public static function tratarValor($valor) {
        // Tratar Injections - tenho q ver isso ainda
        return ($valor);
    }
    public static function ajustaCodificacao($valor) {
        return html_entity_decode($valor);
    }
    public static function arrayToStringComAspas($array, $separador = ',') {
        $quotedValues = array_map(function ($valor) {
            return "'" . addslashes($valor) . "'";
        }, $array);
        return implode($separador, $quotedValues);
    }
    public static function arrayToString($array, $separador = ',') {
        return is_array($array) ? implode($separador, $array) : $array;
    }

    public static function retornaUfCompleta($sigla, $upper = false) {
        mb_internal_encoding('UTF-8');
        $retorno = "";
        switch (strtoupper($sigla)) {
            case 'AC':
                $retorno = 'Acre';
                break;
            case 'AL':
                $retorno = 'Alagoas';
                break;
            case 'AP':
                $retorno = 'Amapá';
                break;
            case 'AM':
                $retorno = 'Amazonas';
                break;
            case 'BA':
                $retorno = 'Bahia';
                break;
            case 'CE':
                $retorno = 'Ceará';
                break;
            case 'DF':
                $retorno = 'Distrito Federal';
                break;
            case 'ES':
                $retorno = 'Espírito Santo';
                break;
            case 'GO':
                $retorno = 'Goiás';
                break;
            case 'MA':
                $retorno = 'Maranhão';
                break;
            case 'MT':
                $retorno = 'Mato Grosso';
                break;
            case 'MS':
                $retorno = 'Mato Grosso do Sul';
                break;
            case 'MG':
                $retorno = 'Minas Gerais';
                break;
            case 'PA':
                $retorno = 'Pará';
                break;
            case 'PB':
                $retorno = 'Paraíba';
                break;
            case 'PR':
                $retorno = 'Paraná';
                break;
            case 'PE':
                $retorno = 'Pernambuco';
                break;
            case 'PI':
                $retorno = 'Piauí';
                break;
            case 'RJ':
                $retorno = 'Rio de Janeiro';
                break;
            case 'RN':
                $retorno = 'Rio Grande do Norte';
                break;
            case 'RS':
                $retorno = 'Rio Grande do Sul';
                break;
            case 'RO':
                $retorno = 'Rondônia';
                break;
            case 'RR':
                $retorno = 'Roraima';
                break;
            case 'SC':
                $retorno = 'Santa Catarina';
                break;
            case 'SP':
                $retorno = 'São Paulo';
                break;
            case 'SE':
                $retorno = 'Sergipe';
                break;
            case 'TO':
                $retorno = 'Tocantins';
                break;
            default:
                $retorno = 'Não Informado';
                break;
        }
        return ($upper) ? mb_strtoupper($retorno) : $retorno;
    }

    public static function removeNumeros($str) {
        return preg_replace('/\d+/', '', $str);
    }

    public static function excutarChamadaApiAqc($b = "", $a = "", $post_data = [], &$time_request = 0, $limit = false) {
        if ($limit === true) {
            set_time_limit(0);
            ini_set('memory_limit', '32384M');
        }
        $empresa = EmpresaController::getEmpresaByUser();
        if ($empresa !== false) {
            $servidor = 'app';
            if (strpos(strtoupper($_SERVER['HTTP_HOST']), "HML.") !== false) {
                $servidor = 'homolog2';
            }

            $url = "https://{$servidor}.aquicob.com.br/api.php?a={$a}&b={$b}";
            // dd($url);
            $user = Auth::user();
            $credor_grupo = $user->gruposAqc->pluck('uga_fk_bbcg_codigo');

            $json_data = [
                'emp_codigo' => $empresa->emp_fk_emp_codigo,
                'bi_id_grupo_usuario'   => $user->role_id,
                'bi_id_usuario'         => $user->id,
                'bi_bbcg_codigo'        => $credor_grupo,
            ];
            if (!empty($post_data)) {
                $json_data = array_merge($json_data, $post_data);
            }

            // Inicia o cálculo do tempo
            $start_time = microtime(true);


            try {
                $response = Http::withHeaders([
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . $empresa->emp_api_token
                ])->withOptions([
                    'verify' => false,
                    'timeout' => (60 * 15), // 15 minutos
                    'connect_timeout' => 10,
                ])->post(
                    $url,
                    $json_data
                );
            } catch (RequestException $e) {
                throw new \Exception("Erro de conexão com a API: " . $e->getMessage());
            }


            // Calcula o tempo da requisição
            $time_request = round(microtime(true) - $start_time, 3);

            // Verifica se a resposta é válida
            if ($response->successful()) {
                $responseData = $response->body();
                // Verifica se a resposta é um JSON válido
                $data = json_decode($responseData, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    // Retorna a resposta como array
                    return $data;
                } else {
                    // Trate o erro caso a resposta não seja um JSON válido
                    dd($response->body());
                    throw new \Exception('Resposta da API não é um JSON válido. Conteúdo recebido: ' . substr($responseData, 0, 500));
                }
            } else {
                // Trata erros de resposta
                throw new \Exception('Erro ao consumir a API: ' . $response->status());
            }
        } else {
            throw new Exception("Usuario não possui empresa Vinculada", 1);
        }
    }

    public static function retornaHtml($fileCSV, $linhas, $frase_topo = "") {
        $frase_topo = $frase_topo != "" ? $frase_topo : "Ops, infelizmente essa página não conseguiu renderizar o resultado de sua consulta. Mas não se preocupe, geramos um arquivo com os seus dados.";
        return
            '<div class="card mt-4 border-info">
                <div class="card-header text-center bg-info text-white">
                    <i class="fa fa-file-excel-o" aria-hidden="true"></i>
                    <h3 class="card-title d-inline-block mb-0 ml-2">Aviso!</h3>
                </div>
                <div class="card-body text-center">
                    <blockquote class="blockquote">
                        <p class="mb-2">' . $frase_topo . '</p>
                        <footer class="blockquote-footer">Total de resultados: <cite title="">' . $linhas . ' linhas.</cite></footer>
                        <footer class="blockquote-footer">Para baixar seu arquivo utilize o botão: <cite title="Baixar Relatório">Baixar Relatório</cite></footer>
                    </blockquote>
                    <button class="btn btn-success mt-3 download" 
                            type="button"
                            onclick="window.location.href=\'' . $fileCSV . '\'">Baixar Relatório</button>
                </div>
            </div>';
    }

    public static function ajeitaDadosParaTabela($ar_config, $ar_dados) {
        if (empty($ar_config) || empty($ar_dados)) {
            return false;
        }
        $pos = 0;
        $keys = array_keys($ar_dados[0]);
        $config = [];
        foreach ($ar_config as $key => $value) {
            if (!in_array($key, $keys)) {
                continue;
            }
            $value["pos"] = $pos;
            //nome Nome da coluna
            //alinhamento Pode ser text-center, text-left, text-right
            //decimalPlaces Pode ser null, qtd decimal, date, datetime
            //somar_footer true ou false
            $config[$key] = ["pos" => $pos, "nome" => $value[0], "alinhamento" => $value[1], "decimalPlaces" => $value[2], "somar_footer" => $value[3]];
            $pos++;
        }
        if (empty($config)) {
            return false;
        }

        //Dados
        $dados = [];
        foreach ($ar_dados as $linha) {
            $temp = [];
            foreach ($config as $chave => $info) {
                // if ($chave == 'aci_status') {
                //     $linha[$chave] = AcordoItem::$status[$linha[$chave]];
                // } else if ($chave == 'aco_status') {
                //     $linha[$chave] = Acordo::$status_acordo[$linha[$chave]];
                // }
                $temp[$info['pos']] = !empty($linha[$chave]) ? $linha[$chave] : "";
            }
            ksort($temp); // Garante ordem correta se posições forem fora de ordem
            $dados[] = array_values($temp); // Só se precisar garantir array indexado 0,1,2,...
        }
        return ["dados" => $dados, "colunas_config" => array_values($config)];
    }

    public static function gerarUltimosMesesAr($qtd_meses = 12): array {
        $meses = [];
        $dataAtual = new \DateTime('first day of this month');

        for ($i = 0; $i < $qtd_meses; $i++) {
            $col1 = $dataAtual->format('Y-m');
            $col2 = strtolower($dataAtual->format('M-Y')); // Ex: jul-2025
            $col2 = str_replace(
                ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
                ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
                $col2
            );

            $meses[] = [
                'col1' => $col1,
                'col2' => $col2
            ];
            $dataAtual->modify('-1 month');
        }

        return $meses;
    }

    public static function erroAbort($msg, $codigo = 500) {
        session()->flash('custom_error', 'Erro: ' . $msg);
        abort($codigo);
    }
}
