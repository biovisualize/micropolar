µ.LinePlot = function module() {
    var config = µ.LinePlot.defaultConfig();
    var dispatch = d3.dispatch('hover');

    function exports() {
        var container = config.containerSelector;
        if (typeof container == 'string') container = d3.select(container);
        container.datum(config.data)
            .each(function(_data, _index) {

                var line = d3.svg.line.radial()
                    .radius(function(d) { return config.radialScale(d[1]); })
                    .angle(function(d) { return config.angularScale(d[0]) * Math.PI / 180 * (config.axisConfig.flip?1:-1); });

                var markStyle = {fill: 'none', 'stroke-width': config.lineStrokeSize, stroke: config.color, 'pointer-events': 'stroke'};
                var geometryGroup = d3.select(this).classed('line-plot', true);
                var geometry = geometryGroup.selectAll('path.mark')
                    .data([0]);
                geometry.enter().append('path').attr({'class': 'mark'});
                geometryGroup.select('path.mark')
                    .datum(_data)
                    .attr({
                        d: line,
//                        transform: 'rotate('+(config.axisConfig.originTheta + 90)+')',
                        'stroke-width': config.lineStrokeSize + 'px',
                        'stroke-dasharray': config.dash,
                        opacity: config.opacity
                })
                .style(markStyle);
            });
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        µ.util._override(_x, config);
        return this;
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
};

µ.LinePlot.defaultConfig = function(){
    var config = {
        data: d3.range(0, 721, 1).map(function(deg, index){ return [deg, index/720*2]; }),
        title: '',
        geometry: 'LinePlot',
        color: '#ffa500',
        dash: 'solid',
        lineStrokeSize: 2,
        height: 250,
        width: 250,
        margin: {top: 0, right: 0, bottom: 0, left: 0},
        isLegendVisible: false,
        minorTicks: 1,
        flip: true,
        originTheta: -90,
        radialAxisTheta: -90,
        radialTicksSuffix: '',
        containerSelector: 'body',
        opacity: 1,
        radialScale: null,
        angularScale: null,
        axisConfig: null
    };
    return config;
};
