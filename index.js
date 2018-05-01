require('dotenv').config();
var Storage = require('./lib/storage.js');
var Station = require('./lib/station.js');
var Server = require('./server/index.js');

global.app_root = process.env.PWD;
global.environment = process.env.NODE_ENV || 'prod';
global.config = require('./config/' + global.environment + '.js');

function initStorage(){
    global.storage = new Storage();
    global.storage.on('ready', function () {
        initStation();
    });
}

function initStation() {
    global.station = new Station();
    global.station.on('ready', function(){
        initServer();
    });
}

function initServer() {
    global.server = new Server();
}

process.on('SIGINT', function () {
    global.station.shutdown();
    setTimeout(function () {
        process.exit(0);
    }, 2000);
});
process.stdin.resume();

initStorage();
