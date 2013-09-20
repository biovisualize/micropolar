d3.custom = d3.custom || {};

d3.custom.PolarAreaChart = function module() {
    var config = {
        dotRadius: 5,
    };
    var radialScale, angularScale, axisConfig;
    var dispatch = d3.dispatch('customHover');
    
    function exports(_selection) {
        _selection.each(function(_data, _index) {

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
                transform: function(d, i){ return 'rotate('+ (axisConfig.originTheta - 90 + (angularScale(i))) +')'}
                // transform: function(d, i){ return 'rotate('+ (axisConfig.originTheta - 90 + (angularScale(d[0]))) +')'}
            })

        });
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        for(x in _x) if(x in config) config[x] = _x[x];
        return this;
    };
    exports.axis = function(_axis){  
        radialScale = _axis.radialScale();
        angularScale = _axis.angularScale();
        axisConfig = _axis.config();
        return this;
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
}