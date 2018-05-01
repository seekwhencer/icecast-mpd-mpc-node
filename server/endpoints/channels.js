const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
    var channels = global.station.channels.data;
    var channel_api_base = 'http://' + global.config.server.host + ':' + global.config.server.port + '/channel/';
    var out = channels.map(function (channel) {
        return {
            id: channel.id,
            name: channel.name,
            api: [
                channel_api_base + channel.id + '/update-playlist',
                channel_api_base + channel.id + '/load-playlist',
                channel_api_base + channel.id + '/skip',
                channel_api_base + channel.id + '/play',
                channel_api_base + channel.id + '/play/1',
                channel_api_base + channel.id + '/pause',
                channel_api_base + channel.id + '/stop',
                channel_api_base + channel.id + '/crossfade/8',
                channel_api_base + channel.id + '/respawn',
                channel_api_base + channel.id + '/shutdown',
                channel_api_base + channel.id + '/spawn'
            ]
        };
    });
    res.json(out);
});

module.exports = router;
