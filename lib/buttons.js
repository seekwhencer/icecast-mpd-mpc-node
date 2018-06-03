var Event = require('events');
var merge = require('deepmerge');
var Log = require('./log.js');
var gpio = require('rpi-gpio');

module.exports = function (args) {
    var that = this;
    var defaults = global.config.buttons;
    this.options = defaults;
    this.event = new Event();
    var log = new Log();
    this.data = [];
    this.show_index = 0;
    this.channel_index = 0;

    this.init = function () {
        log(' INIT BUTTONS');
        that.on('ready', function(){
            console.log(' >>> BUTTONS READY\n');
        });
        that.mergeOptions();
        that.setup();
    };
    this.mergeOptions = function () {
        if (args) {
            if (args.options)
                if (typeof args.options === 'object')
                    that.options = merge(defaults, args.options);
        }
    };
    this.setup = function () {
        that.options.buttons.forEach(function (button) {
            that.data[button.pin] = {
                pin: button.pin,
                latest: Date.now() / 10,
                pressed: false,
                onchange: button.onchange
            };
        });

        that.data.forEach(function (button) {
            gpio.setup(button.pin, gpio.DIR_IN, gpio.EDGE_BOTH);
        });
        gpio.on('change', that.onChange);
        that.emit('ready');
    };
    this.read = function (button) {
        gpio.read(button.pin, function (err, value) {
            that.emit('read', err, value, button);
        });
    };
    this.onChange = function (pin, pressed) {
        var now = Date.now() / 10;
        var edge = now - that.data[pin].latest;
        if (edge < that.options.interrupt){
            that.data[pin].latest = now;
            return false;
        }
        if(pressed === true) {
            log(' BUTTON PIN:', pin, 'PRESSED');
            if(typeof that.data[pin].onchange === 'function'){
                that.data[pin].onchange(that);
            }
        }
        that.data[pin].pressed = pressed;
        that.data[pin].latest = now;
    };
    this.on = function () {
        that.event.on.apply(that.event, Array.from(arguments));
    };
    this.emit = function () {
        that.event.emit.apply(that.event, Array.from(arguments));
    };

    that.init();

    return {
        show_index: that.show_index,
        channel_index: that.channel_index
    };
};