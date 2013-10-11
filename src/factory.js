micropolar.preset = {};

micropolar.preset.linePlot = function(_config){

    if(_config && _config.size){
        _config.width = _config.height = _config.size;
    }

    var polarPlot = micropolar.LinePlot();

    var config = {
        geometry: polarPlot,
        data: d3.range(0, 721, 1).map(function(deg, index){ return [deg, index/720*2]; }),
        height: 250, 
        width: 250, 
        angularDomain: [0, 360],
        additionalAngularEndTick: false,
        angularTicksStep: 30,
        angularTicksSuffix: 'º',
        minorTicks: 1,
        flip: false,
        originTheta: 0,
        radialAxisTheta: -30,
        containerSelector: 'body'
    };

    micropolar._override(_config, config);

    var polarAxis = micropolar.Axis().config(config);
    polarAxis();
};

micropolar.preset.dotPlot = function(_config){

    if(_config && _config.size){
        _config.width = _config.height = _config.size;
    }

    var polarPlot = micropolar.DotPlot();

    var scaleRandom = d3.scale.linear().domain([-3, 3]).range([0, 1]);
    var config = {
        geometry: polarPlot,
        data: d3.range(0, 100).map(function(deg, index){ 
            return [~~(scaleRandom(micropolar._rndSnd()) * 1000), ~~(scaleRandom(micropolar._rndSnd()) * 100)]; 
        }),
        height: 250, 
        width: 250, 
        angularDomain: [0, 1000],
        additionalAngularEndTick: false,
        angularTicksStep: 100,
        minorTicks: 1,
        flip: false,
        originTheta: 0,
        radialAxisTheta: -15,
        containerSelector: 'body'
    };

    micropolar._override(_config, config);

    var polarAxis = micropolar.Axis().config(config);
    polarAxis();
};

micropolar.preset.barChart = function(_config){

    if(_config && _config.size){
        _config.width = _config.height = _config.size;
    }

    var polarPlot = micropolar.BarChart();

    var config = {
        geometry: polarPlot,
        data: d3.range(0, 20).map(function(deg, index){
          return [deg * 50, Math.ceil(Math.random() * (index+1) * 5)];
        }),
        height: 250, 
        width: 250, 
        radialDomain: [-60, 100], 
        angularDomain: [0, 1000],
        angularTicksStep: 50,
        minorTicks: 1,
        flip: true,
        originTheta: 0,
        radialAxisTheta: -10,
        containerSelector: 'body'
    };

    micropolar._override(_config, config);

    var polarAxis = micropolar.Axis().config(config);
    polarAxis();
};

micropolar.preset.areaChart = function(_config){

	if(_config && _config.size){
        _config.width = _config.height = _config.size;
    }

    var polarPlot = micropolar.AreaChart();

    var config = {
        geometry: polarPlot,
        data: d3.range(0, 12).map(function(deg, index){
          return [deg * 50 + 50, ~~(Math.random() * 10 + 5)];
        }),
        height: 250, 
        width: 250, 
        radialDomain: [0, 20], 
        angularDomain: ['North', 'East', 'South', 'West'], 
        additionalAngularEndTick: false,
        minorTicks: 2,
        flip: true,
        originTheta: -90,
        radialAxisTheta: -30,
        radialTicksSuffix: '%',
        containerSelector: 'body'
    };

    micropolar._override(_config, config);

    var polarAxis = micropolar.Axis().config(config);
    polarAxis();
};

micropolar.preset.clock = function(_config){

	if(_config && _config.size){
        _config.width = _config.height = _config.size;
    }

    var polarPlot = micropolar.Clock();

    var config = {
        geometry: polarPlot,
        data: [12, 4, 8],
        height: 250, 
        width: 250, 
        angularDomain: [0, 12],
        additionalAngularEndTick: false,
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

    micropolar._override(_config, config);

    var polarAxis = micropolar.Axis().config(config);
    polarAxis();
};
