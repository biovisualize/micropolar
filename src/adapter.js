µ.adapter = {};
µ.adapter.plotly = function module() {
    var exports = {};
    exports.convert = function(_inputConfig) {
        var outputConfig = {};
        if(_inputConfig.data){
            //convert data
            outputConfig.data = _inputConfig.data.map(function(d, i){
                var r = µ.util.deepExtend({}, d);

                var toTranslate = [
                    [r, ['marker', 'line', 'color'], ['strokeColor']],
                    [r, ['marker', 'color'], ['color']],
                    [r, ['marker', 'opacity'], ['opacity']],
                    [r, ['marker', 'line', 'color'], ['strokeColor']],
                    [r, ['marker', 'line', 'dash'], ['dash']],
                    [r, ['marker', 'line', 'width'], ['strokeSize']],
                    [r, ['marker', 'type'], ['dotType']],
                    [r, ['marker', 'size'], ['dotSize']],
                    [r, ['marker', 'barRadialOffset'], ['barRadialOffset']],
                    [r, ['marker', 'barWidth'], ['barWidth']],
                    [r, ['line', 'interpolation'], ['lineInterpolation']]
                ];
                toTranslate.forEach(function(d, i){
                    µ.util.translator.apply(null, d);
                });

                delete r.marker;
                if(d.type) r.geometry = d.type.substr('Polar'.length);

                return r;
            });

            //add groupId for stack
            if(_inputConfig.layout && _inputConfig.layout.barmode === 'stack'){
                var duplicates = µ.util.duplicates(outputConfig.data.map(function(d, i){ return d.type; }))
                outputConfig.data.forEach(function(d, i){
                    var idx = duplicates.indexOf(d.type);
                    if(idx != -1) outputConfig.data[i].groupId = idx;
                });
            }
        }

        if(_inputConfig.layout){
            //convert layout
            var r = µ.util.deepExtend({}, _inputConfig.layout);

            var toTranslate = [
                [r, ['plot_bgcolor'], ['backgroundColor']],
                [r, ['showlegend'], ['showLegend']],
                [r.angularAxis, ['showLine'], ['gridLinesVisible']],
                [r.angularAxis, ['showticklabels'], ['labelsVisible']],
                [r.angularAxis, ['nticks'], ['ticksCount']]
            ];
            toTranslate.forEach(function(d, i){
                µ.util.translator.apply(null, d);
            });

            if(r.margin && typeof r.margin.t != 'undefined'){
                var source = ['t', 'r', 'b', 'l', 'pad'];
                var target = ['top', 'right', 'bottom', 'left', 'pad'];
                var margin = {};
                d3.entries(r.margin).forEach(function(dB, iB){
                    margin[target[source.indexOf(dB.key)]] = dB.value;
                });
                r.margin = margin
            }

            outputConfig.layout = r;

            if(_inputConfig.container) outputConfig.layout.container = _inputConfig.container;
        }

        return outputConfig;
    };
    return exports;
};