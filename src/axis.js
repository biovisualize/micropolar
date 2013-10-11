micropolar = {version: '0.1.0'};

/*
TODO:
-better evaluation of number of radial and angular ticks
-move hover guides to a plugin
*/

micropolar.Axis = function module() {
    var config = {
        geometry: [],
        data: [],
        height: 500,
        width: 500,
        radialDomain: null,
        angularDomain: null,
        angularTicksStep: 1,
        flip: true,
        originTheta: 0,
        labelOffset: 10,
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
        angularTickOrientation: 'horizontal', // 'radial', 'angular', 'horizontal'
        radialTickOrientation: 'horizontal', // 'angular', 'horizontal'
        containerSelector: 'body',
        margin: 25,
        additionalAngularEndTick: true
    };
    var dispatch = d3.dispatch('hover'),
    	radialScale, angularScale;

    function exports(){

        var container = config.containerSelector;
        if (typeof container == 'string') container = d3.select(container);
        container.datum(config.data)
            .each(function(_data, _index) {


                // Scales
                ////////////////////////////////////////////////////////////////////

                if(typeof config.geometry != 'object') config.geometry = [config.geometry];
                if(typeof _data[0][0] != 'object') _data = [_data];

                var radius = Math.min(config.width, config.height) / 2 - config.margin;
                var extent = d3.extent(_data[0].map(function(d, i){ return d[1]; }));
                radialScale = d3.scale.linear()
                    .domain(config.radialDomain || extent)
                    .range([0, radius]);

                var angularExtent = d3.extent(_data[0].map(function(d, i){ return d[0]; }));
               	var angularDomain = config.angularDomain || angularExtent;
               	var angularScaleIsOrdinal = typeof angularDomain[0] == 'string';
                if(!angularScaleIsOrdinal){
                    if(!angularDomain[2]) angularDomain[2] = config.angularTicksStep;
                    angularDomain[2] /= (config.minorTicks + 1);
                }
                else angularDomain = [0, angularDomain.length * (config.minorTicks + 1)];
                if(config.additionalAngularEndTick) angularDomain[1] += 1;
                var angularAxisRange = d3.range.apply(this, angularDomain);
                // Workaround for rounding errors
                if(!angularScaleIsOrdinal) angularAxisRange = angularAxisRange.map(function(d, i){ return parseFloat(d.toPrecision(12)) });

                angularScale = d3.scale.linear()
                    .domain(angularDomain.slice(0, 2))
                    .range(config.flip? [0, 360] : [360, 0]);


                // CHart skeleton
                ////////////////////////////////////////////////////////////////////

                var skeleton = '<svg class="chart-root"> \
                        <g class="chart-group"> \
                            <circle class="background-circle"></circle> \
                            <g class="angular axis-group"></g> \
                           <g class="geometry-group"></g> \
                           <g class="radial axis-group"> \
                                <circle class="outside-circle"></circle> \
                            </g> \
                            <g class="guides-group"><line></line><circle></circle></g> \
                        </g> \
                    </svg>';

                var lineStyle = {fill: 'none', stroke: 'silver'};
                var fontStyle = {'font-size': 11, 'font-family': 'Tahoma, sans-serif'};

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


                // Radial axis
                ////////////////////////////////////////////////////////////////////

                var radialAxis = svg.select('.radial.axis-group');
                if(config.showRadialCircle){
                    var gridCircles = radialAxis.selectAll('circle.grid-circle')
                        .data(radialScale.ticks(5));
                    gridCircles.enter().append('circle')
                        .attr({'class': 'grid-circle'})
                        .style(lineStyle);
                    gridCircles.attr('r', radialScale);
                    gridCircles.exit().remove();
                }

                radialAxis.select('circle.outside-circle').attr({r: radius}).style(lineStyle);
                svg.select('circle.background-circle').attr({r: radius}).style(lineStyle);

                var currentAngle = function(d, i){ return (angularScale(angularScaleIsOrdinal? i : d) + config.originTheta) % 360; };

                if(config.showRadialAxis){
                    var axis = d3.svg.axis()
                        .scale(radialScale)
                        .ticks(5)
                        .tickSize(5);
                    var radialAxis = svg.select('.radial.axis-group').call(axis)  
                        .attr({transform: 'rotate('+ (config.radialAxisTheta) +')'});
                    radialAxis.selectAll('.domain').style(lineStyle);
                    radialAxis.selectAll('g>text')
                        .text(function(d, i){ return this.textContent + config.radialTicksSuffix; })
                    	.style(fontStyle)
                        .style({
                            'text-anchor': 'start'
                        })
                    	.attr({
                            x: 0,
                            y: 0,
                            dx: 0,
                            dy: 0,
                    		transform: function(d, i){ 
                                if(config.radialTickOrientation === 'horizontal') return 'rotate(' + (-config.radialAxisTheta) + ') translate(' + [0, fontStyle['font-size']] + ')';
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
                    .attr({
                        'class': 'angular-tick',
                        transform: function(d, i) { return 'rotate(' + currentAngle(d, i) + ')'; } 
                    });
                angularAxis.exit().remove();

                angularAxisEnter.append('line')
                    .attr({'class': 'grid-line'})
                    .classed('major', function(d, i){ return (i % (config.minorTicks+1) == 0) })
                    .classed('minor', function(d, i){ return !(i % (config.minorTicks+1) == 0) })
                    .style(lineStyle);
                angularAxisEnter.selectAll('.minor').style({stroke: '#eee'})

                angularAxisEnter.append('text')
                    .attr({'class': 'axis-text'})
                    .style(fontStyle);

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
                            var orient = config.angularTickOrientation;
                            if(orient == 'horizontal') return 'rotate(' + (-angle) + ' ' + rad + ' 0)';
                            else if(orient == 'radial') return (angle < 270 && angle > 90) ? 'rotate(180 ' + rad + ' 0)' : null;
                            else return 'rotate('+ ((angle <= 180 && angle > 0) ? -90 : 90) +' ' + rad + ' 0)';
                        }
                    })
                    .style({'text-anchor': 'middle' })
                    .text(function(d, i) { 
                        if(angularScaleIsOrdinal) return (i % (config.minorTicks + 1) == 0)? config.angularDomain[i / (config.minorTicks+1)] + config.angularTicksSuffix : '';
                        else return (i % (config.minorTicks + 1) == 0)? d + config.angularTicksSuffix : '';
                    })
                    .style(fontStyle);

                if (config.rewriteTicks) ticks.text(function(d, i){ return config.rewriteTicks(this.textContent, i); })


                // Geometry
                ////////////////////////////////////////////////////////////////////

                var that = this;
                config.geometry.forEach(function(d, i){ 
                    var groupClass = 'geometry' + i;
                    var geometryContainer = d3.select(that).select('svg g.geometry-group')
                        .selectAll('g.' + groupClass)
                        .data([0])
                        .enter().append('g')
                        .classed(groupClass, true);
                    d.config({
                        data: _data[i],
                        axisConfig: config, 
                        radialScale: radialScale, 
                        angularScale: angularScale,
                        containerSelector: geometryContainer
                    })();
                });


                // Hover guides
                ////////////////////////////////////////////////////////////////////

                //TODO: get this out
                function getMousePos(){ 
            		var mousePos = d3.mouse(svg.node());
                    var mouseX = mousePos[0] - config.width / 2;
                    var mouseY = mousePos[1] - config.height / 2;
                    var mouseAngle = (Math.atan2(mouseY, mouseX) + Math.PI) / Math.PI * 180;
                    var r = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
                	return {angle: mouseAngle, radius: r}; 
                }
                svg.select('.geometry-group g').style({'pointer-events': 'visible'});
                var guides = svg.select('.guides-group');
                chartGroup.on('mousemove.angular-guide', function(d, i){ 
                        var mouseAngle = getMousePos().angle;
                        guides.select('line')
                            .attr({x1: 0, y1: 0, x2: -radius, y2: 0, transform: 'rotate('+mouseAngle+')'})
                            .style({stroke: 'grey', opacity: 1});
                     })
                    .on('mouseout.angular-guide', function(d, i){ guides.select('line').style({opacity: 0}); });

                chartGroup.on('mousemove.radial-guide', function(d, i){
                        var r = getMousePos().radius;
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
};
