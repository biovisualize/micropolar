d3.custom = d3.custom || {};

d3.custom.CircularBarChart = function module() {
    var config = {
        dotRadius: 5,
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
            
                var geometryGroup = d3.select(this).select('svg g.geometry');

                var barW = 12;
                var geometry = geometryGroup.selectAll('rect.mark')
                    .data(_data);
                geometry.enter().append('rect').attr({'class': 'mark'});
                geometry.attr({
                        x: -barW/2,
                        y: radialScale(0), 
                        width: barW, 
                        height: function(d, i){ return radialScale(d[1]); }, 
                        transform: function(d, i){ return 'rotate('+ (axisConfig.originTheta - 90 + (angularScale(d[0]))) +')'}
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