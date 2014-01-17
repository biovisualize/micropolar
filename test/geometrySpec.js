describe("Geometry", function() {

    var config, fixture = Fixture(), container;

    beforeEach(function() {
        container = fixture.addFixture().get();
    });

    afterEach(function() {
        fixture.removeFixture();
    });

    describe("Line Plot", function() {

        it("works with minimal requirements", function() {
            var config = {
                data: [{x: [0, 1, 2, 3, 4], y: [10, 20, 30, 40, 50]}],
                geometryConfig: [{geometry: 'LinePlot'}]
            };

            var plot = µ.Axis().config(config)();

            var svg = d3.select('svg');
            expect(svg.node()).not.toBe(null);
            svg.remove();
        });

        it("adds a new instance for each call even on same container", function() {
            var config = {
                data: [{x: [0, 1, 2, 3, 4], y: [10, 20, 30, 40, 50]}],
                geometryConfig: [{geometry: 'LinePlot'}]
            };

            var plot = µ.Axis().config(config)();
            var plot = µ.Axis().config(config)();

            var svg = d3.selectAll('svg');
            expect(svg.size()).toBe(2);
            svg.remove();
        });

        it("works with a real-world example", function() {
            var data = [
                µ.util.dataFromEquation(function(theta){ return Math.abs(Math.cos(theta)); }, 6, 'Cardioid'),
                µ.util.dataFromEquation(function(theta){ return Math.abs(0.5 + 0.5 * Math.cos(theta)); }, 6, 'Figure8'),
                µ.util.dataFromEquation(function(theta){ return Math.abs(0.25 + 0.75 * Math.cos(theta)); }, 6, 'Hypercardioid'),
                µ.util.dataFromEquation(function(theta){ return Math.abs(0.7 + 0.3 * Math.cos(theta)); }, 6, 'Subcardioid'),
                µ.util.dataFromEquation(function(theta){ return Math.abs(0.37 + 0.63 * Math.cos(theta)); }, 6, 'Supercardioid')
            ];
            var geometryConfig = [
                {geometry: 'LinePlot', color: 'orange'},
                {geometry: 'LinePlot', color: 'skyblue'},
                {geometry: 'LinePlot', color: 'red'},
                {geometry: 'LinePlot', color: 'limegreen'},
                {geometry: 'LinePlot', color: 'violet'}
            ];
            var axisConfig = {
                height: 500,
                width: 500,
                margin: {top: 60, right: 120, bottom: 20, left: 20},
                container: container,
                originTheta: -90,
                title: 'Microphone Patterns'
            };
            var legendConfig = {
                showLegend: true
            };

            var config = {data: data, axisConfig: axisConfig, geometryConfig: geometryConfig, legendConfig: legendConfig};
            var plot = µ.Axis().config(config)();

            expect(plot.svg().selectAll('.mark').size()).toBe(data.length);
        });

    });

});
