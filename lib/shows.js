var Event = require('events');
var merge = require('deepmerge');
var fs = require('fs-extra');
var Log = require('./log.js');
var Show = require('./show.js');

module.exports = function (args) {
    var that = this;
    var defaults = global.config.shows;
    this.options = defaults;
    this.data = [];

    var log = new Log();
    this.event = new Event();
    this.ready = false;
    this.channel = false;

    this.init = function () {
        log(' SHOWS INIT');
        that.mergeOptions();
        that.checkFolder();
        that.buildNew();
        that.on('ready', function () {
            that.ready = true;
            log(' >>> SHOWS READY\n')
        });
    };

    this.mergeOptions = function () {
        if (args) {
            if (args.options)
                if (typeof args.options === 'object')
                    that.options = merge(defaults, args.options);

            if(args.channel)
                that.channel = args.channel;
        }

        if (global.config.storage.path.substring(0, 1) === '/') {
            that.options.json_path = global.config.storage.path + '/' + that.options.path;
        } else {
            that.options.json_path = global.app_root + '/' + global.config.storage.path + '/' + that.options.path;
        }
    };

    this.checkFolder = function () {
        fs.mkdirsSync(that.options.json_path);
    };

    this.loadShows = function () {
        log(' LOADING SHOWS');
        var stored_shows = global.storage.fetchShows(that.options.json_path);
        var data = [];
        stored_shows.forEach(function (i) {
            var show_data = fs.readJsonSync(i.file_path);
            data.push(show_data);
        });
        if (data.length > 0) {
            return data;
        } else {
            log(' SHOWS NOT FOUND');
        }
        return false;
    };

    this.buildNew = function () {
        var shows = [];
        if (global.config.shows.load_shows === true) {
            shows = that.loadShows();
            if (shows) {
                shows.forEach(function (show) {
                    that.data.push(new Show({
                        options: show,
                        parent: that
                    }));
                });
            }
        }

        if (that.data.length === 0) {
            that.data.push(new Show({
                options: {
                    json_path: that.options.json_path
                },
                parent: that
            }));
        }
        that.ready = true;
        setTimeout(function () {
            that.emit('ready', that);
        }, 100);
    };

    this.getOptions = function () {
        return that.options;
    };

    this.getData = function () {
        return that.data;
    };

    this.get = function (key, match) {
        return that.data.filter(function (channel) {
            if (channel[key] === match) {
                return channel;
            }
        })[0];
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
        channel: that.channel
    }
};
