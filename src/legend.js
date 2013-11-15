µ.legend = function module() {
    var config = {
        height: 150,
        lineHeight: 20,
        colorBandWidth: 30,
        fontSize: 12,
        containerSelector: 'body',
//        data: [1, 10],
        data: ['a', 'b', 'c'],
        symbol: 'square', //'square', 'line', 'cross', 'diamond'
        color: ['red', 'yellow', 'limegreen'],
        textColor: 'grey'
    };
    var dispatch = d3.dispatch('hover');

    function exports() {
        var container = config.containerSelector;
        if (typeof container == 'string') container = d3.select(container);

        var isContinuous = typeof config.data[0] === 'number';
        var height = isContinuous ? config.height : (config.lineHeight) * config.data.length;

        var geometryGroup = container.classed('legend', true);
        var svg = geometryGroup.append('svg')
            .attr({
                width: 300,
                height: height + config.lineHeight * 2,
                xmlns: 'http://www.w3.org/2000/svg',
                'xmlns:xmlns:xlink': 'http://www.w3.org/1999/xlink',
                version: '1.1'
            });
        var svgGroup = svg.append('g')
            .attr({transform: 'translate('+ [0, config.lineHeight] +')'});

        var colorScale = d3.scale[(isContinuous) ? 'linear' : 'ordinal']().domain(config.data).range(config.color);
        var dataScale = colorScale.copy()[(isContinuous) ? 'range' : 'rangePoints']([0, height]);

        var shapeGenerator = function(_type, _size){
            if(_type === 'line'){
                return 'M' + [ [-_size / 2, -_size / 12], [_size / 2, -_size / 12],
                    [_size / 2, _size / 12], [-_size / 2, _size / 12]] + 'Z';
            }
//            else if(d3.svg.symbolTypes.indexOf(_type) != -1) return d3.svg.symbol().type(_type).size(Math.pow(_size / 2, 2))();
            else if(d3.svg.symbolTypes.indexOf(_type) != -1) return d3.svg.symbol().type(_type).size(_size * _size / 2)();
            else return d3.svg.symbol().type('square').size(_size * _size / 2)();
        };

        if(isContinuous){
            var gradient = svgGroup.append('defs').append('linearGradient')
                .attr({id: 'grad1', x1: '0%', y1: '0%', x2: '0%', y2: '100%'})
                .selectAll('stop')
                .data(config.color);
            gradient.enter().append('stop');
            gradient.attr({ offset: function(d, i){ return i / (config.color.length - 1) * 100 + '%'; } })
                .style({'stop-color': function(d, i){ return d; }});
            svgGroup.append('rect').classed('legend-mark', true)
                .attr({height: config.height, width: config.colorBandWidth, fill: 'url(#grad1)'});
        }
        else{
            var legendElement = svgGroup.selectAll('path.legend-mark')
                .data(config.data);
            legendElement.enter().append('path').classed('legend-mark', true);
            legendElement.attr({
                transform: function(d, i){ return 'translate(' + [config.lineHeight / 2, dataScale(d, i)] + ')'; },
                d: function(d, i){
                    var symbolType = (typeof config.symbol === 'string') ? config.symbol : config.symbol[i];
                    return shapeGenerator(symbolType, config.lineHeight);
                },
                fill: function(d, i){ return colorScale(d, i); }
            });
        }

        var legendAxis = d3.svg.axis().scale(dataScale).orient('right');
        var axis = svgGroup.append('g').classed('legend-axis', true)
            .attr({transform: 'translate(' + [isContinuous ? config.colorBandWidth : config.lineHeight, 0] + ')'})
            .call(legendAxis);
        axis.selectAll('.domain').style({fill: 'none', stroke: 'none'});
        axis.selectAll('line').style({fill: 'none', stroke: (isContinuous) ? config.textColor : 'none'});
        axis.selectAll('text').style({fill: config.textColor, 'font-size': config.fontSize});

        svg.attr({width: svg.node().getBBox().width + 10});
    }
    exports.config = function(_x) {
        if (!arguments.length) return config;
        µ.util._override(_x, config);
        return this;
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
};
