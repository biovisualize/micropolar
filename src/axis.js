var micropolar = {version: '0.2.2'};
var µ = micropolar;

µ.Axis = function module() {
    var config = {data: [], layout: {}},
        inputConfig = {},
        liveConfig = {};
    var svg, container, dispatch = d3.dispatch('hover'),
    	radialScale, angularScale;
    var exports = {};
    function render(_container){
        container = _container || container;
        var data = config.data;
        var axisConfig = config.layout;
        if (typeof container == 'string' || container.nodeName) container = d3.select(container);
        container.datum(data)
            .each(function(_data, _index) {

                // Data
                ////////////////////////////////////////////////////////////////////

                // clone data
                var dataOriginal = _data.slice();
                liveConfig = {data: µ.util.cloneJson(dataOriginal), layout:µ.util.cloneJson(axisConfig)};

                // assign color for every geometry, even invisible
                var colorIndex = 0;
                dataOriginal.forEach(function(d, i){
                    if(!d.color){
                        d.color = axisConfig.defaultColorRange[colorIndex];
                        colorIndex = (colorIndex+1) % axisConfig.defaultColorRange.length;
                    }
                    if(!d.strokeColor){
                        d.strokeColor = (d.geometry === "LinePlot") ? d.color : d3.rgb(d.color).darker().toString();
                    }
                    liveConfig.data[i].color = d.color;
                    liveConfig.data[i].strokeColor = d.strokeColor;
                    liveConfig.data[i].strokeDash = d.strokeDash;
                    liveConfig.data[i].strokeSize = d.strokeSize;
                });

                //remove invisible
                var data = dataOriginal.filter(function(d, i){
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
                            var prevArray = d.values[0].r.map(function(d, i){ return 0; });
                            d.values.forEach(function(d, i, a){
                                d.yStack = [prevArray];
                                dataYStack.push(prevArray);
                                prevArray = µ.util.sumArrays(d.r, prevArray);
                            });
                            return d.values;
                        }
                    });
                    data = d3.merge(stacked);
                }

                // Make sure t,r are arrays of array
                data.forEach(function(d, i){
                    d.t = (Array.isArray(d.t[0])) ? d.t : [d.t];
                    d.r = (Array.isArray(d.r[0])) ? d.r : [d.r];
                });

                // Radial scale
                ////////////////////////////////////////////////////////////////////

                var radius = Math.min(axisConfig.width - axisConfig.margin.left - axisConfig.margin.right,
                    axisConfig.height - axisConfig.margin.top - axisConfig.margin.bottom) / 2;
                radius = Math.max(10, radius);
                var chartCenter = [axisConfig.margin.left + radius, axisConfig.margin.top + radius];

                var extent;
                if(isStacked){
                    var highestStackedValue = d3.max(µ.util.sumArrays(µ.util.arrayLast(data).r[0], µ.util.arrayLast(dataYStack)));
                    extent = [0, highestStackedValue];
                }
                else extent = d3.extent(µ.util.flattenArray(data.map(function(d, i){ return d.r; })));
                if(axisConfig.radialAxis.domain != µ.DATAEXTENT) extent[0] = 0;

                radialScale = d3.scale.linear()
                    .domain((axisConfig.radialAxis.domain != µ.DATAEXTENT && axisConfig.radialAxis.domain) ? axisConfig.radialAxis.domain : extent)
                    .range([0, radius]);
                liveConfig.layout.radialAxis.domain = radialScale.domain();

                // Angular scale
                ////////////////////////////////////////////////////////////////////

                var angularDataMerged = µ.util.flattenArray(data.map(function(d, i){ return d.t; }));

                // Ordinal Angular scale
                var isOrdinal = typeof angularDataMerged[0] === 'string';
                var ticks;
                if(isOrdinal){
                    angularDataMerged = µ.util.deduplicate(angularDataMerged);
                    ticks = angularDataMerged.slice();
                    angularDataMerged = d3.range(angularDataMerged.length);
                    data = data.map(function(d, i){
                        var result = d;
                        d.t = [angularDataMerged];
                        if(isStacked) result.yStack = d.yStack;
                        return result;
                    });
                }

                var hasOnlyLineOrDotPlot = data.filter(function(d, i){ return d.geometry === 'LinePlot' || d.geometry === 'DotPlot'; }).length === data.length;
                var needsEndSpacing = (axisConfig.needsEndSpacing === null)? isOrdinal || !hasOnlyLineOrDotPlot : axisConfig.needsEndSpacing;


               	var useProvidedDomain = (axisConfig.angularAxis.domain && axisConfig.angularAxis.domain != µ.DATAEXTENT && !isOrdinal && (axisConfig.angularAxis.domain[0] >= 0));
               	var angularDomain = useProvidedDomain ? axisConfig.angularAxis.domain : d3.extent(angularDataMerged);
                var angularDomainStep = Math.abs(angularDataMerged[1] - angularDataMerged[0]);

                if(hasOnlyLineOrDotPlot && !isOrdinal) angularDomainStep = 0;

                var angularDomainWithPadding = angularDomain.slice();
                if(needsEndSpacing && isOrdinal) angularDomainWithPadding[1] += angularDomainStep;
//                angularDomainWithPadding[1] += angularDomainStep;
//                if(needsEndSpacing) angularDomainWithPadding[1] += 0;

                // Reduce the number of ticks
                var tickCount = axisConfig.angularAxis.ticksCount || 4;
                if(tickCount > 8) tickCount = tickCount / (tickCount / 8) + tickCount%8;
                if(axisConfig.angularAxis.ticksStep){
                    tickCount = (angularDomainWithPadding[1] - angularDomainWithPadding[0]) / tickCount;
                }
                var angularTicksStep = axisConfig.angularAxis.ticksStep
                    || ((angularDomainWithPadding[1] - angularDomainWithPadding[0]) / (tickCount * (axisConfig.minorTicks+1)));
                if(ticks) angularTicksStep = Math.max(Math.round(angularTicksStep), 1);
                if(!angularDomainWithPadding[2]) angularDomainWithPadding[2] = angularTicksStep;

                var angularAxisRange = d3.range.apply(this, angularDomainWithPadding);
                // Workaround for rounding errors
                angularAxisRange = angularAxisRange.map(function(d, i){ return parseFloat(d.toPrecision(12)) });

                angularScale = d3.scale.linear()
                    .domain(angularDomainWithPadding.slice(0, 2))
                    .range((axisConfig.direction === 'clockwise') ? [0, 360] : [360, 0]);
                liveConfig.layout.angularAxis.domain = angularScale.domain();
                liveConfig.layout.angularAxis.endPadding = needsEndSpacing ? angularDomainStep : 0;


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

                svg.select('.guides-group').style({'pointer-events': 'none'});
                svg.select('.angular.axis-group').style({'pointer-events': 'none'});
                svg.select('.radial.axis-group').style({'pointer-events': 'none'});
                var chartGroup = svg.select('.chart-group');

                var lineStyle = {fill: 'none', stroke: axisConfig.tickColor};
                var fontStyle = {
                    'font-size': axisConfig.font.size,
                    'font-family': axisConfig.font.family,
                    fill: axisConfig.font.color,
                    'text-shadow': ['-1px 0px', '1px -1px', '-1px 1px', '1px 1px']
                        .map(function(d, i){ return ' ' + d + ' 0 ' + axisConfig.font.outlineColor; })
                        .join(',')
                };

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
                        var datumClone = µ.util.cloneJson(d);
                        datumClone.symbol = (d.geometry === "DotPlot") ? (d.dotType || 'circle') : (d.geometry != 'LinePlot') ? 'square' : 'line';
                        datumClone.visibleInLegend = (typeof d.visibleInLegend === 'undefined') || d.visibleInLegend;
                        datumClone.color = d.geometry === "LinePlot" ? d.strokeColor : d.color;
                        return datumClone;
                    });

                    var legendConfigMixin1 = µ.util.deepExtend({}, µ.Legend.defaultConfig().legendConfig);
                    var legendConfigMixin2 = µ.util.deepExtend(legendConfigMixin1, {container: legendContainer, elements: elements, reverseOrder: axisConfig.legend.reverseOrder});
                    var legendConfigMixin3 = {
                        data: data.map(function(d, i){ return d.name || 'Element' + i; }),
                        legendConfig: legendConfigMixin2
                    };
                    µ.Legend().config(legendConfigMixin3)();

                    // Recalculate sizes
                    var legendBBox = legendContainer.node().getBBox();
                    radius = Math.min(axisConfig.width - legendBBox.width - axisConfig.margin.left - axisConfig.margin.right,
                        axisConfig.height - axisConfig.margin.top - axisConfig.margin.bottom) / 2;
                    radius = Math.max(10, radius);
                    chartCenter = [axisConfig.margin.left + radius, axisConfig.margin.top + radius]
                    radialScale.range([0, radius]);
                    liveConfig.layout.radialAxis.domain = radialScale.domain();
                    legendContainer.attr('transform', 'translate(' + [chartCenter[0] + radius, chartCenter[1] - radius] + ')');
                }
                else{
                    svg.select('.legend-group').style({display: 'none'});
                }

                // Reposition and resize for legend and centering
                svg.attr({width: axisConfig.width, height: axisConfig.height})
                    .style({opacity: axisConfig.opacity});

                chartGroup.attr('transform', 'translate(' + chartCenter + ')')
                    .style({cursor: 'crosshair'});

                var centeringOffset = [((axisConfig.width) - (axisConfig.margin.left + axisConfig.margin.right + radius * 2 + ((legendBBox) ? legendBBox.width : 0))) / 2,
                    ((axisConfig.height) - (axisConfig.margin.top + axisConfig.margin.bottom + radius * 2)) / 2];
                centeringOffset[0] = Math.max(0, centeringOffset[0]);
                centeringOffset[1] = Math.max(0, centeringOffset[1]);

                svg.select('.outer-group')
                    .attr('transform', 'translate(' + centeringOffset + ')');

                if(axisConfig.title){
                    var title = svg.select('g.title-group text')
                        .style(fontStyle)
                        .text(axisConfig.title);
                    var titleBBox = title.node().getBBox();
                    title.attr({x: chartCenter[0] - titleBBox.width / 2, y: chartCenter[1] - radius - 20}); // hardcoded offset from plot
                }

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
//                            if(ticks) return ticks[d / (axisConfig.minorTicks + 1)] + axisConfig.angularAxis.ticksSuffix;
                            if(ticks){
                                return ticks[d] + axisConfig.angularAxis.ticksSuffix;
                            }
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

                var geometryContainer = svg.select('g.geometry-group')
                    .selectAll('g.geometry')
                    .data(data);
                geometryContainer.enter().append('g')
                    .attr({'class': function(d, i){ return 'geometry geometry' + i; } });
                geometryContainer.exit().remove();

                if(data[0] || hasGeometry){

                    var geometryConfigs = [];
                    data.forEach(function(d, i){
                        var geometryConfig = {};
                        geometryConfig.radialScale = radialScale;
                        geometryConfig.angularScale = angularScale;
                        geometryConfig.container = geometryContainer.filter(function(dB, iB){ return iB == i; });
                        geometryConfig.geometry = d.geometry;
//                        if(!geometryConfig.orientation) geometryConfig.orientation = axisConfig.orientation;
                        geometryConfig.orientation = axisConfig.orientation;
                        geometryConfig.direction = axisConfig.direction;
                        geometryConfig.index = i;
                        geometryConfigs.push({data: d, geometryConfig: geometryConfig});
                    });

                    var geometryConfigsGrouped =  d3.nest().key(function(d, i){ return (typeof d.data.groupId != 'undefined') || 'unstacked'; }).entries(geometryConfigs);
                    var geometryConfigsGrouped2 = [];
                    geometryConfigsGrouped.forEach(function(d, i){
                        if (d.key === 'unstacked') geometryConfigsGrouped2 = geometryConfigsGrouped2.concat(d.values.map(function(d, i){ return [d]; }));
                        else geometryConfigsGrouped2.push(d.values);
                    });

                    geometryConfigsGrouped2.forEach(function(d, i){
                        var geometry;
                        if(Array.isArray(d)) geometry = d[0].geometryConfig.geometry;
                        else geometry = d.geometryConfig.geometry;
                        var finalGeometryConfig = d.map(function(dB, iB){ return µ.util.deepExtend(µ[geometry].defaultConfig(), dB); });
                        µ[geometry]().config(finalGeometryConfig)();
                    });
                }

                // Hover guides, tooltips and hovering
                ////////////////////////////////////////////////////////////////////

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
                            var angleWithOriginOffset = (mouseAngle + 180 + 360 - axisConfig.orientation) % 360;
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
                    .on('mouseover.tooltip', function(d, i){
                        var el = d3.select(this);
                        var color = el.style('fill');
                        var newColor = 'black';
                        var opacity = el.style('opacity') || 1;
                        el.attr({'data-opacity': opacity});
                        if(color != 'none'){
                            el.attr({'data-fill': color});
                            newColor = d3.hsl(color).darker().toString();
                            el.style({fill: newColor, opacity: 1});

                            var textData = {t: µ.util.round(d[0]), r: µ.util.round(d[1])};
                            if(isOrdinal) textData.t = ticks[d[0]];

                            var text = 't: ' +textData.t + ', r: ' + textData.r;

                            var bbox = this.getBoundingClientRect();
                            var svgBBox = svg.node().getBoundingClientRect();
                            var pos = [bbox.left + bbox.width/2  - centeringOffset[0] - svgBBox.left,
                                bbox.top  + bbox.height/2  - centeringOffset[1] - svgBBox.top];
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
                        if(d3.event.which != 0) return false;
                        if(d3.select(this).attr('data-fill')) geometryTooltip.show();
                    })
                    .on('mouseout.tooltip', function(d, i){
                        geometryTooltip.hide();
                        var el = d3.select(this);
                        var fillColor = el.attr('data-fill');
                        if(fillColor)  el.style({fill: fillColor, opacity: el.attr('data-opacity')});
                        else el.style({stroke: el.attr('data-stroke'), opacity: el.attr('data-opacity')});
                    });
            });
        return exports;
    }
    exports.render = function(_container){
        render(_container);
        return this;
    };
    exports.config = function(_x) {
        if (!arguments.length) return config;
        var xClone =  µ.util.cloneJson(_x);
        xClone.data.forEach(function(d, i){
            if(!config.data[i]) config.data[i] = {};
            µ.util.deepExtend(config.data[i], µ.Axis.defaultConfig().data[0]);
            µ.util.deepExtend(config.data[i], d);
        });
        µ.util.deepExtend(config.layout, µ.Axis.defaultConfig().layout);
        µ.util.deepExtend(config.layout, xClone.layout);
        return this;
    };
    exports.getLiveConfig = function(){
        return liveConfig;
    };
    exports.getinputConfig = function(){
        return inputConfig;
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
                t: [1, 2, 3, 4],
                r: [10, 11, 12, 13],
                name: 'Line1',
                geometry: "LinePlot",
                color: null,
                strokeDash: 'solid',
                strokeColor: null,
                strokeSize: '1',
                visibleInLegend: true,
                opacity: 1
            }
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
                size: 12,
                color: 'gray',
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
                domain: [0, 360],
                ticksSuffix: '',
                visible: true, //TODO don't offset legend when hidden
                gridLinesVisible: true,
                labelsVisible: true,
                tickOrientation: 'horizontal', // 'radial', 'angular', 'horizontal'
                rewriteTicks: null,
                ticksCount: null,
                ticksStep: null
            },
            minorTicks: 0,
            tickLength: null,
            tickColor: 'silver',
            minorTickColor: '#eee',
            backgroundColor: 'none',
            needsEndSpacing: null,
            showLegend: true,
            legend:{
                reverseOrder: false
            },
            opacity: 1
        }
    };
    return config;
};
