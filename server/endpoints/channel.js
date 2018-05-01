const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
    res.json({});
});

// channels informations
router.get('/:channel', function (req, res) {
    var channel = global.station.channels.get(req.params.channel);
    if(!channel){
        res.send('404');
        return;
    }
    res.send(channel.name);
});

// skip track
router.get('/:channel/skip', function (req, res) {
    var channel = global.station.channels.get('id', req.params.channel);
    if(!channel){
        res.send('404');
        return;
    }
    channel.skip();
    res.send(channel.name + ' skipped');
});

// update mpc music database
router.get('/:channel/update-database', function (req, res) {
    var channel = global.station.channels.get('id', req.params.channel);
    if(!channel){
        res.send('404');
        return;
    }
    channel.updateDatabase();
    res.send(channel.name + ' database updating');
});

// load playlist only
router.get('/:channel/load-playlist', function (req, res) {
    var channel = global.station.channels.get('id', req.params.channel);
    if(!channel){
        res.send('404');
        return;
    }
    channel.loadPlaylist();
    res.send(channel.name + ' playlist loaded');
});

// update playlist and play
router.get('/:channel/update-playlist', function (req, res) {
    var channel = global.station.channels.get('id', req.params.channel);
    if(!channel){
        res.send('404');
        return;
    }
    channel.updatePlaylist();
    res.send(channel.name + ' playlist updated');
});

// play
router.get('/:channel/play', function (req, res) {
    var channel = global.station.channels.get('id', req.params.channel);
    if(!channel){
        res.send('404');
        return;
    }
    channel.play();
    res.send(channel.name + ' playing');
});

// play track number
router.get('/:channel/play/:number', function (req, res) {
    var channel = global.station.channels.get('id', req.params.channel);
    if(!channel){
        res.send('404');
        return;
    }
    channel.play(req.params.number);
    res.send(channel.name + ' playing');
});

// pause playing
router.get('/:channel/pause', function (req, res) {
    var channel = global.station.channels.get('id', req.params.channel);
    if(!channel){
        res.send('404');
        return;
    }
    channel.pause();
    res.send(channel.name + ' paused');
});

// stop playing
router.get('/:channel/stop', function (req, res) {
    var channel = global.station.channels.get('id', req.params.channel);
    if(!channel){
        res.send('404');
        return;
    }
    channel.stop();
    res.send(channel.name + ' stopped');
});

// set crossfade in seconds
router.get('/:channel/crossfade/:seconds', function (req, res) {
    var channel = global.station.channels.get('id', req.params.channel);
    if(!channel){
        res.send('404');
        return;
    }
    channel.setCrossfade(req.params.seconds);
    res.send(channel.name + ' setting crossfade to: ' + req.params.seconds + ' seconds');
});

// reboot channel
router.get('/:channel/respawn', function (req, res) {
    var channel = global.station.channels.get('id', req.params.channel);
    if(!channel){
        res.send('404');
        return;
    }
    channel.respawn();
    res.send(channel.name + ' respawning');
});

// reboot channel
router.get('/:channel/shutdown', function (req, res) {
    var channel = global.station.channels.get('id', req.params.channel);
    if(!channel){
        res.send('404');
        return;
    }
    channel.shutdown();
    res.send(channel.name + ' shutting down');
});

module.exports = router;