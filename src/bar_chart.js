micropolar.BarChart = function module() {
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

                var markStyle = {fill: config.fill, stroke: config.stroke};
                var barW = 12;

                var geometryGroup = d3.select(this).select('svg g.geometry').classed('bar-chart', true);;
                var geometry = geometryGroup.selectAll('rect.mark')
                    .data(_data);
                geometry.enter().append('rect').attr({'class': 'mark'});
                geometry.attr({
                        x: -barW/2,
                        y: config.radialScale(0), 
                        width: barW, 
                        height: function(d, i){ 
                            // console.log(d[1], ~~config.radialScale(d[1]), config.radialScale.domain(), config.radialScale.range());
                            return config.radialScale(d[1]) - config.radialScale(0); }, 
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
