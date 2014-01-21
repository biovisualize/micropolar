µ.LinePlot = function module() {
    var config = µ.LinePlot.defaultConfig();
    var dispatch = d3.dispatch('hover');
    var dashArray = {solid: 'none', dash: [5, 2], dot: [2, 5] };

    function exports() {
        var geometryConfig = config.geometryConfig;
        var container = geometryConfig.container;
        if (typeof container == 'string') container = d3.select(container);
        container.datum(config.data)
            .each(function(_data, _index) {
                var data = d3.zip(_data.x[0], _data.y[0]);

                var line = d3.svg.line.radial()
                    .interpolate(geometryConfig.lineInterpolation)
                    .radius(function(d) { return geometryConfig.radialScale(d[1]); })
                    .angle(function(d) { return geometryConfig.angularScale(d[0]) * Math.PI / 180; });

                var markStyle = {fill: 'none', 'stroke-width': geometryConfig.lineStrokeSize, stroke: geometryConfig.color, 'pointer-events': 'stroke'};
                var geometryGroup = d3.select(this).classed('line-plot', true);
                var geometry = geometryGroup.selectAll('path.mark')
                    .data([0]);
                geometry.enter().append('path').attr({'class': 'mark'});
                geometryGroup.select('path.mark')
                    .datum(data)
                    .attr({
                        d: line,
                        transform: 'rotate('+(geometryConfig.originTheta + 90)+')',
                        'stroke-width': geometryConfig.lineStrokeSize + 'px',
                        'stroke-dasharray': dashArray[geometryConfig.dash],
                        opacity: geometryConfig.opacity,
                        display: (geometryConfig.visible) ? 'block' : 'none'
                })
                .style(markStyle);
            });
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        µ.util.deepExtend(config, _x);
        return this;
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
};

µ.LinePlot.defaultConfig = function(){
    var config = {
        data: {name: 'geom1', x: [[1, 2, 3, 4]], y: [[1, 2, 3, 4]]},
        geometryConfig: {
            geometry: 'LinePlot',
            color: '#ffa500',
            dash: 'solid',
            lineStrokeSize: 2,
            lineInterpolation: 'linear', // linear, step, basis, cardinal, monotone
            flip: true,
            originTheta: 0,
            container: 'body',
            opacity: 1,
            radialScale: null,
            angularScale: null,
            index: 0,
            visible: true,
            visibleInLegend: true
        }
    };
    return config;
};
