const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
    var api_base = 'http://' + global.config.server.host + ':' + global.config.server.port + '/';
    var out = {
        api : [
            api_base + 'channels'
        ]
    };
    res.json(out);
});

module.exports = router;
