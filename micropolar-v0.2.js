var micropolar = {
    version: "0.2"
};

var µ = micropolar;

µ.Axis = function module() {
    var config = µ.Axis.defaultConfig();
    var svg, dispatch = d3.dispatch("hover"), radialScale, angularScale;
    function exports() {
        var data = config.data;
        var axisConfig = config.axisConfig;
        var geometryConfig = config.geometryConfig;
        var legendConfig = config.legendConfig;
        var container = axisConfig.container;
        if (typeof container == "string" || container.nodeName) container = d3.select(container);
        container.datum(data).each(function(_data, _index) {
            var data = _data.slice();
            data = data.filter(function(d, i) {
                var visible = geometryConfig[i].visible;
                return typeof visible === "undefined" || visible === true;
            });
            geometryConfig = geometryConfig.filter(function(d, i) {
                var visible = d.visible;
                return typeof visible === "undefined" || visible === true;
            });
            var isStacked = false;
            var dataWithGroupId = data.map(function(d, i) {
                d.groupId = geometryConfig[i].groupId;
                isStacked = isStacked || typeof d.groupId !== "undefined";
                return d;
            });
            if (isStacked) {
                var grouped = d3.nest().key(function(d, i) {
                    return typeof d.groupId != "undefined" ? d.groupId : "unstacked";
                }).entries(dataWithGroupId);
                var dataYStack = [];
                var stacked = grouped.map(function(d, i) {
                    if (d.key === "unstacked") return d.values; else {
                        var prevArray = d.values[0].y.map(function(d, i) {
                            return 0;
                        });
                        d.values.forEach(function(d, i, a) {
                            d.yStack = [ prevArray ];
                            dataYStack.push(prevArray);
                            prevArray = µ.util.sumArrays(d.y, prevArray);
                        });
                        return d.values;
                    }
                });
                data = d3.merge(stacked);
            }
            var data = data.map(function(d, i) {
                var validated = {};
                validated.name = d.name;
                validated.x = Array.isArray(d.x[0]) ? d.x : [ d.x ];
                validated.y = Array.isArray(d.y[0]) ? d.y : [ d.y ];
                validated.yStack = d.yStack;
                return validated;
            });
            var radius = Math.min(axisConfig.width - axisConfig.margin.left - axisConfig.margin.right, axisConfig.height - axisConfig.margin.top - axisConfig.margin.bottom) / 2;
            var chartCenter = [ axisConfig.margin.left + radius, axisConfig.margin.top + radius ];
            var extent;
            if (isStacked) {
                var highestStackedValue = d3.max(µ.util.sumArrays(µ.util.arrayLast(data).y[0], µ.util.arrayLast(dataYStack)));
                extent = [ 0, highestStackedValue ];
            } else extent = d3.extent(µ.util.flattenArray(data.map(function(d, i) {
                return d.y;
            })));
            radialScale = d3.scale.linear().domain(axisConfig.radialDomain || extent).range([ 0, radius ]);
            var angularDataMerged = µ.util.flattenArray(data.map(function(d, i) {
                return d.x;
            }));
            var isOrdinal = typeof angularDataMerged[0] === "string";
            var ticks;
            if (isOrdinal) {
                angularDataMerged = µ.util.deduplicate(angularDataMerged);
                ticks = angularDataMerged.slice();
                angularDataMerged = d3.range(angularDataMerged.length);
                data = data.map(function(d, i) {
                    var result = {
                        name: d.name,
                        x: [ angularDataMerged ],
                        y: d.y,
                        yStack: d.yStack
                    };
                    if (isStacked) result.yStack = d.yStack;
                    return result;
                });
            }
            var angularExtent = d3.extent(angularDataMerged);
            var angularDomain = axisConfig.angularDomain ? axisConfig.angularDomain.slice() : angularExtent;
            var angularDomainStep = angularDataMerged[1] - angularDataMerged[0];
            if (axisConfig.needsEndSpacing) angularDomain[1] += angularDomainStep;
            var tickCount = axisConfig.angularTicksCount || 4;
            if (tickCount > 8) tickCount = tickCount / (tickCount / 8) + tickCount % 8;
            if (axisConfig.angularTicksStep) {
                tickCount = (angularDomain[1] - angularDomain[0]) / tickCount;
            }
            var angularTicksStep = axisConfig.angularTicksStep || (angularDomain[1] - angularDomain[0]) / (tickCount * (axisConfig.minorTicks + 1));
            if (!angularDomain[2]) angularDomain[2] = angularTicksStep;
            var angularAxisRange = d3.range.apply(this, angularDomain);
            angularAxisRange = angularAxisRange.map(function(d, i) {
                return parseFloat(d.toPrecision(12));
            });
            angularScale = d3.scale.linear().domain(angularDomain.slice(0, 2)).range(axisConfig.flip ? [ 0, 360 ] : [ 360, 0 ]);
            angularScale.endPadding = axisConfig.needsEndSpacing ? angularDomainStep : 0;
            svg = d3.select(this).select("svg.chart-root");
            if (typeof svg === "undefined" || svg.empty()) {
                var skeleton = '<svg xmlns="http://www.w3.org/2000/svg" class="chart-root">' + '<g class="outer-group">' + '<g class="chart-group">' + '<circle class="background-circle"></circle>' + '<g class="geometry-group"></g>' + '<g class="radial axis-group">' + '<circle class="outside-circle"></circle>' + "</g>" + '<g class="angular axis-group"></g>' + '<g class="guides-group"><line></line><circle r="0"></circle></g>' + "</g>" + '<g class="legend-group"></g>' + '<g class="tooltips-group"></g>' + '<g class="title-group"><text></text></g>' + "</g>" + "</svg>";
                var doc = new DOMParser().parseFromString(skeleton, "application/xml");
                var newSvg = this.appendChild(this.ownerDocument.importNode(doc.documentElement, true));
                svg = d3.select(newSvg);
            }
            var lineStyle = {
                fill: "none",
                stroke: axisConfig.tickColor
            };
            var fontStyle = {
                "font-size": axisConfig.fontSize,
                "font-family": axisConfig.fontFamily,
                fill: axisConfig.fontColor,
                "text-shadow": [ "-1px 0px", "1px -1px", "-1px 1px", "1px 1px" ].map(function(d, i) {
                    return " " + d + " 0 " + axisConfig.fontOutlineColor;
                }).join(",")
            };
            svg.attr({
                width: axisConfig.width,
                height: axisConfig.height
            });
            var chartGroup = svg.select(".chart-group").attr("transform", "translate(" + chartCenter + ")").style({
                cursor: "crosshair"
            });
            svg.select(".guides-group").style({
                "pointer-events": "none"
            });
            svg.select(".angular.axis-group").style({
                "pointer-events": "none"
            });
            svg.select(".radial.axis-group").style({
                "pointer-events": "none"
            });
            var radialAxis = svg.select(".radial.axis-group");
            if (axisConfig.showRadialCircle) {
                var gridCircles = radialAxis.selectAll("circle.grid-circle").data(radialScale.ticks(5));
                gridCircles.enter().append("circle").attr({
                    "class": "grid-circle"
                }).style(lineStyle);
                gridCircles.attr("r", radialScale);
                gridCircles.exit().remove();
            }
            radialAxis.select("circle.outside-circle").attr({
                r: radius
            }).style(lineStyle);
            var backgroundCircle = svg.select("circle.background-circle").attr({
                r: radius
            }).style({
                fill: axisConfig.backgroundColor,
                stroke: axisConfig.stroke
            });
            function currentAngle(d, i) {
                return angularScale(d) % 360 + axisConfig.originTheta;
            }
            if (axisConfig.showRadialAxis) {
                var axis = d3.svg.axis().scale(radialScale).ticks(5).tickSize(5);
                radialAxis.call(axis).attr({
                    transform: "rotate(" + axisConfig.radialAxisTheta + ")"
                });
                radialAxis.selectAll(".domain").style(lineStyle);
                radialAxis.selectAll("g>text").text(function(d, i) {
                    return this.textContent + axisConfig.radialTicksSuffix;
                }).style(fontStyle).style({
                    "text-anchor": "start"
                }).attr({
                    x: 0,
                    y: 0,
                    dx: 0,
                    dy: 0,
                    transform: function(d, i) {
                        if (axisConfig.radialTickOrientation === "horizontal") {
                            return "rotate(" + -axisConfig.radialAxisTheta + ") translate(" + [ 0, fontStyle["font-size"] ] + ")";
                        } else return "translate(" + [ 0, fontStyle["font-size"] ] + ")";
                    }
                });
                radialAxis.selectAll("g>line").style({
                    stroke: "black"
                });
            }
            var angularAxis = svg.select(".angular.axis-group").selectAll("g.angular-tick").data(angularAxisRange);
            var angularAxisEnter = angularAxis.enter().append("g").classed("angular-tick", true);
            angularAxis.attr({
                transform: function(d, i) {
                    return "rotate(" + currentAngle(d, i) + ")";
                }
            });
            angularAxis.exit().remove();
            angularAxisEnter.append("line").classed("grid-line", true).classed("major", function(d, i) {
                return i % (axisConfig.minorTicks + 1) == 0;
            }).classed("minor", function(d, i) {
                return !(i % (axisConfig.minorTicks + 1) == 0);
            }).style(lineStyle);
            angularAxisEnter.selectAll(".minor").style({
                stroke: axisConfig.minorTickColor
            });
            angularAxis.select("line.grid-line").attr({
                x1: axisConfig.tickLength ? radius - axisConfig.tickLength : 0,
                x2: radius
            });
            angularAxisEnter.append("text").classed("axis-text", true).style(fontStyle);
            var ticksText = angularAxis.select("text.axis-text").attr({
                x: radius + axisConfig.labelOffset,
                dy: ".35em",
                transform: function(d, i) {
                    var angle = currentAngle(d, i);
                    var rad = radius + axisConfig.labelOffset;
                    var orient = axisConfig.angularTickOrientation;
                    if (orient == "horizontal") return "rotate(" + -angle + " " + rad + " 0)"; else if (orient == "radial") return angle < 270 && angle > 90 ? "rotate(180 " + rad + " 0)" : null; else return "rotate(" + (angle <= 180 && angle > 0 ? -90 : 90) + " " + rad + " 0)";
                }
            }).style({
                "text-anchor": "middle"
            }).text(function(d, i) {
                if (i % (axisConfig.minorTicks + 1) != 0) return "";
                if (ticks) return ticks[i / (axisConfig.minorTicks + 1)] + axisConfig.angularTicksSuffix; else return d + axisConfig.angularTicksSuffix;
            }).style(fontStyle);
            if (axisConfig.angularRewriteTicks) ticksText.text(function(d, i) {
                if (i % (axisConfig.minorTicks + 1) != 0) return "";
                return axisConfig.angularRewriteTicks(this.textContent, i);
            });
            var hasGeometry = svg.select("g.geometry-group").selectAll("g").size() > 0;
            if (geometryConfig[0] || hasGeometry) {
                var colorIndex = 0;
                var geometryConfigs = [];
                config.geometryConfig.forEach(function(d, i) {
                    if (!d.color) {
                        d.color = axisConfig.defaultColorRange[colorIndex];
                        colorIndex = (colorIndex + 1) % axisConfig.defaultColorRange.length;
                    }
                });
                geometryConfig.forEach(function(d, i) {
                    var groupClass = "geometry" + i;
                    var geometryContainer = svg.select("g.geometry-group").selectAll("g." + groupClass).data([ 0 ]);
                    geometryContainer.enter().append("g").classed(groupClass, true);
                    var geometry = µ[geometryConfig[i].geometry]();
                    var individualGeometryConfig = µ.util.deepExtend({}, d);
                    individualGeometryConfig.radialScale = radialScale;
                    individualGeometryConfig.angularScale = angularScale;
                    individualGeometryConfig.container = geometryContainer;
                    if (!individualGeometryConfig.originTheta) individualGeometryConfig.originTheta = axisConfig.originTheta;
                    individualGeometryConfig.index = i;
                    individualGeometryConfig.flip = axisConfig.flip;
                    var individualGeometryConfigMixin = µ.util.deepExtend(µ[d.geometry].defaultConfig().geometryConfig, individualGeometryConfig);
                    geometryConfigs.push({
                        data: data[i],
                        geometryConfig: individualGeometryConfigMixin,
                        geometry: geometry
                    });
                });
                var geometryConfigsGrouped = d3.nest().key(function(d, i) {
                    return d.geometryConfig.groupId || "unstacked";
                }).entries(geometryConfigs);
                var geometryConfigsGrouped2 = [];
                geometryConfigsGrouped.forEach(function(d, i) {
                    if (d.key === "unstacked") geometryConfigsGrouped2 = geometryConfigsGrouped2.concat(d.values); else geometryConfigsGrouped2.push(d.values);
                });
                geometryConfigsGrouped2.forEach(function(d, i) {
                    var geometry;
                    if (Array.isArray(d)) geometry = d[0].geometry; else geometry = d.geometry;
                    geometry.config(d)();
                });
            }
            if (legendConfig.showLegend) {
                var rightmostTickEndX = d3.max(chartGroup.selectAll(".angular-tick text")[0].map(function(d, i) {
                    return d.getCTM().e + d.getBBox().width;
                }));
                var legendContainer = svg.select(".legend-group").attr({
                    transform: "translate(" + [ radius + rightmostTickEndX, axisConfig.margin.top ] + ")"
                }).style({
                    display: "block"
                });
                var elements = geometryConfig.map(function(d, i) {
                    d.symbol = "line";
                    d.visibleInLegend = typeof d.visibleInLegend === "undefined" || d.visibleInLegend;
                    d.color = d.color || "black";
                    return d;
                });
                var legendConfigMixin1 = µ.util.deepExtend(µ.Legend.defaultConfig().legendConfig, legendConfig);
                var legendConfigMixin2 = µ.util.deepExtend(legendConfigMixin1, {
                    container: legendContainer,
                    elements: elements
                });
                var legendConfigMixin3 = {
                    data: data.map(function(d, i) {
                        return d.name || "Element" + i;
                    }),
                    legendConfig: legendConfigMixin2
                };
                µ.Legend().config(legendConfigMixin3)();
            } else {
                svg.select(".legend-group").style({
                    display: "none"
                });
            }
            if (axisConfig.title) {
                var title = svg.select("g.title-group text").attr({
                    x: 100,
                    y: 100
                }).style({
                    "font-size": 18,
                    "font-family": axisConfig.fontFamily,
                    fill: axisConfig.fontColor
                }).text(axisConfig.title);
                var titleBBox = title.node().getBBox();
                title.attr({
                    x: axisConfig.margin.left + radius - titleBBox.width / 2,
                    y: titleBBox.height
                });
            }
            svg.select(".geometry-group g").style({
                "pointer-events": "visible"
            });
            var guides = svg.select(".guides-group");
            var tooltipContainer = svg.select(".tooltips-group");
            var angularTooltip = µ.tooltipPanel().config({
                container: tooltipContainer,
                fontSize: 8
            })();
            var radialTooltip = µ.tooltipPanel().config({
                container: tooltipContainer,
                fontSize: 8
            })();
            var geometryTooltip = µ.tooltipPanel().config({
                container: tooltipContainer,
                hasTick: true
            })();
            var angularValue, radialValue;
            if (!isOrdinal) {
                var angularGuideLine = guides.select("line").attr({
                    x1: 0,
                    y1: 0,
                    y2: 0
                }).style({
                    stroke: "grey",
                    "pointer-events": "none"
                });
                chartGroup.on("mousemove.angular-guide", function(d, i) {
                    var mouseAngle = µ.util.getMousePos(backgroundCircle).angle;
                    angularGuideLine.attr({
                        x2: -radius,
                        transform: "rotate(" + mouseAngle + ")"
                    }).style({
                        opacity: .5
                    });
                    var angleWithOriginOffset = (mouseAngle + 360 + axisConfig.originTheta) % 360;
                    angularValue = angularScale.invert(angleWithOriginOffset);
                    var pos = µ.util.convertToCartesian(radius + 12, mouseAngle + 180);
                    angularTooltip.text(µ.util.round(angularValue)).move([ pos[0] + chartCenter[0], pos[1] + chartCenter[1] ]);
                }).on("mouseout.angular-guide", function(d, i) {
                    guides.select("line").style({
                        opacity: 0
                    });
                });
            }
            var angularGuideCircle = guides.select("circle").style({
                stroke: "grey",
                fill: "none"
            });
            chartGroup.on("mousemove.radial-guide", function(d, i) {
                var r = µ.util.getMousePos(backgroundCircle).radius;
                angularGuideCircle.attr({
                    r: r
                }).style({
                    opacity: .5
                });
                radialValue = radialScale.invert(µ.util.getMousePos(backgroundCircle).radius);
                var pos = µ.util.convertToCartesian(r, axisConfig.radialAxisTheta);
                radialTooltip.text(µ.util.round(radialValue)).move([ pos[0] + chartCenter[0], pos[1] + chartCenter[1] ]);
            }).on("mouseout.radial-guide", function(d, i) {
                angularGuideCircle.style({
                    opacity: 0
                });
                geometryTooltip.hide();
                angularTooltip.hide();
                radialTooltip.hide();
            });
            svg.selectAll(".geometry-group .mark").on("mouseenter.tooltip", function(d, i) {
                var el = d3.select(this);
                var color = el.style("fill");
                var newColor = "black";
                var opacity = el.style("opacity") || 1;
                el.attr({
                    "data-opacity": opacity
                });
                if (color != "none") {
                    el.attr({
                        "data-fill": color
                    });
                    newColor = d3.hsl(color).darker().toString();
                    el.style({
                        fill: newColor,
                        opacity: 1
                    });
                    var bbox = this.getBoundingClientRect();
                    var svgBBox = svg.node().getBoundingClientRect();
                    var pos = [ bbox.left - svgBBox.left + bbox.width / 2 - centerPosition[0], bbox.top - svgBBox.top + bbox.height / 2 - centerPosition[1] ];
                    var text = "θ: " + µ.util.round(d[0]) + ", r: " + µ.util.round(d[1]);
                    geometryTooltip.config({
                        color: newColor
                    }).text(text);
                    geometryTooltip.move(pos);
                } else {
                    color = el.style("stroke");
                    el.attr({
                        "data-stroke": color
                    });
                    newColor = d3.hsl(color).darker().toString();
                    el.style({
                        stroke: newColor,
                        opacity: 1
                    });
                }
            }).on("mousemove.tooltip", function(d, i) {
                if (d3.select(this).attr("data-fill")) geometryTooltip.show();
            }).on("mouseout.tooltip", function(d, i) {
                geometryTooltip.hide();
                var el = d3.select(this);
                var fillColor = el.attr("data-fill");
                if (fillColor) el.style({
                    fill: fillColor,
                    opacity: el.attr("data-opacity")
                }); else el.style({
                    stroke: el.attr("data-stroke"),
                    opacity: el.attr("data-opacity")
                });
            });
            var centerPosition = [ axisConfig.width / 2 - radius - axisConfig.margin.left, axisConfig.height / 2 - radius - axisConfig.margin.top ];
            var outerGroup = svg.select(".outer-group").attr("transform", "translate(" + centerPosition + ")");
        });
        return exports;
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        µ.util.deepExtend(config, _x);
        return this;
    };
    exports.radialScale = function(_x) {
        return radialScale;
    };
    exports.angularScale = function(_x) {
        return angularScale;
    };
    exports.svg = function() {
        return svg;
    };
    d3.rebind(exports, dispatch, "on");
    return exports;
};

