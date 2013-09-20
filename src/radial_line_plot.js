d3.custom = d3.custom || {};

d3.custom.RadialLinePlot = function module() {
    var config = {
        lineStrokeSize: 1,
        axis: null,
        container: d3.select('body')
    };
    var dispatch = d3.dispatch('hover');

    function exports(_datum) {
        config.container
            .datum(_datum)
            .each(function(_data, _index) {

                config.axis.config({container: d3.select(this)})
                config.axis(_datum);

                radialScale = config.axis.radialScale();
                angularScale = config.axis.angularScale();
                axisConfig = config.axis.config();

                var line = d3.svg.line.radial()
                    .radius(function(d) { return radialScale(d[1]); })
                    .angle(function(d) { return d[0] * Math.PI / 180 * (axisConfig.flip?1:-1); });
                
                var geometryGroup = d3.select(this).select('svg g.geometry').classed('polar-area', true);

                var geometry = geometryGroup.selectAll('path.mark')
                    .data([0]);
                geometry.enter().append('path').attr({'class': 'mark'});

                geometryGroup.select('path.mark')
                    .datum(_data)
                    .attr({
                        d: line, 
                        transform: 'rotate('+(axisConfig.originTheta + 90)+')',
                        'stroke-width': config.lineStrokeSize + 'px'
                });

        });
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        for(x in _x) if(x in config) config[x] = _x[x];
        return this;
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
}