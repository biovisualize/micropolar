µ.StackedAreaChart = function module() {
    var config = µ.StackedAreaChart.defaultConfig();
    var dispatch = d3.dispatch('hover');

    function exports() {
        var geometryConfig = config.geometryConfig;
        var container = geometryConfig.container;
        if (typeof container == 'string') container = d3.select(container);
        container.datum(config.data)
            .each(function (_data, _index) {

                var data = d3.zip(_data.x[0], _data.y[0]);

                var angularScale = geometryConfig.angularScale;

                var dataStacked = d3.nest().key(function (d) { return d[2] }).entries(data);
                dataStacked.forEach(function (d) {
                    d.values.forEach(function (val) {
                        val.x = val[0];
                        val.y = +val[1];
                    })
                });
                var stacked = d3.layout.stack().values(function(d) { return d.values; });

                var geometryType = 'arc';
                var generator = {};
                var baseY = geometryConfig.radialScale(geometryConfig.radialScale.domain()[0]);
                generator.bar = function(d, i){
                        var barH = geometryConfig.radialScale(d[1]) - baseY;
                        var barW = 20;
                        return 'M'+[[barH, -barW/2], [barH, barW/2], [0, barW/2], [0, -barW/2]].join('L')+'Z';
                    };
                generator.triangle = function (d, i) {
                        var h = geometryConfig.radialScale(d.y + d.y0);
                        var startH = baseY;
                        var baseW = Math.tan(triangleAngle) * h;
                        var startW = Math.tan(triangleAngle) * startH;
                        return 'M' + [[startH, startW], [h, baseW], [h, -baseW], [startH, -startW]].join('L') + 'Z'
                    };
                generator.arc = d3.svg.arc()
                    .startAngle(function(d) { return -triangleAngle + Math.PI/2; })
                    .endAngle(function(d) { return triangleAngle + Math.PI/2; })
                    .innerRadius(function(d) { return baseY; })
                    .outerRadius(function(d) { return geometryConfig.radialScale(d.y); });

//                var triangleAngle = (360 / d3.keys(d3.nest().key(function (d) { return d[0] }).map(data)).length) * Math.PI / 180 / 2;
                var triangleAngle = (angularScale(data[1][0] - data[0][0]) * Math.PI / 180 / 2);
//                var markStyle = { fill: function(d){return geometryConfig.colorScale(d[2])}, stroke: "gray" };
                var markStyle = { fill: geometryConfig.color, stroke: "gray" };
                var geometryGroup = d3.select(this).classed('stacked-area-chart', true);
                var geometry = geometryGroup.selectAll('g.layer')
                    .data(stacked(dataStacked))
                    .enter().append('g').classed('layer', true)
                    .selectAll('path.mark')
                    .data(function(d, i){ return d.values; });
                    geometry.enter().append('path').attr({ 'class': 'mark' });
                    geometry.attr({
                        d: generator[geometryType],
                        transform: function (d, i) { return 'rotate(' + (geometryConfig.originTheta + (angularScale(d[0]))) + ')' }
                    })
                    .style(markStyle);

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

µ.StackedAreaChart.defaultConfig = function(){
    var config = {
        data: [1, 2, 3, 4],
        geometryConfig: {
            geometry: 'LinePlot',
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