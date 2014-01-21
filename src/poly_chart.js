µ.PolyChart = function module() {
    var config = µ.PolyChart.defaultConfig();
    var dispatch = d3.dispatch('hover');

    function exports() {
        var geometryConfig = config.geometryConfig;
        var container = geometryConfig.container;
        if (typeof container == 'string') container = d3.select(container);
        container.datum(config.data)
            .each(function (_data, _index) {

                // Zip the data
                var isStack = _data.yStack;
                var data = _data.y.map(function(d, i){
                    if(isStack) return d3.zip(_data.x[0], d, _data.yStack[i]);
                    else return d3.zip(_data.x[0], d);
                });

                // Scales
                var angularScale = geometryConfig.angularScale;
                var angularScaleReversed = geometryConfig.angularScale.copy().range(geometryConfig.angularScale.range().slice().reverse());
                var angularScale2 = (geometryConfig.flip) ? angularScale : angularScaleReversed;

                // Geometry generators
                var generator = {};
                var domainMin = geometryConfig.radialScale.domain()[0];
                generator.bar = function(d, i){
                    var h = geometryConfig.radialScale(d[1]);
                    var stackTop = geometryConfig.radialScale(domainMin + (d[2]||0));
                    var w = 20;
                    return 'M'+[[h+stackTop, -w/2], [h+stackTop, w/2], [stackTop, w/2], [stackTop, -w/2]].join('L')+'Z';
                };
                generator.dot = function (d, i) {
                    return d3.svg.symbol().type(geometryConfig.dotType)(d, i);
                };
                generator.arc = d3.svg.arc()
                    .startAngle(function(d) { return -triangleAngle + Math.PI/2; })
                    .endAngle(function(d) { return triangleAngle + Math.PI/2; })
                    .innerRadius(function(d) { return geometryConfig.radialScale(domainMin +  (d[2]||0)); })
                    .outerRadius(function(d) { return geometryConfig.radialScale(domainMin +  (d[2]||0)) + geometryConfig.radialScale(d[1]) });

                var triangleAngle = (angularScale2(data[0][1][0]) * Math.PI / 180 / 2);
                var markStyle = {
                    fill: function(d, i, pI){ return (isStack) ? geometryConfig.colorScale(pI) : geometryConfig.color },
                    stroke: "gray" };
                var geometryGroup = d3.select(this).classed('stacked-area-chart', true);
                var geometry = geometryGroup.selectAll('g.layer')
                    .data(data)
                    .enter().append('g').classed('layer', true)
                    .selectAll('path.mark')
                    .data(function(d, i){ return d; });
                    geometry.enter().append('path').attr({ 'class': 'mark' });
                    geometry.attr({
                        d: generator[geometryConfig.geometryType],
                        transform: (geometryConfig.geometryType === 'dot')
                            ? function (d, i) {
                                var coord = convertToCartesian(getPolarCoordinates(d));
                                return 'translate('+[coord.x, coord.y]+')';
                            }
                            : function (d, i){ return 'rotate(' + (geometryConfig.originTheta + (angularScale(d[0]))) + ')'; }
                    })
                    .style(markStyle)
                    .append('title')
                    .text(function(d, i){ return d; });

                function getPolarCoordinates(d, i){
                    var r = geometryConfig.radialScale(d[1]);
                    var θ = (geometryConfig.angularScale(d[0])) * Math.PI / 180;
                    return {r: r, θ: θ};
                }

                function convertToCartesian(polarCoordinates){
                    var x = polarCoordinates.r * Math.cos(polarCoordinates.θ);
                    var y = polarCoordinates.r * Math.sin(polarCoordinates.θ);
                    return {x: x, y: y};
                }

            });
    }
    exports.config = function (_x) {
        if (!arguments.length) return config;
        µ.util.deepExtend(config, _x);
        return this;
    };

    d3.rebind(exports, dispatch, 'on');
    return exports;
};

µ.PolyChart.defaultConfig = function(){
    var config = {
        data: {name: 'geom1', x: [[1, 2, 3, 4]], y: [[1, 2, 3, 4]]},
        geometryConfig: {
            geometry: 'LinePlot',
            geometryType: 'arc',
            dotType: 'circle',
            color: '#ffa500',
            dash: 'solid',
            lineStrokeSize: 2,
            flip: true,
            originTheta: 0,
            container: 'body',
            opacity: 1,
            radialScale: null,
            angularScale: null,
            index: 0,
            visible: true,
            visibleInLegend: true,
            colorScale: d3.scale.category20()
        }
    };
    return config;
};