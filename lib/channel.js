var Event = require('events');
var slugify = require('slugify');
var merge = require('deepmerge');
var crypto = require('crypto');
var fs = require('fs-extra');

var Log = require('./log.js');
var MPD = require('./mpd.js');
var MPC = require('./mpc.js');
var Shows = require('./shows.js');

module.exports = function (args) {
    var that = this;
    var defaults = {};
    this.options = defaults;
    var log = new Log();
    this.event = new Event();

    this.id, this.mpd, this.mpd, this.playlist, this.ready = false, this.shows = [];

    this.init = function () {
        that.mergeOptions();
        log(' CHANNEL INIT', that.id);
        that.on('ready', function () {
            that.ready = true;
            if (that.options.autostart === true) {
                //that.updateDatabase();
                //that.updatePlaylist();
            }
            that.saveJsonConfig();
            //that.savePlaylist();
            //that.updatePlaylist();
            log(' --> CHANNEL READY', that.name + '\n');
        });

        that.on('saved-json', function () {
            log(' CHANNEL SAVED JSON', that.name);
        });
        that.on('saved-playlist', function () {
            log(' PLAYLIST SAVED');
            //that.updatePlaylist();
        });
        that.on('update-db', function () {
            // that.updatePlaylist();
        });

        // MP-D
        that.mpd = new MPD({
            options: that.options.mpd
        });
        that.mpd.on('ready', function (mpd) {
            log(' MPD STARTED', mpd.name, 'WITH CONFIG', mpd.options.conf_file);
            that.checkReady();
        });
        that.mpd.on('update', function () {
            that.emit('update-db');
        });

        // MP-C
        that.mpc = new MPC({
            options: that.options.mpc
        });
        that.mpc.on('ready', function (mpc) {
            log(' MPC STARTED', mpc.options.name, 'WITH CONFIG', mpc.options.conf_file);
            that.checkReady();
        });
        that.mpd.on('respawn', function(mpd){
            log(' MPD RESPAWN', mpd.options.name, 'WITH CONFIG', mpd.options.conf_file);
            that.saveJsonConfig();
            that.savePlaylist();
        });

        // Shows
        that.shows = new Shows({
            channel : that
        });
        that.shows.on('ready', function(){
            log(' SHOWS READY', that.name);
            //that.checkReady();
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

        if (global.config.storage.path.substring(0, 1) === '/') {
            that.options.json_file = global.config.storage.path + '/channels/' + that.id + '.json';
        } else {
            that.options.json_file = global.app_root + '/' + global.config.storage.path + '/channels/' + that.id + '.json';
        }

        if (!that.options.mpd)
            that.options.mpd = {};

        that.options.mpd.id = that.options.id;
        that.options.mpd.name = that.options.name;
        that.options.mpd.slug = that.options.slug;
        that.options.mpd.autostart = that.options.autostart;

        if (!that.options.mpc)
            that.options.mpc = {};

        that.options.mpc.id = that.options.id;
        that.options.mpc.name = that.options.name;
        that.options.mpc.slug = that.options.slug;
        that.options.mpc.port = that.options.mpd.config.port;
        that.options.mpc.host = that.options.mpd.config.bind_to_address;
    };

    this.checkReady = function () {
        if (that.mpd.ready() === true && that.mpc.ready() === true && that.shows.ready() === true)
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
        var music_path = that.options.mpd.path.music;
        if (!music_path) {
            music_path = global.config.mpd.path.music;
        }
        if (music_path.substring(0, 1) === '/') {
            folder = music_path;
        } else {
            folder = global.app_root + '/' + music_path;
        }
        var playlist_data = global.storage.fetchAudioFiles(folder, true);
        var data = '';
        playlist_data.forEach(function (i) {
            data += i.file_path + '\n';
        });
        var playlist_path = that.options.mpd.path.playlist + '/' + that.id + '.m3u';
        fs.writeFileSync(playlist_path, data);
        that.emit('saved-playlist', data);
    };


    this.updateDatabase = function () {
        that.mpc.updateDatabase();
    };
    this.loadPlaylist = function (playlist) {
        that.mpc.loadPlaylist(playlist);
    };
    this.updatePlaylist = function (playlist) {
        log(' CHANNEL UPDATE PLAYLISTS', that.name);
        that.mpc.updatePlaylist(playlist);
    };
    this.setCrossfade = function (seconds) {
        that.mpc.setCrossfade(seconds);
    };
    this.play = function () {
        that.mpc.play();
    };
    this.pause = function () {
        that.mpc.pause();
    };
    this.stop = function () {
        that.mpc.stop();
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
    this.skip = function () {
        that.mpc.skip();
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

    this.spawn = function(){
        that.mpd.spawn('respawn');
    };

    this.shutdown = function () {
        that.mpd.shutdown();
    };

    this.respawn = function () {
        that.mpd.respawn();
    };

    this.getShows = function(){
        return that.shows;
    };

    that.init();

    return {
        ready: that.isReady,
        name: that.name,
        slug: that.slug,
        on: that.on,
        emit: that.emit,
        saveConfigMPD: that.saveConfigMPD,
        updateDatabase: that.updateDatabase,
        loadPlaylist: that.loadPlaylist,
        updatePlaylist: that.updatePlaylist,
        setCrossfade: that.setCrossfade,
        play: that.play,
        pause: that.pause,
        stop: that.stop,
        skip: that.skip,
        repeat: that.repeat,
        options: that.options,
        shutdown: that.shutdown,
        respawn: that.respawn,
        spawn: that.spawn,
        id: that.id,
        mpd: that.mpd,
        mpc: that.mpc,
        shows: that.getShows()
    }
};