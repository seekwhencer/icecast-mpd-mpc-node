module.exports = {
    interrupt: 10, // ms
    channel_index: 0,
    buttons: [
        {
            pin: 11,
            onchange: function (buttons) {
                global.station.channels.data[buttons.channel_index].updateDatabase();
            }
        },
        {
            pin: 12,
            onchange: function (buttons) {
                global.station.channels.data[buttons.channel_index].shows.data[buttons.show_index].playlist.generate();
                if (buttons.show_index < global.station.channels.data[buttons.channel_index].shows.data.length - 1) {
                    buttons.show_index++;
                } else {
                    buttons.show_index = 0;
                }
            }
        },
        {
            pin: 15,
            onchange: function (buttons) {
                global.station.channels.data[buttons.channel_index].skip();
            }
        }
    ]
};