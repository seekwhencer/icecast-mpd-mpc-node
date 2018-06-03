module.exports = {
    interrupt: 10, // ms
    buttons : [
        {
            pin: 11,
            onchange: function(){
                //global.station.channels.data[0].updatePlaylist();
                //global.station.channels.get('slug','one').shows.get('slug','breaks').playlist.generate();
                global.station.channels.data[0].shows.data[0].playlist.generate();
            }
        }
    ]
};