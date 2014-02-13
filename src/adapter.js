µ.adapter = {};
µ.adapter.plotly = function module() {
    var exports = {};
    exports.convert = function(_inputConfig, reverse) {
        var outputConfig = {};
        if(_inputConfig.data){
            //convert data
            outputConfig.data = _inputConfig.data.map(function(d, i){
                var r = µ.util.deepExtend({}, d);

                var toTranslate = [
                    [r, ['marker', 'color'], ['color']],
                    [r, ['marker', 'opacity'], ['opacity']],
                    [r, ['marker', 'line', 'color'], ['strokeColor']],
                    [r, ['marker', 'line', 'dash'], ['strokeDash']],
                    [r, ['marker', 'line', 'width'], ['strokeSize']],
                    [r, ['marker', 'type'], ['dotType']],
                    [r, ['marker', 'size'], ['dotSize']],
                    [r, ['marker', 'barRadialOffset'], ['barRadialOffset']],
                    [r, ['marker', 'barWidth'], ['barWidth']],
                    [r, ['line', 'interpolation'], ['lineInterpolation']],
                    [r, ['type'], ['geometry']]
                ];
                toTranslate.forEach(function(d, i){
                    µ.util.translator.apply(null, d.concat(reverse));
                });


                if(!reverse) delete r.marker;

                if(r.geometry && r.geometry.indexOf('Polar') != -1 && !reverse) r.geometry = r.geometry.substr('Polar'.length);
                if(r.type && r.type.indexOf('Polar') == -1 && reverse) r.type = 'Polar' + r.type;

                return r;
            });

            //add groupId for stack
            if(_inputConfig.layout && _inputConfig.layout.barmode === 'stack'){
                var duplicates = µ.util.duplicates(outputConfig.data.map(function(d, i){ return d.geometry; }));
                outputConfig.data.forEach(function(d, i){
                    var idx = duplicates.indexOf(d.geometry);
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
                µ.util.translator.apply(null, d.concat(reverse));
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
        }

        return outputConfig;
    };
    return exports;
};