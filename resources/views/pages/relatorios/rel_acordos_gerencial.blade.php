@extends('adminlte::page')

@section('title', $nameView)

@section('content_header')
    <h4 class="w100perc text-center">{{ $nameView }}</h4>
@stop

@section('content')

    <div class="card">
        <div class="card-header">
            <h3 class="card-title">Filtros</h3>

            <div class="card-tools">
                <button type="button" class="btn btn-tool" data-card-widget="collapse" title="Collapse">
                    <i class="fas fa-minus"></i>
                </button>
            </div>
        </div>
        <div class="card-body">
            <form id="form_filtros_pesquisa">
                <div class="row">
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="nvl1">Nível 1:</label>
                            <select class="form-control nvl" id="nvl1" name="nvl1" required="true">
                                <option value="">Selecione uma opção</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="nvl2">Nível 2:</label>
                            <select class="form-control nvl" id="nvl2" name="nvl2" required="true">
                                <option value="">Selecione uma opção</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="nvl3">Nível 3:</label>
                            <select class="form-control nvl" id="nvl3" name="nvl3" required="true">
                                <option value="">Selecione uma opção</option>
                            </select>
                        </div>
                    </div>

                </div>
                
                <div class="row">
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="rel_canal">Canal Origem:</label>
                            <select class="form-control select2" id="rel_canal" name="rel_canal[]" multiple="multiple">
                                @foreach ($canais_senff as $v)
                                    <option value='{{ $v['col1'] }}'>{{ $v['col2'] }}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="tipo_qtd">Tipo de resultado:</label>
                            <select class="form-control" id="tipo_qtd" name="tipo_qtd" required="true">
                                <option value="0" selected>Por Quantidade</option>
                                <option value="2">Por Valor</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="tipo_qtd">Tipo de relatório:</label>
                            <select class="form-control" id="tipo_rel" name="tipo_rel" required="true">
                                <option value="A" selected>Acordos</option>
                                <option value="B">Pagamentos</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-4">
                        <x-calendario-component id='dateRangePicker' event-name='dateRangeSelected' :options="[]" type='input' autoApply='false' single='N' />
                    </div>
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="loja_cartao">Loja Cartão:</label>
                            <div class="input-group">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">Nome ou CNPJ: </span>
                                </div>
                                <input type="text" class="form-control" id="loja_cartao" name="loja_cartao" value="">
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="qtd_nvl3_agrupador">Agrupador:</label>
                            <div class="input-group">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">Agrupar Qtd inferior a: </span>
                                </div>
                                <input type="number" class="form-control" id="qtd_nvl3_agrupador" name="qtd_nvl3_agrupador" required="true" value="5">
                                <div class="input-group-append">
                                    <span class="input-group-text">na coluna Outros</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="offset-md-4 col-md-4 offset-md-4 col-12">
                        <div class="form-group">
                            <button type="button" class="btn btn-block bg-gradient-primary btn-lg ladda-button" id="btnBuscarDados" data-style='zoom-out'>
                                <i class="fa fa-search"></i>&nbsp;&nbsp;&nbsp;Procurar
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <div class="card card-primary card-outline">
        <div class="card-header ui-sortable-handle" style="cursor: move;">
            <h3 class="card-title" style="margin-top: 5px;">
                <i class="fas fa-chart-pie mr-1"></i>
                <span>Resultados</span>
            </h3>
            <div class="card-tools align-items-center">
                <ul class="nav nav-pills ml-auto" style="margin-bottom: -1.8rem;">
                    <li class="nav-item">
                        <a class="nav-link btn-sm ladda-button active" data-style="zoom-out" href="#resultado-aba1" data-toggle="tab">Arvore</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link btn-sm ladda-button" data-style="zoom-out" href="#resultado-aba2" data-toggle="tab">Analítico</a>&nbsp;
                    </li>
                    <li class="nav-item">
                        <a class="nav-link btn-sm ladda-button" data-style="zoom-out" href="#resultado-aba3" data-toggle="tab">Tabela</a>&nbsp;
                    </li>
                    <li class="nav-item">
                        <button type="button" class="btn btn-tool ladda-button" data-card-widget="collapse" style="margin-top: 5px;"><i class="fas fa-minus"></i></button>
                    </li>
                    <li class="nav-item">
                        <button type="button" class="btn btn-tool" data-card-widget="maximize" style="margin-top: 5px;"><i class="fas fa-expand"></i>
                        </button>
                    </li>
                </ul>
            </div>
        </div>
        <div class="card-body " id="card_resultados">
            <div class="tab-content p-0">
                <div class="chart tab-pane active" id="resultado-aba1" style="position: relative;height: 700px;"></div>
                <div class="chart tab-pane" id="resultado-aba2" style="overflow-y: auto;height: 700px;"></div>
                <div class="chart tab-pane" id="resultado-aba3" style="overflow-y: auto;height: 700px;">
                    <div class="row">
                        <div class="col-md-12 mb-1 text-left" id="resultado-aba3-html">
                        </div>
                        <div class="col-md-12" id='resultado-aba3-tabela'>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card-footer" id="resultado-footer">
        </div>

    </div>
