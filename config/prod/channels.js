module.exports = [
    {
        name: "First Channel",
        autostart: true,
        mpd: {
            config: {
                port: 6100,
                audio_output: {
                    mount: "/one",
                    port: 8100
                }
            }
        }
    },/*
    {
        name: "Second Channel",
        autostart: false,
        mpd: {
            config: {
                port: 6200,
                audio_output: {
                    mount: "/two",
                    port: 8100
                }
            }
        }
    },
    {
        name: "Third Channel",
        autostart: false,
        mpd: {
            config: {
                port: 6300,
                audio_output: {
                    mount: "/three",
                    port: 8100
                }
            }
        }
    }*/
];