<?php

namespace App\Http\Class\Utilitarios;

/*
// Exemplo de uso
    $tabela = new GeradorTabela('tabela-exemplo', [], true);

    $tabela->adicionarCabecalho('Nome', 'texto', ['text-center']);
    $tabela->adicionarCabecalho('Idade', 'numerico', ['text-right'], false);
    $tabela->adicionarCabecalho('Salário', 'monetario', ['text-right'], false);

    $tabela->adicionarLinha(1, 'Nome', 'João', ['text-center']);
    $tabela->adicionarLinha(1, 'Idade', 25, ['text-right']);
    $tabela->adicionarLinha(1, 'Salário', 1500, ['text-right']);

    $tabela->adicionarLinha(2, 'Nome', 'Maria', ['text-center', 'bg-success']);
    $tabela->adicionarLinha(2, 'Idade', 30, ['text-right']);
    $tabela->adicionarLinha(2, 'Salário', 2000, ['text-right']);

    $tabela->adicionarLinha(3, 'Nome', 'Pedro', ['text-center']);
    $tabela->adicionarLinha(3, 'Idade', 35, ['text-right']);
    $tabela->adicionarLinha(3, 'Salário', 2500, ['text-right']);

    // Gerar tabela HTML
    $tabelaHTML = $tabela->gerarTabela();
 */

class GeradorTabela {
    private $id;
    private $classes;
    private $gerarFooter;
    private $attr;
    private $cabecalho = [];
    private $linhas = [];

    public function __construct($id, $classes = [], $gerarFooter = false, $attr = []) {
        $this->id               = $id;
        $this->classes          = count($classes) > 0 ? $classes : ['table', 'dataTablePadrao', 'table-bordered', 'table-hover', 'table-striped'];
        $this->gerarFooter      = $gerarFooter;
        $this->attr             = count($attr) > 0 ? $attr : ['style' => 'width:100%; font-size:12px;'];
    }

    public function adicionarCabecalho($nome, $tipo, $classeFooter = [], $cabecalhoCenter = true) {
        $this->cabecalho[] = [
            'nome'      => $nome,
            'tipo'      => $tipo,
            'classes'   => $classeFooter,
            'center'    => $cabecalhoCenter
        ];
    }

    public function adicionarLinha($id, $nomeColuna, $valor, $classes = [], $attr = []) {
        $this->linhas[$id][$nomeColuna] = [
            'valor'     => $valor,
            'classes'   => $classes,
            'attr'      => $attr
        ];
    }

    private function formatarValor($tipo, $valor) {
        switch ($tipo) {
            case 'texto':
                return $valor;
            case 'inteiro':
                return number_format($valor, 0, ',', '.');
            case 'numerico':
                return number_format($valor, 2, ',', '.');
            case 'monetario':
                return 'R$ ' . number_format($valor, 2, ',', '.');
            default:
                return $valor;
        }
    }

    public function gerarTabela() {
        $table = '<table id="' . $this->id . '" class="' . implode(' ', $this->classes) . '"';

        foreach ($this->attr as $key => $value) {
            $table .= ' ' . $key . '="' . $value . '"';
        }

        $table .= '>';
        $table .= '<thead><tr>';

        foreach ($this->cabecalho as $coluna) {
            $classes = ($coluna['center']) ? "text-center" : implode(' ', $coluna['classes']);
            $table  .= '<th ';
            $table  .= 'class="' . $classes . '"';
            $table  .= '>' . $coluna['nome'] . '</th>';
        }

        $table .= '</tr></thead><tbody>';

        foreach ($this->linhas as $linha) {
            $table .= '<tr>';

            foreach ($this->cabecalho as $coluna) {
                $table .= '<td';

                if (!empty($linha[$coluna['nome']]['classes'])) {
                    $table .= ' class="' . implode(' ', $linha[$coluna['nome']]['classes']) . '"';
                }

                foreach ($linha[$coluna['nome']]['attr'] as $key => $value) {
                    $table .= ' ' . $key . '="' . $value . '"';
                }

                $valorFormatado = $this->formatarValor($coluna['tipo'], $linha[$coluna['nome']]['valor']);

                $table .= '>' . $valorFormatado . '</td>';
            }

            $table .= '</tr>';
        }

        $table .= '</tbody>';

        if ($this->gerarFooter) {
            $table .= '<tfoot><tr>';

            foreach ($this->cabecalho as $coluna) {
                $table .= '<td';

                if ($coluna['tipo'] === 'numerico' || $coluna['tipo'] === 'inteiro' || $coluna['tipo'] === 'monetario') {
                    $valores = array_column($this->linhas, $coluna['nome']);
                    $soma = array_sum(array_column($valores, 'valor'));
                    $valorFormatado = $this->formatarValor($coluna['tipo'], $soma);

                    $table .= ' class="' . implode(' ', $coluna['classes']) . '"';
                    $table .= '>' . $valorFormatado . '</td>';
                } else {
                    $table .= '></td>';
                }
            }

            $table .= '</tr></tfoot>';
        }

        $table .= '</table>';

        return $table;
    }
}
