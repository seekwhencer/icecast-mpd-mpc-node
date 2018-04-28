var slugify = require('slugify');
var crypto = require('crypto');
var Event = require('events');
var merge = require('deepmerge');
var fs = require('fs-extra');
var path = require('path');

var Log = require('./log.js');

module.exports = function (args) {
    var that = this;
    var defaults = global.config.storage;
    this.options = defaults;

    var log = new Log();
    this.event = new Event();

    this.init = function () {
        log(' INIT STORAGE');
        that.mergeOptions();

        if (that.options.flush_on_app_start === true) {
            that.flush();
        }

        that.on('ready', function () {
            that.ready = true;
            log(' >>> STORAGE READY');
        });
        that.on('flushed', function () {
            that.ready = true;
            log(' STORAGE FLUSHED');
        });
        setTimeout(function(){
            that.emit('ready');
        }, that.options.ready_delay);

    };
    this.mergeOptions = function () {
        if (!args)
            return;

        if (!args.options)
            return;

        if (typeof args.options !== 'object')
            return;

        that.options = merge(defaults, args.options);
    };

    this.fetchChannels = function () {
        var folder = global.app_root + '/' + global.config.station.storage_path + '/channels';
        var data = that.readDir(folder, false, ['json']);
        log(' STORAGE FETCHED', data.length, 'CHANNELS');
        return data;
    };

    this.flush = function () {
        log(' STORAGE FLUSHED');
        var storage_path = global.app_root + '/' + that.options.path;
        fs.removeSync(storage_path);
        that.emit('flushed', storage_path);
    };

    this.readDir = function (folder, recursive, includes, excludes) {
        var data = [];
        var walk = function (folder, recursive) {
            if (fs.existsSync(folder)) {
                var dir = fs.readdirSync(folder + '');

                dir.forEach(function (i) {
                    var insert = folder + '/' + i;
                    if (fs.existsSync(insert)) {
                        try {
                            var xstat = fs.statSync(insert);
                            if (!xstat.isDirectory()) {
                                var filename = path.basename(insert).replace(path.extname(insert), '');
                                var extension = path.extname(insert).replace('.', '');
                                if (includes.includes(extension)) {
                                    data.push({
                                        id: filename,
                                        file_path: insert,
                                        filename: filename,
                                        extension: extension,
                                        size: xstat.size,
                                        atime: 'at' + xstat.atime.getTime(),
                                        mtime: 'mt' + xstat.mtime.getTime(),
                                        ctime: 'ct' + xstat.ctime.getTime()
                                    });
                                }
                            } else {
                                if (recursive === true) {
                                    walk(folder + '/' + i, recursive);
                                }
                            }
                        } catch (err) {
                            log(' STORAGE NOT READABLE', insert, err);
                            walk(folder + '/' + i, recursive);
                        }
                    } else {
                        log(' STORAGE NOT EXISTS', insert);
                        walk(folder + '/' + i, recursive);
                    }
                });
            } else {
                log(' STORAGE NOT EXISTS ', folder);
            }
        };
        walk(folder, false);
        return data;
    };

    this.fetchMusic = function (folder, recursive) {
        log(' STORAGE FETCH MUSIC IN', folder);
        var data = that.readDir(folder, recursive, ['mp3']);
        log(' STORAGE FETCHED MUSIC', data.length, 'FILES');
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
        ready: that.isReady,
        on: that.on,
        emit: that.emit,
        fetchChannels: that.fetchChannels,
        fetchMusic: that.fetchMusic,
        flush: that.flush
    }
};
