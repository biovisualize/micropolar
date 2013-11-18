var Helper = {};

Helper.nodeToString = function(_node){ return new XMLSerializer().serializeToString(_node); };

var Fixture = function(){

    var fixture = d3.selection;
    exports = {};

    exports.cloneAndKeepFixture = function(){
        d3.select('body').append('div').classed('fixture-clone', true).node()
            .appendChild(fixture.node().cloneNode(true));
        return this;
    };

    exports.resetFixture = function(){
        exports.emptyFixture(fixture);
        exports.addFixture(fixture);
        return this;
    };

    exports.emptyFixture = function(){
        fixture.html('');
        return this;
    };

    exports.removeFixture = function(){
        fixture.remove();
        return this;
    };

    exports.addFixture = function(){
        fixture = d3.select('body').append('div').classed('fixture', true);
        return this;
    };

    exports.get = function(){ return fixture; };

    exports.toString = function(){ return Helper.nodeToString(fixture.node()); };

    exports.print = function(){ console.log(Helper.nodeToString(fixture.node())); };

    return exports;
};
