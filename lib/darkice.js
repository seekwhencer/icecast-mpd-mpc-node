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
    this.process, this.timer = false;

    this.init = function () {

        that.on('ready', function(){
            log(' DARKICE READY', that.input.name, that.input.id);
        });

        that.on('data', function(chunk){
            //log(' DARKICE LOG', chunk);
        });

        that.on('failed', function(){
            log(' DARKICE START FAILED');
            that.respawn();
        });

        that.on('exited', function(){
            log(' DARKICE EXITED');
            that.respawn();
        });

        that.options = merge(global.config.darkice, args.options);
        if (global.config.storage.path.substring(0, 1) === '/') {
            that.options.config_path = global.config.storage.path + '/' + that.options.path;
        } else {
            that.options.config_path = global.app_root + '/' + global.config.storage.path + '/' + that.options.path;
        }
        that.options.conf_file = that.options.config_path + '/' + that.input.id + '.conf';

        that.options.config['icecast2-0'].server = global.station.icecast.options.config.hostname;
        that.options.config['icecast2-0'].password = global.station.icecast.options.config.authentication['source-password'];
        that.options.config['icecast2-0'].port = global.station.icecast.options.config['listen-socket'].port;
        that.options.config['icecast2-0'].name = that.input.name;

        that.saveConfig();
        that.run();
    };

    this.run = function () {
        log(' DARKICE STARTING', that.input.name);
        var options = ['-c', that.options.conf_file, '-v', 10];
        var match = {
            ready: new RegExp(/transfer/),
            failed: new RegExp(/can't open connector/)
        };
        that.process = spawn(that.options.bin, options);
        that.process.stdout.setEncoding('utf8');
        that.process.stderr.setEncoding('utf8');
        that.process.stdout.on('data', function (chunk) {
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
            that.emit('data', chunk);
        });
        that.process.stdout.on('end', function () {
            that.emit('exited', that);
        });
    };

    this.respawn = function(){
        if(that.options.respawn_on_fail === true){
            clearTimeout(that.timer);
            that.timer = setTimeout(function(){
                that.process = '';
                that.run();
            }, that.options.respawn_delay * 1000);
        }
    };

    this.saveConfig = function () {
        that.checkFolder();
        var conf = '';
        Object.keys(that.options.config).forEach(function (i) {
            conf += '[' + i + ']\n';
            Object.keys(that.options.config[i]).forEach(function(f){
                if (typeof that.options.config[i][f] === 'string' || typeof that.options.config[i][f] === 'number') {
                    conf += f + ' = ' + that.options.config[i][f] + '\n';
                }
            });
            conf += '\n';
        });
        fs.writeFileSync(that.options.conf_file, conf);
        that.emit('saved-config', that);
    };

    this.checkFolder = function () {
        fs.mkdirsSync(that.options.config_path);
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