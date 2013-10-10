micropolar.LinePlot = function module() {
    var config = {
        containerSelector: 'body',
        lineStrokeSize: 2,
        stroke: 'orange',
        radialScale: null,
        angularScale: null,
        axisConfig: null
    };
    var dispatch = d3.dispatch('hover');

    function exports() {
        d3.select(config.containerSelector)
            .datum(config.axisConfig.data)
            .each(function(_data, _index) {

                var line = d3.svg.line.radial()
                    .radius(function(d) { return config.radialScale(d[1]); })
                    .angle(function(d) { return config.angularScale(d[0]) * Math.PI / 180 * (config.axisConfig.flip?1:-1); });

                var markStyle = {fill: 'none', 'stroke-width': config.lineStrokeSize, stroke: config.stroke, 'pointer-events': 'stroke'};
                var geometryGroup = d3.select(this).select('svg g.geometry').classed('line-plot', true);
                var geometry = geometryGroup.selectAll('path.mark')
                    .data([0]);
                geometry.enter().append('path').attr({'class': 'mark'});

                geometryGroup.select('path.mark')
                    .datum(_data)
                    .attr({
                        d: line, 
                        transform: 'rotate('+(config.axisConfig.originTheta + 90)+')',
                        'stroke-width': config.lineStrokeSize + 'px'
                })
                .style(markStyle);

        });
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        micropolar._override(_x, config);
        return this;
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
};
