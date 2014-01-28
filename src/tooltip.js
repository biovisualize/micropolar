µ.tooltipPanel = function(){
    var tooltipEl, tooltipTextEl, backgroundEl, circleEl;
    var config = {container: null, hasTick: false, fontSize: 12, color: 'white', padding: 5};
    var id = 'tooltip-' + µ.tooltipPanel.uid++;
    var exports = function(){
        tooltipEl = config.container.selectAll('g.' + id).data([0]);
        var tooltipEnter = tooltipEl.enter().append('g')
            .classed('tooltip', true).classed(id, true)
            .style({'pointer-events': 'none'});
        circleEl = tooltipEnter.append('circle').attr({cx: 5, r: 5}).style({fill: 'white', 'fill-opacity': 0.9});
        backgroundEl = tooltipEnter.append('rect').style({fill: 'white', 'fill-opacity': 0.9});
        tooltipTextEl = tooltipEnter.append('text')
            .attr({dy: -config.fontSize * 0.3, dx: config.padding + 5});
        return exports;
    };
    exports.text = function(_text){
        var l = d3.hsl(config.color).l;
        var strokeColor = (l >= 0.5) ? '#aaa' : 'white';
        var fillColor = (l >= 0.5) ? 'black' : 'white';
        var text = _text || '';
        tooltipTextEl
            .style({
                fill: fillColor,
                'font-size': config.fontSize + 'px'
            })
            .text(text);
        var padding = config.padding;
        var bbox = tooltipTextEl.node().getBBox();
        backgroundEl.attr({
                x: 5,
                y: -(bbox.height + padding),
                width: bbox.width + padding*2,
                height: bbox.height + padding*2,
                rx: 5,
                ry: 5
            })
            .style({
                fill: config.color,
                stroke: strokeColor,
                'stroke-width': '2px'
            });
        circleEl.attr({cy: -(bbox.height / 2)}).style({display: config.hasTick? 'block' : 'none'});
        tooltipEl.style({display: 'block'});
        return exports;
    };
    exports.move = function(_pos){
        if(!tooltipEl) return;
        tooltipEl.attr({transform: 'translate(' + [_pos[0], _pos[1]] + ')'})
            .style({display: 'block'});

        return exports;
    };
    exports.hide = function(){
        if(!tooltipEl) return;
        tooltipEl.style({display: 'none'});
        return exports;
    };
    exports.show = function(){
        if(!tooltipEl) return;
        tooltipEl.style({display: 'block'});
        return exports;
    };
    exports.config = function(_x){
        µ.util.deepExtend(config, _x);
        return exports;
    };
    return exports;
};

µ.tooltipPanel.uid = 1;