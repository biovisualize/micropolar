µ.util = {};

µ.util._override = function(_objA, _objB){ for(var x in _objA) if(x in _objB) _objB[x] = _objA[x]; };
µ.util._extend = function(_objA, _objB){ for(var x in _objA) _objB[x] = _objA[x]; };

µ.util._rndSnd = function(){
    return (Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1);
};

µ.util.dataFromEquation = function(_equation, _step){
    var step = _step || 6;
    var data = d3.range(0, 360 + step, step).map(function(deg, index){
        var theta = deg * Math.PI / 180;
        var radius = _equation(theta);
        return [deg, radius];
    });
    return data;
};

µ.util.ensureArray = function(_val, _count){
    if(typeof _val === 'undefined') return null;
    var arr = [].concat(_val);
    return d3.range(_count).map(function(d, i){
        return arr[i] || arr[0];
    });
};

µ.util.fillArrays = function(_obj, _valueNames, _count){
    _valueNames.forEach(function(d, i){
        _obj[d] = µ.util.ensureArray(_obj[d], _count);
    });
    return _obj;
};


