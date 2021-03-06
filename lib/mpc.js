var Event = require('events');
var merge = require('deepmerge');
var spawn = require('child_process').spawn;
var Log = require('./log.js');

module.exports = function (args) {
    var that = this;
    var defaults = global.config.mpc;
    this.options = defaults, this.host, this.port, this.process, this.playlist, this.ready = false;

    var log = new Log();
    this.event = new Event();
    this.next_delay = 0;

    this.init = function () {
        that.mergeOptions();
        log(' MP CLIENT INIT', that.name, 'ON', that.host + ':' + that.port);
        that.on('ready', function () {
            that.ready = true;
        });

        that.on('exit', function () {

        });
        that.on('data', function (chunk, mpc) {
            //log(' MPC GET MESSAGE', mpc.name, chunk);
        });
        that.emit('ready', that);
    };

    this.mergeOptions = function () {
        if (args) {
            if (args.options) {
                if (typeof args.options === 'object')
                    that.options = merge(defaults, args.options);

                ['id', 'name', 'host', 'port'].forEach(function (k) {
                    if (that.options[k])
                        that[k] = that.options[k];
                });
                that.playlist = that.id;
            }
        }

        that.next_delay = that.options.delay;
    };

    this.updateDatabase = function () {
        that.query(['update', '--wait']);
    };

    this.setCrossfade = function (seconds) {
        that.query(['crossfade', seconds]);
    };

    this.play = function (number) {
        var options = ['play'];
        if (number) {
            options = ['play', number]
        }
        that.query(options);
    };

    this.repeat = function () {
        that.query(['repeat']);
    };

    this.pause = function () {
        that.query(['pause']);
    };
    this.stop = function () {
        that.query(['stop']);
    };

    this.loadPlaylist = function (playlist) {
        that.query(['load', playlist]);
    };

    this.status = function () {
        that.query(['-f', '"%title% - %artist% - %time% - %file%"']);
    };

    this.crop = function () {
        that.query(['crop']);
    };
    this.shuffle = function () {
        that.query(['shuffle']);
    };
    this.skip = function () {
        that.query(['next']);
    };

    this.updatePlaylist = function (playlist) {
        log(' MPC UPDATE PLAYLIST');
        if (!playlist)
            playlist = that.playlist;

        that.crop();
        that.loadPlaylist(playlist);
        that.setCrossfade(8);
        //that.shuffle();
        that.play(2);
        that.repeat();
        that.status();
    };

    this.initPlaylist = function(){
        playlist = that.playlist;
        that.loadPlaylist(playlist);
        that.setCrossfade(8);
        that.repeat();
        that.play(1);
    };

    this.query = function (query) {
        setTimeout(function () {
            var options = ['-p', that.port, '-h', that.host].concat(query);
            log(' MPC QUERYING', options.join(' '));

            that.process = spawn(that.options.bin, options);
            that.process.stdout.setEncoding('utf8');
            that.process.stderr.setEncoding('utf8');

            that.process.stderr.on('data', function (chunk) {
                last_chunk = chunk;
                that.emit('data', chunk, that);
            });

            that.process.stdout.on('data', function (chunk) {
                last_chunk = chunk;
                that.emit('data', chunk, that);
            });

            that.process.stderr.on('end', function () {
                that.emit('exit', that);
            });

            that.next_delay = that.next_delay - that.options.delay;

            if(that.next_delay === that.options.delay){
                log(" MPD QUEUE END");
            }

        }, that.next_delay);
        that.next_delay = that.next_delay + that.options.delay;
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

    this.getOptions = function () {
        return that.options;
    };

    that.init();

    return {
        on: that.on,
        emit: that.emit,
        ready: that.isReady,
        getOptions: that.getOptions,
        updateDatabase: that.updateDatabase,
        loadPlaylist: that.loadPlaylist,
        updatePlaylist: that.updatePlaylist,
        initPlaylist: that.initPlaylist,
        setCrossfade: that.setCrossfade,
        play: that.play,
        repeat: that.repeat,
        status: that.status,
        skip: that.skip,
        pause: that.pause,
        stop: that.stop
    }
};