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

module.exports = router;