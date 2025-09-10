

$(document).ready(function () {
    carregarCoresGraficos();
    gerarSelectPicker(".multiselect-bs4");

    $('#btnBuscarDados').click(function () {
        FormValidator.validar('form_filtros_pesquisa').then((isValid) => {
            if (isValid) {
                __buscarDados();
            }
        });

    });

});

function __buscarDados() {
    let idForm = 'form_filtros_pesquisa';
    let div_retorno_sintetico = 'resultado-aba1';
    let div_retorno_analitico = 'resultado-aba2';
    addLoading("card_resultados");
    let datas = getRangeDate('dateRangePicker');
    const requestParams = {
        method: 'POST',
        url: window.app.routes.buscarCredor,
        data: {
            'rangedatas': datas,
            'limitar_data': $('#dateRangePicker_check').is(':checked') ? 'S' : 'N'
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
            if (response.data.htmlDownload !== undefined && response.data.htmlDownload != '') {
                // Se o status for verdadeiro, então há um arquivo para download
                var html = response.data.htmlDownload;
                $('#' + div_retorno).html(response.data.htmlDownload);
            } else {
                if (response.data.tabela !== undefined && response.data.tabela != '') {
                    // renderiza
                    renderSmallBoxes(response.data.cards_total, {
                        container: "#kpis-row",
                        colClass: "col-12 col-sm-6 col-md-3 col-lg-3",
                        defaultColor: "bg-light",
                        defaultIcon: "ion ion-stats-bars"
                    });
                    //Tabela
                    tratarRetorno(response.data.tabela, div_retorno_sintetico, response.data.comissao);
                }
            }

        } else {
            SweetAlert.alertAutoClose("error", "Precisamos de sua atenção", response.msg, 20000);
        }
    }).catch(error => {
        alertar(error, "", "error");
    });
}


async function tratarRetorno(tabela, divTabela, comissao) {
    let param = {
        ordering: false
    };
    const table = await __renderDataTable(tabela, divTabela, param, undefined, true);

    const dtf = new DTFiltrados(table);
    lerRowEMontarGraficos(dtf.getArray(), comissao);

}

async function lerRowEMontarGraficos(rows, v2 = true) {

    if (rows.length === 0) {
        SweetAlert.alertAutoClose("info", "Precisamos de sua atenção", "Sem dados para gerar Graficos!", 5000)
        return true;
    }
    const cols = v2 === true
        ? { V1: '7+9', V2: 10 }
        : { V1: '7+9' };

    const ar_data_valor = Utilitarios.sumColumnsFormula(rows, cols, 5);
    console.log(ar_data_valor)
    // const chartPro = new TimeSeriesChartPro({
    //     container: "grafico-1",
    //     title: "Pagamentos",
    //     subtitle: "Valores recebidos",
    //     // paleta opcional:
    //     colors: ["#2e7d32", "#1565c0", "#ff9900"],
    //     // cria toolbar Dia/Semana/Mês:
    //     createToolbar: true
    // });

    // // dataMap no formato { "YYYY-MM-DD": { V1: num, V2: num, ... } }
    // chartPro.render(ar_data_valor);

    const seriesConfig = [
        {
            id: "V1", name: "Recebido", type: "column", axis: "left",
            format: { decimals: 2, prefix: "R$ " }, color: "#2e7d32"
        }
        // pode adicionar V3/V4...
    ];

    if (v2 === true) {
        seriesConfig.push({
            id: "V2",
            name: "Comissão",
            type: "spline",
            axis: "right",
            format: { decimals: 2, prefix: "R$ " }
        });
    }

    const chartPro = new TimeSeriesChartPro({
        container: "grafico-1",
        title: "Pagamentos",
        subtitle: "Valores recebidos",
        createToolbar: true,
        seriesConfig: seriesConfig,
        tooltipFormatter: function (api) {
            const date = Highcharts.dateFormat("%d/%m/%Y", this.x);
            let html = `<div><b>${date}</b><hr style="margin:4px 0">`;
            (this.points || []).forEach(p => {
                const f = p.series.userOptions._fmt;
                html += `${p.series.name}: <b>${api._fmtVal(p.y, f)}</b><br>`;
            });
            return html + `</div>`;
        }
    });
    chartPro.render(ar_data_valor);

    // chartPro.updateData(novosDados);  // redesenha mantendo zoom/estado
    // chartPro.setGrouping('week'); // 'day' | 'week' | 'month'



}

