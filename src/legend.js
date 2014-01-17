µ.Legend = function module() {
    var config = µ.Legend.defaultConfig();
    var dispatch = d3.dispatch('hover');

    function exports() {
        var legendConfig = config.legendConfig;
        var data = config.data.filter(function(d, i){
            return (legendConfig.elements[i] && (legendConfig.elements[i].visibleInLegend
                || typeof legendConfig.elements[i].visibleInLegend === 'undefined'));
        });
        if(legendConfig.reverseOrder) data = data.reverse();
        var container = legendConfig.container;
        if (typeof container == 'string' || container.nodeName) container = d3.select(container);
        var colors = legendConfig.elements.map(function(d, i){ return d.color; });
        var lineHeight = legendConfig.fontSize;
        var isContinuous = (legendConfig.isContinuous == null) ? typeof data[0] === 'number' : legendConfig.isContinuous;
        var height = isContinuous ? legendConfig.height : (lineHeight) * data.length;

        var geometryGroup = container.classed('legend-group', true);
        var svg = geometryGroup.selectAll('svg')
            .data([0]);
        var svgEnter = svg.enter().append('svg')
            .attr({
                width: 300,
                height: height + lineHeight,
                xmlns: 'http://www.w3.org/2000/svg',
                'xmlns:xmlns:xlink': 'http://www.w3.org/1999/xlink',
                version: '1.1'
            });
        svgEnter.append('g').classed('legend-axis', true);
        svgEnter.append('g').classed('legend-marks', true);

        var svgGroup = svg.html('');

        var colorScale = d3.scale[(isContinuous) ? 'linear' : 'ordinal']().domain(config.data).range(colors);
        var dataScale = d3.scale[(isContinuous) ? 'linear' : 'ordinal']()
            .domain(data)[(isContinuous) ? 'range' : 'rangePoints']([0, height]);

        var shapeGenerator = function(_type, _size){
            var squareSize = _size * 3;
            if(_type === 'line'){
                return 'M' + [ [-_size / 2, -_size / 12], [_size / 2, -_size / 12],
                    [_size / 2, _size / 12], [-_size / 2, _size / 12]] + 'Z';
            }
            else if(d3.svg.symbolTypes.indexOf(_type) != -1) return d3.svg.symbol().type(_type).size(squareSize)();
            else return d3.svg.symbol().type('square').size(squareSize)();
        };

        if(isContinuous){
            var gradient = svgGroup.select('.legend-marks')
                .append('defs').append('linearGradient')
                .attr({id: 'grad1', x1: '0%', y1: '0%', x2: '0%', y2: '100%'})
                .selectAll('stop')
                .data(colors);
            gradient.enter().append('stop');
            gradient.attr({ offset: function(d, i){ return i / (colors.length - 1) * 100 + '%'; } })
                .style({'stop-color': function(d, i){ return d; }});
            svgGroup.append('rect').classed('legend-mark', true)
                .attr({height: legendConfig.height, width: legendConfig.colorBandWidth, fill: 'url(#grad1)'});
        }
        else{
            var legendElement = svgGroup.select('.legend-marks')
                .selectAll('path.legend-mark')
                .data(data);
            legendElement.enter().append('path').classed('legend-mark', true);
            legendElement.attr({
                transform: function(d, i){ return 'translate(' + [lineHeight / 2, dataScale(d) + lineHeight / 2] + ')'; },
                d: function(d, i){
                    var symbolType = legendConfig.elements[i].symbol;
                    return shapeGenerator(symbolType, lineHeight);
                },
                fill: function(d, i){ return colorScale(d, i); }
            });
            legendElement.exit().remove();
        }

        var legendAxis = d3.svg.axis().scale(dataScale).orient('right');
        var axis = svgGroup.select('g.legend-axis')
            .attr({transform: 'translate(' + [isContinuous ? legendConfig.colorBandWidth : lineHeight, lineHeight / 2] + ')'})
            .call(legendAxis);
        axis.selectAll('.domain').style({fill: 'none', stroke: 'none'});
        axis.selectAll('line').style({fill: 'none', stroke: (isContinuous) ? legendConfig.textColor : 'none'});
        axis.selectAll('text').style({fill: legendConfig.textColor, 'font-size': legendConfig.fontSize});

//        svg.attr({width: svg.node().getBBox().width + 10});
        return exports;
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        µ.util.deepExtend(config, _x);
        return this;
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
};

µ.Legend.defaultConfig = function(d, i){
    var config = {
//        data: [1, 10],
        data: ['a', 'b', 'c'],
        legendConfig: {
            elements: [
                {symbol: 'line', color: 'red'},
                {symbol: 'square', color: 'yellow'},
                {symbol: 'diamond', color: 'limegreen'}
            ],
            height: 150, // only make sense for linear
            colorBandWidth: 30, // only make sense for linear
            fontSize: 12,
            container: 'body',
            isContinuous: null,
            textColor: 'grey',
            reverseOrder: false
        }
    };
    return config;
};
