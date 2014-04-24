µ.PolyChart = function module() {
    var config = [µ.PolyChart.defaultConfig()];
    var dispatch = d3.dispatch('hover');
    var dashArray = {solid: 'none', dash: [5, 2], dot: [2, 5] };
    var colorScale;

    function exports() {
        var geometryConfig = config[0].geometryConfig;
        var container = geometryConfig.container;
        if (typeof container == 'string') container = d3.select(container);
        container.datum(config)
            .each(function (_config, _index) {

                // Zip the data
                var isStack = !!_config[0].data.yStack;
                var data = _config.map(function(d, i){
                    if(isStack) return d3.zip(d.data.t[0], d.data.r[0], d.data.yStack[0]);
                    else return d3.zip(d.data.t[0], d.data.r[0]);
                });

                // Scales
                var angularScale = geometryConfig.angularScale;
                var domainMin = geometryConfig.radialScale.domain()[0];

                // Geometry generators
                var generator = {};

                // Bar
                generator.bar = function(d, i, pI){
                    var dataConfig = _config[pI].data;
                    var h = geometryConfig.radialScale(d[1]);
                    var stackTop = geometryConfig.radialScale(domainMin + (d[2]||0));
                    if(dataConfig.barRadialOffset){
                        stackTop = dataConfig.barRadialOffset;
                        h -= stackTop;
                    }
                    var w = dataConfig.barWidth;
                    d3.select(this).attr({
                        class: 'mark bar',
                        d: 'M'+[[h+stackTop, -w/2], [h+stackTop, w/2], [stackTop, w/2], [stackTop, -w/2]].join('L')+'Z',
                        transform: function (d, i){ return 'rotate(' + (geometryConfig.orientation + (angularScale(d[0]))) + ')'; }
                    });
                };

                // Dot
                generator.dot = function (d, i, pI) {
                    var stackedData = (d[2]) ? [d[0], d[1] + d[2]] : d;
                    var symbol = d3.svg.symbol().size(_config[pI].data.dotSize).type(_config[pI].data.dotType)(d, i);
                    d3.select(this).attr({
                        class: 'mark dot',
                        d: symbol,
                        transform: function (d, i) {
                            var coord = convertToCartesian(getPolarCoordinates(stackedData));
                            return 'translate('+[coord.x, coord.y]+')';
                        }
                    });
                };

                // Line
                var line = d3.svg.line.radial()
//                    .interpolate(geometryConfig.lineInterpolation)
                    .radius(function(d) { return geometryConfig.radialScale(d[1]); })
                    .angle(function(d) { return geometryConfig.angularScale(d[0]) * Math.PI / 180; });
                generator.line = function(d, i, pI) {
                    var lineData = (d[2]) ? data[pI].map(function(d, i){ return [d[0], d[1] + d[2]]; }) : data[pI];
                    // Line dots
                    d3.select(this).each(generator['dot'])
                        .style({opacity: 0, fill:  markStyle.stroke(d, i, pI)})
                        .attr({'class': 'mark dot'});
                    if(i > 0) return;
                    // Line
                    var lineSelection = d3.select(this.parentNode).selectAll('path.line').data([0]);
                    lineSelection.enter().insert('path');
                    lineSelection.attr({
                            class: 'line',
                            d: line(lineData),
//                            transform: function (dB, iB){ return 'rotate(' + (geometryConfig.orientation + (angularScale(d[0])) + 90) + ')'; },
                            transform: function (dB, iB){ return 'rotate(' + (geometryConfig.orientation + 90) + ')'; },
                            'pointer-events': 'none'
                        })
                        .style({
                            fill: function(dB, iB){ return markStyle.fill(d, i, pI); },
                            'fill-opacity': 0,
                            stroke: function(dB, iB){ return markStyle.stroke(d, i, pI); },
                            'stroke-width': function(dB, iB){ return markStyle['stroke-width'](d, i, pI); },
                            'stroke-dasharray': function(dB, iB){ return markStyle['stroke-dasharray'](d, i, pI); },
                            opacity: function(dB, iB){ return markStyle.opacity(d, i, pI); },
                            display: function(dB, iB){ return markStyle.display(d, i, pI); }
                        });
                };

                // Arc
                var angularRange = geometryConfig.angularScale.range();
                var triangleAngle = (Math.abs(angularRange[1] - angularRange[0]) / data[0].length) * Math.PI / 180;
                var arc = d3.svg.arc()
                    .startAngle(function(d){ return -triangleAngle / 2; })
                    .endAngle(function(d){ return triangleAngle / 2; })
                    .innerRadius(function(d){ return geometryConfig.radialScale(domainMin +  (d[2]||0)); })
                    .outerRadius(function(d){ return geometryConfig.radialScale(domainMin +  (d[2]||0)) + geometryConfig.radialScale(d[1]); });
                generator.arc = function(d, i, pI){
                    d3.select(this).attr({
                        class: 'mark arc',
                        d: arc,
                        transform: function (d, i){ return 'rotate(' + (geometryConfig.orientation + (angularScale(d[0])) + 90) + ')'; }
                    });
                };

                var markStyle = {
                    fill: function(d, i, pI){ return _config[pI].data.color; },
                    stroke: function(d, i, pI){ return  _config[pI].data.strokeColor; },
                    'stroke-width': function(d, i, pI){ return _config[pI].data.strokeSize + 'px'; },
                    'stroke-dasharray': function(d, i, pI){ return dashArray[_config[pI].data.strokeDash]; },
                    opacity: function(d, i, pI){ return _config[pI].data.opacity; },
                    display: function(d, i, pI){ return (typeof _config[pI].data.visible === 'undefined' || _config[pI].data.visible) ? 'block' : 'none'; }
                };

                var geometryLayer = d3.select(this).selectAll('g.layer')
                    .data(data);
                geometryLayer.enter().append('g').attr({'class': 'layer'});
                var geometry = geometryLayer.selectAll('path.mark')
                    .data(function(d, i){ return d; });
                geometry.enter().append('path').attr({'class': 'mark'});
                geometry
                    .style(markStyle)
                    .each(generator[geometryConfig.geometryType]);
                geometry.exit().remove();
                geometryLayer.exit().remove();

                function getPolarCoordinates(d, i){
                    var r = geometryConfig.radialScale(d[1]);
                    var t = (geometryConfig.angularScale(d[0]) + geometryConfig.orientation) * Math.PI / 180;
                    return {r: r, t: t};
                }

                function convertToCartesian(polarCoordinates){
                    var x = polarCoordinates.r * Math.cos(polarCoordinates.t);
                    var y = polarCoordinates.r * Math.sin(polarCoordinates.t);
                    return {x: x, y: y};
                }

            });
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        _x.forEach(function(d, i){
            if(!config[i]) config[i] = {};
            µ.util.deepExtend(config[i], µ.PolyChart.defaultConfig());
            µ.util.deepExtend(config[i], d);
        });
        return this;
    };

    exports.getColorScale = function() {
        return colorScale;
    };

    d3.rebind(exports, dispatch, 'on');
    return exports;
};

    µ.PolyChart.defaultConfig = function(){
        var config = {
            data: {
                name: 'geom1',
                t: [[1, 2, 3, 4]],
                r: [[1, 2, 3, 4]],
                dotType: 'circle',
                dotSize: 64,
                barRadialOffset: null,
                barWidth: 20,
                color: '#ffa500',
                strokeSize: 1,
                strokeColor: 'silver',
                strokeDash: 'solid',
                opacity: 1,
                index: 0,
                visible: true,
                visibleInLegend: true
            },
            geometryConfig: {
            geometry: 'LinePlot',
            geometryType: 'arc',
            direction: 'clockwise',
            orientation: 0,
            container: 'body',
            radialScale: null,
            angularScale: null,
            colorScale: d3.scale.category20()
        }
    };
    return config;
};