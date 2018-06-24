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
    this.channel;
    this.icecast_config;
    this.source_host;
    this.source;
    this.process;

    this.init = function () {
        that.options = merge(global.config.ffmix, args.options);
        that.icecast_config = global.station.icecast.options.config;
        that.channel = global.station.channels.data[that.options.source_channel];
        that.source_host = 'http://' + that.icecast_config.hostname + ':' + that.icecast_config['listen-socket'].port;
        that.source = {
            a: that.source_host + that.channel.mpd.options.config.audio_output.mount,
            b: that.source_host + '/' + that.input.darkice.options.config['icecast2-0'].mountPoint
        };

        that.on('ready', function () {
            log(' FFMIX READY', that.input.name, that.input.id);
        });

        that.on('data', function (chunk) {
            //log(' FFMIX LOG', chunk);
        });

        that.on('source-offline', function () {
            log(' FFMIX SOURCE OFFLINE', that.input.name);
            if (that.options.respawn_on_fail === true) {
                setTimeout(function () {
                    that.process = '';
                    that.run();
                }, that.options.respawn_delay * 1000);
            }
        });
        that.run();
    };

    this.run = function () {
        log(' FFMIX STARTING', that.input.name);
        var target = 'icecast://source:' + that.icecast_config.authentication['source-password'] + '@' + that.icecast_config.hostname + ':' + that.icecast_config['listen-socket'].port + '' + that.channel.mpd.options.config.audio_output.mount + that.options.endpoint_addition;
        var options = [
            "-i", that.source.a,
            "-i", that.source.b,
            "-muxpreload", that.options.muxpreload,
            "-c:a", that.options.codec,
            "-b:a", that.options.bitrate,
            "-id3v2_version", that.options.id3v2_version,
            "-legacy_icecast", 1,
            "-content_type", that.options.content_type,
            "-ice_name", that.channel.name + " " + that.options.name_addition,
            "-filter_complex", '[0:a][1:a]amerge=inputs=2,pan=stereo|c0<c0+c2|c1<c1+c3[aout]',
            "-map", '[aout]',
            "-f", "mp3", target,
            "-y"
        ];
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
        that.process.stdout.on('end', function () {
            that.emit('exited', that);
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
        options: that.getOptions()
    };
};