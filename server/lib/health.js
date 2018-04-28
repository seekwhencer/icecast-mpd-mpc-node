module.exports = function(){
    var that = this;

    that.alive = true;

    init = function(){
        console.log(' INIT HEALTH');
    };

    init();

    return that;
};