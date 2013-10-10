micropolar = {version: '0.1.1'};

micropolar.Axis = function module() {
    var config = {
        geometry: [],
        data: null,
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
        d3.select(config.containerSelector)
            .datum(config.data)
            .each(function(_data, _index) {


                // Scales
                ////////////////////////////////////////////////////////////////////

                var radius = Math.min(config.width, config.height) / 2 - config.margin;
                var extent = d3.extent(_data.map(function(d, i){ return d[1]; }));
                radialScale = d3.scale.linear()
                    .domain(config.radialDomain || extent)
                    .range([0, radius]);

                var angularExtent = d3.extent(_data.map(function(d, i){ return d[0]; }));
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

                var radialAxis = svg.select('.radial.axis');
                if(config.showRadialCircle){
                    var gridCircles = radialAxis.selectAll('circle.grid-circle')
                        .data(radialScale.ticks(5));
                    var gridCirclesEnter = gridCircles.enter().append('circle')
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
                    var radialAxis = svg.select('.radial.axis').call(axis)  
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
                    .style(lineStyle);

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
                    d.config({
                        axisConfig: config, 
                        radialScale: radialScale, 
                        angularScale: angularScale,
                        containerSelector: that
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
                svg.select('.geometry').style({'pointer-events': 'visible'});
                var guides = svg.select('.guides');
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
//TODO: make it immutable
micropolar._override = function(_objA, _objB){ for(x in _objA) if(x in _objB) _objB[x] = _objA[x]; };

micropolar._rndSnd = function(){
    return (Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1);
};
micropolar.BarChart = function module() {
    var config = {
        containerSelector: 'body',
        dotRadius: 5,
        fill: 'orange',
        stroke: 'red',
        radialScale: null,
        angularScale: null,
        axisConfig: null
    };
    var dispatch = d3.dispatch('hover');

     function exports() {
        d3.select(config.containerSelector)
            .datum(config.axisConfig.data)
            .each(function(_data, _index) {

                var markStyle = {fill: config.fill, stroke: config.stroke};
                var barW = 12;

                var geometryGroup = d3.select(this).select('svg g.geometry').classed('bar-chart', true);;
                var geometry = geometryGroup.selectAll('rect.mark')
                    .data(_data);
                geometry.enter().append('rect').attr({'class': 'mark'});
                geometry.attr({
                        x: -barW/2,
                        y: config.radialScale(0), 
                        width: barW, 
                        height: function(d, i){ 
                            // console.log(d[1], ~~config.radialScale(d[1]), config.radialScale.domain(), config.radialScale.range());
                            return config.radialScale(d[1]) - config.radialScale(0); }, 
                        transform: function(d, i){ return 'rotate('+ (config.axisConfig.originTheta - 90 + (config.angularScale(d[0]))) +')'}
                    })
                .style(markStyle);

        });
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        micropolar._override(_x, config);
        return this;
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
};
micropolar.Clock = function module() {
    var config = {
        containerSelector: 'body',
        fill: 'orange',
        stroke: 'red',
        radialScale: null,
        angularScale: null,
        axisConfig: null
    };
    var dispatch = d3.dispatch('hover');

    function exports() {
        d3.select(config.containerSelector)
            .datum(config.axisConfig.data)
            .each(function(_data, _index) {

                var triangleAngle = (360 / _data.length) * Math.PI / 180 / 2;
                var radius = config.radialScale.range()[1];
                var handsHeight = [radius / 1.3, radius / 1.5, radius / 1.5];
                var handsWidth = [radius / 15, radius / 10, radius / 30];

                _data = [0, 4, 8]; // hardocded
                config.angularScale.domain([0, 12]); // hardocded 

                var markStyle = {fill: config.fill, stroke: config.stroke};
                var geometryGroup = d3.select(this).select('svg g.geometry').classed('clock', true);;
                var geometry = geometryGroup.selectAll('rect.mark')
                    .data(_data);
                geometry.enter().append('rect').attr({'class': 'mark'});
                geometry.attr({
                    x: function(d, i){ return -handsWidth[i]/2; },
                    y: function(d, i){ return i==2 ? -radius/5 : 0 }, 
                    width: function(d, i){ return handsWidth[i]; }, 
                    height: function(d, i){ return handsHeight[i]; }, 
                    transform: function(d, i){ return 'rotate('+ (config.axisConfig.originTheta - 90 + (config.angularScale(d))) +')'}
                })
                .style(markStyle);

                geometryGroup.selectAll('circle.mark')
                    .data([0])
                    .enter().append('circle').attr({'class': 'mark'})
                    .attr({r: radius / 10}).style({'fill-opacity': 1})
                    .style(markStyle);

            });
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        micropolar._override(_x, config);
        return this;
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
};
micropolar.AreaChart = function module() {
    var config = {
        containerSelector: 'body',
        dotRadius: 5,
        fill: 'orange',
        stroke: 'red',
        radialScale: null,
        angularScale: null,
        axisConfig: null
    };
    var dispatch = d3.dispatch('hover');

    function exports() {
        d3.select(config.containerSelector)
            .datum(config.axisConfig.data)
            .each(function(_data, _index) {

                var triangleAngle = (360 / _data.length) * Math.PI / 180 / 2;
                var markStyle = {fill: config.fill, stroke: config.stroke};
                var geometryGroup = d3.select(this).select('svg g.geometry').classed('area-chart', true);;
                var geometry = geometryGroup.selectAll('path.mark')
                    .data(_data);
                geometry.enter().append('path').attr({'class': 'mark'});
                geometry.attr({
                    d: function(d, i){ 
                        var h = config.radialScale(d[1]); 
                        var baseW = Math.tan(triangleAngle) * h;
                        return 'M'+[[0, 0], [h, baseW], [h, -baseW]].join('L')+'Z' },
                    transform: function(d, i){ return 'rotate('+ (config.axisConfig.originTheta - 90 + (config.angularScale(i))) +')'}
                    // transform: function(d, i){ return 'rotate('+ (axisConfig.originTheta - 90 + (angularScale(d[0]))) +')'}
                })
                .style(markStyle);

        });
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        micropolar._override(_x, config);
        return this;
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
};
micropolar.DotPlot = function module() {
    var config = {
        containerSelector: 'body',
        dotRadius: 3,
        fill: 'orange',
        stroke: 'red',
        radialScale: null,
        angularScale: null,
        axisConfig: null
    };
    var dispatch = d3.dispatch('hover');

    function exports() {
        d3.select(config.containerSelector)
            .datum(config.axisConfig.data)
            .each(function(_data, _index) {

                var markStyle = {fill: config.fill, stroke: config.stroke};
                var geometryGroup = d3.select(this).select('svg g.geometry').classed('dot-plot', true);;
                var geometry = geometryGroup.selectAll('circle.mark')
                    .data(_data);
                geometry.enter().append('circle').attr({'class': 'mark'});
                geometry.attr({
                    cy: function(d, i){ return config.radialScale(d[1]); }, 
                    r: config.dotRadius, 
                    transform: function(d, i){ return 'rotate('+ (config.axisConfig.originTheta - 90 + (config.angularScale(d[0]))) +')'}
                })
                .style(markStyle);

        });
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        micropolar._override(_x, config);
        return this;
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
};
micropolar.LinePlot = function module() {
    var config = {
        containerSelector: 'body',
        lineStrokeSize: 2,
        stroke: 'orange',
        radialScale: null,
        angularScale: null,
        axisConfig: null
    };
    var dispatch = d3.dispatch('hover');

    function exports() {
        d3.select(config.containerSelector)
            .datum(config.axisConfig.data)
            .each(function(_data, _index) {

                var line = d3.svg.line.radial()
                    .radius(function(d) { return config.radialScale(d[1]); })
                    .angle(function(d) { return config.angularScale(d[0]) * Math.PI / 180 * (config.axisConfig.flip?1:-1); });

                var markStyle = {fill: 'none', 'stroke-width': config.lineStrokeSize, stroke: config.stroke, 'pointer-events': 'stroke'};
                var geometryGroup = d3.select(this).select('svg g.geometry').classed('line-plot', true);
                var geometry = geometryGroup.selectAll('path.mark')
                    .data([0]);
                geometry.enter().append('path').attr({'class': 'mark'});

                geometryGroup.select('path.mark')
                    .datum(_data)
                    .attr({
                        d: line, 
                        transform: 'rotate('+(config.axisConfig.originTheta + 90)+')',
                        'stroke-width': config.lineStrokeSize + 'px'
                })
                .style(markStyle);

        });
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        micropolar._override(_x, config);
        return this;
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
};
function linePlot(_config){

    if(_config && _config.size){
        _config.width = _config.height = _config.size;
    }

    var polarPlot = micropolar.LinePlot();

    var config = {
        geometry: [polarPlot],
        data: d3.range(0, 721, 1).map(function(deg, index){ return [deg, index/720*2]; }),
        height: 250, 
        width: 250, 
        angularDomain: [0, 360],
        additionalAngularEndTick: false,
        angularTicksStep: 30,
        angularTicksSuffix: 'º',
        minorTicks: 1,
        flip: false,
        originTheta: 0,
        radialAxisTheta: -30,
        containerSelector: 'body'
    };

    micropolar._override(_config, config);

    var polarAxis = micropolar.Axis().config(config);
    polarAxis();
}

function dotPlot(_config){

    if(_config && _config.size){
        _config.width = _config.height = _config.size;
    }

    var polarPlot = micropolar.DotPlot();

    var scaleRandom = d3.scale.linear().domain([-3, 3]).range([0, 1]);
    var config = {
        geometry: [polarPlot],
        data: d3.range(0, 100).map(function(deg, index){ 
            return [~~(scaleRandom(micropolar._rndSnd()) * 1000), ~~(scaleRandom(micropolar._rndSnd()) * 100)]; 
        }),
        height: 250, 
        width: 250, 
        angularDomain: [0, 1000],
        additionalAngularEndTick: false,
        angularTicksStep: 100,
        minorTicks: 1,
        flip: false,
        originTheta: 0,
        radialAxisTheta: -15,
        containerSelector: 'body'
    };

    micropolar._override(_config, config);

    var polarAxis = micropolar.Axis().config(config);
    polarAxis();
}

function barChart(_config){

    if(_config && _config.size){
        _config.width = _config.height = _config.size;
    }

    var polarPlot = micropolar.BarChart();

    var scaleRandom = d3.scale.linear().domain([-3, 3]).range([0, 1]);
    var config = {
        geometry: [polarPlot],
        data: d3.range(0, 20).map(function(deg, index){
          return [deg * 50, Math.ceil(Math.random() * (index+1) * 5)];
        }),
        height: 250, 
        width: 250, 
        radialDomain: [-60, 100], 
        angularDomain: [0, 1000],
        angularTicksStep: 50,
        minorTicks: 1,
        flip: true,
        originTheta: 0,
        radialAxisTheta: -10,
        containerSelector: 'body'
    };

    micropolar._override(_config, config);

    var polarAxis = micropolar.Axis().config(config);
    polarAxis();
}

function areaChart(_config){

	if(_config && _config.size){
        _config.width = _config.height = _config.size;
    }

    var polarPlot = micropolar.AreaChart();

    var scaleRandom = d3.scale.linear().domain([-3, 3]).range([0, 1]);
    var config = {
        geometry: [polarPlot],
        data: d3.range(0, 12).map(function(deg, index){
          return [deg * 50 + 50, ~~(Math.random() * 10 + 5)];
        }),
        height: 250, 
        width: 250, 
        radialDomain: [0, 20], 
        angularDomain: ['North', 'East', 'South', 'West'], 
        additionalAngularEndTick: false,
        minorTicks: 2,
        flip: true,
        originTheta: -90,
        radialAxisTheta: -30,
        radialTicksSuffix: '%',
        containerSelector: 'body'
    };

    micropolar._override(_config, config);

    var polarAxis = micropolar.Axis().config(config);
    polarAxis();
}

function clock(_config){

	if(_config && _config.size){
        _config.width = _config.height = _config.size;
    }

    var polarPlot = micropolar.Clock();

    var scaleRandom = d3.scale.linear().domain([-3, 3]).range([0, 1]);
    var config = {
        geometry: [polarPlot],
        data: [12, 4, 8],
        height: 250, 
        width: 250, 
        angularDomain: [0, 12],
        additionalAngularEndTick: false,
        minorTicks: 9,
        flip: true,
        originTheta: -90,
        showRadialAxis: false,
        showRadialCircle: false,
        rewriteTicks: function(d, i){ return (d === '0')? '12': d; },
        labelOffset: -15,
        tickLength: 5,
        containerSelector: 'body'
    };

    micropolar._override(_config, config);

    var polarAxis = micropolar.Axis().config(config);
    polarAxis();
}


micropolar.preset = {
    linePlot: linePlot,
    dotPlot: dotPlot,
    barChart: barChart,
    areaChart: areaChart,
    clock: clock
 };
