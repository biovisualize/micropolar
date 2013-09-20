d3.custom = d3.custom || {};

d3.custom.Clock = function module() {
    var config = {
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

                var triangleAngle = (360 / _data.length) * Math.PI / 180 / 2;
                var radius = radialScale.range()[1];
                var handsHeight = [radius / 1.3, radius / 1.5, radius / 1.5];
                var handsWidth = [radius / 15, radius / 10, radius / 30];
                
                var svg = d3.select(this).select('svg').classed('clock', true);
                var geometryGroup =svg.select('g.geometry');

                var geometry = geometryGroup.selectAll('rect.mark')
                    .data([0, 4, 8]);
                geometry.enter().append('rect').attr({'class': 'mark'});
                geometry.attr({
                    x: function(d, i){ return -handsWidth[i]/2; },
                    y: function(d, i){ return i==2 ? -radius/5 : 0 }, 
                    width: function(d, i){ return handsWidth[i]; }, 
                    height: function(d, i){ return handsHeight[i]; }, 
                    transform: function(d, i){ return 'rotate('+ (axisConfig.originTheta - 90 + (angularScale(d))) +')'}
                })

                geometryGroup.selectAll('circle.mark')
                    .data([0])
                    .enter().append('circle').attr({'class': 'mark'}).attr({r: radius / 10}).style({'fill-opacity': 1});

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