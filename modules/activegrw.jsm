var activeGrw = null;
var getActiveGRW = function () {
    return activeGrw;
};
var setActiveGRW = function (w) {
    var scope = {};
    activeGrw = w;
};
let EXPORTED_SYMBOLS = ['getActiveGRW', 'setActiveGRW'];
