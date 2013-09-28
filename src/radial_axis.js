micropolar = {};
micropolar.chart = {};

micropolar.chart.RadialAxis = function module() {
    var config = {
        height: 500,
        width: 500,
        radialDomain: null,
        angularDomain: [0, 360],
        flip: true,
        originTheta: 0,
        labelOffset: 6,
        radialAxisTheta: -45,
        radialTicksSuffix: '',
        angularTicksSuffix: '',
        hideFirstTick: true,
        angularTicks: null,
        showRadialAxis: true,
        showRadialCircle: true,
        minorTicks: 0,
        tickLength: null,
        rewriteTicks: null,
        tickOrientation: 'angular', // 'radial', 'angular', 'horizontal'
        containerSelector: 'body',
        margin: 10
    };
    var dispatch = d3.dispatch('hover');

    function exports(_datum) {
        d3.select(config.containerSelector)
            .datum(_datum)
            .each(function(_data, _index) {

                var radius = Math.min(config.width, config.height) / 2 - config.margin;
                var extent = d3.extent(_data.map(function(d, i){ return d[1]; }));
                radialScale = d3.scale.linear()
                    .domain(config.radialDomain || extent)
                    .range([0, radius]);

                var angularScaleIsOrdinal = typeof config.angularDomain[0] == 'string';
                var angularDomain = config.angularDomain;
                if(!angularScaleIsOrdinal){
                    if(!angularDomain[2]) angularDomain[2] = 1;
                    angularDomain[2] /= (config.minorTicks + 1);
                }
                else{
                    angularDomain = [0, angularDomain.length * (config.minorTicks + 1)];
                }
                var angularAxisRange = d3.range.apply(this, angularDomain);
                // Workaround for rounding errors
                if(!angularScaleIsOrdinal) angularAxisRange = angularAxisRange.map(function(d, i){ return parseFloat(d.toPrecision(12)) });

                angularScale = d3.scale.linear()
                    .domain(angularDomain.slice(0, 2))
                    .range(config.flip? [0, 360] : [360, 0]);

                var skeleton = '<svg class="chart"> \
                        <g class="chart-group"> \
                            <circle class="background-circle"></circle> \
                            <g class="angular axis"></g> \
                           <g class="geometry"></g> \
                           <g class="radial axis"> \
                                <circle class="outside-circle"></circle> \
                            </g> \
                            <g class="guides"><line></line><circle></circle></g> \
                        </g> \
                    </svg>';

                var container = d3.select(this)
                    .selectAll('div.chart-container')
                    .data([0]);
                container.enter()
                    .append('div')
                    .classed('chart-container', true)
                    .html(skeleton);
                
                var svg = container.select('svg');
                svg.attr({width: config.width, height: config.height})
                    .style({'pointer-events': 'none'});

                var chartGroup = svg.select('.chart-group')
                    .attr('transform', 'translate(' + config.width / 2 + ',' + config.height / 2 + ')');

                var radialAxis = svg.select('.radial.axis');
                if(config.showRadialCircle){
                    var gridCircles = radialAxis.selectAll('circle.grid-circle')
                        .data(radialScale.ticks(5));
                    var gridCirclesEnter = gridCircles.enter().append('circle')
                        .attr({'class': 'grid-circle'});
                    gridCircles.attr('r', radialScale);
                    gridCircles.exit().remove();
                }

                radialAxis.select('circle.outside-circle').attr({r: radius});
                svg.select('circle.background-circle').attr({r: radius}).style({'fill': 'white'});

                if(config.showRadialAxis){
                    var axis = d3.svg.axis()
                        .scale(radialScale)
                        .ticks(5)
                    var radialAxis = svg.select('.radial.axis').call(axis)  
                        .attr({transform: 'rotate('+ (config.radialAxisTheta) +')'});
                    radialAxis.selectAll('.domain').style({fill: 'none', stroke: 'black'});
                    radialAxis.selectAll('.tick.major text').text(function(d, i){ return this.textContent + config.radialTicksSuffix; });
                }

                var currentAngle = function(d, i){ return (angularScale(angularScaleIsOrdinal? i : d) + config.originTheta) % 360; };
                var angularAxis = svg.select('.angular.axis')
                  .selectAll('g.angular-tick')
                    .data(angularAxisRange);
                var angularAxisEnter = angularAxis.enter().append('g')
                    .attr({
                        'class': 'angular-tick',
                        transform: function(d, i) { return 'rotate(' + currentAngle(d, i) + ')'; } 
                    });
                angularAxis.exit().remove();

                angularAxisEnter.append('line')
                    .attr({'class': 'grid-line'})
                    .classed('major', function(d, i){ return (i % (config.minorTicks+1) == 0) })
                    .classed('minor', function(d, i){ return !(i % (config.minorTicks+1) == 0) })

                angularAxisEnter.append('text')
                    .attr({'class': 'axis-text'})

                svg.selectAll('line.grid-line')
                    .attr({
                        x1: config.tickLength ? radius - config.tickLength : 0,
                        x2: radius
                    });

                var ticks = svg.selectAll('text.axis-text')
                    .attr({
                        x: radius + config.labelOffset,
                        dy: '.35em',
                        transform: function(d, i) { 
                            var angle = currentAngle(d, i);
                            var rad = radius + config.labelOffset;
                            var orient = config.tickOrientation;
                            if(orient == 'horizontal') return 'rotate(' + (-angle) + ' ' + rad + ' 0)';
                            else if(orient == 'radial') return (angle < 270 && angle > 90) ? 'rotate(180 ' + rad + ' 0)' : null;
                            else return 'rotate('+ ((angle <= 180 && angle > 0) ? -90 : 90) +' ' + rad + ' 0)';
                        }
                    })
                    .style({'text-anchor': 'middle' })
                    .text(function(d, i) { 
                        if(angularScaleIsOrdinal) return (i % (config.minorTicks + 1) == 0)? config.angularDomain[i / (config.minorTicks+1)] + config.angularTicksSuffix : '';
                        else return (i % (config.minorTicks + 1) == 0)? d + config.angularTicksSuffix : '';
                    });

                if (config.rewriteTicks) ticks.text(function(d, i){ return config.rewriteTicks(this.textContent, i); })

                svg.select('.geometry').style({'pointer-events': 'all'});
                var guides = svg.select('.guides');
                chartGroup.on('mousemove.angular-guide', function(d, i){ 
                        var mousePos = d3.mouse(svg.node());
                        var mouseX = mousePos[0] - radius - config.margin;
                        var mouseY = mousePos[1] - radius - config.margin;
                        var mouseAngle = (Math.atan2(mouseY, mouseX) + Math.PI) / Math.PI * 180;
                        guides.select('line')
                            .attr({x1: 0, y1: 0, x2: -radius, y2: 0, transform: 'rotate('+mouseAngle+')'})
                            .style({stroke: 'grey', opacity: 1});
                     })
                    .on('mouseout.angular-guide', function(d, i){ guides.select('line').style({opacity: 0}); });

                chartGroup.on('mousemove.radial-guide', function(d, i){ 
                        var mousePos = d3.mouse(svg.node());
                        var mouseX = mousePos[0] - radius - config.margin;
                        var mouseY = mousePos[1] - radius - config.margin;
                        var r = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
                        guides.select('circle')
                            .attr({r: r})
                            .style({stroke: 'grey', fill: 'none', opacity: 1});
                     })
                    .on('mouseout.radial-guide', function(d, i){ 
                        guides.select('circle').style({opacity: 0}); 
                    });

            });
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        micropolar._override(_x, config);
        return this;
    };
    exports.radialScale = function(_x){  
        return radialScale;
    };
    exports.angularScale = function(_x){  
        return angularScale;
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
}