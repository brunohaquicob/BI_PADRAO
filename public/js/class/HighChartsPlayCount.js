class HighChartsPlayCount {
    constructor(id, dados, nbr = 16) {
        
        this.nbr = nbr;
        this.idChart = id;
        this.titleChart = dados.title;
        this.dataset = dados.data;
        this.chart = null;
        this.btn = document.getElementById('play-pause-button');
        this.input = document.getElementById('play-range');
        this.startYear = this.input.min;
        this.endYear = this.input.max;
        this.input.value = this.input.min;

        this.initialize();
    }

    async initialize() {
        //this.dataset = await this.fetchDataset();

        this.createChart();
        this.setupEventListeners();
    }

    async fetchDataset() {
        var response = await fetch('https://demo-live-data.highcharts.com/population.json');
        return response.json();
    }

    getData(year) {
        var output = Object.entries(this.dataset)
            .map(country => {
                var [countryName, countryData] = country;
                return [countryName, Number(countryData[year])];
            })
            .sort((a, b) => b[1] - a[1]);
        return [output[0], output.slice(1, this.nbr)];
    }
    converterFormatoData(dataString) {
        var ano = dataString.substring(0, 4);
        var mes = dataString.substring(4, 6);
        var dia = dataString.substring(6, 8);

        var dataFormatada = `${dia}/${mes}/${ano}`;

        return dataFormatada;
    }

    somarValoresPorAno(anoDesejado) {
        let soma = 0;
        for (let pais in this.dataset) {
            // Verifica se o país tem a chave do ano desejado
            if (this.dataset[pais].hasOwnProperty(anoDesejado)) {
                // Converte o valor para número e adiciona à soma
                soma += parseInt(this.dataset[pais][anoDesejado], 10);
            }
        }
        return soma;
    }
    getSubtitle() {
        var qtd = doubleToMoney(this.somarValoresPorAno(this.input.value), 0);
        var data_formatada = this.converterFormatoData(this.input.value);
        return `<span style="font-size: 20px">${data_formatada}</span>
            <br>
            <span style="font-size: 12px">
                Total: <b>: ${qtd}</b> Audits
            </span>`;
    }

    createChart() {
        this.chart = Highcharts.chart(this.idChart, {
            chart: {
                animation: {
                    duration: 700
                },
                marginRight: 50,
                height: '600px'
            },
            title: {
                text: this.titleChart,
                align: 'center'
            },
            subtitle: {
                useHTML: true,
                text: this.getSubtitle(),
                floating: true,
                align: 'right',
                verticalAlign: 'middle',
                y: 50,
                x: -10
            },

            legend: {
                enabled: false
            },
            xAxis: {
                type: 'category'
            },
            yAxis: {
                opposite: true,
                tickPixelInterval: 150,
                title: {
                    text: null
                }
            },
            plotOptions: {
                series: {
                    animation: false,
                    groupPadding: 0,
                    pointPadding: 0.1,
                    borderWidth: 0,
                    colorByPoint: true,
                    dataSorting: {
                        enabled: true,
                        matchByName: true
                    },
                    type: 'bar',
                    dataLabels: {
                        enabled: true
                    }
                }
            },
            series: [
                {
                    type: 'bar',
                    name: this.startYear,
                    data: this.getData(this.startYear)[1]
                }
            ],
        });
    }
    update(incrementDays) {
        if (!this.chart) {
            // Evita erro se o gráfico não estiver definido
            return;
        }
        if (incrementDays) {
            // Converte a data atual para um objeto Moment.js
            let currentDate = moment(this.input.value, "YYYYMMDD");
            // Incrementa a data em um dia
            currentDate.add(incrementDays, 'days');
            // Atualiza o valor do input com a nova data
            this.input.value = currentDate.format("YYYYMMDD");
        }
    
        if (this.input.value >= this.endYear) {
            this.pause();
        }

        this.chart.update(
            {
                subtitle: {
                    text: this.getSubtitle()
                }
            },
            false,
            false,
            false
        );

        this.chart.series[0].update({
            name: this.input.value,
            data: this.getData(this.input.value)[1]
        });
    }

    play() {
        this.btn.title = 'pause';
        this.btn.className = 'fa fa-pause';
        // Certifique-se de que this.chart é definido antes de acessar sequenceTimer
        if (this.chart && this.chart.sequenceTimer === undefined) {
            this.chart.sequenceTimer = setInterval(() => {
                this.update(1);
            }, 700);
        }
    }

    pause() {
        this.btn.title = 'play';
        this.btn.className = 'fa fa-play';
        if (this.chart) {
            clearTimeout(this.chart.sequenceTimer);
            this.chart.sequenceTimer = undefined;
        }
    }

    setupEventListeners() {
        this.btn.addEventListener('click', () => {
            if (!this.chart) {
                // Evita erro se o gráfico não estiver definido
                return;
            }
            if (this.chart.sequenceTimer) {
                this.pause();
            } else {
                this.play();
            }
        });

        this.input.addEventListener('click', () => {
            this.update();
        });
    }
    destroy() {
        if (this.chart.sequenceTimer) {
            clearTimeout(this.chart.sequenceTimer);
            this.chart.sequenceTimer = undefined;
        }
        this.chart.destroy();
        this.chart = null;
    }
}