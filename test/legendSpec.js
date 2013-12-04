describe("Legend", function() {

    var fixture = Fixture(), container;

    beforeEach(function() {
        container = fixture.addFixture().get();
    });

    afterEach(function() {
        fixture.removeFixture();
    });

    it("works with minimal requirements", function() {
        micropolar.legend()();

        var svg = d3.select('svg');
        expect(svg.node()).not.toBe(null);
        svg.remove();
    });

    it("renders a continuous legend with a color gradient", function() {
       micropolar.legend()
            .config({
                data: [1, 10],
                colors: ['red', 'yellow', 'limegreen'],
                containerSelector: container
            })();

        var svg = container.select('svg');
        expect(svg.select('defs').node().childNodes[0].nodeName).not.toBe('lineargradient');
    });

    it("renders a discrete legend with colored squares", function() {
        micropolar.legend()
            .config({
                data: ['a', 'b', 'c'],
                colors: ['red', 'yellow', 'limegreen'],
                containerSelector: container
            })();

        var svg = container.select('svg');
        expect(svg.selectAll('.legend-mark')[0].length).toBe(3);
    });

    it("renders a discrete legend with various shapes", function() {
        micropolar.legend()
            .config({
//                data: ['a', 'b', 'c', 'd'],
                data: [1, 2, 3, 4],
                isContinuous: false,
                color: 'red',
                symbol: ['square', 'line', 'cross', 'diamond'],
                containerSelector: container
            })();

        var svg = container.select('svg');
        var path1 = svg.select('g path:nth-child(1)').attr('d');
        var path2 = svg.select('g path:nth-child(2)').attr('d');

        expect(svg.selectAll('.legend-mark')[0].length).toBe(4);
        expect(path1).not.toBe(path2);
    });

});
