describe("Axis", function() {

    var polarAxis, config, fixture = Fixture(), container;

    beforeEach(function() {
        container = fixture.addFixture().get();
    });

    afterEach(function() {
        fixture.removeFixture();
    });

    it("works with minimal requirements", function() {
        polarAxis = µ.Axis()();

        var svg = d3.select('svg');
        expect(svg.node()).not.toBe(null);
        svg.remove();
    });

    it("builds it in the provided container", function() {
        config = {axisConfig: {container: container}};
        polarAxis = µ.Axis().config(config)();

        expect(container.select('svg').node()).not.toBe(null);
    });

    it("has configurable dimensions", function() {
        var axisConfig = {
            height: 500,
            width: 500,
            margin: {top: 60, right: 120, bottom: 20, left: 20},
            container: container
        };
        config = {axisConfig: axisConfig};
        polarAxis = µ.Axis().config(config)();

        var svg = container.select('svg');
        var bg = container.select('.background-circle');
        expect(+svg.attr('width')).toBe(axisConfig.width);
        expect(+svg.attr('height')).toBe(axisConfig.height);
        expect(bg.node().getBBox().width).toBe(axisConfig.width - axisConfig.margin.right  - axisConfig.margin.left);
    });

    it("has configurable styles", function() {
        var axisConfig = {
            backgroundColor: 'red',
            container: container
        };
        config = {axisConfig: axisConfig};
        polarAxis = µ.Axis().config(config)();

        var svg = container.select('svg');
        var bg = container.select('.background-circle');
        expect(d3.rgb(bg.style('fill')).toString()).toBe('#ff0000');
    });

    describe("Default axes config", function() {

        beforeEach(function() {
            var data = [
                {x:[1, 2, 3, 4, 5], y:[10, 20, 30, 40, 50], name:"Line1"},
                {x:[1, 2, 3, 4, 5], y:[30, 40, 50, 60, 70], name:"Line2"}
            ];
            var axisConfig = {
                width: 500,
                height: 500,
                margin: {top: 25, right: 25, bottom: 25, left: 25},
                container: container
            };
            config = {data: data, axisConfig: axisConfig};
            polarAxis = µ.Axis().config(config)();
        });

        it("provides sensible scale domain and range", function() {
            var radialScale = polarAxis.radialScale();
            var angularScale = polarAxis.angularScale();
            expect(radialScale.domain()).toEqual([10, 70]);
            expect(angularScale.domain()).toEqual([1, 6]); // default is needsEndSpacing
            expect(radialScale.range()).toEqual([0, 225]);
            expect(angularScale.range()).toEqual([360, 0]); // default is counterclockwise
        });

    });

    describe("Ticks", function() {
        var axisConfig;
        beforeEach(function() {
            axisConfig = {
                width: 500,
                height: 500,
                margin: {top: 25, right: 25, bottom: 25, left: 25},
                container: container
            };
            config = {axisConfig: axisConfig};
            polarAxis = µ.Axis();
        });

        it("connect the last element over or add a space at the end ", function() {
            config.data = [{x:[0, 1, 2, 3], y:[10, 20, 30, 40], name:"Line1"}];
            config.axisConfig.needsEndSpacing = false;
            polarAxis.config(config)();

            var tickTexts = container.selectAll('.angular-tick')[0].map(function(d, i){ return d.textContent; })
                .filter(function(d, i){ return d; });
            expect(tickTexts).toEqual(['0', '1', '2']);

            config.axisConfig.needsEndSpacing = true;
            polarAxis.config(config)();

            var tickTexts = container.selectAll('.angular-tick')[0].map(function(d, i){ return d.textContent; })
                .filter(function(d, i){ return d; });
            expect(tickTexts).toEqual(['0', '1', '2', '3']);
        });

        it("starts the ticks at 3 o'clock by default", function() {
            config.data = [{x:[1, 5], y:[10, 20], name:"Line1"}];
            config.axisConfig.height = 150;
            polarAxis.config(config)();

            var tickLabelsPosX = [];
            container.selectAll('g.angular-tick text').each(function(d, i){ return tickLabelsPosX.push(this.getBoundingClientRect().left); });
            expect(tickLabelsPosX[0]).toBe(d3.max(tickLabelsPosX));

            config.axisConfig.originTheta = -90;
            polarAxis.config(config)();

            var tickLabelsPosY = [];
            container.selectAll('g.angular-tick text').each(function(d, i){ return tickLabelsPosY.push(this.getBoundingClientRect().top); });
            expect(tickLabelsPosY[0]).toBe(d3.min(tickLabelsPosY));
        });

    });

    describe("Config change", function() {

        beforeEach(function() {
            var axisConfig = {
                container: container
            };
            config = {axisConfig: axisConfig};
            polarAxis = µ.Axis();
        });

        it("should update the chart data", function() {
            config.data = [{x:[0, 1, 2, 3], y:[10, 20, 30, 40], name:"Line1"}];
            polarAxis.config(config)();

            var tickTexts1 = container.selectAll('.angular-tick')[0].map(function(d, i){ return d.textContent; })
                .filter(function(d, i){ return d; });
            expect(container.selectAll('svg')[0].length).toBe(2);
            expect(tickTexts1).toEqual(['0', '1', '2', '3']);

            config.data = [{x:[1, 2, 3], y:[20, 30, 40], name:"Line1"}];
            polarAxis.config(config)();

            var tickTexts2 = container.selectAll('.angular-tick')[0].map(function(d, i){ return d.textContent; })
                .filter(function(d, i){ return d; });
            expect(container.selectAll('svg')[0].length).toBe(2);
            expect(tickTexts2).toEqual(['1', '2', '3']);
        });

        it("only overrides with new config", function() {
            var config1 = {
                data: [{x:[1, 2], y:[10, 20], name:"Line1"}],
                axisConfig: {
                    width: 300,
                    height: 300,
                    margin: {top: 25, right: 25, bottom: 25, left: 25},
                    container: container
                }
            };
            polarAxis = µ.Axis().config(config1)();

            expect(polarAxis.config().height).toBe(config1.height);
            expect(polarAxis.config().width).toBe(config1.width);

            var config2 = {
                axisConfig: {width: 200}
            };
            polarAxis.config(config2)();

            expect(polarAxis.config().height).toBe(config2.height);
            expect(polarAxis.config().width).toBe(config1.width);
        });

    });

});
