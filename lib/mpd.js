var Event = require('events');
var merge = require('deepmerge');
var fs = require('fs-extra');
var spawn = require('child_process').spawn;
var path = require('path');

var Log = require('./log.js');

module.exports = function (args) {
    var that = this;
    var app = null;
    var defaults = global.config.mpd;
    this.options = {},
        this.id,
        this.name,
        this.ready = false;

    var log = new Log();
    this.event = new Event();

    this.init = function () {
        that.mergeOptions();
        log(' MP DAEMON INIT', that.name, 'ON', that.options.config.bind_to_address + ':' + that.options.config.port);
        that.checkFolder();

        that.on('ready', function (mpd, chunk) {
            that.ready = true;
        });
        that.on('failed', function (mpd, chunk) {
            if (that.ready !== true) {
                log(' !!! MPD CONNECTION TIMEOUT', that.name);
                that.emit('ready', that);
            }
        });
        that.on('address', function (mpd, chunk) {
            if (that.ready !== true) {
                log(' !!! MPD ADDRESS IN USE', mpd.name);
                that.emit('ready', that);
            }
        });
        that.on('data', function (chunk) {
            if (that.options.debug.stderr === true) {
                log(' MPD OUT', that.name, chunk);
            }
        });
        that.on('no-soundcard', function (mpd, chunk) {
            log(' MPD NO SOUNDCARD FOUND', mpd.name);
        });
        that.on('update', function (mpd, chunk) {
            log(' MPD DB UPDATE', mpd.name);
        });
        that.on('added', function (mpd, chunk) {
            //log(' MPD ADDED DB', mpd.name, chunk);
        });
        that.on('shutdown', function (mpd) {
            log(' MPD SHUTTING DOWN', mpd.name);
        });
        that.on('respawn', function (mpd) {
            log(' MPD RESPAWN', mpd.name);
        });

        if (that.options.autostart === true) {
            that.on('saved-config', function () {
                log(' MPD SAVED CONFIG', that.name, 'AUTOSTART', that.options.conf_file);
                that.run();
            });
        }

        if (that.options.autostart === false) {
            that.on('saved-config', function () {
                log(' MPD SAVED CONFIG', that.name, that.options.conf_file);
                setTimeout(function () {
                    that.emit('ready', that);
                }, that.options.ready_delay);
            });
        }
        that.saveConfig();
    };

    this.mergeOptions = function () {
        that.options = merge(defaults, args.options);
        that.id = that.options.id;
        that.name = args.options.name;
        that.slug = args.options.slug;

        // rewrite or create the filled config
        ['playlist', 'music'].forEach(function (i) {
            if (that.options.path[i].substring(0, 1) === '/') {
                that.options.config[i + '_directory'] = that.options.path[i];
            } else {
                that.options.config[i + '_directory'] = global.app_root + '/' + that.options.path[i];
            }
        });
        var files = {
            db: 'cache',
            pid: 'pid',
            log: 'log'
        };
        Object.keys(files).forEach(function (i) {
            if (that.options.path[i].substring(0, 1) === '/') {
                that.options.config[i + '_file'] = that.options.path[i] + '/mpd_' + that.id + '.' + files[i];
            } else {
                that.options.config[i + '_file'] = global.app_root + '/' + that.options.path[i] + '/' + that.id + '.' + files[i];
            }
        });
        that.options.config.audio_output.name = that.name;
        that.options.config.zeroconf_name = that.id;
        that.options.conf_file = global.app_root + '/' + that.options.path.config + '/' + that.id + '.conf';
        that.options.json_file = global.app_root + '/' + global.config.storage.path + '/channels/' + that.id + '.json';
    };

    this.saveConfig = function () {
        var conf = '';
        Object.keys(that.options.config).forEach(function (i) {
            if (typeof that.options.config[i] === 'string' || typeof that.options.config[i] === 'number') {
                conf += i + ' "' + that.options.config[i] + '"\n';
            }
            if (typeof that.options.config[i] === 'object') {
                conf += i + ' {\n';
                Object.keys(that.options.config[i]).forEach(function (ii) {
                    conf += '   ' + ii + ' "' + that.options.config[i][ii] + '"\n';
                });
                conf += '}\n';
            }
        });
        that.options.config_file_end.audio_output.name = 'fake_' + that.id;
        Object.keys(that.options.config_file_end).forEach(function (i) {
            if (typeof that.options.config_file_end[i] === 'object') {
                conf += i + ' {\n';
                Object.keys(that.options.config_file_end[i]).forEach(function (ii) {
                    conf += '   ' + ii + ' "' + that.options.config_file_end[i][ii] + '"\n';
                });
                conf += '}\n';
            }
        });
        fs.writeFileSync(that.options.conf_file, conf);
        that.emit('saved-config', that);
    };

    this.checkFolder = function () {
        Object.keys(that.options.path).forEach(function (p) {
            if (that.options.path[p].substring(0, 1) === '/') {
                fs.mkdirsSync(that.options.path[p]);
            } else {
                var f = global.app_root + '/' + that.options.path[p];
                fs.mkdirsSync(f);
            }
        });
        if (global.config.storage.path.substring(0, 1) === '/') {
            fs.mkdirsSync(global.config.storage.path + '/channels');
        } else {
            fs.mkdirsSync(global.app_root + '/' + global.config.storage.path + '/channels');
        }
    };

    this.run = function (complete_event) {
        if(!complete_event){
            complete_event = 'ready';
        }
        var options = [that.options.conf_file, '--no-daemon', '--verbose', /*'--stdout',*/ '--stderr'];
        log(' MPD STARTING', that.name, 'WITH OPTIONS', JSON.stringify(options));
        var last_chunk = '';

        var match = {
            collision: new RegExp(/Local name collision/),
            address: new RegExp(/Address already in use/),
            "no-soundcard": new RegExp(/cannot find card/),
            update: new RegExp(/update: finished/),
            added: new RegExp(/update: added /)
        };
        match[complete_event] = [new RegExp(/successfully established/)];

        that.process = spawn(that.options.bin, options);
        that.process.stdout.setEncoding('utf8');
        that.process.stderr.setEncoding('utf8');
        that.process.stderr.on('data', function (chunk) {
            last_chunk = chunk;
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
        });

        that.process.stdout.on('data', function (chunk) {
            log(' >>>>>>', data);
        });

        that.process.stderr.on('end', function () {
            //that.emit('ready', that);
        });

        // setTimeout(function () {
        //     that.emit('failed');
        // }, that.options.skip_timeout);
    };

    this.isReady = function () {
        return that.ready;
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

    this.shutdown = function () {
        var options = [that.options.conf_file, '--kill'];
        spawn(that.options.bin, options);
        that.emit('shutdown', that);
    };

    this.respawn = function () {
        that.shutdown();
        setTimeout(function () {
            that.run('respawn', that);
        }, 10000);
    };

    that.init();

    return {
        on: that.on,
        emit: that.emit,
        saveConfig: that.saveConfig,
        ready: that.isReady,
        getOptions: that.getOptions,
        shutdown: that.shutdown,
        respawn: that.respawn
    }
};