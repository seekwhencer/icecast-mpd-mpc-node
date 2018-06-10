var Event = require('events');
var merge = require('deepmerge');
var fs = require('fs-extra');
var Log = require('./log.js');
var Channel = require('./channel.js');

module.exports = function (args) {
    var that = this;
    var defaults = global.config.channels;
    this.options = defaults;
    this.channels = [];

    var log = new Log();
    this.event = new Event();

    this.init = function () {
        log(' CHANNELS INIT');
        that.mergeOptions();
        that.buildNew();
        that.on('ready', function () {
            log(' >>> CHANNELS READY\n');
        });
    };

    this.mergeOptions = function () {
        if (global.config.station.load_channels === true) {
            that.loadOptions(); // <<-- that loads channel-jsons from disk
        }
        if (global.config.station.load_channels === false) {
            if (args) {
                if (args.options)
                    if (typeof args.options === 'object')
                        that.options = merge(defaults, args.options);
            }
        }
    };

    this.loadOptions = function () {
        log(' STORAGE LOADING CHANNELS');
        var options = [];
        var stored_channels = global.storage.fetchChannels();
        stored_channels.forEach(function (i) {
            options.push(fs.readJsonSync(i.file_path));
        });
        if (stored_channels.length > 0) {
            that.options = options;
        } else {
            log(' STORAGE NO CHANNELS FOUND');
        }
    };

    this.buildNew = function () {
        var walk = function (i) {
            var options = that.options[i];
            if (options.mpd)
                options.mpd = merge(global.config.mpd, options.mpd);
            if (options.mpc)
                options.mpc = merge(global.config.mpc, options.mpc);

            setTimeout(function () {
                var add = new Channel({
                    channels: that,
                    options: options
                });
                add.on('ready', function () { // @TODO - exclude it from respawn
                    if (i < that.options.length - 1)
                        walk(i + 1);

                    if (i === that.options.length - 1) {
                        that.emit('ready');
                    }
                });
                that.channels.push(add);
            }, global.config.station.add_channel_delay);
        };
        walk(0);
    };

    this.updatePlaylists = function () {
        that.channels.forEach(function (channel) {
            if (channel.options.autostart === true) {
                channel.updatePlaylist();
            }
        });
    };

    this.getOptions = function () {
        return that.options;
    };

    this.getData = function () {
        return that.channels;
    };

    this.get = function(key, match){
        return that.channels.filter(function(channel){
            if(channel[key] === match){
                return channel;
            }
        })[0];
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
        checkReady: that.checkReady,
        options: that.getOptions(),
        data: that.getData(),
        updatePlaylists: that.updatePlaylists,
        get: that.get
    }
};
