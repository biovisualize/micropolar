d3.custom = d3.custom || {};

d3.custom.RadialDotPlot = function module() {
    var config = {
        dotRadius: 5,
    };
    var axis = null;

    var dispatch = d3.dispatch('customHover');
    function exports(_selection) {
        _selection.each(function(_data, _index) {

            var radialScale = axis.radialScale();
            var angularScale = axis.angularScale();
            var axisConfig = axis.config();
            
            var geometryGroup = d3.select(this).select('svg g.geometry');

            var geometry = geometryGroup.selectAll('circle.mark')
                .data(_data);
            geometry.enter().append('circle').attr({'class': 'mark'});
            geometry.attr({
                cy: function(d, i){ return radialScale(d[1]); }, 
                r: config.dotRadius, 
                transform: function(d, i){ return 'rotate('+ (axisConfig.originTheta - 90 + (angularScale(d[0]))) +')'}
            })

        });
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        for(x in _x) if(x in config) config[x] = _x[x];
        return this;
    };
    exports.axis = function(_x){  
        if (!arguments.length) return axis;
        axis = _x;
        return this;
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
}