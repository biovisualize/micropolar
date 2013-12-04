µ.preset = {};

µ.preset.linePlot = function(_config){

    if(_config && _config.size){
        _config.width = _config.height = _config.size;
    }

    var polarPlot = µ.LinePlot();

    var config = {
        geometry: polarPlot,
        data: d3.range(0, 721, 1).map(function(deg, index){ return [deg, index/720*2]; }),
        height: 250,
        width: 250, 
        angularDomain: [0, 360],
        angularTicksStep: 30,
        angularTicksSuffix: 'º',
        minorTicks: 1,
        flip: false,
        originTheta: 0,
        radialAxisTheta: -30,
        containerSelector: 'body'
    };

    µ.util._extend(_config, config);

    var polarAxis = µ.Axis().config(config);
    polarAxis();
    return polarAxis;
};

µ.preset.multiLinePlot = function(_config){

    var config = µ.LinePlot.defaultConfig();
    µ.util._extend(_config, config);

    if (typeof [].concat(_config.data)[0] === 'function'){
        config.data = config.data.map(function(d, i){ return µ.util.dataFromEquation(d, 6); });
    }

    if(typeof config.data[0][0] != 'object') config.data = [config.data];
    µ.util.fillArrays(config, ['color', 'dash', 'geometryName', 'geometry'], config.data.length);
    var dashArray = {solid: 'none', dot: [1, 5], dash: [5, 1]};
    if(!config.geometryName) config.geometryName = config.data.map(function(d, i){ return 'Line'+i; });

    config.geometry = config.geometry.map(function(d, i){
        return µ[d]().config({
            color: config.color[i],
            dash: dashArray[config.dash[i]],
            lineStrokeSize: config.lineStrokeSize,
            opacity: config.opacity[i]
        });
    });
    if(config.isLegendVisible){
        config.legend = µ.legend()
            .config({
                data: config.geometryName,
                color: config.color
            });
    }

    var polarAxis = µ.Axis().config(config);
    polarAxis();
    return polarAxis;
};

µ.preset.dotPlot = function(_config){

    if(_config && _config.size){
        _config.width = _config.height = _config.size;
    }

    var polarPlot = µ.DotPlot();

    var scaleRandom = d3.scale.linear().domain([-3, 3]).range([0, 1]);
    var config = {
        geometry: polarPlot,
        data: d3.range(0, 100).map(function(deg, index){ 
            return [~~(scaleRandom(µ.util._rndSnd()) * 1000), ~~(scaleRandom(µ.util._rndSnd()) * 100)];
        }),
        height: 250, 
        width: 250, 
        angularDomain: [0, 1000],
        angularTicksStep: 100,
        minorTicks: 1,
        flip: false,
        originTheta: 0,
        radialAxisTheta: -15,
        containerSelector: 'body'
    };

    µ.util._extend(_config, config);

    var polarAxis = µ.Axis().config(config);
    polarAxis();
    return polarAxis;
};

µ.preset.barChart = function(_config){

    if(_config && _config.size){
        _config.width = _config.height = _config.size;
    }

    var polarPlot = µ.BarChart();

    var config = {
        geometry: polarPlot,
        data: d3.range(0, 16).map(function(deg, index){
          return [deg * 50, Math.ceil(Math.random() * (index+1) * 5)];
        }),
        height: 250,
        width: 250,
        radialDomain: [-60, 100],
        minorTicks: 1,
        flip: true,
        originTheta: 0,
        radialAxisTheta: -10,
        containerSelector: 'body'
    };

    µ.util._extend(_config, config);

    var polarAxis = µ.Axis().config(config);
    polarAxis();
    return polarAxis;
};

µ.preset.areaChart = function(_config){

	if(_config && _config.size){
        _config.width = _config.height = _config.size;
    }

    var polarPlot = µ.AreaChart();

    var config = {
        geometry: polarPlot,
        data: d3.range(0, 12).map(function(deg, index){
          return [deg * 50 + 50, ~~(Math.random() * 10 + 5)];
        }),
        height: 250, 
        width: 250, 
        radialDomain: [0, 20], 
        angularTicksCount: 4,
        ticks: ['North', 'East', 'South', 'West'],
        minorTicks: 5,
        flip: true,
        originTheta: -90,
        radialAxisTheta: -30,
        radialTicksSuffix: '%',
        containerSelector: 'body'
    };

    µ.util._extend(_config, config);

    var polarAxis = µ.Axis().config(config);
    polarAxis();
    return polarAxis;
};

µ.preset.clock = function(_config){

	if(_config && _config.size){
        _config.width = _config.height = _config.size;
    }

    var polarPlot = µ.Clock();

    var config = {
        geometry: polarPlot,
        data: [12, 4, 8],
        height: 250, 
        width: 250, 
        angularDomain: [0, 12],
        minorTicks: 9,
        flip: true,
        originTheta: -90,
        showRadialAxis: false,
        showRadialCircle: false,
        rewriteTicks: function(d, i){ return (d === '0')? '12': d; },
        labelOffset: -15,
        tickLength: 5,
        containerSelector: 'body'
    };

    µ.util._extend(_config, config);

    var polarAxis = µ.Axis().config(config);
    polarAxis();
    return polarAxis;
};
