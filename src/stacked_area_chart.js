micropolar.StackedAreaChart = function module() {
    var config = {
        data: null,
        containerSelector: 'body',
        dotRadius: 5,
        fill: 'orange',
        stroke: 'red',
        radialScale: null,
        angularScale: null,
        colorScale: d3.scale.category20(),
        axisConfig: null
};
var dispatch = d3.dispatch('hover');

function exports() {
    var container = config.containerSelector;
    if (typeof container == 'string') container = d3.select(container);
    container.datum(config.data)
        .each(function (_data, _index) {

            var dataStacked = d3.nest().key(function (d) { return d[2] }).entries(_data);
            dataStacked.forEach(function (d) {
                d.values.forEach(function (val) {
                    val.x = val[0];
                    val.y = +val[1];
                })
            });
            var stacked = d3.layout.stack().values(function(d) { return d.values; });

            var triangleAngle = (360 / d3.keys(d3.nest().key(function (d) { return d[0] }).map(_data)).length) * Math.PI / 180 / 2;
            var markStyle = { fill: function(d){return config.colorScale(d[2])}, stroke: "gray" };
            var geometryGroup = d3.select(this).classed('stacked-area-chart', true);
            var geometry = geometryGroup.selectAll('g.layer')
                .data(stacked(dataStacked))
                .enter().append('g').classed('layer', true)
                .selectAll('path.mark')
                .data(function(d, i){ return d.values; });
                geometry.enter().append('path').attr({ 'class': 'mark' });
                geometry.attr({
                    d: function (d, i) {
                        var h = config.radialScale(d.y + d.y0);
                        var startH = config.radialScale(d.y0);
                        var baseW = Math.tan(triangleAngle) * h;
                        var startW = Math.tan(triangleAngle) * startH;
                        return 'M' + [[startH, startW], [h, baseW], [h, -baseW], [startH, -startW]].join('L') + 'Z'
                    },
                    transform: function (d, i) { return 'rotate(' + (config.axisConfig.originTheta - 90 + (config.angularScale(i))) + ')' }
                })
                .style(markStyle);

    });
}
exports.config = function (_x) {
    if (!arguments.length) return config;
    micropolar._override(_x, config);
    return this;
};
d3.rebind(exports, dispatch, 'on');
return exports;
};