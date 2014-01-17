µ.BarChart = function module() {
    var config = µ.BarChart.defaultConfig();
    var dispatch = d3.dispatch('hover');

    function exports() {
        var geometryConfig = config.geometryConfig;
        var container = geometryConfig.container;
        if (typeof container == 'string') container = d3.select(container);
        container.datum(config.data)
            .each(function(_data, _index) {

                var data = d3.zip(_data.x[0], _data.y[0]);

                var angularScale = geometryConfig.angularScale;

                var markStyle = {fill: geometryConfig.color, stroke: d3.rgb(geometryConfig.color).darker().toString()};
                var barW = 12;
                var barY = geometryConfig.radialScale(geometryConfig.radialScale.domain()[0]);

                var geometryGroup = d3.select(this).classed('bar-chart', true);
                var geometry = geometryGroup.selectAll('rect.mark')
                    .data(data);
                geometry.enter().append('rect').attr({'class': 'mark'});
                geometry.attr({
                    x: -barW/2,
                    y: barY,
                    width: barW,
                    height: function(d, i){ return geometryConfig.radialScale(d[1]) - barY; },
                    transform: function(d, i){ return 'rotate('+ (geometryConfig.originTheta - 90 + (angularScale(d[0]))) +')'}
                })
                .style(markStyle);

        });
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        µ.util.deepExtend(config, _x);
        return this;
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
};


µ.BarChart.defaultConfig = function(){
    var config = {
        data: {name: 'Data', x: [0, 1, 2, 3], y: [10, 20, 30, 40]},
        geometryConfig: {
            geometry: 'BarChart',
            container: 'body',
            radialScale: null,
            angularScale: null,
            axisConfig: null,
            color: '#ffa500',
            dash: 'solid',
            lineStrokeSize: 2,
            flip: true,
            originTheta: 0,
            opacity: 1,
            index: 0,
            visible: true,
            visibleInLegend: true
        }
    };
    return config;
};