µ.Axis.defaultConfig = function(d, i) {
    var config = {
        data: [ {
            x: [ 1, 2, 3, 4 ],
            y: [ 10, 11, 12, 13 ],
            name: "Line1"
        }, {
            x: [ 21, 22, 23, 24 ],
            y: [ 30, 31, 32, 33 ],
            name: "Line2"
        } ],
        geometryConfig: [],
        legendConfig: {
            showLegend: true
        },
        axisConfig: {
            defaultColorRange: d3.scale.category10().range(),
            radialDomain: null,
            angularDomain: null,
            angularTicksStep: null,
            angularTicksCount: null,
            title: null,
            height: 450,
            width: 500,
            margin: {
                top: 40,
                right: 40,
                bottom: 40,
                left: 40
            },
            fontSize: 11,
            fontColor: "black",
            fontFamily: "Tahoma, sans-serif",
            fontOutlineColor: "white",
            flip: false,
            originTheta: 0,
            labelOffset: 10,
            radialAxisTheta: -45,
            radialTicksSuffix: "",
            angularTicksSuffix: "",
            angularTicks: null,
            showRadialAxis: true,
            showRadialCircle: true,
            minorTicks: 1,
            tickLength: null,
            tickColor: "silver",
            minorTickColor: "#eee",
            angularRewriteTicks: null,
            radialRewriteTicks: null,
            angularTickOrientation: "horizontal",
            radialTickOrientation: "horizontal",
            container: "body",
            backgroundColor: "none",
            needsEndSpacing: true
        }
    };
    return config;
};

