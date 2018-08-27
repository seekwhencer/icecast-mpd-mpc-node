var Event = require('events');
var merge = require('deepmerge');
var Log = require('./log.js');
var slugify = require('slugify');
var crypto = require('crypto');
var fs = require('fs-extra');
var Playlist = require('./playlist.js');

module.exports = function (args) {
    var that = this;
    var defaults = global.config.show;
    this.options = defaults;
    this.event = new Event();
    var log = new Log();
    this.data = [],
        this.id,
        this.name,
        this.ready = false,
        this.shows,
        this.playlist;

    this.init = function () {
        that.mergeOptions();
        log(' INIT SHOW', that.id);
        that.setup();
    };
    this.mergeOptions = function () {
        if (args) {
            if (args.options)
                if (typeof args.options === 'object')
                    that.options = merge(defaults, args.options);

            if (args.parent)
                that.channel = args.parent.channel;
        }

        if (!that.options.slug)
            that.options.slug = slugify(that.options.name, {replacement: '_', lower: true});

        if (!that.options.id)
            that.options.id = crypto.createHash('md5').update(Date.now() + '').digest("hex");

        Object.keys(that.options.path).forEach(function (p) {
            if (!that.options[p].path)
                that.options[p].path = that.options.path[p] + '/' + that.options[p].folder;
        });

        that.id = that.options.id;
        that.name = args.options.name;
        that.slug = args.options.slug;
        that.options.json_file = that.options.json_path + '/' + that.id + '.json';
    };
    this.setup = function () {
        that.saveJson();

        that.playlist = new Playlist({
            options: {},
            show: that,
            channel: that.channel
        });
        //that.playlist.generate(); // NOT! @TODO
        that.emit('ready', that);
    };

    this.saveJson = function () {
        fs.writeJsonSync(that.options.json_file, that.options);
        that.emit('saved-json', that);
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
        slug: that.slug,
        on: that.on,
        emit: that.emit,
        shows: that.shows,
        playlist: that.playlist
    };
};