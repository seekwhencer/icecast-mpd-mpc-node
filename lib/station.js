var Event = require('events');
var merge = require('deepmerge');
var spawn = require('child_process').spawn;

var Log = require('./log.js');
var Channels = require('./channels.js');
var Icecast = require('./icecast.js');

module.exports = function(args){
    var that = this;
    var app = null;
    var defaults = global.config.station;
    this.options = defaults;

    var log = new Log();
    this.event = new Event();
    this.channels;

    if (args) {
        if (args.app)
            app = args.app;

        if (args.options)
            if (typeof args.options === 'object')
                that.options = merge(defaults, args.options);
    }

    this.init = function(){
        that.killProcesses();
        that.icecast = new Icecast();
        that.icecast.on('ready', function(){
            log(' >>> ICECAST READY\n');
            that.channels = new Channels();
        });
    };

    this.on = function () {
        that.event.on.apply(that.event, Array.from(arguments));
    };
    this.emit = function () {
        that.event.emit.apply(that.event, Array.from(arguments));
    };

    this.killProcesses = function(){
        spawn('sudo', ['/usr/bin/killall', 'mpd']);
        spawn('sudo', ['/usr/bin/killall', 'icecast']);
    };

    that.init();

    return {
        on: that.on,
        emit: that.emit,
        channels: that.channels,
        icecast: that.icecast
    }

};