µ.util = {};

µ.util._override = function(_objA, _objB) {
    for (var x in _objA) if (x in _objB) _objB[x] = _objA[x];
};

µ.util._extend = function(_objA, _objB) {
    for (var x in _objA) _objB[x] = _objA[x];
};

µ.util._rndSnd = function() {
    return Math.random() * 2 - 1 + (Math.random() * 2 - 1) + (Math.random() * 2 - 1);
};

µ.util.dataFromEquation2 = function(_equation, _step) {
    var step = _step || 6;
    var data = d3.range(0, 360 + step, step).map(function(deg, index) {
        var theta = deg * Math.PI / 180;
        var radius = _equation(theta);
        return [ deg, radius ];
    });
    return data;
};

µ.util.dataFromEquation = function(_equation, _step, _name) {
    var step = _step || 6;
    var x = [], y = [];
    d3.range(0, 360 + step, step).forEach(function(deg, index) {
        var theta = deg * Math.PI / 180;
        var radius = _equation(theta);
        x.push(deg);
        y.push(radius);
    });
    var result = {
        x: x,
        y: y
    };
    if (_name) result.name = _name;
    return result;
};

µ.util.ensureArray = function(_val, _count) {
    if (typeof _val === "undefined") return null;
    var arr = [].concat(_val);
    return d3.range(_count).map(function(d, i) {
        return arr[i] || arr[0];
    });
};

