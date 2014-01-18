µ.DotPlot = function module() {
    var config = µ.DotPlot.defaultConfig();
    var dispatch = d3.dispatch('hover');

    function exports() {
        var geometryConfig = config.geometryConfig;
        var container = geometryConfig.container;
        if (typeof container == 'string') container = d3.select(container);
        container.datum(config.data)
            .each(function(_data, _index) {

                var data = d3.zip(_data.x[0], _data.y[0]);

                var getPolarCoordinates = function(d, i){
                    var r = geometryConfig.radialScale(d[1]);
                    var θ = (geometryConfig.angularScale(d[0])) * Math.PI / 180;
                    return {r: r, θ: θ};
                };

                var convertToCartesian = function(polarCoordinates){
                    var x = polarCoordinates.r * Math.cos(polarCoordinates.θ);
                    var y = polarCoordinates.r * Math.sin(polarCoordinates.θ);
                    return {x: x, y: y};
                };

                var markStyle = {fill: geometryConfig.color, stroke: d3.rgb(geometryConfig.color).darker().toString()};
                var geometryGroup = d3.select(this).classed('dot-plot', true);
                var geometry = geometryGroup.selectAll('circle.mark')
                    .data(data);
                geometry.enter().append('circle').attr({'class': 'mark'});
                geometry.attr({
                    cx: function(d, i){ return convertToCartesian(getPolarCoordinates(d)).x},
                    cy: function(d, i){ return convertToCartesian(getPolarCoordinates(d)).y},
                    r: geometryConfig.radius
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

µ.DotPlot.defaultConfig = function(){
    var config = {
        data: [1, 2, 3, 4],
        geometryConfig: {
            geometry: 'DotPlot',
            container: 'body',
            radius: 3,
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
