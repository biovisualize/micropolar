describe("Line Preset", function() {

    var polarAxis, config, fixture = Fixture(), container;

    beforeEach(function() {
        container = fixture.addFixture().get();
    });

    afterEach(function() {
        fixture.removeFixture();
    });

    it("works with minimal requirements", function() {
        var data = [[1, 50], [2, 20], [3, 30], [4, 40], [5, 50]];
        var plot = micropolar.preset.multiLinePlot({
            data: data,
            geometry: 'LinePlot',
            containerSelector: fixture.get()
        });
        expect(plot.svg().select('.mark').node().animatedPathSegList.numberOfItems).toBe(data.length);
    });

    it("works with a real-world example", function() {
        var equation1 = function(theta){ return Math.abs(Math.cos(theta)); };
        var equation2 = function(theta){ return Math.abs(0.5 + 0.5 * Math.cos(theta)); };
        var equation3 = function(theta){ return Math.abs(0.25 + 0.75 * Math.cos(theta)); };
        var equation4 = function(theta){ return Math.abs(0.7 + 0.3 * Math.cos(theta)); };
        var equation5 = function(theta){ return Math.abs(0.37 + 0.63 * Math.cos(theta)); };
        var color = ['peru', 'darkviolet', 'deepskyblue', 'orangered', 'green'];
        var geometryName = ['Figure 8', 'Cardioid', 'Hypercardioid', 'Subcardioid', 'Supercardioid'];
        var data = [equation1, equation2, equation3, equation4, equation5];

        var plot = micropolar.preset.multiLinePlot({
            data: data,
            color: color,
            geometryName: geometryName,
            geometry: 'LinePlot',
            title: 'Microphone Patterns',
            containerSelector: fixture.get(),
            radialTicksSuffix: 'dB',
            angularTicksSuffix: 'º'
        });
        expect(plot.svg().selectAll('.mark').size()).toBe(data.length);
    });

    it("shares space with a legend", function() {
        var data = [[[1, 50], [3, 20], [5, 30], [7, 40], [9, 50]], [[2, 50], [4, 20], [6, 30], [8, 40], [10, 50]]];
        var geometryName = ['Figure 8', 'Cardioid', 'Hypercardioid', 'Subcardioid', 'Supercardioid'];
        config = {
            width: 500,
            height: 200,
            margin: {top: 50, right: 80, bottom: 20, left: 20},
            data: data,
            geometry: 'LinePlot',
            containerSelector: fixture.get(),
            radialDomain: [0, 50],
            color: ['red', 'skyblue'],
            geometryName: geometryName,
            isLegendVisible: true
        };
        var plot = micropolar.preset.multiLinePlot(config);
        var bgNode = container.select('.background-circle').node();
        var bgWidth = bgNode.getBBox().width;
        var legendX = container.select('.legend-group').node().getCTM().e;
        expect(bgWidth).toBe(130);
        expect(legendX).toBeGreaterThan(bgWidth);
    });

    it("is stylable", function() {
        var data = [[[1, 50], [3, 20], [5, 30], [7, 40], [9, 50]], [[2, 50], [4, 20], [6, 30], [8, 40], [10, 50]]];
        var geometryName = ['Figure 8', 'Cardioid', 'Hypercardioid', 'Subcardioid', 'Supercardioid'];
        config = {
            geometry: 'LinePlot',
            data: data,
            containerSelector: fixture.get(),
            width: 500,
            height: 200,
            margin: {top: 50, right: 80, bottom: 20, left: 20},
            radialDomain: [0, 50],
            color: ['red', 'skyblue'],
            dash: ['dot', 'long'],
            isLegendVisible: true,
            geometryName: geometryName,
            lineStrokeSize: 4
        };
        var plot = micropolar.preset.multiLinePlot(config);
        var lines = container.selectAll('.mark').each(function(d, i){
            expect(d3.select(this).attr('stroke-dasharray')).toBeDefined();
            expect(parseInt(d3.select(this).style('stroke-width'))).toBe(config.lineStrokeSize);
            expect(d3.select(this).style('stroke')).toBe(d3.rgb(config.color[i]).toString());
        });
    });

});
