var Event = require('events');
var merge = require('deepmerge');
var Log = require('./log.js');
var slugify = require('slugify');
var crypto = require('crypto');
var fs = require('fs-extra');
var _ = require('lodash');

module.exports = function (args) {
    var log = new Log();
    var that = this;
    var defaults = global.config.playlist;
    this.options = defaults;
    this.event = new Event();
    this.channel = false, this.show = false, this.music, this.intro, this.spot;
    this.playlist, this.data;

    this.init = function () {
        that.mergeOptions();
        log(' INIT PLAYLIST FOR SHOW', that.show.id);
        that.on('saved-playlist', function (playlist) {
            log(' PLAYLIST SAVED', that.data.length, 'ENTRIES');
            that.show.channel.updatePlaylist(); // NOT! @TODO
        });
        that.getFiles();
    };

    this.mergeOptions = function () {
        if (args) {
            if (args.options)
                if (typeof args.options === 'object')
                    that.options = merge(defaults, args.options);

            if (args.show)
                that.show = args.show;

            if (args.channel)
                that.channel = args.channel;
        }
        if (that.channel)
            that.options.playlist_path = that.channel.mpd.getOptions().config.playlist_directory + '/' + that.channel.id + '.m3u';
    };

    this.getFiles = function () {
        var sopt = that.show.options;
        that.music = global.storage.fetchAudioFiles(sopt.music.path, sopt.music.recursive);
        that.podcast = global.storage.fetchAudioFiles(sopt.podcast.path, sopt.podcast.recursive);
        that.intro = global.storage.fetchAudioFiles(sopt.intro.path, sopt.intro.recursive);
        that.spot = global.storage.fetchAudioFiles(sopt.spot.path, sopt.spot.recursive);
    };

    this.generate = function () {
        that.addMusic();
        that.addHotRotation();
        that.addPodcast();
        that.addSpot();
        that.addIntro();
        that.save();
    };

    this.save = function () {
        that.playlist = '';
        that.data.forEach(function (i) {
            that.playlist += i.file_path + '\n';
        });
        fs.writeFileSync(that.options.playlist_path, that.playlist);
        that.emit('saved-playlist', that.playlist);
    };

    this.insertNth = function (add, nth, offset) {
        var build = [];
        if (!offset)
            offset = 0;

        var i = 0, c = 0;
        that.data.forEach(function (d) {
            if ((c === nth - 1 || i === offset - 1) && i >= offset - 1) {
                var insert = add[_.random(add.length - 1)];
                build.push(insert);
                c = 0;
            }
            c++;
            build.push(d);
            i++;
        });
        that.data = build;
    };

    this.addMusic = function () {
        var opts = that.show.options.music;
        if (opts.enable !== true)
            return;

        that.music = that.order(that.music, opts.order_by, opts.order_direction);
        that.data = that.music;
    };

    this.addHotRotation = function () {
        var opts = that.show.options.hot_rotation;
        if (opts.enable !== true)
            return;

        var data = [];
        var source = that.order(that.music, opts.order_by, opts.order_direction);

        if (opts.latest_tracks > 0) {
            source = source.slice(0, opts.latest_tracks);
        }

        if (opts.age_days > 0) {
            var edge = parseInt((Date.now() / 1000) - parseInt(opts.age_days * 24 * 60 * 60));
            var days = source.filter(function (i) {
                var timestamp = parseInt(i.mtime.replace('mt', '') / 1000);
                if (timestamp < edge) {
                    return i;
                }
            });
            source = days;
        }

        for (var i = 0; i < opts.multiplier; i++) {
            data = data.concat(source);
        }
        that.data = that.data.concat(data);
        that.data = _.shuffle(that.data);
    };

    this.addPodcast = function () {
        var opts = that.show.options.podcast;
        if (opts.enable !== true)
            return;
    };

    this.addSpot = function () {
        var opts = that.show.options.spot;
        if (opts.enable !== true)
            return;

        that.insertNth(that.spot, opts.nth, opts.offset);
    };

    this.addIntro = function () {
        var opts = that.show.options.spot;
        if (opts.enable !== true)
            return;

        var rand = _.random(that.intro.length - 1);
        var insert = that.intro[rand];
        var build = [insert].concat(that.data);
        that.data = build;
    };

    this.order = function (arr, order_by, order_direction) {
        var data;
        if (order_by === 'shuffle') {
            data = _.shuffle(arr);
        }
        if (order_by === 'time') {
            data = _.sortBy(arr, 'mtime');
        }
        if (order_by === 'name') {
            data = _.sortBy(arr, 'filename');
        }
        if (order_direction === 'asc') {
            data.reverse();
        }
        return data;
    };


    this.on = function () {
        that.event.on.apply(that.event, Array.from(arguments));
    };
    this.emit = function () {
        that.event.emit.apply(that.event, Array.from(arguments));
    };

    that.init();

    return {
        id: that.id,
        name: that.name,
        slug: that.slug,
        on: that.on,
        emit: that.emit,
        generate: that.generate
    };
};
