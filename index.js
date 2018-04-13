require('dotenv').config();
var Storage = require('./lib/storage.js');
var Station = require('./lib/station.js');
var Log = require('./lib/log.js');

global.app_root = process.env.PWD;
global.environment = process.env.NODE_ENV || 'prod';
global.config = require('./config/' + global.environment + '.js');

global.core = new function() {
    var that = this;
    this.station, this.storage;

    that.storage = new Storage({
        options: global.config.storage
    });
    that.station = new Station({
        options: global.config.station
    });

    return {
        station: that.station,
        storage: that.storage
    }
}();