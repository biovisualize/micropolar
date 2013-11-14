µ.util = {};

//TODO: make it immutable
µ.util._override = function(_objA, _objB){ for(var x in _objA) if(x in _objB) _objB[x] = _objA[x]; };
µ.util._extend = function(_objA, _objB){ for(var x in _objA) _objB[x] = _objA[x]; };

µ.util._rndSnd = function(){
    return (Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1);
};
