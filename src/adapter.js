µ.adapter = {};
µ.adapter.plotly = function module() {
    var exports = {};
    exports.convert = function(_inputConfig) {
        var outputConfig = {};

        if(_inputConfig.data){
            outputConfig.data = _inputConfig.data.map(function(d, i){
                return d3.zip(d.x, d.y);
            });
            outputConfig.color = _inputConfig.data.map(function(d, i){ return d.line.color || 'black'; });
            outputConfig.dash = _inputConfig.data.map(function(d, i){ return d.line.dash || 'solid'; });
            outputConfig.opacity = _inputConfig.data.map(function(d, i){ return d.opacity || 1; });
            outputConfig.geometryName = _inputConfig.data.map(function(d, i){ return d.name || 'Line ' + i; });
            outputConfig.geometry = _inputConfig.data.map(function(d, i){ return d.type.substr('Polar'.length) || 'Line'; });
        }

        var margin = _inputConfig.layout.margin;
        outputConfig.margin = {top: margin.t, right: margin.r, bottom: margin.b, left: margin.l};

        outputConfig.title = _inputConfig.layout.title;
        outputConfig.containerSelector = _inputConfig.container;
        outputConfig.height = _inputConfig.layout.height;
        outputConfig.width = _inputConfig.layout.width;
        outputConfig.isLegendVisible = _inputConfig.layout.showlegend;

        return outputConfig;
    };
    return exports;
};
