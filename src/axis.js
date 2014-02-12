var micropolar = {version: '0.2.1'};
var µ = micropolar;

µ.Axis = function module() {
    var config = µ.Axis.defaultConfig();
    var svg, dispatch = d3.dispatch('hover'),
    	radialScale, angularScale;

    function exports(){
        var data = config.data;
        var axisConfig = config.layout;
        var container = axisConfig.container;
        if (typeof container == 'string' || container.nodeName) container = d3.select(container);
        container.datum(data)
            .each(function(_data, _index) {

                // Scales
                ////////////////////////////////////////////////////////////////////

                // clone data
                var dataOriginal = _data.slice();

                //remove invisible
                data = dataOriginal.filter(function(d, i){
                    var visible = d.visible;
                    return typeof visible === 'undefined' || visible === true;
                });

                // Stack
                var isStacked = false;
                var dataWithGroupId = data.map(function(d, i){
                    isStacked = isStacked || (typeof d.groupId !== 'undefined')
                    return d;
                });
                if(isStacked){
                    var grouped =  d3.nest().key(function(d, i){
                            return (typeof d.groupId != 'undefined') ? d.groupId : 'unstacked';
                        })
                        .entries(dataWithGroupId);
                    var dataYStack = [];
                    var stacked = grouped.map(function(d, i){
                        if (d.key === 'unstacked') return d.values;
                        else{
                            var prevArray = d.values[0].y.map(function(d, i){ return 0; });
                            d.values.forEach(function(d, i, a){
                                d.yStack = [prevArray];
                                dataYStack.push(prevArray);
                                prevArray = µ.util.sumArrays(d.y, prevArray);
                            });
                            return d.values;
                        }
                    });

                    data = d3.merge(stacked);
                }

                // Make sure x,y are arrays of array
                //TODO: get rid of this
                var data = data.map(function(d, i){
                    var validated = d;
                    validated.name = d.name;
                    validated.x = (Array.isArray(d.x[0])) ? d.x : [d.x];
                    validated.y = (Array.isArray(d.y[0])) ? d.y : [d.y];
                    validated.yStack = d.yStack;
                    return validated;
                });

                // Radial scale
                var radius = Math.min(axisConfig.width - axisConfig.margin.left - axisConfig.margin.right,
                    axisConfig.height - axisConfig.margin.top - axisConfig.margin.bottom) / 2;
                var chartCenter = [axisConfig.margin.left + radius, axisConfig.margin.top + radius]

                var extent;
                if(isStacked){
                    var highestStackedValue = d3.max(µ.util.sumArrays(µ.util.arrayLast(data).y[0], µ.util.arrayLast(dataYStack)));
                    extent = [0, highestStackedValue];
                }
                else extent = d3.extent(µ.util.flattenArray(data.map(function(d, i){ return d.y; })));

                radialScale = d3.scale.linear()
                    .domain(axisConfig.radialAxis.domain || extent)
                    .range([0, radius]);

                // Angular scale
                var angularDataMerged = µ.util.flattenArray(data.map(function(d, i){ return d.x; }));

                // Ordinal Angular scale
                var isOrdinal = typeof angularDataMerged[0] === 'string';
                var ticks;
                if(isOrdinal){
                    angularDataMerged = µ.util.deduplicate(angularDataMerged);
                    ticks = angularDataMerged.slice();
                    angularDataMerged = d3.range(angularDataMerged.length);
                    data = data.map(function(d, i){
                        var result = d;
                        d.x = [angularDataMerged];
                        if(isStacked) result.yStack = d.yStack;
                        return result;
                    });
                }

                var angularExtent = d3.extent(angularDataMerged);
               	var angularDomain = (axisConfig.angularAxis.domain) ? axisConfig.angularAxis.domain.slice() : angularExtent;
                var angularDomainStep = angularDataMerged[1] - angularDataMerged[0];
                if(axisConfig.needsEndSpacing) angularDomain[1] += angularDomainStep;

                // Reduce the number of ticks
//                var tickCount = axisConfig.angularAxis.ticksCount || ((angularDomain[1] - angularDomain[0]) / (data[0].x[0][1] - data[0].x[0][0]));
                var tickCount = axisConfig.angularAxis.ticksCount || 4;
                if(tickCount > 8) tickCount = tickCount / (tickCount / 8) + tickCount%8;
                if(axisConfig.angularAxis.ticksStep){
                    tickCount = (angularDomain[1] - angularDomain[0]) / tickCount;
                }
                var angularTicksStep = axisConfig.angularAxis.ticksStep
                    || ((angularDomain[1] - angularDomain[0]) / (tickCount * (axisConfig.minorTicks+1)));
                if(!angularDomain[2]) angularDomain[2] = angularTicksStep;

                var angularAxisRange = d3.range.apply(this, angularDomain);
                // Workaround for rounding errors
                angularAxisRange = angularAxisRange.map(function(d, i){ return parseFloat(d.toPrecision(12)) });

                angularScale = d3.scale.linear()
                    .domain(angularDomain.slice(0, 2))
                    .range((axisConfig.direction === 'clockwise') ? [0, 360] : [360, 0]);

                angularScale.endPadding = axisConfig.needsEndSpacing ? angularDomainStep : 0;

                // Chart skeleton
                ////////////////////////////////////////////////////////////////////

                svg = d3.select(this).select('svg.chart-root');

                if(typeof svg === 'undefined' || svg.empty()){
                    var skeleton = '<svg xmlns="http://www.w3.org/2000/svg" class="chart-root">' +
                        '<g class="outer-group">' +
                            '<g class="chart-group">' +
                                '<circle class="background-circle"></circle>' +
                                '<g class="geometry-group"></g>' +
                                '<g class="radial axis-group">' +
                                    '<circle class="outside-circle"></circle>' +
                                '</g>' +
                                '<g class="angular axis-group"></g>' +
                                '<g class="guides-group"><line></line><circle r="0"></circle></g>' +
                            '</g>' +
                            '<g class="legend-group"></g>' +
                            '<g class="tooltips-group"></g>' +
                            '<g class="title-group"><text></text></g>' +
                        '</g>' +
                    '</svg>';
                    var doc = new DOMParser().parseFromString(skeleton, 'application/xml');
                    var newSvg = this.appendChild(this.ownerDocument.importNode(doc.documentElement, true));
                    svg = d3.select(newSvg);
                }

                var lineStyle = {fill: 'none', stroke: axisConfig.tickColor};
                var fontStyle = {
                    'font-size': axisConfig.font.size,
                    'font-family': axisConfig.font.family,
                    fill: axisConfig.font.color,
                    'text-shadow': ['-1px 0px', '1px -1px', '-1px 1px', '1px 1px']
                        .map(function(d, i){ return ' ' + d + ' 0 ' + axisConfig.font.outlineColor; })
                        .join(',')
                };

                svg.attr({width: axisConfig.width, height: axisConfig.height})
                    .style({opacity: axisConfig.opacity});

                var chartGroup = svg.select('.chart-group')
                    .attr('transform', 'translate(' + chartCenter + ')')
                    .style({cursor: 'crosshair'});

                svg.select('.guides-group').style({'pointer-events': 'none'});
                svg.select('.angular.axis-group').style({'pointer-events': 'none'});
                svg.select('.radial.axis-group').style({'pointer-events': 'none'});


                // Radial axis
                ////////////////////////////////////////////////////////////////////

                var radialAxis = svg.select('.radial.axis-group');
                if(axisConfig.radialAxis.gridLinesVisible){
                    var gridCircles = radialAxis.selectAll('circle.grid-circle')
                        .data(radialScale.ticks(5));
                    gridCircles.enter().append('circle')
                        .attr({'class': 'grid-circle'})
                        .style(lineStyle);
                    gridCircles.attr('r', radialScale);
                    gridCircles.exit().remove();
                }

                radialAxis.select('circle.outside-circle').attr({r: radius}).style(lineStyle);
                var backgroundCircle = svg.select('circle.background-circle').attr({r: radius})
                    .style({fill: axisConfig.backgroundColor, stroke: axisConfig.stroke});

                function currentAngle(d, i){ return (angularScale(d)% 360)+ axisConfig.orientation;}

                if(axisConfig.radialAxis.visible){
                    var axis = d3.svg.axis()
                        .scale(radialScale)
                        .ticks(5)
                        .tickSize(5);
                    radialAxis.call(axis)
                        .attr({transform: 'rotate('+ (axisConfig.radialAxis.orientation) +')'});
                    radialAxis.selectAll('.domain').style(lineStyle);
                    radialAxis.selectAll('g>text')
                        .text(function(d, i){ return this.textContent + axisConfig.radialAxis.ticksSuffix; })
                    	.style(fontStyle)
                        .style({'text-anchor': 'start'})
                    	.attr({
                            x: 0, y: 0, dx: 0, dy: 0,
                    		transform: function(d, i){
                                if(axisConfig.radialAxis.tickOrientation === 'horizontal') {
                                    return 'rotate(' + (-axisConfig.radialAxis.orientation) + ') translate(' + [0, fontStyle['font-size']] + ')';
                                }
                                else return 'translate(' + [0, fontStyle['font-size']] + ')';
                    		}
                    	});
                    radialAxis.selectAll('g>line')
                        .style({stroke: 'black'});
                }


                // Angular axis
                ////////////////////////////////////////////////////////////////////
                    var angularAxis = svg.select('.angular.axis-group')
                      .selectAll('g.angular-tick')
                        .data(angularAxisRange);
                    var angularAxisEnter = angularAxis.enter().append('g')
                        .classed('angular-tick', true);
                    angularAxis.attr({
                            transform: function(d, i) { return 'rotate(' + currentAngle(d, i) + ')'; }
                        })
                        .style({display: axisConfig.angularAxis.visible ? 'block' : 'none'});
                    angularAxis.exit().remove();

                    angularAxisEnter.append('line')
                        .classed('grid-line', true)
                        .classed('major', function(d, i){ return (i % (axisConfig.minorTicks+1) == 0) })
                        .classed('minor', function(d, i){ return !(i % (axisConfig.minorTicks+1) == 0) })
                        .style(lineStyle);
                    angularAxisEnter.selectAll('.minor').style({stroke: axisConfig.minorTickColor});
                    angularAxis.select('line.grid-line')
                        .attr({
                            x1: axisConfig.tickLength ? radius - axisConfig.tickLength : 0,
                            x2: radius
                        })
                        .style({display: axisConfig.angularAxis.gridLinesVisible ? 'block' : 'none'});

                    angularAxisEnter.append('text')
                        .classed('axis-text', true)
                        .style(fontStyle);
                    var ticksText = angularAxis.select('text.axis-text')
                        .attr({
                            x: radius + axisConfig.labelOffset,
                            dy: '.35em',
                            transform: function(d, i) {
                                var angle = currentAngle(d, i);
                                var rad = radius + axisConfig.labelOffset;
                                var orient = axisConfig.angularAxis.tickOrientation;
                                if(orient == 'horizontal') return 'rotate(' + (-angle) + ' ' + rad + ' 0)';
                                else if(orient == 'radial') return (angle < 270 && angle > 90) ? 'rotate(180 ' + rad + ' 0)' : null;
                                else return 'rotate('+ ((angle <= 180 && angle > 0) ? -90 : 90) +' ' + rad + ' 0)';
                            }
                        })
                        .style({
                            'text-anchor': 'middle',
                            display: axisConfig.angularAxis.labelsVisible ? 'block' : 'none'
                        })
                        .text(function(d, i) {
                            if(i % (axisConfig.minorTicks + 1) != 0) return '';
                            if(ticks) return ticks[i / (axisConfig.minorTicks + 1)] + axisConfig.angularAxis.ticksSuffix;
    //                        if(axisConfig.ticks) return axisConfig.ticks[i / (axisConfig.minorTicks + 1)] + axisConfig.angularAxis.ticksSuffix;
                            else return d + axisConfig.angularAxis.ticksSuffix;
                        })
                        .style(fontStyle);

                    if (axisConfig.angularAxis.rewriteTicks) ticksText.text(function(d, i){
                        if(i % (axisConfig.minorTicks + 1) != 0) return '';
                        return axisConfig.angularAxis.rewriteTicks(this.textContent, i);
                    });


                // Geometry
                ////////////////////////////////////////////////////////////////////

                var hasGeometry = svg.select('g.geometry-group').selectAll('g').size() > 0;
                if(data[0] || hasGeometry){
                    var colorIndex = 0;
                    var geometryConfigs = [];

                    // assign color for every geometry, even invisible
                    dataOriginal.forEach(function(d, i){
                        if(!d.color){
                            d.color = axisConfig.defaultColorRange[colorIndex];
                            colorIndex = (colorIndex+1) % axisConfig.defaultColorRange.length;
                        }
                    });

                    data.forEach(function(d, i){
                        var groupClass = 'geometry' + i;
                        var geometryContainer = svg.select('g.geometry-group')
                            .selectAll('g.' + groupClass)
                            .data([0]);
                        geometryContainer.enter().append('g')
                            .classed(groupClass, true);

                        var geometryConfig = d;
                        geometryConfig.radialScale = radialScale;
                        geometryConfig.angularScale = angularScale;
                        geometryConfig.container = geometryContainer;
                        if(!geometryConfig.orientation) geometryConfig.orientation = axisConfig.orientation;
                        geometryConfig.direction = axisConfig.direction;
                        geometryConfig.index = i;

                        geometryConfigs.push({data: data[i], geometryConfig: geometryConfig});
                    });

                    var geometryConfigsGrouped =  d3.nest().key(function(d, i){ return d.geometryConfig.groupId || 'unstacked'; }).entries(geometryConfigs);
                    var geometryConfigsGrouped2 = [];
                    geometryConfigsGrouped.forEach(function(d, i){
                        if (d.key === 'unstacked') geometryConfigsGrouped2 = geometryConfigsGrouped2.concat(d.values);
                        else geometryConfigsGrouped2.push(d.values);
                    });

                    geometryConfigsGrouped2.forEach(function(d, i){
                        var geometry;
                        if(Array.isArray(d)) geometry = d[0].geometryConfig.geometry;
                        else geometry = d.geometryConfig.geometry;
                        µ[geometry]().config(d)();
                    });

                }


                // Legend and title
                ////////////////////////////////////////////////////////////////////

                if(axisConfig.showLegend){
                    // Offset for labels
                    var rightmostTickEndX = d3.max(chartGroup.selectAll('.angular-tick text')[0].map(function(d, i){
                        return d.getCTM().e + d.getBBox().width;
                    }));
                    var legendContainer = svg.select('.legend-group')
                        .attr({transform: 'translate(' + [radius + rightmostTickEndX, axisConfig.margin.top] + ')'})
                        .style({display: 'block'});
                    var elements = data.map(function(d, i){
                        d.symbol = 'line'; //hardcoded
                        d.visibleInLegend = (typeof d.visibleInLegend === 'undefined') || d.visibleInLegend;
                        d.color = d.color || 'black'
                        return d;
                    });

                    var legendConfigMixin1 = µ.util.deepExtend({}, µ.Legend.defaultConfig().legendConfig);
                    var legendConfigMixin2 = µ.util.deepExtend(legendConfigMixin1, {container: legendContainer, elements: elements});
                    var legendConfigMixin3 = {
                        data:data.map(function(d, i){ return d.name || 'Element' + i; }),
                        legendConfig: legendConfigMixin2
                    };
                    µ.Legend().config(legendConfigMixin3)();
                }
                else{
                    svg.select('.legend-group').style({display: 'none'});
                }

                if(axisConfig.title){
                    var title = svg.select('g.title-group text')
                        .attr({x: 100, y: 100})
                        .style(fontStyle)
                        .text(axisConfig.title);
                    var titleBBox = title.node().getBBox();
                    title.attr({x: axisConfig.margin.left + radius - titleBBox.width / 2, y: titleBBox.height});
                }


                // Hover guides, tooltips and hovering
                ////////////////////////////////////////////////////////////////////

                svg.select('.geometry-group g').style({'pointer-events': 'visible'});
                var guides = svg.select('.guides-group');

                var tooltipContainer = svg.select('.tooltips-group');
                var angularTooltip = µ.tooltipPanel().config({container: tooltipContainer, fontSize: 8})();
                var radialTooltip = µ.tooltipPanel().config({container: tooltipContainer, fontSize: 8})();
                var geometryTooltip = µ.tooltipPanel().config({container: tooltipContainer, hasTick: true})();
                var angularValue, radialValue;

                if(!isOrdinal){
                    var angularGuideLine = guides.select('line')
                        .attr({x1: 0, y1: 0, y2: 0})
                        .style({stroke: 'grey', 'pointer-events': 'none'});
                    chartGroup
                        .on('mousemove.angular-guide', function(d, i){
                            var mouseAngle = µ.util.getMousePos(backgroundCircle).angle;
                            angularGuideLine.attr({x2: -radius, transform: 'rotate('+mouseAngle+')'}).style({opacity: 0.5});
                            var angleWithOriginOffset = (mouseAngle + 360 + axisConfig.orientation) % 360;
                            angularValue = angularScale.invert(angleWithOriginOffset);
                            var pos = µ.util.convertToCartesian(radius + 12, mouseAngle + 180);
                            angularTooltip.text(µ.util.round(angularValue)).move([pos[0] + chartCenter[0], pos[1] + chartCenter[1]])
                         })
                        .on('mouseout.angular-guide', function(d, i){ guides.select('line').style({opacity: 0}); });
                }

                var angularGuideCircle = guides.select('circle').style({stroke: 'grey', fill: 'none'});
                chartGroup
                    .on('mousemove.radial-guide', function(d, i){
                        var r = µ.util.getMousePos(backgroundCircle).radius;
                        angularGuideCircle.attr({r: r}).style({opacity: 0.5});
                        radialValue = radialScale.invert(µ.util.getMousePos(backgroundCircle).radius);
                        var pos = µ.util.convertToCartesian(r, axisConfig.radialAxis.orientation);
                        radialTooltip.text(µ.util.round(radialValue)).move([pos[0] + chartCenter[0], pos[1] + chartCenter[1]])
                     })
                    .on('mouseout.radial-guide', function(d, i){
                        angularGuideCircle.style({opacity: 0});
                        geometryTooltip.hide();
                        angularTooltip.hide();
                        radialTooltip.hide();
                    });

                svg.selectAll('.geometry-group .mark')
                    .on('mouseenter.tooltip', function(d, i){
                        var el = d3.select(this);
                        var color = el.style('fill');
                        var newColor = 'black';
                        var opacity = el.style('opacity') || 1;
                        el.attr({'data-opacity': opacity});
                        if(color != 'none'){
                            el.attr({'data-fill': color});
                            newColor = d3.hsl(color).darker().toString();
                            el.style({fill: newColor, opacity: 1});
                            var bbox = this.getBoundingClientRect();
                            var svgBBox = svg.node().getBoundingClientRect();
                            var pos = [bbox.left - svgBBox.left + bbox.width/2 - centerPosition[0],
                                bbox.top - svgBBox.top + bbox.height/2 - centerPosition[1]];
                            var text = 'θ: ' + µ.util.round(d[0]) + ', r: ' + µ.util.round(d[1]);
                            geometryTooltip.config({color: newColor}).text(text);
                            geometryTooltip.move(pos);
                        }
                        else{
                            color = el.style('stroke');
                            el.attr({'data-stroke': color});
                            newColor = d3.hsl(color).darker().toString();
                            el.style({stroke: newColor, opacity: 1});
                        }
                    })
                    .on('mousemove.tooltip', function(d, i){
                        if(d3.select(this).attr('data-fill')) geometryTooltip.show();
                    })
                    .on('mouseout.tooltip', function(d, i){
                        geometryTooltip.hide();
                        var el = d3.select(this);
                        var fillColor = el.attr('data-fill');
                        if(fillColor)  el.style({fill: fillColor, opacity: el.attr('data-opacity')});
                        else  el.style({stroke: el.attr('data-stroke'), opacity: el.attr('data-opacity')});
                    });

                var centerPosition = [(axisConfig.width / 2 - radius - axisConfig.margin.left),
                        (axisConfig.height / 2 - radius - axisConfig.margin.top)];
                svg.select('.outer-group')
                    .attr('transform', 'translate(' + centerPosition + ')');

            });
        return exports;
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        µ.util.deepExtend(config, _x);
        return this;
    };
    exports.radialScale = function(_x){
        return radialScale;
    };
    exports.angularScale = function(_x){
        return angularScale;
    };
    exports.svg = function(){ return svg; };
    d3.rebind(exports, dispatch, 'on');
    return exports;
};

