describe("Legend", function() {

    var fixture = Fixture(), container;

    beforeEach(function() {
        container = fixture.addFixture().get();
    });

    afterEach(function() {
        fixture.removeFixture();
    });

    it("works with minimal requirements", function() {
        micropolar.Legend()();

        var svg = d3.select('svg');
        expect(svg.node()).not.toBe(null);
        svg.remove();
    });

    it("renders a continuous legend with a color gradient", function() {
        var config = {
            data: [1, 10],
            legendConfig:{
                elements: [
                    {symbol: 'line', color: 'red'},
                    {symbol: 'square', color: 'yellow'},
                    {symbol: 'diamond', color: 'limegreen'}
                ],
                container: container
            }
        };
        var legend = micropolar.Legend().config(config)();

        var svg = container.select('svg');
        expect(svg.select('defs').node().childNodes[0].nodeName).not.toBe('lineargradient');
    });

    it("renders a discrete legend with colored squares", function() {
        var config = {
            data: ['a', 'b', 'c'],
            legendConfig:{
                elements: [
                    {symbol: 'line', color: 'red'},
                    {symbol: 'square', color: 'yellow'},
                    {symbol: 'diamond', color: 'limegreen'}
                ],
                container: container
            }
        };
        var legend = micropolar.Legend().config(config)();

        var svg = container.select('svg');
        expect(svg.selectAll('.legend-mark')[0].length).toBe(3);
    });

    it("renders a discrete legend with various shapes", function() {
        var config = {
            data: ['a', 'b', 'c', 'd'],
            legendConfig:{
                elements: [
                    {symbol: 'square', color: 'red'},
                    {symbol: 'line', color: 'red'},
                    {symbol: 'cross', color: 'red'},
                    {symbol: 'diamond', color: 'red'}
                ],
                container: container
            }
        };
        var legend = micropolar.Legend().config(config)();

        var svg = container.select('svg');
        var path1 = svg.select('g.legend-marks path:nth-child(1)').attr('d');
        var path2 = svg.select('g.legend-marks path:nth-child(2)').attr('d');

        expect(svg.selectAll('.legend-mark')[0].length).toBe(4);
        expect(path1).not.toBe(path2);
        fixture.cloneAndKeepFixture();
    });

});
