describe("Axis", function() {

    var polarAxis, config, fixture;

    function nodeToString(_node){ return new XMLSerializer().serializeToString(_node); }

    function keepFixtureVisible(){
        d3.select('body').append('div').classed('fixture-clone', true).node()
            .appendChild(fixture.node().cloneNode(true));
    }

    function resetFixture(){
        if(!fixture) fixture = d3.select('body').append('div').classed('fixture', true);
        else fixture.html('');
    }

    beforeEach(function() {
        resetFixture()
    });

    afterEach(function() {
        if(fixture) fixture.html('');
    });

    it("works with minimal requirements", function() {
        polarAxis = micropolar.Axis()();

        var svg = d3.select('svg');
        expect(svg.node()).not.toBe(null);
        svg.remove();
    });

    it("has configurable dimensions", function() {
        var config = {
            height: 500,
            width: 500,
            labelOffset: 10,
            tickLength: null,
            containerSelector: fixture,
            margin: 25
        };
        polarAxis = micropolar.Axis().config(config)();

        var svg = fixture.select('svg');
        var bg = fixture.select('.background-circle');
        expect(+svg.attr('width')).toBe(config.width);
        expect(+svg.attr('height')).toBe(config.height);
        expect(bg.node().getBBox().width).toBe(config.width - config.margin * 2);
    });

    it("has configurable styles", function() {
        var config = {
            backgroundColor: 'red',
            containerSelector: fixture
        };
        polarAxis = micropolar.Axis().config(config)();

        var svg = fixture.select('svg');
        var bg = fixture.select('.background-circle');
        expect(d3.rgb(bg.style('fill')).toString()).toBe('#ff0000');
    });

    describe("Default axes config", function() {

        beforeEach(function() {
            config = {
                width: 500,
                height: 500,
                margin: 25,
                data: [[1, 10], [2, 20], [3, 30], [4, 40], [5, 50]],
                containerSelector: fixture
            };
            polarAxis = micropolar.Axis().config(config);
            polarAxis();
        });

        it("builds it in the provided container", function() {
            expect(fixture.select('svg').node()).not.toBe(null);
        });

        it("provides sensible scale domain and range", function() {
            var radialScale = polarAxis.radialScale();
            var angularScale = polarAxis.angularScale();
            expect(radialScale.domain()).toEqual([10, 50]);
            expect(angularScale.domain()).toEqual([1, 5]);
            expect(radialScale.range()).toEqual([0, 225]);
            expect(angularScale.range()).toEqual([0,360]);
        });

        it("works with minimum requirements", function() {
            expect(fixture.select('svg').node()).not.toBe(null);
        });

    });

    describe("Ticks", function() {

        beforeEach(function() {
            config = {
                containerSelector: fixture
            };
            polarAxis = micropolar.Axis();
        });

        it("shows 4 ticks by default", function() {
            config.data = [[0, 10], [1, 20]];
            polarAxis.config(config)();

            var tickTexts = fixture.selectAll('.angular-tick')[0].map(function(d, i){ return d.textContent; });
            expect(tickTexts).toEqual(['0', '0.25', '0.5', '0.75']);
        });

    });

    describe("Config change", function() {

        beforeEach(function() {
            config = {
                containerSelector: fixture
            };
            polarAxis = micropolar.Axis();
        });

        it("should update the chart data", function() {
            config.data = [[0, 10], [1, 20]];
            polarAxis.config(config)();

            var tickTexts1 = fixture.selectAll('.angular-tick')[0].map(function(d, i){ return d.textContent; });
            expect(fixture.selectAll('svg')[0].length).toBe(1);
            expect(tickTexts1).toEqual(['0', '0.25', '0.5', '0.75']);

            config.data = [[1, 20], [2, 30]];
            polarAxis.config(config)();

            var tickTexts2 = fixture.selectAll('.angular-tick')[0].map(function(d, i){ return d.textContent; });
            expect(fixture.selectAll('svg')[0].length).toBe(1);
            expect(tickTexts2).toEqual(['1', '1.25', '1.5', '1.75']);
        });

        it("only overrides with new config", function() {
            var config1 = {
                data: [[1, 10], [2, 20]],
                height: 300,
                width: 300,
                containerSelector: fixture
            };
            polarAxis = micropolar.Axis().config(config1)();

            expect(polarAxis.config().height).toBe(config1.height);
            expect(polarAxis.config().width).toBe(config1.width);

            var config2 = {
                height: 200
            };
            polarAxis.config(config2)();

            expect(polarAxis.config().height).toBe(config2.height);
            expect(polarAxis.config().width).toBe(config1.width);
        });

    });

});
