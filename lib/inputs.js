var Event = require('events');
var merge = require('deepmerge');
var fs = require('fs-extra');
var Log = require('./log.js');
var Input = require('./input.js');

module.exports = function (args) {
    var that = this;
    var defaults = global.config.inputs;
    this.options = defaults;
    this.data = [];

    var log = new Log();
    this.event = new Event();
    this.ready = false;
    this.ready_interval;

    this.init = function () {
        if (that.options.enable !== true) {
            return false;
        }
        log(' INIT INPUTS');
        that.mergeOptions();
        that.on('ready', function () {
            that.ready = true;
            log(' >>> INPUTS READY\n')
            clearInterval(that.ready_interval);
        });
        that.build();
    };

    this.mergeOptions = function () {
        if (args) {
            if (args.options)
                if (typeof args.options === 'object')
                    that.options = merge(defaults, args.options);
        }

        if (global.config.storage.path.substring(0, 1) === '/') {
            that.options.json_path = global.config.storage.path + '/' + that.options.path;
        } else {
            that.options.json_path = global.app_root + '/' + global.config.storage.path + '/' + that.options.path;
        }
    };

    this.load = function () {
        log(' LOADING INPUTS');
        var stored_inputs = global.storage.fetchInputs(that.options.json_path);
        var data = [];
        stored_inputs.forEach(function (i) {
            var input_data = fs.readJsonSync(i.file_path);
            data.push(input_data);
        });
        if (data.length > 0) {
            return data;
        } else {
            log(' INPUT NOT FOUND');
        }
    };

    this.build = function () {
        var inputs = [];
        if (that.options.load === true) {
            inputs = that.load();
            if (inputs) {
                inputs.forEach(function (input) {
                    that.data.push(new Input({
                        options: input
                    }));
                });
            }
        }
        if (that.options.generate_from_config === true) {
            that.data = [];
            that.options.inputs.forEach(function (opt) {
                that.data.push(new Input({
                    options: opt
                }));
            });
        }
        this.listenReady();
    };

    this.listenReady = function () {
        that.ready_interval = setInterval(function () {
            that.checkReady();
        }, 100);
    };

    this.getOptions = function () {
        return that.options;
    };

    this.getData = function () {
        return that.data;
    };

    this.get = function (key, match) {
        return that.data.filter(function (input) {
            if (input[key] === match) {
                return input;
            }
        })[0];
    };

    this.checkReady = function () {
        if (that.ready === true)
            return;

        var c = 0;
        that.data.forEach(function (i) {
            if (i.ready() === true)
                c++;
        });
        if (c === that.data.length && that.ready !== true)
            that.emit('ready');
    };

    this.isReady = function () {
        return that.ready;
    };
    this.on = function () {
        that.event.on.apply(that.event, Array.from(arguments));
    };
    this.emit = function () {
        that.event.emit.apply(that.event, Array.from(arguments));
    };

    that.init();

    return {
        on: that.on,
        emit: that.emit,
        options: that.getOptions(),
        data: that.getData(),
        get: that.get,
        ready: that.isReady,
    }
};
