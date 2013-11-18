var micropolar = {version: '0.1.1'};
var µ = micropolar;

µ.Axis = function module() {
    var config = {
        geometry: [],
        data: [[0, 0], [0, 0]],
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
        radialTicksSuffix: '',
        angularTicksSuffix: '',
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
        backgroundColor: 'none'
    };
    var svg, dispatch = d3.dispatch('hover'),
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
                var extent = d3.extent(d3.merge(_data).map(function(d, i){ return d[1]; }));
                radialScale = d3.scale.linear()
                    .domain(config.radialDomain || extent)
                    .range([0, radius]);

                var angularExtent = d3.extent(_data[0].map(function(d, i){ return d[0]; }));
               	var angularDomain = config.angularDomain || angularExtent;
                var angularTicksStep = config.angularTicksStep || (angularDomain[1] - angularDomain[0]) / config.angularTicksCount;
                if(!angularDomain[2]) angularDomain[2] = angularTicksStep;
                angularDomain[2] /= (config.minorTicks + 1);

                var angularAxisRange = d3.range.apply(this, angularDomain);
                // Workaround for rounding errors
                angularAxisRange = angularAxisRange.map(function(d, i){ return parseFloat(d.toPrecision(12)) });

                angularScale = d3.scale.linear()
                    .domain(angularDomain.slice(0, 2))
                    .range(config.flip? [0, 360] : [360, 0]);


                // Chart skeleton
                ////////////////////////////////////////////////////////////////////

                var skeleton = '<svg xmlns="http://www.w3.org/2000/svg" class="chart-root"> \
                        <g class="chart-group"> \
                            <circle class="background-circle"></circle> \
                            <g class="angular axis-group"></g> \
                           <g class="geometry-group"></g> \
                           <g class="radial axis-group"> \
                                <circle class="outside-circle"></circle> \
                            </g> \
                            <g class="guides-group"><line></line><circle></circle></g> \
                        </g> \
                        <g class="legend-group"> </g> \
                    </svg>';

                if(typeof svg === 'undefined'){
                    var doc = new DOMParser().parseFromString(skeleton, 'application/xml');
                    this.appendChild(this.ownerDocument.importNode(doc.documentElement, true));
                    svg = d3.select(this).select('svg');
                }


                var lineStyle = {fill: 'none', stroke: 'silver'};
                var fontStyle = {'font-size': 11, 'font-family': 'Tahoma, sans-serif'};

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
                svg.select('circle.background-circle').attr({r: radius})
                    .style({fill: config.backgroundColor, stroke: lineStyle.stroke});

                var currentAngle = function(d, i){ return (angularScale(d) + config.originTheta) % 360; };

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
                        'class': 'angular-tick'
                    });
                angularAxis.attr({
                    transform: function(d, i) { return 'rotate(' + currentAngle(d, i) + ')'; }
                });
                angularAxis.exit().remove();

                angularAxisEnter.append('line')
                    .attr({'class': 'grid-line'})
                    .classed('major', function(d, i){ return (i % (config.minorTicks+1) == 0) })
                    .classed('minor', function(d, i){ return !(i % (config.minorTicks+1) == 0) })
                    .style(lineStyle);
                angularAxisEnter.selectAll  ('.minor').style({stroke: '#eee'});
                angularAxis.select('line.grid-line')
                    .attr({
                        x1: config.tickLength ? radius - config.tickLength : 0,
                        x2: radius
                    });

                angularAxisEnter.append('text')
                    .attr({'class': 'axis-text'})
                    .style(fontStyle);
                var ticks = angularAxis.select('text.axis-text')
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
                        if(i % (config.minorTicks + 1) != 0) return '';
                        if(config.ticks) return config.ticks[i / (config.minorTicks + 1)] + config.angularTicksSuffix;
                        else return d + config.angularTicksSuffix;
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


                // Legend and title
                ////////////////////////////////////////////////////////////////////

                if(config.legend){
                    var legendContainer = d3.select(this).select('.legend-group')
                        .attr({transform: 'translate(' + config.width + ', 0)'});
                    config.legend.config({containerSelector: legendContainer})();
                    var legendWidth = legendContainer.node().getBBox().width;
                    svg.attr({width: config.width + legendWidth});
                }

                if(config.title){
                    var title = svg.append('text').classed('title', true)
                        .attr({x: 100, y: 100})
                        .style({'font-size': 18})
                        .text(config.title);
                    var titleBBox = title.node().getBBox();
                    title.attr({x: config.width / 2 - titleBBox.width / 2, y: titleBBox.height});
                    //offset svg y + height
                    svg.attr({height: config.height + titleBBox.height});

                    var chartGroup = svg.select('.chart-group');
                    var oldTranslate = d3.transform(chartGroup.attr('transform')).translate;
                    chartGroup.attr('transform', 'translate(' + oldTranslate[0] + ',' + (oldTranslate[1] + titleBBox.height) + ')');
                }


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

                svg.selectAll('.geometry-group .mark').on('mouseenter.tooltip', function(d, i){
//                    console.log(d);
                });

            });
        return exports;
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        µ.util._override(_x, config);
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
