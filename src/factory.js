function linePlot(_config){

    if(_config && _config.size){
        _config.width = _config.size;
        _config.height = _config.size;
    }

    var config = {
        data: d3.range(0, 721, 1).map(function(deg, index){ return [deg, index/720*2]; }),
        height: 250, 
        width: 300, 
        angularDomain: [0, 360, 45], 
        flip: false,
        originTheta: 0,
        radialAxisTheta: -30,
        angularTicksSuffix: 'º',
        containerSelector: 'body'
    };

    micropolar._override(_config, config);

    var radialAxis = micropolar.chart.RadialAxis().config(config);

    var radialLinePlot = micropolar.chart.RadialLinePlot()
        .config({
            axis: radialAxis, 
            containerSelector: config.containerSelector // TODO: grab it from the axis by default
        });
    radialLinePlot(config.data);
}

function dotPlot(_config){

    if(_config && _config.size){
        _config.width = _config.size;
        _config.height = _config.size;
    }

    var scaleRandom = d3.scale.linear().domain([-3, 3]).range([0, 1]);
    var config = {
        data: d3.range(0, 100).map(function(deg, index){ 
            return [~~(scaleRandom(micropolar._rndSnd()) * 1000), ~~(scaleRandom(micropolar._rndSnd()) * 100)]; 
        }),
        height: 250, width: 250, 
        angularDomain: [0, 1000, 50], 
        flip: false,
        originTheta: 0,
        radialAxisTheta: 0,
        minorTicks: 1,
        containerSelector: 'body'
    };

    micropolar._override(_config, config);

    var radialAxis = micropolar.chart.RadialAxis().config(config);

    var radialDotPlot = micropolar.chart.RadialDotPlot()
        .config({
            axis: radialAxis, 
            containerSelector: config.containerSelector, 
            dotRadius: 3
        });
    radialDotPlot(config.data);
}

function barChart(_config){

    if(_config && _config.size){
        _config.width = _config.size;
        _config.height = _config.size;
    }

    var config = {
        data: d3.range(0, 20).map(function(deg, index){
          return [deg * 50 + 50, ~~(Math.random() * index * 5 - 15)];
        }),
        height: 250, width: 250, 
        radialDomain: [-40, 100], 
        angularDomain: [0, 1000, 50], 
        flip: true,
        originTheta: 0,
        radialAxisTheta: 0,
        containerSelector: 'body'
    };

    micropolar._override(_config, config);

    var radialAxis = micropolar.chart.RadialAxis().config(config);

    var circularBarChart = micropolar.chart.CircularBarChart()
        .config({
            axis: radialAxis, 
            containerSelector: config.containerSelector
        });
    circularBarChart(config.data);
}

function areaChart(_config){

    var config = {
        data: d3.range(0, 12).map(function(deg, index){
          return [deg * 50 + 50, ~~(Math.random() * 10 + 5)];
        }),
        height: 250, width: 250, 
        radialDomain: [0, 20], 
        angularDomain: ['North', 'East', 'South', 'West'], 
        flip: true,
        originTheta: -90,
        radialAxisTheta: -30,
        minorTicks: 2,
        radialTicksSuffix: '%',
        containerSelector: 'body'
    };

    micropolar._override(_config, config);

    var radialAxis = micropolar.chart.RadialAxis().config(config);

    var polarAreaChart = micropolar.chart.PolarAreaChart()
        .config({
            axis: radialAxis, 
            containerSelector: config.containerSelector
        });
    polarAreaChart(config.data);
}

function clock(_config){

    var config = {
        data: [0, 4, 8],
        height: 250, width: 250, 
        labelOffset: -15,
        angularDomain: [0, 12], 
        flip: true,
        originTheta: -90,
        radialAxisTheta: -30,
        minorTicks: 9,
        showRadialAxis: false,
        showRadialCircle: false,
        rewriteTicks: function(d, i){ return (d === '0')? '12': d; },
        tickOrientation: 'horizontal',
        tickLength: 5,
        containerSelector: 'body'
    };

    micropolar._override(_config, config);

    var radialAxis = micropolar.chart.RadialAxis().config(config);

    var clock = micropolar.chart.Clock().config({axis: radialAxis, containerSelector: config.containerSelector});
    clock(config.data);
}


micropolar.factory = {
    linePlot: linePlot,
    dotPlot: dotPlot,
    barChart: barChart,
    areaChart: areaChart,
    clock: clock
 };