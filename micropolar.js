micropolar = {version: '0.1.0'};
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

micropolar.chart.CircularBarChart = function module() {
    var config = {
        dotRadius: 5,
        axis: null,
        containerSelector: 'body'
    };
    var dispatch = d3.dispatch('hover');

     function exports(_datum) {
        d3.select(config.containerSelector)
            .datum(_datum)
            .each(function(_data, _index) {

                config.axis.config({container: this})
                config.axis(_datum);

                radialScale = config.axis.radialScale();
                angularScale = config.axis.angularScale();
                axisConfig = config.axis.config();
            
                var geometryGroup = d3.select(this).select('svg g.geometry');

                var barW = 12;
                var geometry = geometryGroup.selectAll('rect.mark')
                    .data(_data);
                geometry.enter().append('rect').attr({'class': 'mark'});
                geometry.attr({
                        x: -barW/2,
                        y: radialScale(0), 
                        width: barW, 
                        height: function(d, i){ return radialScale(d[1]); }, 
                        transform: function(d, i){ return 'rotate('+ (axisConfig.originTheta - 90 + (angularScale(d[0]))) +')'}
                    });

        });
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        micropolar._override(_x, config);
        return this;
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
}

micropolar.chart.Clock = function module() {
    var config = {
        axis: null,
        containerSelector: 'body'
    };
    var dispatch = d3.dispatch('hover');

    function exports(_datum) {

        d3.select(config.containerSelector)
            .datum(_datum)
            .each(function(_data, _index) {

                config.axis.config({containerSelector: this})
                config.axis(_datum);

                radialScale = config.axis.radialScale();
                angularScale = config.axis.angularScale();
                axisConfig = config.axis.config();

                var triangleAngle = (360 / _data.length) * Math.PI / 180 / 2;
                var radius = radialScale.range()[1];
                var handsHeight = [radius / 1.3, radius / 1.5, radius / 1.5];
                var handsWidth = [radius / 15, radius / 10, radius / 30];
                
                var svg = d3.select(this).select('svg').classed('clock', true);
                var geometryGroup =svg.select('g.geometry');

                var geometry = geometryGroup.selectAll('rect.mark')
                    .data(_data);
                geometry.enter().append('rect').attr({'class': 'mark'});
                geometry.attr({
                    x: function(d, i){ return -handsWidth[i]/2; },
                    y: function(d, i){ return i==2 ? -radius/5 : 0 }, 
                    width: function(d, i){ return handsWidth[i]; }, 
                    height: function(d, i){ return handsHeight[i]; }, 
                    transform: function(d, i){ return 'rotate('+ (axisConfig.originTheta - 90 + (angularScale(d))) +')'}
                })

                geometryGroup.selectAll('circle.mark')
                    .data([0])
                    .enter().append('circle').attr({'class': 'mark'}).attr({r: radius / 10}).style({'fill-opacity': 1});

            });
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        micropolar._override(_x, config);
        return this;
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
}

micropolar.chart.PolarAreaChart = function module() {
    var config = {
        dotRadius: 5,
        axis: null,
        containerSelector: 'body'
    };
    var dispatch = d3.dispatch('hover');

    function exports(_datum) {

        d3.select(config.containerSelector)
            .datum(_datum)
            .each(function(_data, _index) {

                config.axis.config({containerSelector: this})
                config.axis(_datum);

                radialScale = config.axis.radialScale();
                angularScale = config.axis.angularScale();
                axisConfig = config.axis.config();

                var triangleAngle = (360 / _data.length) * Math.PI / 180 / 2;
                
                var geometryGroup = d3.select(this).select('svg g.geometry');

                var geometry = geometryGroup.selectAll('path.mark')
                    .data(_data);
                geometry.enter().append('path').attr({'class': 'mark'});
                geometry.attr({
                    d: function(d, i){ 
                        var h = radialScale(d[1]); 
                        var baseW = Math.tan(triangleAngle) * h;
                        return 'M'+[[0, 0], [h, baseW], [h, -baseW]].join('L')+'Z' },
                    transform: function(d, i){ return 'rotate('+ (axisConfig.originTheta  + (angularScale(i))) +')'}
                    // transform: function(d, i){ return 'rotate('+ (axisConfig.originTheta - 90 + (angularScale(d[0]))) +')'}
                })

        });
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        micropolar._override(_x, config);
        return this;
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
}

micropolar.chart.RadialDotPlot = function module() {
    var config = {
        dotRadius: 5,
        axis: null,
        containerSelector: 'body'
    };
    var dispatch = d3.dispatch('hover');

    function exports(_datum) {
        d3.select(config.containerSelector)
            .datum(_datum)
            .each(function(_data, _index) {

                config.axis.config({container: this})
                config.axis(_datum);

                radialScale = config.axis.radialScale();
                angularScale = config.axis.angularScale();
                axisConfig = config.axis.config();

                var geometryGroup = d3.select(this).select('svg g.geometry');

                var geometry = geometryGroup.selectAll('circle.mark')
                    .data(_data);
                geometry.enter().append('circle').attr({'class': 'mark'});
                geometry.attr({
                        cy: function(d, i){ return radialScale(d[1]); }, 
                        r: config.dotRadius, 
                        transform: function(d, i){ return 'rotate('+ (axisConfig.originTheta - 90 + (angularScale(d[0]))) +')'}
                    });

        });
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        micropolar._override(_x, config);
        return this;
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
}

micropolar.chart.RadialLinePlot = function module() {
    var config = {
        lineStrokeSize: 1,
        axis: null,
        containerSelector: 'body'
    };
    var dispatch = d3.dispatch('hover');

    function exports(_datum) {
        d3.select(config.containerSelector)
            .datum(_datum)
            .each(function(_data, _index) {

                config.axis.config({containerSelector: this})
                config.axis(_datum);

                radialScale = config.axis.radialScale();
                angularScale = config.axis.angularScale();
                axisConfig = config.axis.config();

                var line = d3.svg.line.radial()
                    .radius(function(d) { return radialScale(d[1]); })
                    .angle(function(d) { return d[0] * Math.PI / 180 * (axisConfig.flip?1:-1); });
                
                var geometryGroup = d3.select(this).select('svg g.geometry').classed('polar-area', true);

                var geometry = geometryGroup.selectAll('path.mark')
                    .data([0]);
                geometry.enter().append('path').attr({'class': 'mark'});

                geometryGroup.select('path.mark')
                    .datum(_data)
                    .attr({
                        d: line, 
                        transform: 'rotate('+(axisConfig.originTheta + 90)+')',
                        'stroke-width': config.lineStrokeSize + 'px'
                });

        });
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        micropolar._override(_x, config);
        return this;
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
}

//TODO: make it immutable
micropolar._override = function(_objA, _objB){ for(x in _objA) if(x in _objB) _objB[x] = _objA[x]; };

micropolar._rndSnd = function(){
    return (Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1);
}

function linePlot(_config){

    if(_config && _config.size){
        _config.width = _config.size;
        _config.height = _config.size;
    }

    var config = {
        data: d3.range(0, 721, 1).map(function(deg, index){ return [deg, index/720*2]; }),
        height: 250, 
        width: 300, 
        angularDomain: [0, 360, 45], 
        flip: false,
        originTheta: 0,
        radialAxisTheta: -30,
        angularTicksSuffix: 'º',
        containerSelector: 'body'
    };

    micropolar._override(_config, config);

    var radialAxis = micropolar.chart.RadialAxis().config(config);

    var radialLinePlot = micropolar.chart.RadialLinePlot()
        .config({
            axis: radialAxis, 
            containerSelector: config.containerSelector // TODO: grab it from the axis by default
        });
    radialLinePlot(config.data);
}

function dotPlot(_config){

    if(_config && _config.size){
        _config.width = _config.size;
        _config.height = _config.size;
    }

    var scaleRandom = d3.scale.linear().domain([-3, 3]).range([0, 1]);
    var config = {
        data: d3.range(0, 100).map(function(deg, index){ 
            return [~~(scaleRandom(micropolar._rndSnd()) * 1000), ~~(scaleRandom(micropolar._rndSnd()) * 100)]; 
        }),
        height: 250, width: 250, 
        angularDomain: [0, 1000, 50], 
        flip: false,
        originTheta: 0,
        radialAxisTheta: 0,
        minorTicks: 1,
        containerSelector: 'body'
    };

    micropolar._override(_config, config);

    var radialAxis = micropolar.chart.RadialAxis().config(config);

    var radialDotPlot = micropolar.chart.RadialDotPlot()
        .config({
            axis: radialAxis, 
            containerSelector: config.containerSelector, 
            dotRadius: 3
        });
    radialDotPlot(config.data);
}

function barChart(_config){

    if(_config && _config.size){
        _config.width = _config.size;
        _config.height = _config.size;
    }

    var config = {
        data: d3.range(0, 20).map(function(deg, index){
          return [deg * 50 + 50, ~~(Math.random() * index * 5 - 15)];
        }),
        height: 250, width: 250, 
        radialDomain: [-40, 100], 
        angularDomain: [0, 1000, 50], 
        flip: true,
        originTheta: 0,
        radialAxisTheta: 0,
        containerSelector: 'body'
    };

    micropolar._override(_config, config);

    var radialAxis = micropolar.chart.RadialAxis().config(config);

    var circularBarChart = micropolar.chart.CircularBarChart()
        .config({
            axis: radialAxis, 
            containerSelector: config.containerSelector
        });
    circularBarChart(config.data);
}

function areaChart(_config){

    var config = {
        data: d3.range(0, 12).map(function(deg, index){
          return [deg * 50 + 50, ~~(Math.random() * 10 + 5)];
        }),
        height: 250, width: 250, 
        radialDomain: [0, 20], 
        angularDomain: ['North', 'East', 'South', 'West'], 
        flip: true,
        originTheta: -90,
        radialAxisTheta: -30,
        minorTicks: 2,
        radialTicksSuffix: '%',
        containerSelector: 'body'
    };

    micropolar._override(_config, config);

    var radialAxis = micropolar.chart.RadialAxis().config(config);

    var polarAreaChart = micropolar.chart.PolarAreaChart()
        .config({
            axis: radialAxis, 
            containerSelector: config.containerSelector
        });
    polarAreaChart(config.data);
}

function clock(_config){

    var config = {
        data: [0, 4, 8],
        height: 250, width: 250, 
        labelOffset: -15,
        angularDomain: [0, 12], 
        flip: true,
        originTheta: -90,
        radialAxisTheta: -30,
        minorTicks: 9,
        showRadialAxis: false,
        showRadialCircle: false,
        rewriteTicks: function(d, i){ return (d === '0')? '12': d; },
        tickOrientation: 'horizontal',
        tickLength: 5,
        containerSelector: 'body'
    };

    micropolar._override(_config, config);

    var radialAxis = micropolar.chart.RadialAxis().config(config);

    var clock = micropolar.chart.Clock().config({axis: radialAxis, containerSelector: config.containerSelector});
    clock(config.data);
}

micropolar.factory = {
    linePlot: linePlot,
    dotPlot: dotPlot,
    barChart: barChart,
    areaChart: areaChart,
    clock: clock
 };