module.exports = [
    {
        name: "One",
        autostart: true,
        input_index : 0,
        mpd: {
            path: {
                music: "/data/audio"
            },
            config: {
                port: 6110,
                audio_output: {
                    mount: "/one",
                    port: 8100
                }
            }
        }
    }/*,
    {
        name: "Two",
        autostart: true,
        mpd: {
            path: {
                music: "/data/storage/music/breaks",
            },
            config: {
                port: 6120,
                audio_output: {
                    mount: "/two",
                    port: 8100
                }
            }
        }
    }/*,
    {
        name: "Three",
        autostart: true,
        mpd: {
            path: {
                music: "/data/storage/music/jazz",
            },
            config: {
                port: 6130,
                audio_output: {
                    mount: "/three",
                    port: 8100
                }
            }
        }
    }/*,
    {
        name: "Four",
        autostart: true,
        path: {
            music: "/data/storage/music/nightwatch",
        },
        mpd: {
            config: {
                port: 6140,
                audio_output: {
                    mount: "/four",
                    port: 8100
                }
            }
        }
    }/*,
    {
        name: "5th Channel",
        autostart: true,
        mpd: {
            config: {
                port: 6500,
                audio_output: {
                    mount: "/five",
                    port: 8100
                }
            }
        }
    },
    {
        name: "6th Channel",
        autostart: true,
        mpd: {
            config: {
                port: 7600,
                audio_output: {
                    mount: "/six",
                    port: 8100
                }
            }
        }
    },
    {
        name: "7th Channel",
        autostart: true,
        mpd: {
            config: {
                port: 6700,
                audio_output: {
                    mount: "/seven",
                    port: 8100
                }
            }
        }
    },
    {
        name: "8th Channel",
        autostart: true,
        mpd: {
            config: {
                port: 6800,
                audio_output: {
                    mount: "/eight",
                    port: 8100
                }
            }
        }
    },
    {
        name: "9th Channel",
        autostart: true,
        mpd: {
            config: {
                port: 6900,
                audio_output: {
                    mount: "/nine",
                    port: 8100
                }
            }
        }
    },
    {
        name: "10th Channel",
        autostart: true,
        mpd: {
            config: {
                port: 7000,
                audio_output: {
                    mount: "/ten",
                    port: 8100
                }
            }
        }
    }*/
];

