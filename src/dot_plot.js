µ.DotPlot = function module(){ return µ.PolyChart(); };

µ.DotPlot.defaultConfig = function(){
    var config = {
        geometryConfig: {
            geometryType: 'dot',
            dotType: 'circle'
        }
    };
    return config;
};