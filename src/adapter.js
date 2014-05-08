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
                    [r, ['marker', 'symbol'], ['dotType']],
                    [r, ['marker', 'size'], ['dotSize']],
                    [r, ['marker', 'barWidth'], ['barWidth']],
                    [r, ['line', 'interpolation'], ['lineInterpolation']],
                    [r, ['showlegend'], ['visibleInLegend']]
                ];
                toTranslate.forEach(function(d, i){
                    µ.util.translator.apply(null, d.concat(reverse));
                });


                if(!reverse) delete r.marker;
                if(reverse) delete r.groupId;

                if(!reverse){
                    if(r.type === 'scatter'){
                       if(r.mode === 'lines') r.geometry = 'LinePlot';
                       else if(r.mode === 'markers') r.geometry = 'DotPlot';
                    }
                    else if(r.type === 'area') r.geometry = 'AreaChart';
                    else if(r.type === 'bar') r.geometry = 'BarChart';
                    delete r.mode;
                    delete r.type;
                }
                else{
                    if(r.geometry === 'LinePlot'){
                        r.type = 'scatter';
                        r.mode = 'lines';
                    }
                    else if(r.geometry === 'DotPlot'){
                        r.type = 'scatter';
                        r.mode = 'markers';
                    }
                    else if(r.geometry === 'AreaChart') r.type = 'area';
                    else if(r.geometry === 'BarChart') r.type = 'bar';
                    delete r.geometry;
                }

//                if(r.type && r.type.indexOf('Polar') == -1 && reverse) r.type = 'Polar' + r.type;

                return r;
            });

            //add groupId for stack
            if(!reverse && _inputConfig.layout && _inputConfig.layout.barmode === 'stack'){
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
                [r, ['radialaxis'], ['radialAxis']],
                [r, ['angularaxis'], ['angularAxis']],
                [r.angularaxis, ['showline'], ['gridLinesVisible']],
                [r.angularaxis, ['showticklabels'], ['labelsVisible']],
                [r.angularaxis, ['nticks'], ['ticksCount']],
                [r.angularaxis, ['tickorientation'], ['tickOrientation']],
                [r.angularaxis, ['tickssuffix'], ['ticksSuffix']],
                [r.radialaxis, ['showline'], ['gridLinesVisible']],
                [r.radialaxis, ['tickorientation'], ['tickOrientation']],
                [r.radialaxis, ['tickssuffix'], ['ticksSuffix']],
                [r.font, ['outlinecolor'], ['outlineColor']],
                [r.legend, ['traceorder'], ['reverseOrder']],
                [r, ['labeloffset'], ['labelOffset']],
                [r, ['defaultcolorrange'], ['defaultColorRange']]
            ];
            toTranslate.forEach(function(d, i){
                µ.util.translator.apply(null, d.concat(reverse));
            });

            if(!reverse){
                if(r.angularAxis && typeof r.angularAxis.ticklen !== 'undefined') r.tickLength = r.angularAxis.ticklen;
                if(r.angularAxis && typeof r.angularAxis.tickcolor !== 'undefined') r.tickColor = r.angularAxis.tickcolor;
            }
            else{
                if(r.tickLength) r.angularaxis.ticklen = r.tickLength;
                if(r.tickColor) r.angularaxis.tickcolor = r.tickColor;
            }

            if(r.legend && typeof r.legend.reverseOrder != "boolean"){
                r.legend.reverseOrder = r.legend.reverseOrder != 'normal';
            }
            if(r.legend && typeof r.legend.traceorder == "boolean"){
                r.legend.traceorder = r.legend.traceorder ? 'reversed' : 'normal';
            }

            if(r.margin && typeof r.margin.t != 'undefined'){
                var source = ['t', 'r', 'b', 'l', 'pad'];
                var target = ['top', 'right', 'bottom', 'left', 'pad'];
                var margin = {};
                d3.entries(r.margin).forEach(function(dB, iB){
                    margin[target[source.indexOf(dB.key)]] = dB.value;
                });
                r.margin = margin
            }

            if(reverse) delete r.needsEndSpacing;

            outputConfig.layout = r;
        }

        return outputConfig;
    };
    return exports;
};