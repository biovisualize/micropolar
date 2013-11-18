µ.adapter = {};
µ.adapter.plotly = function module() {
    var exports = {};
    exports.convert = function(_inputConfig) {
        var data = _inputConfig.data.map(function(d, i){
            return d3.zip(d.x, d.y);
        });
        var color = _inputConfig.data.map(function(d, i){ return d.line.color; })
        var geometryName = _inputConfig.data.map(function(d, i){ return d.name; })
        var geometry = _inputConfig.data.map(function(d, i){ return d.type.substr('Polar'.length); })

        var outputConfig = {
            data: data,
            color: color,
            geometryName: geometryName,
            geometry: geometry,
            title: _inputConfig.layout.title,
            containerSelector: 'body'
        };
        return outputConfig;
    };
    return exports;
};
