var Event = require('events');
var spawn = require('child_process').spawn;
var merge = require('deepmerge');
var fs = require('fs-extra');
var http = require('http');

var Log = require('./log.js');

module.exports = function (args) {
    var that = this;
    var app = null;
    var defaults = global.config.icecast;
    this.options = defaults, this.conf_file, this.process;

    var log = new Log();
    this.event = new Event();

    if (args) {
        if (args.app)
            app = args.app;

        if (args.options)
            if (typeof args.options === 'object') {
                that.options = merge(defaults, args.options);
            }
    }

    this.init = function () {
        log(' INIT ICECAST');
        that.conf_file = global.app_root + '/' + that.options.path.config + '/' + that.options.name + '.xml';
        that.on('saved', function () {
            log(' ICECAST SAVED CONFIG FILE', that.conf_file);
        });
        that.checkFolder();
        that.save();
        if (that.options.autostart === true) {
            that.run();
        } else {
            setTimeout(function () {
                that.emit('ready');
            }, 100);
        }
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
    };

    this.save = function () {
        var conf = '<icecast>\n';
        Object.keys(that.options.config).forEach(function (i) {
            if (typeof that.options.config[i] === 'string' || typeof that.options.config[i] === 'number') {
                conf += '    <' + i + '>' + that.options.config[i] + '</' + i + '>\n';
            }
            if (typeof that.options.config[i] === 'object') {
                conf += '    <' + i + '>\n';
                Object.keys(that.options.config[i]).forEach(function (ii) {
                    if (typeof that.options.config[i][ii] === 'string' || typeof that.options.config[i][ii] === 'number') {
                        conf += '        <' + ii + '>' + that.options.config[i][ii] + '</' + ii + '>\n';
                    }
                    if (typeof that.options.config[i][ii] === 'object') {
                        var attr = [];
                        that.options.config[i][ii].forEach(function (iii) {
                            Object.keys(iii).forEach(function (k) {
                                attr.push(k + '="' + iii[k] + '"');
                            });
                        });
                        var s = attr.join(' ');
                        conf += '        <' + ii + ' ' + s + '/>\n';
                    }
                });
                conf += '    </' + i + '>\n';
            }
        });
        conf += '</icecast>\n';
        fs.writeFileSync(that.conf_file, conf);
        that.emit('saved', that);
    };

    this.run = function () {
        var options = ['-c', that.conf_file];
        var last_chunk = '';

        log(' ICECAST STARTING', that.options.bin, 'WITH CONFIG', options.join(' '));

        that.process = spawn(that.options.bin, options);
        that.process.stdout.setEncoding('utf8');
        that.process.stderr.setEncoding('utf8');

        that.process.stderr.on('data', function (chunk) {
            last_chunk = chunk;
            log(' ICECAST GET MESSAGE', chunk);
        });

        that.process.stderr.on('end', function () {
            log(' ICECAST EXITED');
        });
        setTimeout(that.checkUp, that.options.checkup_delay);
    };

    this.checkUp = function () {
        log(' ICECAST CHECK IF IT IS RUNNING ...');
        http.get({
            hostname: that.options.config.hostname,
            port: that.options.config["listen-socket"].port,
            path: '/status.xsl'
        }, function (res) {
            var responseString = '';
            res.on('data', function (data) {
                responseString += data;
            });

            res.on('end', function () {
                that.emit('ready');
            });
        }).on('error', function (err) {
            console.log(' ICECAST IS NOT RUNNING', JSON.stringify(err));
            setTimeout(that.checkUp, that.options.checkup_delay);
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
        options: that.getOptions()
    }

};