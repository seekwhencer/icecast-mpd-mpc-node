var fs = require('fs');
module.exports = function(){
    var that = this;

    init = function(){
        console.log(' INIT RELEASE');
        renew();
    };

    release = function(){
        _is = false;
    };

    renew = function(){
        _is = fs.readFileSync('release.info').toString();
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