var Event = require('events');
var slugify = require('slugify');
var merge = require('deepmerge');
var crypto = require('crypto');
var fs = require('fs-extra');

var Log = require('./log.js');
var MPD = require('./mpd.js');
var MPC = require('./mpc.js');
var Storage = require('./storage.js');

module.exports = function (args) {
    var that = this;
    var defaults = {};
    this.options = defaults;

    var log = new Log();
    this.event = new Event();
    this.storage = new Storage();

    this.id, this.mpd, this.mpd, this.playlist, this.ready = false;

    this.init = function () {
        that.mergeOptions();

        that.on('ready', function () {
            that.ready = true;
            that.mpc.updateDatabase();
            that.saveJsonConfig();
            that.savePlaylist();
            log(' >>> CHANNEL READY', that.name, '\n');
        });

        that.on('saved-json', function () {
            log(' CHANNEL SAVED JSON', that.name);
        });

        // MP-D
        that.mpd = new MPD({
            options: that.options.mpd
        });
        that.mpd.on('ready', function (mpd) {
            log(' MPD STARTED', mpd.name, 'WITH CONFIG', mpd.options.conf_file);
            that.checkReady();
        });

        // MP-C
        that.mpc = new MPC({
            options: that.options.mpc
        });
        that.mpc.on('ready', function (mpc) {
            log(' MPC STARTED', mpc.options.name, 'WITH CONFIG', mpc.options.conf_file);
            that.checkReady();
        });

    };
    this.mergeOptions = function () {
        if (!args.options)
            return;

        if (typeof args.options !== 'object')
            return;

        that.options = merge(defaults, args.options);

        if (!that.options.slug)
            that.options.slug = slugify(that.options.name, {replacement: '_', lower: true});

        if (!that.options.id)
            that.options.id = crypto.createHash('md5').update(Date.now() + '').digest("hex");

        that.id = that.options.id;
        that.name = that.options.name;
        that.slug = that.options.slug;
        that.options.playlist = that.options.slug;

        if (global.config.station.storage_path.substring(0, 1) === '/') {
            that.options.json_file = global.config.station.storage_path + '/channels/' + that.id + '.json';
        } else {
            that.options.json_file = global.app_root + '/' + global.config.station.storage_path + '/channels/' + that.id + '.json';
        }

        if (!that.options.mpd)
            that.options.mpd = {};

        that.options.mpd.id = that.options.id;
        that.options.mpd.name = that.options.name;
        that.options.mpd.slug = that.options.slug;

        if (!that.options.mpc)
            that.options.mpc = {};

        that.options.mpc.id = that.options.id;
        that.options.mpc.name = that.options.name;
        that.options.mpc.slug = that.options.slug;
        that.options.mpc.port = that.options.mpd.config.port;
        that.options.mpc.host = that.options.mpd.config.bind_to_address;
    };

    this.checkReady = function () {
        if (that.mpd.ready() === true && that.mpc.ready() === true)
            that.emit('ready', that);
    };

    this.saveJsonConfig = function () {
        var save = that.options;
        save.mpd = merge(save.mpd, that.mpd.getOptions());
        save.mpc = merge(save.mpc, that.mpc.getOptions());
        fs.writeJsonSync(that.options.json_file, that.options);
        that.emit('saved-json', that);
    };

    this.saveConfigMPD = function () {
        that.mpd.saveConfig();
    };

    this.savePlaylist = function () {
        var folder;
        if (global.config.mpd.path.music.substring(0, 1) === '/') {
            folder = global.config.mpd.path.music;
        } else {
            folder = global.app_root + '/' + global.config.mpd.path.music;
        }
        var playlist_data = that.storage.fetchMusic(folder, false);
        var data = '';
        playlist_data.forEach(function (i) {
            data += i.file_path + '\n';
        });
        var playlist_path = that.options.mpd.path.playlist + '/' + that.id + '.m3u';
        fs.writeFileSync(playlist_path, data);
        console.log(' PLAYLIST SAVED', data);
    };


    this.updateDatabase = function () {
        that.mpc.updateDatabase();
    };
    this.loadPlaylist = function (playlist) {
        that.mpc.loadPlaylist(playlist);
    };
    this.updatePlaylist = function (playlist) {
        that.mpc.updatePlaylist(playlist);
    };
    this.setCrossfade = function (seconds) {
        that.mpc.setCrossfade(seconds);
    };
    this.play = function () {
        that.mpc.play();
    };
    this.repeat = function () {
        that.mpc.repeat();
    };
    this.status = function () {
        that.mpc.status();
    };
    this.crop = function () {
        that.mpc.crop();
    };
    this.changePlaylist = function (playlist) {
        that.mpc.changePlaylist(playlist);
    };

    this.on = function () {
        that.event.on.apply(that.event, Array.from(arguments));
    };
    this.emit = function () {
        that.event.emit.apply(that.event, Array.from(arguments));
    };

    this.isReady = function () {
        return that.ready;
    };

    that.init();

    return {
        ready: that.isReady,
        on: that.on,
        emit: that.emit,
        saveConfigMPD: that.saveConfigMPD,
        updateDatabase: that.updateDatabase,
        loadPlaylist: that.loadPlaylist,
        updatePlaylist: that.updatePlaylist,
        setCrossfade: that.setCrossfade,
        play: that.play,
        repeat: that.repeat
    }
};