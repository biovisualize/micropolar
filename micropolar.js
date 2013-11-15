var micropolar = {
    version: "0.1.1"
};

var µ = micropolar;

µ.Axis = function module() {
    var config = {
        geometry: [],
        data: [ [ 0, 0 ], [ 0, 0 ] ],
        legend: null,
        title: null,
        height: 300,
        width: 300,
        radialDomain: null,
        angularDomain: null,
        angularTicksStep: null,
        angularTicksCount: 4,
        flip: true,
        originTheta: 0,
        labelOffset: 10,
        radialAxisTheta: -45,
        ticks: null,
        radialTicksSuffix: "",
        angularTicksSuffix: "",
        angularTicks: null,
        showRadialAxis: true,
        showRadialCircle: true,
        minorTicks: 0,
        tickLength: null,
        rewriteTicks: null,
        angularTickOrientation: "horizontal",
        radialTickOrientation: "horizontal",
        containerSelector: "body",
        margin: 25,
        backgroundColor: "none"
    };
    var svg, dispatch = d3.dispatch("hover"), radialScale, angularScale;
    function exports() {
        var container = config.containerSelector;
        if (typeof container == "string") container = d3.select(container);
        container.datum(config.data).each(function(_data, _index) {
            if (typeof config.geometry != "object") config.geometry = [ config.geometry ];
            if (typeof _data[0][0] != "object") _data = [ _data ];
            var radius = Math.min(config.width, config.height) / 2 - config.margin;
            var extent = d3.extent(_data[0].map(function(d, i) {
                return d[1];
            }));
            radialScale = d3.scale.linear().domain(config.radialDomain || extent).range([ 0, radius ]);
            var angularExtent = d3.extent(_data[0].map(function(d, i) {
                return d[0];
            }));
            var angularDomain = config.angularDomain || angularExtent;
            var angularTicksStep = config.angularTicksStep || (angularDomain[1] - angularDomain[0]) / config.angularTicksCount;
            if (!angularDomain[2]) angularDomain[2] = angularTicksStep;
            angularDomain[2] /= config.minorTicks + 1;
            var angularAxisRange = d3.range.apply(this, angularDomain);
            angularAxisRange = angularAxisRange.map(function(d, i) {
                return parseFloat(d.toPrecision(12));
            });
            angularScale = d3.scale.linear().domain(angularDomain.slice(0, 2)).range(config.flip ? [ 0, 360 ] : [ 360, 0 ]);
            var skeleton = '<svg xmlns="http://www.w3.org/2000/svg" class="chart-root">                         <g class="chart-group">                             <circle class="background-circle"></circle>                             <g class="angular axis-group"></g>                            <g class="geometry-group"></g>                            <g class="radial axis-group">                                 <circle class="outside-circle"></circle>                             </g>                             <g class="guides-group"><line></line><circle></circle></g>                         </g>                         <g class="legend-group"> </g>                     </svg>';
            if (typeof svg === "undefined") {
                var doc = new DOMParser().parseFromString(skeleton, "application/xml");
                this.appendChild(this.ownerDocument.importNode(doc.documentElement, true));
                svg = d3.select(this).select("svg");
            }
            var lineStyle = {
                fill: "none",
                stroke: "silver"
            };
            var fontStyle = {
                "font-size": 11,
                "font-family": "Tahoma, sans-serif"
            };
            svg.attr({
                width: config.width,
                height: config.height
            }).style({
                "pointer-events": "none"
            });
            var chartGroup = svg.select(".chart-group").attr("transform", "translate(" + config.width / 2 + "," + config.height / 2 + ")");
            var radialAxis = svg.select(".radial.axis-group");
            if (config.showRadialCircle) {
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
            svg.select("circle.background-circle").attr({
                r: radius
            }).style({
                fill: config.backgroundColor,
                stroke: lineStyle.stroke
            });
            var currentAngle = function(d, i) {
                return (angularScale(d) + config.originTheta) % 360;
            };
            if (config.showRadialAxis) {
                var axis = d3.svg.axis().scale(radialScale).ticks(5).tickSize(5);
                var radialAxis = svg.select(".radial.axis-group").call(axis).attr({
                    transform: "rotate(" + config.radialAxisTheta + ")"
                });
                radialAxis.selectAll(".domain").style(lineStyle);
                radialAxis.selectAll("g>text").text(function(d, i) {
                    return this.textContent + config.radialTicksSuffix;
                }).style(fontStyle).style({
                    "text-anchor": "start"
                }).attr({
                    x: 0,
                    y: 0,
                    dx: 0,
                    dy: 0,
                    transform: function(d, i) {
                        if (config.radialTickOrientation === "horizontal") return "rotate(" + -config.radialAxisTheta + ") translate(" + [ 0, fontStyle["font-size"] ] + ")"; else return "translate(" + [ 0, fontStyle["font-size"] ] + ")";
                    }
                });
                radialAxis.selectAll("g>line").style({
                    stroke: "black"
                });
            }
            var angularAxis = svg.select(".angular.axis-group").selectAll("g.angular-tick").data(angularAxisRange);
            var angularAxisEnter = angularAxis.enter().append("g").attr({
                "class": "angular-tick"
            });
            angularAxis.attr({
                transform: function(d, i) {
                    return "rotate(" + currentAngle(d, i) + ")";
                }
            });
            angularAxis.exit().remove();
            angularAxisEnter.append("line").attr({
                "class": "grid-line"
            }).classed("major", function(d, i) {
                return i % (config.minorTicks + 1) == 0;
            }).classed("minor", function(d, i) {
                return !(i % (config.minorTicks + 1) == 0);
            }).style(lineStyle);
            angularAxisEnter.selectAll(".minor").style({
                stroke: "#eee"
            });
            angularAxis.select("line.grid-line").attr({
                x1: config.tickLength ? radius - config.tickLength : 0,
                x2: radius
            });
            angularAxisEnter.append("text").attr({
                "class": "axis-text"
            }).style(fontStyle);
            var ticks = angularAxis.select("text.axis-text").attr({
                x: radius + config.labelOffset,
                dy: ".35em",
                transform: function(d, i) {
                    var angle = currentAngle(d, i);
                    var rad = radius + config.labelOffset;
                    var orient = config.angularTickOrientation;
                    if (orient == "horizontal") return "rotate(" + -angle + " " + rad + " 0)"; else if (orient == "radial") return angle < 270 && angle > 90 ? "rotate(180 " + rad + " 0)" : null; else return "rotate(" + (angle <= 180 && angle > 0 ? -90 : 90) + " " + rad + " 0)";
                }
            }).style({
                "text-anchor": "middle"
            }).text(function(d, i) {
                if (i % (config.minorTicks + 1) != 0) return "";
                if (config.ticks) return config.ticks[i / (config.minorTicks + 1)] + config.angularTicksSuffix; else return d + config.angularTicksSuffix;
            }).style(fontStyle);
            if (config.rewriteTicks) ticks.text(function(d, i) {
                return config.rewriteTicks(this.textContent, i);
            });
            var that = this;
            config.geometry.forEach(function(d, i) {
                var groupClass = "geometry" + i;
                var geometryContainer = d3.select(that).select("svg g.geometry-group").selectAll("g." + groupClass).data([ 0 ]).enter().append("g").classed(groupClass, true);
                d.config({
                    data: _data[i],
                    axisConfig: config,
                    radialScale: radialScale,
                    angularScale: angularScale,
                    containerSelector: geometryContainer
                })();
            });
            if (config.legend) {
                var legendContainer = d3.select(this).select(".legend-group").attr({
                    transform: "translate(" + config.width + ", 0)"
                });
                config.legend.config({
                    containerSelector: legendContainer
                })();
                var legendWidth = legendContainer.node().getBBox().width;
                svg.attr({
                    width: config.width + legendWidth
                });
            }
            if (config.title) {
                var title = svg.append("text").classed("title", true).attr({
                    x: 100,
                    y: 100
                }).style({
                    "font-size": 18
                }).text(config.title);
                var titleBBox = title.node().getBBox();
                title.attr({
                    x: config.width / 2 - titleBBox.width / 2,
                    y: titleBBox.height
                });
                svg.attr({
                    height: config.height + titleBBox.height
                });
                var chartGroup = svg.select(".chart-group");
                var oldTranslate = d3.transform(chartGroup.attr("transform")).translate;
                chartGroup.attr("transform", "translate(" + oldTranslate[0] + "," + (oldTranslate[1] + titleBBox.height) + ")");
            }
            function getMousePos() {
                var mousePos = d3.mouse(svg.node());
                var mouseX = mousePos[0] - config.width / 2;
                var mouseY = mousePos[1] - config.height / 2;
                var mouseAngle = (Math.atan2(mouseY, mouseX) + Math.PI) / Math.PI * 180;
                var r = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
                return {
                    angle: mouseAngle,
                    radius: r
                };
            }
            svg.select(".geometry-group g").style({
                "pointer-events": "visible"
            });
            var guides = svg.select(".guides-group");
            chartGroup.on("mousemove.angular-guide", function(d, i) {
                var mouseAngle = getMousePos().angle;
                guides.select("line").attr({
                    x1: 0,
                    y1: 0,
                    x2: -radius,
                    y2: 0,
                    transform: "rotate(" + mouseAngle + ")"
                }).style({
                    stroke: "grey",
                    opacity: 1
                });
            }).on("mouseout.angular-guide", function(d, i) {
                guides.select("line").style({
                    opacity: 0
                });
            });
            chartGroup.on("mousemove.radial-guide", function(d, i) {
                var r = getMousePos().radius;
                guides.select("circle").attr({
                    r: r
                }).style({
                    stroke: "grey",
                    fill: "none",
                    opacity: 1
                });
            }).on("mouseout.radial-guide", function(d, i) {
                guides.select("circle").style({
                    opacity: 0
                });
            });
            svg.selectAll(".geometry-group .mark").on("mouseenter.tooltip", function(d, i) {});
        });
        return exports;
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        µ.util._override(_x, config);
        return this;
    };
    exports.radialScale = function(_x) {
        return radialScale;
    };
    exports.angularScale = function(_x) {
        return angularScale;
    };
    d3.rebind(exports, dispatch, "on");
    return exports;
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

µ.util.dataFromEquation = function(_equation, _step) {
    var step = _step || 6;
    var data = d3.range(0, 360 + step, step).map(function(deg, index) {
        var theta = deg * Math.PI / 180;
        var radius = _equation(theta);
        return [ deg, radius ];
    });
    return data;
};

µ.util.ensureArray = function(_val, _count) {
    if (typeof _val === "undefined") return null;
    var arr = [].concat(_val);
    return d3.range(_count).map(function(d, i) {
        return arr[i] || arr[0];
    });
};

µ.util.fillArrays = function(_obj, _valueNames, _count) {
    var newObj = JSON.parse(JSON.stringify(_obj));
    _valueNames.forEach(function(d, i) {
        newObj[d] = µ.util.ensureArray(newObj[d], _count);
    });
    return newObj;
};

µ.BarChart = function module() {
    var config = {
        data: null,
        containerSelector: "body",
        dotRadius: 5,
        fill: "orange",
        stroke: "red",
        radialScale: null,
        angularScale: null,
        axisConfig: null
    };
    var dispatch = d3.dispatch("hover");
    function exports() {
        var container = config.containerSelector;
        if (typeof container == "string") container = d3.select(container);
        container.datum(config.data).each(function(_data, _index) {
            var domain = config.angularScale.domain();
            var angularScale = config.angularScale.copy().domain([ domain[0], domain[1] + _data[1][0] - _data[0][0] ]);
            var markStyle = {
                fill: config.fill,
                stroke: config.stroke
            };
            var barW = 12;
            var geometryGroup = d3.select(this).classed("bar-chart", true);
            var geometry = geometryGroup.selectAll("rect.mark").data(_data);
            geometry.enter().append("rect").attr({
                "class": "mark"
            });
            geometry.attr({
                x: -barW / 2,
                y: config.radialScale(0),
                width: barW,
                height: function(d, i) {
                    return config.radialScale(d[1]) - config.radialScale(0);
                },
                transform: function(d, i) {
                    return "rotate(" + (config.axisConfig.originTheta - 90 + angularScale(d[0])) + ")";
                }
            }).style(markStyle);
        });
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        µ.util._override(_x, config);
        return this;
    };
    d3.rebind(exports, dispatch, "on");
    return exports;
};

µ.Clock = function module() {
    var config = {
        data: null,
        containerSelector: "body",
        fill: "orange",
        stroke: "red",
        radialScale: null,
        angularScale: null,
        axisConfig: null
    };
    var dispatch = d3.dispatch("hover");
    function exports() {
        var container = config.containerSelector;
        if (typeof container == "string") container = d3.select(container);
        container.datum(config.data).each(function(_data, _index) {
            var radius = config.radialScale.range()[1];
            var handsHeight = [ radius / 1.3, radius / 1.5, radius / 1.5 ];
            var handsWidth = [ radius / 15, radius / 10, radius / 30 ];
            _data = [ 0, 4, 8 ];
            config.angularScale.domain([ 0, 12 ]);
            var markStyle = {
                fill: config.fill,
                stroke: config.stroke
            };
            var geometryGroup = d3.select(this).classed("clock", true);
            var geometry = geometryGroup.selectAll("rect.mark").data(_data);
            geometry.enter().append("rect").attr({
                "class": "mark"
            });
            geometry.attr({
                x: function(d, i) {
                    return -handsWidth[i] / 2;
                },
                y: function(d, i) {
                    return i == 2 ? -radius / 5 : 0;
                },
                width: function(d, i) {
                    return handsWidth[i];
                },
                height: function(d, i) {
                    return handsHeight[i];
                },
                transform: function(d, i) {
                    return "rotate(" + (config.axisConfig.originTheta - 90 + config.angularScale(d)) + ")";
                }
            }).style(markStyle);
            geometryGroup.selectAll("circle.mark").data([ 0 ]).enter().append("circle").attr({
                "class": "mark"
            }).attr({
                r: radius / 10
            }).style({
                "fill-opacity": 1
            }).style(markStyle);
        });
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        µ.util._override(_x, config);
        return this;
    };
    d3.rebind(exports, dispatch, "on");
    return exports;
};

µ.AreaChart = function module() {
    var config = {
        data: null,
        containerSelector: "body",
        dotRadius: 5,
        fill: "orange",
        stroke: "red",
        radialScale: null,
        angularScale: null,
        axisConfig: null
    };
    var dispatch = d3.dispatch("hover");
    function exports() {
        var container = config.containerSelector;
        if (typeof container == "string") container = d3.select(container);
        container.datum(config.data).each(function(_data, _index) {
            var domain = config.angularScale.domain();
            var angularScale = config.angularScale.copy().domain([ domain[0], domain[1] + _data[1][0] - _data[0][0] ]);
            var triangleAngle = 360 / _data.length * Math.PI / 180 / 2;
            var markStyle = {
                fill: config.fill,
                stroke: config.stroke
            };
            var geometryGroup = d3.select(this).classed("area-chart", true);
            var geometry = geometryGroup.selectAll("path.mark").data(_data);
            geometry.enter().append("path").attr({
                "class": "mark"
            });
            geometry.attr({
                d: function(d, i) {
                    var h = config.radialScale(d[1]);
                    var baseW = Math.tan(triangleAngle) * h;
                    return "M" + [ [ 0, 0 ], [ h, baseW ], [ h, -baseW ] ].join("L") + "Z";
                },
                transform: function(d, i) {
                    return "rotate(" + (config.axisConfig.originTheta - 90 + angularScale(d[0])) + ")";
                }
            }).style(markStyle);
        });
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        µ.util._override(_x, config);
        return this;
    };
    d3.rebind(exports, dispatch, "on");
    return exports;
};

µ.StackedAreaChart = function module() {
    var config = {
        data: null,
        containerSelector: "body",
        dotRadius: 5,
        fill: "orange",
        stroke: "red",
        radialScale: null,
        angularScale: null,
        colorScale: d3.scale.category20(),
        axisConfig: null
    };
    var dispatch = d3.dispatch("hover");
    function exports() {
        var container = config.containerSelector;
        if (typeof container == "string") container = d3.select(container);
        container.datum(config.data).each(function(_data, _index) {
            var dataStacked = d3.nest().key(function(d) {
                return d[2];
            }).entries(_data);
            dataStacked.forEach(function(d) {
                d.values.forEach(function(val) {
                    val.x = val[0];
                    val.y = +val[1];
                });
            });
            var stacked = d3.layout.stack().values(function(d) {
                return d.values;
            });
            var triangleAngle = 360 / d3.keys(d3.nest().key(function(d) {
                return d[0];
            }).map(_data)).length * Math.PI / 180 / 2;
            var markStyle = {
                fill: function(d) {
                    return config.colorScale(d[2]);
                },
                stroke: "gray"
            };
            var geometryGroup = d3.select(this).classed("stacked-area-chart", true);
            var geometry = geometryGroup.selectAll("g.layer").data(stacked(dataStacked)).enter().append("g").classed("layer", true).selectAll("path.mark").data(function(d, i) {
                return d.values;
            });
            geometry.enter().append("path").attr({
                "class": "mark"
            });
            geometry.attr({
                d: function(d, i) {
                    var h = config.radialScale(d.y + d.y0);
                    var startH = config.radialScale(d.y0);
                    var baseW = Math.tan(triangleAngle) * h;
                    var startW = Math.tan(triangleAngle) * startH;
                    return "M" + [ [ startH, startW ], [ h, baseW ], [ h, -baseW ], [ startH, -startW ] ].join("L") + "Z";
                },
                transform: function(d, i) {
                    return "rotate(" + (config.axisConfig.originTheta - 90 + config.angularScale(d[0])) + ")";
                }
            }).style(markStyle);
        });
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        µ.util._override(_x, config);
        return this;
    };
    d3.rebind(exports, dispatch, "on");
    return exports;
};

µ.DotPlot = function module() {
    var config = {
        data: null,
        containerSelector: "body",
        dotRadius: 3,
        fill: "orange",
        stroke: "red",
        radialScale: null,
        angularScale: null,
        axisConfig: null
    };
    var dispatch = d3.dispatch("hover");
    function exports() {
        var container = config.containerSelector;
        if (typeof container == "string") container = d3.select(container);
        container.datum(config.data).each(function(_data, _index) {
            var markStyle = {
                fill: config.fill,
                stroke: config.stroke
            };
            var geometryGroup = d3.select(this).classed("dot-plot", true);
            var geometry = geometryGroup.selectAll("circle.mark").data(_data);
            geometry.enter().append("circle").attr({
                "class": "mark"
            });
            geometry.attr({
                cy: function(d, i) {
                    return config.radialScale(d[1]);
                },
                r: config.dotRadius,
                transform: function(d, i) {
                    return "rotate(" + (config.axisConfig.originTheta - 90 + config.angularScale(d[0])) + ")";
                }
            }).style(markStyle);
        });
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        µ.util._override(_x, config);
        return this;
    };
    d3.rebind(exports, dispatch, "on");
    return exports;
};

µ.LinePlot = function module() {
    var config = {
        data: null,
        containerSelector: "body",
        lineStrokeSize: 2,
        stroke: "orange",
        radialScale: null,
        angularScale: null,
        axisConfig: null
    };
    var dispatch = d3.dispatch("hover");
    function exports() {
        var container = config.containerSelector;
        if (typeof container == "string") container = d3.select(container);
        container.datum(config.data).each(function(_data, _index) {
            var line = d3.svg.line.radial().radius(function(d) {
                return config.radialScale(d[1]);
            }).angle(function(d) {
                return config.angularScale(d[0]) * Math.PI / 180 * (config.axisConfig.flip ? 1 : -1);
            });
            var markStyle = {
                fill: "none",
                "stroke-width": config.lineStrokeSize,
                stroke: config.stroke,
                "pointer-events": "stroke"
            };
            var geometryGroup = d3.select(this).classed("line-plot", true);
            var geometry = geometryGroup.selectAll("path.mark").data([ 0 ]);
            geometry.enter().append("path").attr({
                "class": "mark"
            });
            geometryGroup.select("path.mark").datum(_data).attr({
                d: line,
                "stroke-width": config.lineStrokeSize + "px"
            }).style(markStyle);
        });
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        µ.util._override(_x, config);
        return this;
    };
    d3.rebind(exports, dispatch, "on");
    return exports;
};

µ.legend = function module() {
    var config = {
        height: 150,
        lineHeight: 20,
        colorBandWidth: 30,
        fontSize: 12,
        containerSelector: "body",
        data: [ "a", "b", "c" ],
        symbol: "square",
        color: [ "red", "yellow", "limegreen" ],
        textColor: "grey"
    };
    var dispatch = d3.dispatch("hover");
    function exports() {
        var container = config.containerSelector;
        if (typeof container == "string") container = d3.select(container);
        var isContinuous = typeof config.data[0] === "number";
        var height = isContinuous ? config.height : config.lineHeight * config.data.length;
        var geometryGroup = container.classed("legend", true);
        var svg = geometryGroup.append("svg").attr({
            width: 300,
            height: height + config.lineHeight * 2,
            xmlns: "http://www.w3.org/2000/svg",
            "xmlns:xmlns:xlink": "http://www.w3.org/1999/xlink",
            version: "1.1"
        });
        var svgGroup = svg.append("g").attr({
            transform: "translate(" + [ 0, config.lineHeight ] + ")"
        });
        var colorScale = d3.scale[isContinuous ? "linear" : "ordinal"]().domain(config.data).range(config.color);
        var dataScale = colorScale.copy()[isContinuous ? "range" : "rangePoints"]([ 0, height ]);
        var shapeGenerator = function(_type, _size) {
            if (_type === "line") {
                return "M" + [ [ -_size / 2, -_size / 12 ], [ _size / 2, -_size / 12 ], [ _size / 2, _size / 12 ], [ -_size / 2, _size / 12 ] ] + "Z";
            } else if (d3.svg.symbolTypes.indexOf(_type) != -1) return d3.svg.symbol().type(_type).size(_size * _size / 2)(); else return d3.svg.symbol().type("square").size(_size * _size / 2)();
        };
        if (isContinuous) {
            var gradient = svgGroup.append("defs").append("linearGradient").attr({
                id: "grad1",
                x1: "0%",
                y1: "0%",
                x2: "0%",
                y2: "100%"
            }).selectAll("stop").data(config.color);
            gradient.enter().append("stop");
            gradient.attr({
                offset: function(d, i) {
                    return i / (config.color.length - 1) * 100 + "%";
                }
            }).style({
                "stop-color": function(d, i) {
                    return d;
                }
            });
            svgGroup.append("rect").classed("legend-mark", true).attr({
                height: config.height,
                width: config.colorBandWidth,
                fill: "url(#grad1)"
            });
        } else {
            var legendElement = svgGroup.selectAll("path.legend-mark").data(config.data);
            legendElement.enter().append("path").classed("legend-mark", true);
            legendElement.attr({
                transform: function(d, i) {
                    return "translate(" + [ config.lineHeight / 2, dataScale(d, i) ] + ")";
                },
                d: function(d, i) {
                    var symbolType = typeof config.symbol === "string" ? config.symbol : config.symbol[i];
                    return shapeGenerator(symbolType, config.lineHeight);
                },
                fill: function(d, i) {
                    return colorScale(d, i);
                }
            });
        }
        var legendAxis = d3.svg.axis().scale(dataScale).orient("right");
        var axis = svgGroup.append("g").classed("legend-axis", true).attr({
            transform: "translate(" + [ isContinuous ? config.colorBandWidth : config.lineHeight, 0 ] + ")"
        }).call(legendAxis);
        axis.selectAll(".domain").style({
            fill: "none",
            stroke: "none"
        });
        axis.selectAll("line").style({
            fill: "none",
            stroke: isContinuous ? config.textColor : "none"
        });
        axis.selectAll("text").style({
            fill: config.textColor,
            "font-size": config.fontSize
        });
        svg.attr({
            width: svg.node().getBBox().width + 10
        });
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        µ.util._override(_x, config);
        return this;
    };
    d3.rebind(exports, dispatch, "on");
    return exports;
};

µ.preset = {};

µ.preset.linePlot = function(_config) {
    if (_config && _config.size) {
        _config.width = _config.height = _config.size;
    }
    var polarPlot = µ.LinePlot();
    var config = {
        geometry: polarPlot,
        data: d3.range(0, 721, 1).map(function(deg, index) {
            return [ deg, index / 720 * 2 ];
        }),
        height: 250,
        width: 250,
        angularDomain: [ 0, 360 ],
        angularTicksStep: 30,
        angularTicksSuffix: "º",
        minorTicks: 1,
        flip: false,
        originTheta: 0,
        radialAxisTheta: -30,
        containerSelector: "body"
    };
    µ.util._extend(_config, config);
    var polarAxis = µ.Axis().config(config);
    polarAxis();
};

µ.preset.multiLinePlot = function(_config) {
    var config = {
        data: d3.range(0, 721, 1).map(function(deg, index) {
            return [ deg, index / 720 * 2 ];
        }),
        title: "",
        geometry: "LinePlot",
        color: "#ffa500",
        height: 250,
        width: 250,
        isLegendVisible: false,
        angularTicksSuffix: "º",
        minorTicks: 1,
        flip: true,
        originTheta: -90,
        radialAxisTheta: -90,
        radialTicksSuffix: "",
        containerSelector: "body"
    };
    µ.util._extend(_config, config);
    if (typeof [].concat(_config.data)[0] === "function") {
        config.data = config.data.map(function(d, i) {
            return µ.util.dataFromEquation(d, 6);
        });
    }
    if (typeof config.data[0][0] != "object") config.data = [ config.data ];
    config = µ.util.fillArrays(config, [ "color", "geometryName", "geometry" ], config.data.length);
    if (!config.geometryName) config.geometryName = config.data.map(function(d, i) {
        return "Line" + i;
    });
    config.geometry = config.geometry.map(function(d, i) {
        return µ[d]().config({
            stroke: config.color[i]
        });
    });
    if (config.isLegendVisible) {
        config.legend = µ.legend().config({
            data: config.geometryName,
            color: config.color
        });
    }
    var polarAxis = µ.Axis().config(config);
    polarAxis();
};

µ.preset.dotPlot = function(_config) {
    if (_config && _config.size) {
        _config.width = _config.height = _config.size;
    }
    var polarPlot = µ.DotPlot();
    var scaleRandom = d3.scale.linear().domain([ -3, 3 ]).range([ 0, 1 ]);
    var config = {
        geometry: polarPlot,
        data: d3.range(0, 100).map(function(deg, index) {
            return [ ~~(scaleRandom(µ.util._rndSnd()) * 1e3), ~~(scaleRandom(µ.util._rndSnd()) * 100) ];
        }),
        height: 250,
        width: 250,
        angularDomain: [ 0, 1e3 ],
        angularTicksStep: 100,
        minorTicks: 1,
        flip: false,
        originTheta: 0,
        radialAxisTheta: -15,
        containerSelector: "body"
    };
    µ.util._extend(_config, config);
    var polarAxis = µ.Axis().config(config);
    polarAxis();
};

µ.preset.barChart = function(_config) {
    if (_config && _config.size) {
        _config.width = _config.height = _config.size;
    }
    var polarPlot = µ.BarChart();
    var config = {
        geometry: polarPlot,
        data: d3.range(0, 16).map(function(deg, index) {
            return [ deg * 50, Math.ceil(Math.random() * (index + 1) * 5) ];
        }),
        height: 250,
        width: 250,
        radialDomain: [ -60, 100 ],
        minorTicks: 1,
        flip: true,
        originTheta: 0,
        radialAxisTheta: -10,
        containerSelector: "body"
    };
    µ.util._extend(_config, config);
    var polarAxis = µ.Axis().config(config);
    polarAxis();
};

µ.preset.areaChart = function(_config) {
    if (_config && _config.size) {
        _config.width = _config.height = _config.size;
    }
    var polarPlot = µ.AreaChart();
    var config = {
        geometry: polarPlot,
        data: d3.range(0, 12).map(function(deg, index) {
            return [ deg * 50 + 50, ~~(Math.random() * 10 + 5) ];
        }),
        height: 250,
        width: 250,
        radialDomain: [ 0, 20 ],
        angularTicksCount: 4,
        ticks: [ "North", "East", "South", "West" ],
        minorTicks: 5,
        flip: true,
        originTheta: -90,
        radialAxisTheta: -30,
        radialTicksSuffix: "%",
        containerSelector: "body"
    };
    µ.util._extend(_config, config);
    var polarAxis = µ.Axis().config(config);
    polarAxis();
};

µ.preset.clock = function(_config) {
    if (_config && _config.size) {
        _config.width = _config.height = _config.size;
    }
    var polarPlot = µ.Clock();
    var config = {
        geometry: polarPlot,
        data: [ 12, 4, 8 ],
        height: 250,
        width: 250,
        angularDomain: [ 0, 12 ],
        minorTicks: 9,
        flip: true,
        originTheta: -90,
        showRadialAxis: false,
        showRadialCircle: false,
        rewriteTicks: function(d, i) {
            return d === "0" ? "12" : d;
        },
        labelOffset: -15,
        tickLength: 5,
        containerSelector: "body"
    };
    µ.util._extend(_config, config);
    var polarAxis = µ.Axis().config(config);
    polarAxis();
};