µ.Axis.defaultConfig = function(d, i){
    var config = {
        data: [
            {
                x: [1, 2, 3, 4],
                y: [10, 11, 12, 13],
                name: 'Line1',
                geometry: "LineChart",
                color: 'limegreen',
                visibleInLegend: true,
                opacity: 1
            },
            {x: [21, 22, 23, 24], y: [30, 31, 32, 33], name: 'Line2', geometry: "LineChart"}
        ],
        layout: {
            defaultColorRange: d3.scale.category10().range(),
            title: null,
            height: 450,
            width: 500,
            margin: {
                top: 40,
                right: 40,
                bottom: 40,
                left: 40
            },
            font: {
                size: 31,
                color: 'red',
                outlineColor: 'white',
                family: 'Tahoma, sans-serif'
            },
            direction: 'clockwise', //clockwise, counterclockwise
            orientation: 0,
            labelOffset: 10,
            radialAxis: {
                domain: null,
                orientation: -45,
                ticksSuffix: '',
                visible: true,
                gridLinesVisible: true,
                tickOrientation: 'horizontal', // 'angular', 'horizontal'
                rewriteTicks: null //TODO
            },
            angularAxis: {
                domain: null,
                ticksSuffix: '',
                visible: true, //TODO don't offset legend when hidden
                gridLinesVisible: true,
                labelsVisible: true,
                tickOrientation: 'horizontal', // 'radial', 'angular', 'horizontal'
                rewriteTicks: null,
                ticksCount: null,
                ticksStep: null
            },
            minorTicks: 1,
            tickLength: null,
            tickColor: 'silver',
            minorTickColor: '#eee',
            container: 'body',
            backgroundColor: 'none',
            needsEndSpacing: true,
            showLegend: true,
            opacity: 1
        }
    };
    return config;
};
