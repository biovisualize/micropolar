µ.tooltipPanel = function(_id){
    var tooltipDiv;
    var config = {hasTick: false, fontSize: 12, color: 'silver'};
    var id = 'tooltip-'+_id
    var exports = {}
    exports.text = function(_text){
        var style = {
            'font-size': config.fontSize + 'px',
            color: 'grey',
            'background-color': 'white',
            'border-radius': [6, 6, 6, !+config.hasTick * 6].join('px ') +'px',
            padding: '2px',
            border: +config.hasTick*2 + 'px solid ' + config.color
        };
        var text = _text || '';
        tooltipDiv = d3.select('body').selectAll('div#' + id).data([0]);
        tooltipDiv.enter().append('div').classed('tooltip', true)
            .attr({id: id})
            .style({
                position: 'absolute',
                'z-index': 1001,
                'pointer-events': 'none'
            })
            .style(style);
        tooltipDiv.style('width', function(d, i){return (text.length > 80) ? '300px' : null;})
            .html(text);
        return exports;
    };
    exports.move = function(_pos){
        if(!tooltipDiv) return;
        var bbox = tooltipDiv.node().getBoundingClientRect();
        tooltipDiv.style('left', _pos[0] + 'px').style('top', _pos[1] -  bbox.height + 'px');
        return exports;
    };
    exports.remove = function(){
        d3.select('body').selectAll('div#' + id).remove();
        return exports;
    };
    exports.config = function(_x){
        µ.util.deepExtend(config, _x);
        return exports;
    };
    return exports;
};