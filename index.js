require('dotenv').config();
var Storage = require('./lib/storage.js');
var Station = require('./lib/station.js');

global.app_root = process.env.PWD;
global.environment = process.env.NODE_ENV || 'prod';
global.config = require('./config/' + global.environment + '.js');

global.core = new function () {
    var that = this;
    this.station, this.storage;

    this.init = function () {
        that.storage = new Storage({
            options: global.config.storage
        });
        that.station = new Station({
            options: global.config.station
        });
        process.on('SIGINT', function() {
            that.station.shutdown();
            setTimeout(function () {
                process.exit(0);
            }, 2000);
        });
        process.stdin.resume();
    };

    that.init();

    return {
        station: that.station,
        storage: that.storage
    }
}(); // just do it now