µ.util.fillArrays = function(_obj, _valueNames, _count) {
    _valueNames.forEach(function(d, i) {
        _obj[d] = µ.util.ensureArray(_obj[d], _count);
    });
    return _obj;
};

µ.util.deepExtend = function(destination, source) {
    for (var property in source) {
        if (source[property] && source[property].constructor && source[property].constructor === Object) {
            destination[property] = destination[property] || {};
            arguments.callee(destination[property], source[property]);
        } else {
            destination[property] = source[property];
        }
    }
    return destination;
};

µ.util.validateKeys = function(obj, keys) {
    if (typeof keys === "string") keys = keys.split(".");
    var next = keys.shift();
    return obj[next] && (!keys.length || objHasKeys(obj[next], keys));
};

µ.util.sumArrays = function(a, b) {
    return d3.zip(a, b).map(function(d, i) {
        return d3.sum(d);
    });
};

µ.util.arrayLast = function(a) {
    return a[a.length - 1];
};

µ.util.arrayEqual = function(a, b) {
    var i = Math.max(a.length, b.length, 1);
    while (i-- >= 0 && a[i] === b[i]) ;
    return i === -2;
};

µ.util.flattenArray = function(arr) {
    var r = [];
    while (!µ.util.arrayEqual(r, arr)) {
        r = arr;
        arr = [].concat.apply([], arr);
    }
    return arr;
};

