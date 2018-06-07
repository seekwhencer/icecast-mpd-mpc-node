var Event = require('events');
var merge = require('deepmerge');
var fs = require('fs-extra');
var slugify = require('slugify');
var crypto = require('crypto');
var spawn = require('child_process').spawn;
var Log = require('./log.js');
var DarkIce = require('./darkice.js');
var FFMix = require('./ffmix.js');

module.exports = function (args) {
    var that = this;
    var log = new Log();
    var defaults = global.config.input;
    this.options = defaults;
    this.data = [];
    this.event = new Event();
    this.ready = false;
    this.darkice, this.ffmix;

    this.init = function () {
        log(' INPUT INIT');
        that.mergeOptions();
        that.checkFolder();
        that.on('ready', function () {
            that.ready = true;
            log(' INPUT READY');
            that.saveJson();
        });
        that.on('saved-json', function () {
            log(' INPUT SAVED', that.name, that.options.json_file);
        });

        that.darkice = new DarkIce({
            options: that.options.darkice,
            input: that
        });
        that.darkice.on('ready', function(){
            that.emit('ready');
        });
        that.ffmix = new FFMix({
            options: that.options.ffmix,
            input: that
        });

        // that.emit('ready');
    };

    this.mergeOptions = function () {
        if (args) {
            if (args.options)
                if (typeof args.options === 'object')
                    that.options = merge(that.options, args.options);
        }
        if (!that.options.slug)
            that.options.slug = slugify(that.options.name, {replacement: '_', lower: true});

        if (!that.options.id)
            that.options.id = crypto.createHash('md5').update(Date.now() + '').digest("hex");

        if (global.config.storage.path.substring(0, 1) === '/') {
            that.options.json_path = global.config.storage.path + '/' + that.options.path;
        } else {
            that.options.json_path = global.app_root + '/' + global.config.storage.path + '/' + that.options.path;
        }

        that.id = that.options.id;
        that.name = args.options.name;
        that.slug = args.options.slug;
        that.options.json_file = that.options.json_path + '/' + that.id + '.json';
    };

    this.getOptions = function () {
        return that.options;
    };

    this.saveJson = function () {
        var save = that.options;
        save.darkice = that.darkice.options;
        save.ffmix = that.ffmix.options;

        fs.writeJsonSync(that.options.json_file, that.options);
        that.emit('saved-json', that);
    };

    this.checkFolder = function () {
        fs.mkdirsSync(that.options.json_path);
    };

    this.isReady = function () {
        return that.ready;
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
        on: that.on,
        emit: that.emit,
        options: that.getOptions(),
        ready: that.isReady,
        darkice: that.darkice,
        ffmix: that.ffmix
    }
};