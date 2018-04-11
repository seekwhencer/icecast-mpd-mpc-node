var Event = require('events');
module.exports = function (args) {

    var that = this;
    var defaults = {
    };

    this.event = new Event();
    this.options = defaults;

    if (args) {
        if(args.app)
            var app = args.app;

        if (args.options)
            if (typeof args.options === 'object')
                this.options = Object.assign({}, defaults, args.options);
    }


    this.init = function () {
    };

    this.log = function(){
        console.log.apply(console, arguments);
    };

    // on event wrapper
    this.on = function () {
        that.event.on.apply(that.event, Array.from(arguments));
    };

    // emit event wrapper
    this.emit = function () {
        that.event.emit.apply(that.event, Array.from(arguments));
    };

    that.init();

    return that.log;

};