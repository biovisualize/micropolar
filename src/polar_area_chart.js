micropolar.chart.PolarAreaChart = function module() {
    var config = {
        dotRadius: 5,
        axis: null,
        containerSelector: 'body'
    };
    var dispatch = d3.dispatch('hover');

    function exports(_datum) {

        d3.select(config.containerSelector)
            .datum(_datum)
            .each(function(_data, _index) {

                config.axis.config({containerSelector: this})
                config.axis(_datum);

                radialScale = config.axis.radialScale();
                angularScale = config.axis.angularScale();
                axisConfig = config.axis.config();

                var triangleAngle = (360 / _data.length) * Math.PI / 180 / 2;
                
                var geometryGroup = d3.select(this).select('svg g.geometry');

                var geometry = geometryGroup.selectAll('path.mark')
                    .data(_data);
                geometry.enter().append('path').attr({'class': 'mark'});
                geometry.attr({
                    d: function(d, i){ 
                        var h = radialScale(d[1]); 
                        var baseW = Math.tan(triangleAngle) * h;
                        return 'M'+[[0, 0], [h, baseW], [h, -baseW]].join('L')+'Z' },
                    transform: function(d, i){ return 'rotate('+ (axisConfig.originTheta + (angularScale(i))) +')'}
                    // transform: function(d, i){ return 'rotate('+ (axisConfig.originTheta - 90 + (angularScale(d[0]))) +')'}
                })

        });
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        micropolar._override(_x, config);
        return this;
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
}