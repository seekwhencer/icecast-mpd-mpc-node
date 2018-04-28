var Event = require('events');
var merge = require('deepmerge');
var spawn = require('child_process').spawn;
var fs = require('fs-extra');

var Log = require('./log.js');
var Channels = require('./channels.js');
var Icecast = require('./icecast.js');

module.exports = function (args) {
    var that = this;
    var app = null;
    var defaults = global.config.station;
    this.options = defaults;

    var log = new Log();
    this.event = new Event();
    this.channels;

    this.init = function () {
        that.mergeOptions();
        that.killProcesses();

        if (that.options.flush_storage === true) {
            that.flushStorage();
        }

        that.icecast = new Icecast();
        that.icecast.on('ready', function () {
            log(' >>> ICECAST READY\n');
            that.channels = new Channels();
            that.channels.on('ready', function () {
                that.emit('ready');
                that.saveScript();
            });
        });

        that.on('saved-runscript', function (runscript_file) {
            log(' STATION SAVED RUN SCRIPT', runscript_file);
        });

        that.on('ready', function () {
            log(' STATION READY');
        });
    };

    this.mergeOptions = function () {
        if (args) {
            if (args.options)
                if (typeof args.options === 'object')
                    that.options = merge(defaults, args.options);
        }

        if (that.options.path.script.substring(0, 1) === '/') {
            that.options.runscript_path = that.options.path.script;
        } else {
            that.options.runscript_path = global.app_root + '/' + that.options.storage_path;
        }
    };

    this.on = function () {
        that.event.on.apply(that.event, Array.from(arguments));
    };
    this.emit = function () {
        that.event.emit.apply(that.event, Array.from(arguments));
    };

    this.killProcesses = function () {
        spawn('sudo', ['/usr/bin/killall', 'mpd']);
        spawn('sudo', ['/usr/bin/killall', 'icecast']);
    };

    this.saveScript = function () {
        var runscript_file = that.options.runscript_path + '/run.sh';
        var mpc_file = that.options.runscript_path + '/mpc.sh';
        var script = '#!/bin/bash\n';

        script += [
            that.icecast.options.bin,
            '-c',
            global.app_root + '/' + that.icecast.options.path.config + '/' + that.icecast.options.name + '.xml',
            '&',
            '\n'
        ].join(' ');
        that.channels.data.forEach(function (channel) {
            var config_mpd = global.app_root + '/' + channel.options.mpd.path.config + '/' + channel.options.mpd.id + '.conf';
            script += [
                channel.options.mpd.bin,
                config_mpd,
                '--kill',
                '\n',
                'sleep',
                '2',
                '\n'
            ].join(' ');
            script += [
                channel.options.mpd.bin,
                config_mpd,
                '--no-daemon',
                '--stdout',
                '--verbose',
                '--stderr',
                '&',
                '\n',
                'sleep',
                '2',
                '\n'
            ].join(' ');
            fs.writeFileSync(runscript_file, script);
        });

        var script = '#!/bin/bash\n';
        that.channels.data.forEach(function (channel) {
            var base_mpc = [channel.options.mpc.bin, '-h', channel.options.mpc.host, '-p', channel.options.mpc.port].join(' ');
            script += [base_mpc, 'load', channel.options.mpd.id, '\n'].join(' ');
            script += [base_mpc, 'shuffle', '\n'].join(' ');
            script += [base_mpc, 'repeat', '\n'].join(' ');
            script += [base_mpc, 'crossfade', '8', '\n'].join(' ');
            script += [base_mpc, 'play', '\n', '\n'].join(' ');
        });
        fs.writeFileSync(mpc_file, script);
        that.emit('saved-runscript', runscript_file);
    };

    this.flushStorage = function () {
        var storage_path = global.app_root + '/' + that.options.storage_path;
        fs.removeSync(storage_path);
        log(' STATION STORAGE FLUSHED', storage_path);
    };

    this.shutdown = function(){
        that.channels.data.forEach(function (channel) {
            channel.shutdown();
        });
    };

    that.init();

    return {
        on: that.on,
        emit: that.emit,
        channels: that.channels,
        icecast: that.icecast,
        shutdown: that.shutdown
    }

};