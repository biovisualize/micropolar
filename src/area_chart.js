micropolar.AreaChart = function module() {
    var config = {
        containerSelector: 'body',
        dotRadius: 5,
        fill: 'orange',
        stroke: 'red',
        radialScale: null,
        angularScale: null,
        axisConfig: null
    };
    var dispatch = d3.dispatch('hover');

    function exports() {
        d3.select(config.containerSelector)
            .datum(config.axisConfig.data)
            .each(function(_data, _index) {

                var triangleAngle = (360 / _data.length) * Math.PI / 180 / 2;
                var markStyle = {fill: config.fill, stroke: config.stroke};
                var geometryGroup = d3.select(this).select('svg g.geometry').classed('area-chart', true);;
                var geometry = geometryGroup.selectAll('path.mark')
                    .data(_data);
                geometry.enter().append('path').attr({'class': 'mark'});
                geometry.attr({
                    d: function(d, i){ 
                        var h = config.radialScale(d[1]); 
                        var baseW = Math.tan(triangleAngle) * h;
                        return 'M'+[[0, 0], [h, baseW], [h, -baseW]].join('L')+'Z' },
                    transform: function(d, i){ return 'rotate('+ (config.axisConfig.originTheta - 90 + (config.angularScale(i))) +')'}
                    // transform: function(d, i){ return 'rotate('+ (axisConfig.originTheta - 90 + (angularScale(d[0]))) +')'}
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
