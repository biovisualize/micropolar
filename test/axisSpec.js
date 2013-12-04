describe("Axis", function() {

    var polarAxis, config, fixture = Fixture(), container;

    beforeEach(function() {
        container = fixture.addFixture().get();
    });

    afterEach(function() {
        fixture.removeFixture();
    });

    it("works with minimal requirements", function() {
        polarAxis = micropolar.Axis()();

        var svg = d3.select('svg');
        expect(svg.node()).not.toBe(null);
        svg.remove();
    });

    it("builds it in the provided container", function() {
        var config = {
            containerSelector: container
        };
        polarAxis = micropolar.Axis().config(config)();

        expect(container.select('svg').node()).not.toBe(null);
    });

    it("has configurable dimensions", function() {
        var config = {
            height: 500,
            width: 500,
            labelOffset: 10,
            tickLength: null,
            containerSelector: container,
            margin: {top: 25, right: 25, bottom: 25, left: 25}
        };
        polarAxis = micropolar.Axis().config(config)();

        var svg = container.select('svg');
        var bg = container.select('.background-circle');
        expect(+svg.attr('width')).toBe(config.width);
        expect(+svg.attr('height')).toBe(config.height);
        expect(bg.node().getBBox().width).toBe(config.width - config.margin.right  - config.margin.left);
    });

    it("has configurable styles", function() {
        var config = {
            backgroundColor: 'red',
            containerSelector: container
        };
        polarAxis = micropolar.Axis().config(config)();

        var svg = container.select('svg');
        var bg = container.select('.background-circle');
        expect(d3.rgb(bg.style('fill')).toString()).toBe('#ff0000');
    });

    describe("Default axes config", function() {

        beforeEach(function() {
            config = {
                width: 500,
                height: 500,
                margin: {top: 25, right: 25, bottom: 25, left: 25},
                data: [[1, 10], [2, 20], [3, 30], [4, 40], [5, 50]],
                containerSelector: container
            };
            polarAxis = micropolar.Axis().config(config);
            polarAxis();
        });

        it("provides sensible scale domain and range", function() {
            var radialScale = polarAxis.radialScale();
            var angularScale = polarAxis.angularScale();
            expect(radialScale.domain()).toEqual([10, 50]);
            expect(angularScale.domain()).toEqual([1, 5]);
            expect(radialScale.range()).toEqual([0, 225]);
            expect(angularScale.range()).toEqual([0,360]);
        });

    });

    describe("Ticks", function() {

        beforeEach(function() {
            config = {
                containerSelector: container
            };
            polarAxis = micropolar.Axis();
        });

        it("shows 4 ticks by default", function() {
            config.data = [[0, 10], [12, 20]];
            polarAxis.config(config)();

            var tickTexts = container.selectAll('.angular-tick')[0].map(function(d, i){ return d.textContent; });
            expect(tickTexts).toEqual(['0', '3', '6', '9']);

            config.angularTicksCount = 3;
            polarAxis.config(config)();

            var tickTexts = container.selectAll('.angular-tick')[0].map(function(d, i){ return d.textContent; });
            expect(tickTexts).toEqual(['0', '4', '8']);
        });

        it("starts the ticks at 3 o'clock by default", function() {
            config.data = [[1, 10], [5, 20]];
            config.height = 150;
            polarAxis.config(config)();

            var tickLabelsPosX = [];
            container.selectAll('g.angular-tick text').each(function(d, i){ return tickLabelsPosX.push(this.getBoundingClientRect().left); });
            expect(tickLabelsPosX[0]).toBe(d3.max(tickLabelsPosX));

            config.originTheta = -90;
            polarAxis.config(config)();

            var tickLabelsPosY = [];
            container.selectAll('g.angular-tick text').each(function(d, i){ return tickLabelsPosY.push(this.getBoundingClientRect().top); });
            expect(tickLabelsPosY[0]).toBe(d3.min(tickLabelsPosY));
        });

    });

    describe("Config change", function() {

        beforeEach(function() {
            config = {
                containerSelector: container
            };
            polarAxis = micropolar.Axis();
        });

        it("should update the chart data", function() {
            config.data = [[0, 10], [1, 20]];
            polarAxis.config(config)();

            var tickTexts1 = container.selectAll('.angular-tick')[0].map(function(d, i){ return d.textContent; });
            expect(container.selectAll('svg')[0].length).toBe(1);
            expect(tickTexts1).toEqual(['0', '0.25', '0.5', '0.75']);

            config.data = [[1, 20], [2, 30]];
            polarAxis.config(config)();

            var tickTexts2 = container.selectAll('.angular-tick')[0].map(function(d, i){ return d.textContent; });
            expect(container.selectAll('svg')[0].length).toBe(1);
            expect(tickTexts2).toEqual(['1', '1.25', '1.5', '1.75']);
        });

        it("only overrides with new config", function() {
            var config1 = {
                data: [[1, 10], [2, 20]],
                height: 300,
                width: 300,
                containerSelector: container
            };
            polarAxis = micropolar.Axis().config(config1)();

            expect(polarAxis.config().height).toBe(config1.height);
            expect(polarAxis.config().width).toBe(config1.width);

            var config2 = {
                height: 200
            };
            polarAxis.config(config2)();
//            fixture.cloneAndKeepFixture();

            expect(polarAxis.config().height).toBe(config2.height);
            expect(polarAxis.config().width).toBe(config1.width);
        });

    });

});
