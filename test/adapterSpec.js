describe("Adapter", function() {

    var fixture = Fixture(), container, plotlyConfig, adapter;

    beforeEach(function() {
        container = fixture.addFixture().get();
        adapter = micropolar.adapter.plotly();
        plotlyConfig = {
            data: [
                {
                    name: "Line 1",
                    x: [0, 10, 20, 30, 40],
                    y: [22, 11, 33, 55, 22],
                    opacity: 1,
                    line: {
                        color: "red",
                        width: 3
                    },
                    type: "PolarLinePlot"
                },
                {
                    name: "Line 2",
                    x: [0, 10, 20, 30, 40],
                    y: [33, 44, 55, 66, 77],
                    opacity: 0.5,
                    line: {
                        color: "green",
                        width: 3,
                        dash: "dash"
                    },
                    type: "PolarLinePlot"
                }
            ],
            layout: {
                title: "Plot Title",
                legend: {},
                width: 550,
                height: 400,
                margin: {
                    l: 70,
                    r: 20,
                    t: 60,
                    b: 60,
                    pad: 2
                },
                showlegend: true
            }
        };
        plotlyConfig.container = container;
    });

    afterEach(function() {
        fixture.removeFixture();
    });

    it("converts from Plotly to Micropolar data format", function() {
        var expectedMicropolarConfig = {
            data: [
                {x: [0, 10, 20, 30, 40], y: [22, 11, 33, 55, 22], name : 'Line 1', type : 'PolarLinePlot'},
                {x: [0, 10, 20, 30, 40], y: [33, 44, 55, 66, 77], name : 'Line 2', type : 'PolarLinePlot'}
            ],
            geometryConfig: [
                {geometry: 'LinePlot', color: 'red', lineStrokeSize: 3, opacity: 1},
                {geometry: 'LinePlot', color: 'green', lineStrokeSize: 3, opacity: 0.5, dash: 'dash'}
            ],
            axisConfig: {
                height: 400,
                width: 550,
                margin: {top: 60, right: 20, bottom: 60, left: 70, pad: 2},
                container: container,
                title: 'Plot Title'
            },
            legendConfig: {
                showLegend: true
            }
        };

        var micropolarConfig = adapter.convert(plotlyConfig);

        expect(expectedMicropolarConfig.data).toEqual(micropolarConfig.data);
        expect(expectedMicropolarConfig.geometryConfig).toEqual(micropolarConfig.geometryConfig);
        expect(expectedMicropolarConfig.axisConfig.height).toEqual(micropolarConfig.axisConfig.height);
        expect(expectedMicropolarConfig.legendConfig).toEqual(micropolarConfig.legendConfig);

//        µ.Axis().config(micropolarConfig)();
//        µ.Axis().config(expectedMicropolarConfig)();
//        fixture.cloneAndKeepFixture();
    });

});
