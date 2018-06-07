var Event = require('events');
var merge = require('deepmerge');
var fs = require('fs-extra');
var spawn = require('child_process').spawn;
var Log = require('./log.js');

module.exports = function (args) {
    var that = this;
    var log = new Log();
    this.event = new Event();
    this.options = args.options;
    this.input = args.input;
    this.process;

    this.init = function () {
        that.options = merge(global.config.ffmix, args.options);
        that.on('ready', function () {
            log(' FFMIX READY', that.input.name, that.input.id);
        });

        that.on('data', function (chunk) {
            //log(' FFMIX LOG', chunk);
        });

        that.on('source-offline', function () {
            log(' FFMIX SOURCE OFFLINE', that.input.name);
            setTimeout(function () {
                that.process = '';
                that.run();
            }, that.options.retry * 1000);
        });
        that.run();
    };

    this.run = function () {
        var gsioc = global.station.icecast.options.config;
        var channel = global.station.channels.data[that.options.source_channel];
        var server = 'http://' + gsioc.hostname + ':' + gsioc['listen-socket'].port;
        var source = {
            a: server + channel.mpd.options.config.audio_output.mount,
            b: server + '/' + that.input.darkice.options.config['icecast2-0'].mountPoint
        };
        var target = 'icecast://source:' + gsioc.authentication['source-password'] + '@' + gsioc.hostname + ':' + gsioc['listen-socket'].port + '' + channel.mpd.options.config.audio_output.mount + that.options.endpoint_addition;
        var options = [
            "-i", source.a,
            "-i", source.b,
            "-muxpreload", 1,
            "-c:a", "libmp3lame",
            "-b:a", "128k",
            "-id3v2_version", 3,
            "-legacy_icecast", 1,
            "-content_type", "audio/mpeg",
            "-ice_name", channel.name + " " + that.options.name_addition,
            "-filter_complex", '[0:a][1:a]amerge=inputs=2,pan=stereo|c0<c0+c2|c1<c1+c3[aout]',
            "-map", '[aout]',
            "-f", "mp3", target,
            "-y"
        ];

        log(' FFMIX STARTING', that.input.name);
        var last_chunk = '';

        var match = {
            ready: new RegExp(/Stream mapping:/),
            'source-offline': new RegExp(/Server returned 404 Not Found/),
            'connection-refused': new RegExp(/Connection refused/),
        };

        var onEvent = function (chunk) {
            that.emit('data', chunk);
            Object.keys(match).forEach(function (key) {
                if (match[key].length === undefined) {
                    if (chunk.match(match[key])) {
                        that.emit(key, that, chunk);
                    }
                } else {
                    match[key].forEach(function (event) {
                        if (chunk.match(event)) {
                            that.emit(key, that, chunk);
                        }
                    });
                }
            });
        };

        that.process = spawn(that.options.bin, options);
        that.process.stdout.setEncoding('utf8');
        that.process.stderr.setEncoding('utf8');

        that.process.stdout.on('data', onEvent);
        that.process.stderr.on('data', onEvent);

        that.process.stderr.on('end', function () {

        });
    };

    this.getOptions = function () {
        return that.options;
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
        run: that.run,
        options: that.getOptions(),
    };
};