const Event = require('events');
const express = require('express');
const app = express();
const channel = require('./endpoints/channel.js');
const channels = require('./endpoints/channels.js');
const internal = require('./endpoints/internal.js');

module.exports = function (args) {
    console.log(' INIT WEB APP');
    var event = new Event();
    const defaults = {
        port : global.config.server.port
    };
    if(typeof args === 'object') {
        var options = Object.assign({}, defaults, args);
    } else {
        options = defaults;
    }

    app.use('/internal', internal);
    app.use('/channel', channel);
    app.use('/channels', channels);
    app.use('/', express.static('server/static'));

    app.use(function (req, res, next) {
        const err = new Error('Not Found');
        err.status = 404;
        res.json(err);
    });

    app.listen(options.port, function () {
        emit('ready');
    });

    on = function () {
        event.on.apply(event, Array.from(arguments));
    };
    emit = function () {
        event.emit.apply(event, Array.from(arguments));
    };
    on('ready', function(){
        console.log(' >>> WEB APP ON PORT', options.port, 'IS UP AND RUNNING\n');
    });
    return {
        app: app,
        on: on,
        emit: emit
    };
};