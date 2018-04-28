require('dotenv').config();
var Storage = require('./lib/storage.js');
var Station = require('./lib/station.js');

global.app_root = process.env.PWD;
global.environment = process.env.NODE_ENV || 'prod';
global.config = require('./config/' + global.environment + '.js');
global.storage = new Storage();
global.storage.on('ready', function () {
    global.station = new Station();
});

process.on('SIGINT', function () {
    global.station.shutdown();
    setTimeout(function () {
        process.exit(0);
    }, 2000);
});
process.stdin.resume();
