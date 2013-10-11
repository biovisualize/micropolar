//TODO: make it immutable
micropolar._override = function(_objA, _objB){ for(var x in _objA) if(x in _objB) _objB[x] = _objA[x]; };

micropolar._rndSnd = function(){
    return (Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1);
};
