const Event = require('events');
const express = require('express');
const app = express();
const station = require('./endpoints/station.js');
const channel = require('./endpoints/channel.js');
const channels = require('./endpoints/channels.js');
const internal = require('./endpoints/internal.js');

/*
var express = require('express');
var app = express();
httpServer = require('http').createServer(app);
httpServer.listen('3333');
// Then close the server when done...
httpServer.close();
 */


module.exports = function (args) {
    console.log(' INIT WEB APP');
    var event = new Event();
    var server = null;
    var httpServer = require('http').createServer(app);

    const defaults = {
        port : global.config.server.port,
        host: global.config.server.host
    };
    if(typeof args === 'object') {
        var options = Object.assign({}, defaults, args);
    } else {
        options = defaults;
    }

    app.use('/internal', internal);
    app.use('/station', station);
    app.use('/channel', channel);
    app.use('/channels', channels);
    app.use('/', express.static('server/static'));

    app.use(function (req, res, next) {
        const err = new Error('Not Found');
        err.status = 404;
        res.json(err);
    });

    httpServer.listen(options.port, options.host, function () {
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
        httpServer: httpServer,
        on: on,
        emit: emit
    };
};