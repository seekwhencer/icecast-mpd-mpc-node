module.exports = function(){
    var that = this;

    var _is = false;

    init = function(){
        console.log(' INIT PING');
        renew();
    };

    release = function(){
        _is = false;
    };

    renew = function(){
        _is = true;
    };

    is = function(){
        return _is;
    };

    init();

    return {
        renew : renew,
        release: release,
        is : is
    };
};