µ.util.deduplicate = function(arr) {
    return arr.filter(function(v, i, a) {
        return a.indexOf(v) == i;
    });
};

µ.util.convertToCartesian = function(radius, theta) {
    var thetaRadians = theta * Math.PI / 180;
    var x = radius * Math.cos(thetaRadians);
    var y = radius * Math.sin(thetaRadians);
    return [ x, y ];
};

µ.util.round = function(_value, _digits) {
    var digits = _digits || 2;
    var mult = Math.pow(10, digits);
    return Math.round(_value * mult) / mult;
};

µ.util.getMousePos = function(_referenceElement) {
    var mousePos = d3.mouse(_referenceElement.node());
    var mouseX = mousePos[0];
    var mouseY = mousePos[1];
    var mouse = {};
    mouse.x = mouseX;
    mouse.y = mouseY;
    mouse.pos = mousePos;
    mouse.angle = (Math.atan2(mouseY, mouseX) + Math.PI) * 180 / Math.PI;
    mouse.radius = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
    return mouse;
};

µ.util.duplicatesCount = function(arr) {
    var uniques = {}, val;
    var dups = {};
    for (var i = 0, len = arr.length; i < len; i++) {
        val = arr[i];
        if (val in uniques) {
            uniques[val]++;
            dups[val] = uniques[val];
        } else {
            uniques[val] = 1;
        }
    }
    return dups;
};

µ.util.duplicates = function(arr) {
    return Object.keys(µ.util.duplicatesCount(arr));
};

µ.PolyChart = function module() {
    var config = µ.PolyChart.defaultConfig();
    var dispatch = d3.dispatch("hover");
    var dashArray = {
        solid: "none",
        dash: [ 5, 2 ],
        dot: [ 2, 5 ]
    };
    var colorScale;
    function exports() {
        var geometryConfig = config.geometryConfig;
        var container = geometryConfig.container;
        if (typeof container == "string") container = d3.select(container);
        container.datum(config.data).each(function(_data, _index) {
            var isStack = !!_data.yStack;
            var data = _data.y.map(function(d, i) {
                if (isStack) return d3.zip(_data.x[0], d, _data.yStack[i]); else return d3.zip(_data.x[0], d);
            });
            var angularScale = geometryConfig.angularScale;
            var angularScaleReversed = geometryConfig.angularScale.copy().range(geometryConfig.angularScale.range().slice().reverse());
            var angularScale2 = geometryConfig.flip ? angularScale : angularScaleReversed;
            var generator = {};
            var domainMin = geometryConfig.radialScale.domain()[0];
            generator.bar = function(d, i) {
                var h = geometryConfig.radialScale(d[1]);
                var stackTop = geometryConfig.radialScale(domainMin + (d[2] || 0));
                if (geometryConfig.barRadialOffset) {
                    stackTop = 190;
                    h -= stackTop;
                }
                var w = geometryConfig.barWidth;
                return "M" + [ [ h + stackTop, -w / 2 ], [ h + stackTop, w / 2 ], [ stackTop, w / 2 ], [ stackTop, -w / 2 ] ].join("L") + "Z";
            };
            generator.dot = function(d, i) {
                return d3.svg.symbol().size(geometryConfig.dotSize).type(geometryConfig.dotType)(d, i);
            };
            generator.arc = d3.svg.arc().startAngle(function(d) {
                return -triangleAngle + Math.PI / 2;
            }).endAngle(function(d) {
                return triangleAngle + Math.PI / 2;
            }).innerRadius(function(d) {
                return geometryConfig.radialScale(domainMin + (d[2] || 0));
            }).outerRadius(function(d) {
                return geometryConfig.radialScale(domainMin + (d[2] || 0)) + geometryConfig.radialScale(d[1]);
            });
            colorScale = function(i) {
                return [].concat(geometryConfig.color)[i];
            };
            var triangleAngle = angularScale2(data[0][1][0]) * Math.PI / 180 / 2;
            var markStyle = {
                fill: function(d, i, pI) {
                    return colorScale(pI);
                },
                stroke: geometryConfig.strokeColor,
                "stroke-width": geometryConfig.lineStrokeSize + "px",
                "stroke-dasharray": dashArray[geometryConfig.dash],
                opacity: geometryConfig.opacity,
                display: geometryConfig.visible ? "block" : "none"
            };
            var geometryGroup = d3.select(this).classed("stacked-area-chart", true);
            var geometryLayer = geometryGroup.selectAll("g.layer").data(data);
            geometryLayer.enter().append("g").classed("layer", true);
            var geometry = geometryLayer.selectAll("path.mark").data(function(d, i) {
                return d;
            });
            geometry.enter().append("path").attr({
                "class": "mark"
            });
            geometry.attr({
                d: generator[geometryConfig.geometryType],
                transform: geometryConfig.geometryType === "dot" ? function(d, i) {
                    var coord = convertToCartesian(getPolarCoordinates(d));
                    return "translate(" + [ coord.x, coord.y ] + ")";
                } : function(d, i) {
                    return "rotate(" + (geometryConfig.originTheta + angularScale(d[0])) + ")";
                }
            }).style(markStyle);
            function getPolarCoordinates(d, i) {
                var r = geometryConfig.radialScale(d[1]);
                var θ = (geometryConfig.angularScale(d[0]) + geometryConfig.originTheta) * Math.PI / 180;
                return {
                    r: r,
                    θ: θ
                };
            }
            function convertToCartesian(polarCoordinates) {
                var x = polarCoordinates.r * Math.cos(polarCoordinates.θ);
                var y = polarCoordinates.r * Math.sin(polarCoordinates.θ);
                return {
                    x: x,
                    y: y
                };
            }
        });
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        var newConfig = _x;
        if (Array.isArray(_x)) {
            newConfig = _x[0];
            newConfig.data.y = _x.map(function(d, i) {
                return d.data.y[0];
            });
            newConfig.data.yStack = _x.map(function(d, i) {
                return d.data.yStack[0];
            });
            newConfig.geometryConfig.color = _x.map(function(d, i) {
                return d.geometryConfig.color;
            });
        }
        µ.util.deepExtend(config, newConfig);
        return this;
    };
    exports.getColorScale = function() {
        return colorScale;
    };
    d3.rebind(exports, dispatch, "on");
    return exports;
};

