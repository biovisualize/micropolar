micropolar.DotPlot = function module() {
    var config = {
        data: null,
        containerSelector: 'body',
        dotRadius: 3,
        fill: 'orange',
        stroke: 'red',
        radialScale: null,
        angularScale: null,
        axisConfig: null
    };
    var dispatch = d3.dispatch('hover');

    function exports() {
        var container = config.containerSelector;
        if (typeof container == 'string') container = d3.select(container);
        container.datum(config.data)
            .each(function(_data, _index) {

                var markStyle = {fill: config.fill, stroke: config.stroke};
                var geometryGroup = d3.select(this).classed('dot-plot', true);
                var geometry = geometryGroup.selectAll('circle.mark')
                    .data(_data);
                geometry.enter().append('circle').attr({'class': 'mark'});
                geometry.attr({
                    cy: function(d, i){ return config.radialScale(d[1]); }, 
                    r: config.dotRadius, 
                    transform: function(d, i){ return 'rotate('+ (config.axisConfig.originTheta - 90 + (config.angularScale(d[0]))) +')'}
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
