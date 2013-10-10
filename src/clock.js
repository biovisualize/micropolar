micropolar.Clock = function module() {
    var config = {
        containerSelector: 'body',
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
                var radius = config.radialScale.range()[1];
                var handsHeight = [radius / 1.3, radius / 1.5, radius / 1.5];
                var handsWidth = [radius / 15, radius / 10, radius / 30];

                _data = [0, 4, 8]; // hardocded
                config.angularScale.domain([0, 12]); // hardocded 

                var markStyle = {fill: config.fill, stroke: config.stroke};
                var geometryGroup = d3.select(this).select('svg g.geometry').classed('clock', true);;
                var geometry = geometryGroup.selectAll('rect.mark')
                    .data(_data);
                geometry.enter().append('rect').attr({'class': 'mark'});
                geometry.attr({
                    x: function(d, i){ return -handsWidth[i]/2; },
                    y: function(d, i){ return i==2 ? -radius/5 : 0 }, 
                    width: function(d, i){ return handsWidth[i]; }, 
                    height: function(d, i){ return handsHeight[i]; }, 
                    transform: function(d, i){ return 'rotate('+ (config.axisConfig.originTheta - 90 + (config.angularScale(d))) +')'}
                })
                .style(markStyle);

                geometryGroup.selectAll('circle.mark')
                    .data([0])
                    .enter().append('circle').attr({'class': 'mark'})
                    .attr({r: radius / 10}).style({'fill-opacity': 1})
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