µ.PolyChart.defaultConfig = function() {
    var config = {
        data: {
            name: "geom1",
            x: [ [ 1, 2, 3, 4 ] ],
            y: [ [ 1, 2, 3, 4 ] ]
        },
        geometryConfig: {
            geometry: "LinePlot",
            geometryType: "arc",
            dotType: "circle",
            dotSize: 64,
            barRadialOffset: null,
            barWidth: 20,
            color: "#ffa500",
            strokeColor: "silver",
            dash: "solid",
            lineStrokeSize: 1,
            flip: true,
            originTheta: 0,
            container: "body",
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

µ.BarChart = function module() {
    return µ.PolyChart();
};

µ.BarChart.defaultConfig = function() {
    var config = {
        geometryConfig: {
            geometryType: "bar"
        }
    };
    return config;
};

µ.AreaChart = function module() {
    return µ.PolyChart();
};

µ.AreaChart.defaultConfig = function() {
    var config = {
        geometryConfig: {
            geometryType: "arc"
        }
    };
    return config;
};

µ.DotPlot = function module() {
    return µ.PolyChart();
};

µ.DotPlot.defaultConfig = function() {
    var config = {
        geometryConfig: {
            geometryType: "dot",
            dotType: "circle"
        }
    };
    return config;
};

µ.LinePlot = function module() {
    var config = µ.LinePlot.defaultConfig();
    var dispatch = d3.dispatch("hover");
    var dashArray = {
        solid: "none",
        dash: [ 5, 2 ],
        dot: [ 2, 5 ]
    };
    function exports() {
        var geometryConfig = config.geometryConfig;
        var container = geometryConfig.container;
        if (typeof container == "string") container = d3.select(container);
        container.datum(config.data).each(function(_data, _index) {
            var data = d3.zip(_data.x[0], _data.y[0]);
            var line = d3.svg.line.radial().interpolate(geometryConfig.lineInterpolation).radius(function(d) {
                return geometryConfig.radialScale(d[1]);
            }).angle(function(d) {
                return geometryConfig.angularScale(d[0]) * Math.PI / 180;
            });
            var markStyle = {
                fill: "none",
                "stroke-width": geometryConfig.lineStrokeSize,
                stroke: geometryConfig.color,
                "pointer-events": "stroke"
            };
            var geometryGroup = d3.select(this).classed("line-plot", true);
            var geometry = geometryGroup.selectAll("path.mark").data([ 0 ]);
            geometry.enter().append("path").attr({
                "class": "mark"
            });
            geometryGroup.select("path.mark").datum(data).attr({
                d: line,
                transform: "rotate(" + (geometryConfig.originTheta + 90) + ")",
                "stroke-width": geometryConfig.lineStrokeSize + "px",
                "stroke-dasharray": dashArray[geometryConfig.dash],
                opacity: geometryConfig.opacity,
                display: geometryConfig.visible ? "block" : "none"
            }).style(markStyle);
        });
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        µ.util.deepExtend(config, _x);
        return this;
    };
    d3.rebind(exports, dispatch, "on");
    return exports;
};

µ.LinePlot.defaultConfig = function() {
    var config = {
        data: {
            name: "geom1",
            x: [ [ 1, 2, 3, 4 ] ],
            y: [ [ 1, 2, 3, 4 ] ]
        },
        geometryConfig: {
            geometry: "LinePlot",
            color: "#ffa500",
            dash: "solid",
            lineStrokeSize: 2,
            lineInterpolation: "linear",
            flip: true,
            originTheta: 0,
            container: "body",
            opacity: 1,
            radialScale: null,
            angularScale: null,
            index: 0,
            visible: true,
            visibleInLegend: true
        }
    };
    return config;
};

µ.Legend = function module() {
    var config = µ.Legend.defaultConfig();
    var dispatch = d3.dispatch("hover");
    function exports() {
        var legendConfig = config.legendConfig;
        var flattenData = config.data.map(function(d, i) {
            return [].concat(d).map(function(dB, iB) {
                var element = µ.util.deepExtend({}, legendConfig.elements[i]);
                element.name = dB;
                element.color = [].concat(legendConfig.elements[i].color)[iB];
                return element;
            });
        });
        var data = d3.merge(flattenData);
        data = data.filter(function(d, i) {
            return legendConfig.elements[i] && (legendConfig.elements[i].visibleInLegend || typeof legendConfig.elements[i].visibleInLegend === "undefined");
        });
        if (legendConfig.reverseOrder) data = data.reverse();
        var container = legendConfig.container;
        if (typeof container == "string" || container.nodeName) container = d3.select(container);
        var colors = data.map(function(d, i) {
            return d.color;
        });
        var lineHeight = legendConfig.fontSize;
        var isContinuous = legendConfig.isContinuous == null ? typeof data[0] === "number" : legendConfig.isContinuous;
        var height = isContinuous ? legendConfig.height : lineHeight * data.length;
        var legendContainerGroup = container.classed("legend-group", true);
        var svg = legendContainerGroup.selectAll("svg").data([ 0 ]);
        var svgEnter = svg.enter().append("svg").attr({
            width: 300,
            height: height + lineHeight,
            xmlns: "http://www.w3.org/2000/svg",
            "xmlns:xmlns:xlink": "http://www.w3.org/1999/xlink",
            version: "1.1"
        });
        svgEnter.append("g").classed("legend-axis", true);
        svgEnter.append("g").classed("legend-marks", true);
        var dataNumbered = d3.range(data.length);
        var colorScale = d3.scale[isContinuous ? "linear" : "ordinal"]().domain(dataNumbered).range(colors);
        var dataScale = d3.scale[isContinuous ? "linear" : "ordinal"]().domain(dataNumbered)[isContinuous ? "range" : "rangePoints"]([ 0, height ]);
        var shapeGenerator = function(_type, _size) {
            var squareSize = _size * 3;
            if (_type === "line") {
                return "M" + [ [ -_size / 2, -_size / 12 ], [ _size / 2, -_size / 12 ], [ _size / 2, _size / 12 ], [ -_size / 2, _size / 12 ] ] + "Z";
            } else if (d3.svg.symbolTypes.indexOf(_type) != -1) return d3.svg.symbol().type(_type).size(squareSize)(); else return d3.svg.symbol().type("square").size(squareSize)();
        };
        if (isContinuous) {
            var gradient = svg.select(".legend-marks").append("defs").append("linearGradient").attr({
                id: "grad1",
                x1: "0%",
                y1: "0%",
                x2: "0%",
                y2: "100%"
            }).selectAll("stop").data(colors);
            gradient.enter().append("stop");
            gradient.attr({
                offset: function(d, i) {
                    return i / (colors.length - 1) * 100 + "%";
                }
            }).style({
                "stop-color": function(d, i) {
                    return d;
                }
            });
            svg.append("rect").classed("legend-mark", true).attr({
                height: legendConfig.height,
                width: legendConfig.colorBandWidth,
                fill: "url(#grad1)"
            });
        } else {
            var legendElement = svg.select(".legend-marks").selectAll("path.legend-mark").data(data);
            legendElement.enter().append("path").classed("legend-mark", true);
            legendElement.attr({
                transform: function(d, i) {
                    return "translate(" + [ lineHeight / 2, dataScale(i) + lineHeight / 2 ] + ")";
                },
                d: function(d, i) {
                    var symbolType = d.symbol;
                    return shapeGenerator(symbolType, lineHeight);
                },
                fill: function(d, i) {
                    return colorScale(i);
                }
            });
            legendElement.exit().remove();
        }
        var legendAxis = d3.svg.axis().scale(dataScale).orient("right");
        var axis = svg.select("g.legend-axis").attr({
            transform: "translate(" + [ isContinuous ? legendConfig.colorBandWidth : lineHeight, lineHeight / 2 ] + ")"
        }).call(legendAxis);
        axis.selectAll(".domain").style({
            fill: "none",
            stroke: "none"
        });
        axis.selectAll("line").style({
            fill: "none",
            stroke: isContinuous ? legendConfig.textColor : "none"
        });
        axis.selectAll("text").style({
            fill: legendConfig.textColor,
            "font-size": legendConfig.fontSize
        }).text(function(d, i) {
            return data[i].name;
        });
        return exports;
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        µ.util.deepExtend(config, _x);
        return this;
    };
    d3.rebind(exports, dispatch, "on");
    return exports;
};

µ.Legend.defaultConfig = function(d, i) {
    var config = {
        data: [ "a", "b", "c" ],
        legendConfig: {
            elements: [ {
                symbol: "line",
                color: "red"
            }, {
                symbol: "square",
                color: "yellow"
            }, {
                symbol: "diamond",
                color: "limegreen"
            } ],
            height: 150,
            colorBandWidth: 30,
            fontSize: 12,
            container: "body",
            isContinuous: null,
            textColor: "grey",
            reverseOrder: false
        }
    };
    return config;
};

µ.tooltipPanel = function() {
    var tooltipEl, tooltipTextEl, backgroundEl, circleEl;
    var config = {
        container: null,
        hasTick: false,
        fontSize: 12,
        color: "white",
        padding: 5
    };
    var id = "tooltip-" + µ.tooltipPanel.uid++;
    var exports = function() {
        tooltipEl = config.container.selectAll("g." + id).data([ 0 ]);
        var tooltipEnter = tooltipEl.enter().append("g").classed(id, true).style({
            "pointer-events": "none"
        });
        circleEl = tooltipEnter.append("circle").attr({
            cx: 5,
            r: 5
        }).style({
            fill: "white",
            "fill-opacity": .9
        });
        backgroundEl = tooltipEnter.append("rect").style({
            fill: "white",
            "fill-opacity": .9
        });
        tooltipTextEl = tooltipEnter.append("text").attr({
            dy: -config.fontSize * .3,
            dx: config.padding + 5
        });
        return exports;
    };
    exports.text = function(_text) {
        var l = d3.hsl(config.color).l;
        var strokeColor = l >= .5 ? "#aaa" : "white";
        var fillColor = l >= .5 ? "black" : "white";
        var text = _text || "";
        tooltipTextEl.style({
            fill: fillColor,
            "font-size": config.fontSize + "px"
        }).text(text);
        var padding = config.padding;
        var bbox = tooltipTextEl.node().getBBox();
        backgroundEl.attr({
            x: 5,
            y: -(bbox.height + padding),
            width: bbox.width + padding * 2,
            height: bbox.height + padding * 2,
            rx: 0,
            ry: 0
        }).style({
            fill: config.color,
            stroke: strokeColor,
            "stroke-width": "2px"
        });
        circleEl.attr({
            cy: -(bbox.height / 2)
        }).style({
            display: config.hasTick ? "block" : "none"
        });
        tooltipEl.style({
            display: "block"
        });
        return exports;
    };
    exports.move = function(_pos) {
        if (!tooltipEl) return;
        tooltipEl.attr({
            transform: "translate(" + [ _pos[0], _pos[1] ] + ")"
        }).style({
            display: "block"
        });
        return exports;
    };
    exports.hide = function() {
        if (!tooltipEl) return;
        tooltipEl.style({
            display: "none"
        });
        return exports;
    };
    exports.show = function() {
        if (!tooltipEl) return;
        tooltipEl.style({
            display: "block"
        });
        return exports;
    };
    exports.config = function(_x) {
        µ.util.deepExtend(config, _x);
        return exports;
    };
    return exports;
};

µ.tooltipPanel.uid = 1;

µ.adapter = {};

µ.adapter.plotly = function module() {
    var exports = {};
    exports.convert = function(_inputConfig) {
        var outputConfig = {};
        var r = {};
        if (_inputConfig.data) {
            outputConfig.data = _inputConfig.data.slice();
            outputConfig.geometryConfig = outputConfig.data.map(function(d, i) {
                r = {};
                if (d.type) r.geometry = d.type.substr("Polar".length);
                if (d.line && d.line.color) r.color = d.line.color;
                if (d.line && d.line.width) r.lineStrokeSize = d.line.width;
                if (d.line && d.line.dash) r.dash = d.line.dash;
                if (d.line && d.line.interpolation) r.lineInterpolation = d.line.interpolation;
                if (d.opacity) r.opacity = d.opacity;
                if (typeof d.visible != "undefined") r.visible = d.visible;
                if (typeof d.visibleInLegend != "undefined") r.visibleInLegend = d.visibleInLegend;
                if (d.marker && d.marker.type) r.dotType = d.marker.type;
                if (d.marker && d.marker.color) r.color = d.marker.color;
                if (d.marker && d.marker.line && d.marker.line.color) r.strokeColor = d.marker.line.color;
                if (d.marker && d.marker.size) r.dotSize = d.marker.size;
                if (d.marker && typeof d.marker.barRadialOffset != "undefined") r.barRadialOffset = d.marker.barRadialOffset;
                if (d.marker && typeof d.marker.barWidth != "undefined") r.barWidth = d.marker.barWidth;
                return r;
            });
            if (_inputConfig.layout && _inputConfig.layout.barmode === "stack") {
                var duplicates = µ.util.duplicates(outputConfig.data.map(function(d, i) {
                    return d.type;
                }));
                outputConfig.data.forEach(function(d, i) {
                    var idx = duplicates.indexOf(d.type);
                    if (idx != -1) outputConfig.geometryConfig[i].groupId = idx;
                });
            }
        }
        if (_inputConfig.layout) {
            outputConfig.legendConfig = {};
            r = {};
            d3.entries(_inputConfig.layout).forEach(function(d, i) {
                if (d.key === "height") r.height = d.value;
                if (d.key === "width") r.width = d.value;
                if (d.key === "title") r.title = d.value;
                if (d.key === "showlegend") outputConfig.legendConfig.showLegend = d.value;
                if (d.key === "direction") r.flip = d.value === "clockwise";
                if (d.key === "needsEndSpacing") r.needsEndSpacing = d.value;
                if (d.key === "legend") {
                    if (d.value.traceorder) outputConfig.legendConfig.reverseOrder = d.value.traceorder === "reversed";
                }
                if (d.key === "plot_bgcolor") r.backgroundColor = d.value;
                if (d.key === "xaxis") {
                    if (typeof d.value.range != "undefined") r.angularDomain = d.value.range;
                    if (typeof d.value.tickCount != "undefined") r.angularTicksCount = d.value.tickCount;
                    if (typeof d.value.tickStep != "undefined") r.angularTicksStep = d.value.tickStep;
                    if (typeof d.value.minorTickCount != "undefined") r.minorTicks = d.value.minorTickCount;
                    if (d.value.suffix) r.angularTicksSuffix = d.value.suffix;
                    if (typeof d.value.flip != "undefined") r.flip = d.value.flip;
                    if (typeof d.value.rewriteTicks != "undefined") r.angularRewriteTicks = d.value.rewriteTicks;
                }
                if (d.key === "yaxis") {
                    if (typeof d.value.range != "undefined") r.radialDomain = d.value.range;
                    if (d.value.suffix) r.radialTicksSuffix = d.value.suffix;
                    if (typeof d.value.orientation != "undefined") r.radialAxisTheta = d.value.orientation;
                    if (typeof d.value.rewriteTicks != "undefined") r.radialRewriteTicks = d.value.rewriteTicks;
                    if (typeof d.value.labelOffset != "undefined") r.labelOffset = d.value.labelOffset;
                }
                if (d.key === "font") {
                    if (d.value.size) r.fontSize = d.value.size;
                    if (d.value.color) r.fontColor = d.value.color;
                    if (d.value.family) r.fontFamily = d.value.family;
                }
                if (d.key === "margin") {
                    var source = [ "t", "r", "b", "l", "pad" ];
                    var target = [ "top", "right", "bottom", "left", "pad" ];
                    r.margin = {};
                    d3.entries(d.value).forEach(function(dB, iB) {
                        r.margin[target[source.indexOf(dB.key)]] = dB.value;
                    });
                }
                if (d.key === "orientation") r.originTheta = d.value;
                if (d.key === "tickColor") r.tickColor = d.value;
                if (d.key === "minorTickColor") r.minorTickColor = d.value;
            });
            outputConfig.axisConfig = r;
            if (_inputConfig.container) outputConfig.axisConfig.container = _inputConfig.container;
        }
        return outputConfig;
    };
    return exports;
};