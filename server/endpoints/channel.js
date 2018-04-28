const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
    res.json({});
});

router.get('/:channel', function (req, res) {
    var channel = global.station.channels.get(req.params.channel);
    if(!channel){
        res.send('404');
        return;
    }
    res.send(channel.name);
});

router.get('/:channel/skip', function (req, res) {
    var channel = global.station.channels.get('id', req.params.channel);
    if(!channel){
        res.send('404');
        return;
    }
    channel.skip();
    res.send(channel.name + ' skipped');
});

router.get('/:channel/load-playlist', function (req, res) {
    var channel = global.station.channels.get('id', req.params.channel);
    if(!channel){
        res.send('404');
        return;
    }
    channel.loadPlaylist();
    res.send(channel.name + ' playlist loaded');
});

router.get('/:channel/update-playlist', function (req, res) {
    var channel = global.station.channels.get('id', req.params.channel);
    if(!channel){
        res.send('404');
        return;
    }
    channel.updatePlaylist();
    res.send(channel.name + ' playlist updated');
});

router.get('/:channel/play', function (req, res) {
    var channel = global.station.channels.get('id', req.params.channel);
    if(!channel){
        res.send('404');
        return;
    }
    channel.play();
    res.send(channel.name + ' playing');
});

router.get('/:channel/play/:number', function (req, res) {
    var channel = global.station.channels.get('id', req.params.channel);
    if(!channel){
        res.send('404');
        return;
    }
    channel.play(req.params.number);
    res.send(channel.name + ' playing');
});

router.get('/:channel/pause', function (req, res) {
    var channel = global.station.channels.get('id', req.params.channel);
    if(!channel){
        res.send('404');
        return;
    }
    channel.pause();
    res.send(channel.name + ' paused');
});

router.get('/:channel/stop', function (req, res) {
    var channel = global.station.channels.get('id', req.params.channel);
    if(!channel){
        res.send('404');
        return;
    }
    channel.stop();
    res.send(channel.name + ' stopped');
});

router.get('/:channel/crossfade/:seconds', function (req, res) {
    var channel = global.station.channels.get('id', req.params.channel);
    if(!channel){
        res.send('404');
        return;
    }
    channel.setCrossfade(req.params.seconds);
    res.send(channel.name + ' setting crossfade to: ' + req.params.seconds + ' seconds');
});

module.exports = router;