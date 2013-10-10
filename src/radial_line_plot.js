micropolar.chart.RadialLinePlot = function module() {
    var config = {
        axis: null,
        containerSelector: 'body',
        lineStrokeSize: 2,
        stroke: 'orange'
    };
    var dispatch = d3.dispatch('hover');

    function exports() {
        d3.select(config.containerSelector)
            .datum(config.data)
            .each(function(_data, _index) {

                config.axis.config({containerSelector: this})
                config.axis(_datum);

                radialScale = config.axis.radialScale();
                angularScale = config.axis.angularScale();
                axisConfig = config.axis.config();

                var line = d3.svg.line.radial()
                    .radius(function(d) { return radialScale(d[1]); })
                    .angle(function(d) { return d[0] * Math.PI / 180 * (axisConfig.flip?1:-1); });
                
                var geometryGroup = d3.select(this).select('svg g.geometry').classed('polar-area', true);

                var markStyle = {fill: 'none', 'stroke-width': config.lineStrokeSize, stroke: config.stroke, 'pointer-events': 'stroke'};

                var geometry = geometryGroup.selectAll('path.mark')
                    .data([0]);
                geometry.enter().append('path').attr({'class': 'mark'});

                geometryGroup.select('path.mark')
                    .datum(_data)
                    .attr({
                        d: line, 
                        transform: 'rotate('+(axisConfig.originTheta + 90)+')',
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
