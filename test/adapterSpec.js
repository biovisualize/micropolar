describe("Adapter", function() {

    var fixture = Fixture(), container, plotlyConfig, adapter;

    beforeEach(function() {
        container = fixture.addFixture().get();
        adapter = micropolar.adapter.plotly();
        plotlyConfig = {};
        plotlyConfig.data = [{
            name: 'Line 1',
            x: [0, 10, 20, 30, 40],
            y: [22, 11, 33, 55, 22],
            opacity: 1,
            line:
            {
                color: 'red',
                width:3
            },
            type: "PolarLinePlot"
        },
        {
            name: 'Line 2',
            x: [0, 10, 20, 30, 40],
            y: [33, 44, 55, 66, 77],
            opacity: 0.5,
            line: {
                color: 'green',
                width: 3,
                dash: 'dash'
            },
            type: "PolarLinePlot"
        }];
        plotlyConfig.layout = {
            title: "Plot Title",
            xaxis: {
                range: [0, 40],
                type: "linear",
                showline: true,
                mirror: true,
                linecolor: "black",
                linewidth: 1,
                tick0: 0,
                dtick: 1,
                ticks: "outside",
                ticklen: 5,
                tickwidth: 1,
                tickcolor: "black",
                nticks: 10,
                showticklabels: true,
                tickangle: 0,
                exponentformat: "e",
                showexponent: "all",
                showgrid: true,
                gridcolor: "grey",
                gridwidth: 1,
                autorange: false,
                autotick: true,
                zeroline: false,
                zerolinecolor: "black",
                zerolinewidth: 1,
                title: "X Axis Title",
                unit: "$",
                titlefont: {
                    family: "Arial",
                    size: 20,
                    color: "black"
                },
                tickfont: {
                    family: "Arial",
                    size: 0,
                    color: "black"
                },
                tmin: 0,
                drange: [null, null],
                r0: -0.15000000000000002,
                b: 22.272727272727273,
                m: 148.48484848484847,
                tickround: 100,
                categories: []
            },
            yaxis: {
                range: [10, 100],
                type: "linear",
                showline: true,
                mirror: true,
                linecolor: "black",
                linewidth: 1,
                tick0: 0,
                dtick: 0.2,
                ticks: "outside",
                ticklen: 5,
                tickwidth: 1,
                tickcolor: "black",
                nticks: 0,
                showticklabels: true,
                tickangle: 0,
                exponentformat: "e",
                showexponent: "all",
                showgrid: true,
                gridcolor: "grey",
                gridwidth: 1,
                autorange: true,
                autotick: true,
                zeroline: false,
                zerolinecolor: "black",
                zerolinewidth: 1,
                title: "Y Axis Title",
                unit: "",
                titlefont: {
                    family: "Arial",
                    size: 20,
                    color: "black"
                },
                tickfont: {
                    family: "Arial",
                    size: 0,
                    color: "black"
                },
                tmin: 0.1,
                drange: [null, null],
                r0: 0.012499999999999983,
                b: 385.75757575757575,
                m: -460.6060606060605,
                tickround: 1000,
                categories: []
            },
            legend: {
                bgcolor: "white",
                bordercolor: "grey",
                borderwidth: 1,
                font: {
                    family: "Arial",
                    size: 18,
                    color: "black"
                },
                traceorder: "normal",
                y: 1,
                x: 100
            },
            width: 550,
            height: 400,
            autosize: false,
            margin: {
                l: 70,
                r: 0,
                t: 60,
                b: 60,
                pad: 2
            },
            paper_bgcolor: "white",
            plot_bgcolor: "white",
            // "barmode": "stack",
            // "bargap": 0.2,
            // "bargroupgap": 0,
            // "boxmode": "overlay",
            // "boxgap": 0.3,
            // "boxgroupgap": 0.3,
            font: {
                family: "Arial",
                size: 12,
                color: "black"
            },
            titlefont: {
                family: "Arial",
                size: 0,
                color: "black"
            },
//            "dragmode": "zoom",
            hovermode: "x",
            showlegend: true
        };
        plotlyConfig.container = fixture.get();
    });

    afterEach(function() {
        fixture.removeFixture();
    });

    it("converts from Plotly to Micropolar data format", function() {
        var expectedMicropolarConfig = {
            data: [[[0,22],[10,11],[20,33],[30,55],[40,22]],[[0,33],[10,44],[20,55],[30,66],[40,77]]],
            color: ["red", "green"],
            geometryName: ["Line 1", "Line 2"],
            geometry: ["LinePlot", "LinePlot"],
            title: "Plot Title",
            containerSelector: fixture.get(),
            height: 400,
            width: 550,
            isLegendVisible: true,
            margin: {top: 60, right: 0, bottom: 60, left: 70},
            dash: ['solid', 'dash'],
            opacity: [1, 0.5]
        };
        var micropolarConfig = adapter.convert(plotlyConfig);
        micropolar.preset.multiLinePlot(micropolarConfig);
//        micropolar.preset.multiLinePlot(expectedMicropolarConfig);

        for(var config in expectedMicropolarConfig){
            expect(micropolarConfig[config]).toEqual(expectedMicropolarConfig[config]);
        }
    });

});