@stop

@section('plugins.HighCharts', true)

@once
    @push('css')
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
    @endpush
    @push('js')
        <script>
            $(document).ready(function() {
                $('.select2').select2({
                    placeholder: 'Selecione uma ou mais opções',
                    allowClear: true, // Adiciona um botão de limpar seleção
                    width: '100%', // Define a largura do seletor
                });
                
                $('#btnBuscarDados').click(function() {
                    FormValidator.validar('form_filtros_pesquisa').then((isValid) => {
                        if (isValid) {
                            __buscarDados();
                        }
                    });

                });
            });

            function __montarTabela(result) {
                let htmlExtra = `
                <div class="btn-group btn-group-toggle" data-toggle="buttons">
                    <label class="btn bg-info  color-palette btn-sm text-xs ">
                        <input type="radio" name="optionsTabela1[]" autocomplete="off" value="0"> Por Canal
                    </label>
                    <label class="btn bg-info  color-palette btn-sm text-xs active">
                        <input type="radio" name="optionsTabela1[]" autocomplete="off" value="1"> Por UF
                    </label>
                    <label class="btn bg-info  color-palette btn-sm text-xs">
                        <input type="radio" name="optionsTabela1[]" autocomplete="off" value="2"> Por Cidade
                    </label>
                    <label class="btn bg-info  color-palette btn-sm text-xs">
                        <input type="radio" name="optionsTabela1[]" autocomplete="off" value="3"> Por Tipo Pagamento
                    </label>
                    <label class="btn bg-info  color-palette btn-sm text-xs">
                        <input type="radio" name="optionsTabela1[]" autocomplete="off" value="5"> Por Loja Cartão
                    </label>
                    <label class="btn bg-info  color-palette btn-sm text-xs">
                        <input type="radio" name="optionsTabela1[]" autocomplete="off" value="7"> Por Fase Grupo
                    </label>
                </div>`;
                $("#resultado-aba3-html").html(htmlExtra)

                let extraOptions = {
                    scrollY: "480px",
                    destroy: true,
                    orderFixed: [
                        [1, 'desc']
                    ],
                    rowGroup: {
                        startRender: null,
                        endRender: function(rows, group) {
                            let col_qt = rows.data().pluck(result.colunas.length-2).reduce((a, b) => a + moneyToDouble(b) * 1, 0);
                            let col_vl = rows.data().pluck(result.colunas.length-1).reduce((a, b) => a + moneyToDouble(b) * 1, 0);

                            // Primeira linha (RowAvg1)
                            let tr1 = document.createElement('tr');
                            tr1.className = 'bg-lightblue disabled color-palette';
                            addCell(tr1, 'TOTAIS\n' + group, result.colunas.length-2, 'text-xs');
                            addCell(tr1, doubleToMoney(col_qt, 0) + '\n(AVG: ' + doubleToMoney(col_qt / rows.count(), 0) + ')', 1, 'text-center text-xs');
                            addCell(tr1, doubleToMoney(col_vl, 2) + '\n(AVG: ' + doubleToMoney(col_vl / rows.count(), 2) + ')', 1, 'text-center text-xs');

                            return tr1; // Retorna o array de linhas
                        },
                        dataSrc: 1 // Coluna utilizada para agrupamento
                    }
                };

                let dataTable = new criarDataTableNew('resultado-aba3-tabela', result.conteudo, result.colunas, result.classes, result.footer, extraOptions, 'resultado-aba3');
                dataTable.build();
                dataTable.ajustar();

            }

            function __buscarDados() {
                let idForm = 'form_filtros_pesquisa';
                let div_retorno = 'resultado-aba1';
                addLoading("card_resultados");
                let datas = getRangeDate('dateRangePicker');
                const requestParams = {
                    method: 'POST',
                    url: '{{ route('buscar.rel_acordos_gerencial') }}',
                    data: {
                        'rangedatas': datas
                    },
                    formId: idForm
                };
                AjaxRequest.sendRequest(requestParams).then(response => {
                    removeLoading("card_resultados");
                    if (response.status) {
                        if (response.msg != "") {
                            //SweetAlert.info(response.msg);
                            alertar(response.msg, '', 'info');
                        }
                        __criaGraficoModelo2('resultado-aba1', response.data.grafico_data, response.data.qtdecimal);
                        __criaGraficoModelo1('resultado-aba2', response.data.grafico_data, response.data.qtdecimal);

                        __montarTabela(response.data.tabela);


                    } else {
                        SweetAlert.alertAutoClose("error", "Precisamos de sua atenção", response.msg, 20000);
                        $('#' + div_retorno).html("");
                    }
                }).catch(error => {
                    alertar(error, "", "error");
                });
            }

            function __criaGraficoModelo1(id, data, qtdDecimal = 0) {
                Highcharts.chart(id, {

                    chart: {
                        height: '700px',
                        style: {
                            fontFamily: "'Roboto', Arial, sans-serif" // Define uma fonte moderna
                        }
                    },

                    colors: ['#f0f0f0'].concat(Highcharts.getOptions().colors),

                    title: {
                        text: data.title,
                        style: {
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: '#333' // Cor personalizada
                        }
                    },

                    subtitle: {
                        text: data.subtitle,
                        style: {
                            fontSize: '14px',
                            color: '#666' // Cor mais suave para o subtítulo
                        }
                    },

                    series: [{
                        type: 'sunburst',
                        data: data.dados,
                        name: 'INICIO',
                        allowDrillToNode: true,
                        borderRadius: 1,
                        cursor: 'pointer',
                        dataLabels: {
                            formatter: function() {
                                // Determina a cor do texto com base na cor do ponto
                                let textColor = getTextColorForBackground(this.point.color);
                                let borderColor = textColor === '#FFFFFF' ? '#000000' : '#FFFFFF';

                                return `<span style="color:${textColor}; text-shadow: 0px 0px 3px ${borderColor}">${this.point.name}</span>`;
                            },
                            useHTML: true,
                            //style: {
                            //fontSize: '12px',
                            //color: '#333', // Cor do texto
                            //textOutline: 'none' // Remove o contorno do texto
                            // },
                            //format: '{point.name}',
                            filter: {
                                property: 'innerArcLength',
                                operator: '>',
                                value: 16
                            }
                        },
                        levels: [{
                                level: 1,
                                levelIsConstant: false,
                                dataLabels: {
                                    //filter: {
                                    //property: 'outerArcLength',
                                    //operator: '>',
                                    //value: 64
                                    //}
                                }
                            }, {
                                level: 2,
                                colorByPoint: true
                            },
                            {
                                level: 3,
                                colorVariation: {
                                    key: 'brightness',
                                    to: -0.5
                                }
                            }, {
                                level: 4,
                                colorVariation: {
                                    key: 'brightness',
                                    to: 0.5
                                }
                            }
                        ]

                    }],

                    tooltip: {
                        formatter: function() {
                            var point = this.point;
                            var total = calcularTotal(this.series.data[0]);
                            var percent = (point.value / total) * 100;

                            var s = "";
                            s += '<div class="info-box bg-gradient-light" style="margin:1px;">'
                            s += '<div class="info-box-content">'
                            s += '<span class="info-box-text"><b>' + point.name + '</b></span>'
                            s += '<span class="info-box-number"><b>' + (qtdDecimal > 0 ? "R$ " : "") + (doubleToMoney(point.value, qtdDecimal)) + '</b> ' + (qtdDecimal > 0 ? "" : "") + '</span>'
                            s += '<div class="progress">'
                            s += '<div class="progress-bar bg-primary progress-bar-striped" style="width: ' + percent + '%;"></div>'
                            s += '</div>'
                            s += '<span class="progress-description">'
                            s += '<i><b>' + (doubleToMoney(percent, 2)) + '%</b> de <b>' + (doubleToMoney(total, qtdDecimal)) + '</b> </i>'
                            s += '</span>'
                            s += '</div>'
                            s += '</div>'

                            return s;
                        },
                        useHTML: true,
                        backgroundColor: '#f8f9fa',
                        distance: 20,
                        padding: 0,
                        style: {
                            fontFamily: "'Roboto', Arial, sans-serif", // Personaliza a fonte no tooltip
                            fontSize: '14px',
                            color: '#333'
                        }
                    },

                    credits: {
                        enabled: false // Remove os créditos do Highcharts
                    },

                    legend: {
                        itemStyle: {
                            fontSize: '12px',
                            color: '#333'
                        },
                        itemHoverStyle: {
                            color: '#000'
                        }
                    }
                });
            }


            function __criaGraficoModelo2(id, data, qtdDecimal = 0) {
                Highcharts.chart(id, {

                    chart: {
                        height: '700px',
                        inverted: true,
                        marginBottom: 140
                    },
                    colors: ['#f0f0f0'].concat(Highcharts.getOptions().colors),
                    title: {
                        text: data.title
                    },
                    subtitle: {
                        text: data.subtitle
                    },
                    series: [{
                        type: 'treegraph',
                        data: data.dados,
                        dataLabels: {
                            formatter: function() {
                                var name = this.point.name;
                                if (name.length > 15) {
                                    name = name.substring(0, 15) + '...';
                                }
                                return name;
                            },
                            style: {
                                whiteSpace: 'nowrap',
                                fontFamily: 'Roboto, sans-serif',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                color: '#333',
                                textOutline: '2px contrast' // Um contorno suave para o texto
                            },
                            crop: false
                        },
                        marker: {
                            radius: 10
                        },
                        levels: [{
                                level: 1,
                                dataLabels: {
                                    verticalAlign: 'bottom',
                                    y: 20,
                                }
                            },
                            {
                                level: 2,
                                colorByPoint: true,
                                /*
                                dataLabels: {
                                    verticalAlign: 'bottom',
                                    y: -20
                                }
                                */
                                dataLabels: {
                                    align: 'left',
                                    rotation: 90,
                                    y: 20
                                }
                            },
                            {
                                level: 3,
                                colorVariation: {
                                    key: 'brightness',
                                    to: -0.5
                                },
                                dataLabels: {
                                    align: 'left',
                                    rotation: 90,
                                    y: 20
                                }
                            }, {
                                level: 4,
                                colorVariation: {
                                    key: 'brightness',
                                    to: 0.5
                                },
                                dataLabels: {
                                    align: 'left',
                                    rotation: 90,
                                    y: 20
                                }
                            }
                        ]
                    }],

                    tooltip: {
                        formatter: function() {
                            // 'this.point' representa o item em que o cursor está posicionado
                            var point = this.point;
                            // Calcula o valor total dos itens a partir do nó raiz
                            var total = calcularTotal(this.series.data[0]);
                            // Calcula o percentual com base no valor do item em relação ao valor total
                            var percent = (point.value / total) * 100;

                            var s = "";
                            s += '<div class="info-box bg-gradient-light" style="margin:1px;">'
                            s += '<div class="info-box-content">'
                            s += '<span class="info-box-text"><b>' + point.name + '</b></span>'
                            s += '<span class="info-box-number"><b>' + (qtdDecimal > 0 ? "R$ " : "") + (doubleToMoney(point.value, qtdDecimal)) + '</b> ' + (qtdDecimal > 0 ? "" : "") + '</span>'
                            s += '<div class="progress">'
                            s += '<div class="progress-bar bg-primary progress-bar-striped" style="width: ' + percent + '%;"></div>'
                            s += '</div>'
                            s += '<span class="progress-description">'
                            s += '<i><b>' + (doubleToMoney(percent, 2)) + '%</b> de <b>' + (doubleToMoney(total, qtdDecimal)) + '</b> </i>'
                            s += '</span>'
                            s += '</div>'
                            s += '</div>'

                            return s;
                        },
                        useHTML: true,
                        backgroundColor: '#f8f9fa',
                        distance: 20,
                        padding: 0,
                    },
                });
            }

            function getTextColorForBackground(hex) {
                // Remove o '#' no início, se existir
                hex = hex.replace('#', '');

                // Converte a cor em valores RGB
                let r = parseInt(hex.substring(0, 2), 16);
                let g = parseInt(hex.substring(2, 4), 16);
                let b = parseInt(hex.substring(4, 6), 16);

                // Calcula o brilho da cor
                let brightness = (r * 299 + g * 587 + b * 114) / 1000;

                // Retorna branco para fundos escuros, preto para fundos claros
                return brightness > 50 ? '#000000' : '#FFFFFF';
            }

            function calcularTotal(node) {
                var total = 0;
                if (node.children && node.children.length > 0) {
                    node.children.forEach(function(child) {
                        total += calcularTotal(child);
                    });
                } else {
                    total = node.value || 0;
                }
                node.total = total;
                return total;
            }

            //SELECTS
            document.addEventListener("DOMContentLoaded", function() {
                // Array de opções
                var opcoes = [{
                        value: "canal",
                        text: "Canal"
                    },
                    {
                        value: "uf",
                        text: "UF"
                    },
                    {
                        value: "cidade",
                        text: "Cidade"
                    },
                    {
                        value: "tipo_pagamento",
                        text: "Tipo Parcelamento"
                    },
                    {
                        value: "fase_grupo",
                        text: "Fase"
                    },
                ];

                // Função para preencher os selects com as opções não selecionadas
                function preencherSelects() {
                    var selecionados = document.querySelectorAll('.nvl');
                    var valoresSelecionados = Array.from(selecionados, function(select) {
                        return select.value;
                    });

                    selecionados.forEach(function(select) {
                        var valorSelecionado = select.value;
                        select.innerHTML = '<option value="">Selecione uma opção</option>';

                        opcoes.forEach(function(opcao) {
                            if (!valoresSelecionados.includes(opcao.value)) {
                                var option = document.createElement('option');
                                option.value = opcao.value;
                                option.textContent = opcao.text;
                                select.appendChild(option);
                            } else if (opcao.value === valorSelecionado) {
                                var option = document.createElement('option');
                                option.value = opcao.value;
                                option.textContent = opcao.text;
                                option.selected = true;
                                select.appendChild(option);
                            }
                        });
                    });
                }

                // Atualizar os selects quando clicar para abrir as opções (evento focus)
                var selects = document.querySelectorAll('.nvl');
                selects.forEach(function(select) {
                    select.addEventListener('focus', preencherSelects);
                });

                // Chamar a função inicialmente
                preencherSelects();
            });
        </script>
    @endpush
@endonce
