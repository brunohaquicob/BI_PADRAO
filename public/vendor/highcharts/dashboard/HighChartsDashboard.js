class HighchartsDashboard {
    constructor() {
        this.title = '';
        this.divId = '';
        this.valores = '';
        this.decimal = 0;
    }

    createDashboard(divId, valores, title) {
        this.title = title;
        this.divId = divId;
        this.valores = valores;
        const DataCursor = Dashboards.DataCursor;
        const DataTable = Dashboards.DataTable;
        const cursor = new DataCursor();
        const vegeTable = new DataTable({
            columns: this.valores,
            id: this.title
        });
        vegeTable.setColumnAlias('name', 'names');
        vegeTable.setColumnAlias('y', 'values');
        // Create Dashboards.Board
        Dashboards.board(this.divId, {
            gui: {
                layouts: [{
                    id: 'dashboards-layout-1' + this.divId,
                    rows: [{
                        cells: [{
                            id: 'highcharts-dashboards-cell-a0' + this.divId
                        }, {
                            id: 'highcharts-dashboards-cell-b0' + this.divId
                        }]
                    }, {
                        cells: [{
                            id: 'highcharts-dashboards-cell-a1' + this.divId
                        }]
                    }]
                }]
            },
            components: [
                {
                    cell: 'highcharts-dashboards-cell-a0' + this.divId,
                    type: 'Highcharts',
                    chartOptions: this.buildChartOptions('column', vegeTable, cursor)
                }, {
                    cell: 'highcharts-dashboards-cell-b0' + this.divId,
                    type: 'Highcharts',
                    chartOptions: this.buildChartOptions('pie', vegeTable, cursor)
                }, {
                    cell: 'highcharts-dashboards-cell-a1' + this.divId,
                    type: 'Highcharts',
                    chartOptions: this.buildChartOptions('areaspline', vegeTable, cursor)
                },
            ]
        })
    }
    buildChartOptions(type, table, cursor) {
        const decimal = this.decimal;
        return {
            chart: {
                // className: 'highcharts-dark',
                height: 290,
                events: {
                    load: function () {
                        const chart = this;
                        const series = chart.series[0];

                        // react to table cursor
                        cursor.addListener(table.id, 'point.mouseOver', function (e) {
                            const point = series.data[e.cursor.row];

                            if (chart.hoverPoint !== point) {
                                chart.tooltip.refresh(point);
                            }
                        });
                        cursor.addListener(table.id, 'point.mouseOut', function () {
                            chart.tooltip.hide();
                        });
                    }
                }
            },
            legend: {
                enabled: false
            },
            series: [{
                type,
                //colorByPoint: true,
                name: table.id,
                data: table.getRowObjects(0, void 0, ['name', 'y']),
                point: {
                    events: {
                        // emit table cursor
                        mouseOver: function () {
                            cursor.emitCursor(table, {
                                type: 'position',
                                row: this.x,
                                state: 'point.mouseOver'
                            });
                        },
                        mouseOut: function () {
                            cursor.emitCursor(table, {
                                type: 'position',
                                row: this.x,
                                state: 'point.mouseOut'
                            });
                        }
                    }
                }
            }],

            plotOptions: {
                pie: {
                    allowPointSelect: true,
                },
                area: {
                    pointStart: 1940,
                    marker: {
                        enabled: false,
                        symbol: 'circle',
                        radius: 2,
                        states: {
                            hover: {
                                enabled: true
                            }
                        }
                    }
                },
                column: {
                    borderRadius: '25%'
                },
                spline: {
                    marker: {
                        radius: 4,
                        lineColor: '#666666',
                        lineWidth: 1
                    }
                }
            },
            title: {
                text: table.id
            },
            xAxis: {
                categories: table.getColumn('name')
            },
            yAxis: {
                title: {
                    enabled: false
                }
            }, credits: {
                enabled: false
            },
            tooltip: {
                formatter: function () {
                    var s = "";
                    s += "<table>";
                    s += "<tr>";
                    s += "<td colspan='2' class='text-center' style='font-size:11px; padding-bottom: 10px;'><b>" + this.series.name + "</b></td>";
                    s += "</tr>";
                    s += "<tr style='font-size:12px'>";
                    s += "<td style='margin-right:2px;'><span style='color:" + this.series.color + "'>\u25CF</span> " + this.key + ": </td>";
                    s += "<td> <b>" + (doubleToMoney(this.point.y, decimal)) + "</b></td>";
                    s += "</tr>";
                    s += "</table>";

                    return s;
                },
                useHTML: true
            },
            
        };
    }
}

