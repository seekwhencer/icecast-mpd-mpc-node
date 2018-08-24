module.exports = {
    bin: "mpd",
    ready_delay: 200,
    skip_timeout: 10000,
    bluetooth: false,
    debug : {
        stderr : false
    },
    path : {
        config : "storage/mpd",
        music: "/data/audio/music",
        log: "storage/mpd/log",

        db: "storage/mpd/db",
        pid: "storage/mpd/pid",
        playlist: "storage/playlist"
    },
    db_filename: 'shared',
    config: {
        user: "vagrant",
        playlist_directory: "",     // will be set
        music_directory: "",        // will be set
        db_file: "",                // will be set
        pid_file: "",               // will be set
        log_file: "",               // will be set
        buffer_before_play: "80%",
        audio_buffer_size: 8192,
        port: 6600,
        log_level: "verbose", // secure
        bind_to_address: "0.0.0.0",
        zeroconf_enabled: "yes",
        zeroconf_name: "station",
        audio_output: {
            type: "shout",
            encoding: "mp3",
            name: "station",
            host: "localhost",
            port: 8100,
            mount: "/playlist",
            password: "changeme",
            bitrate: 128,
            format: "44100:16:2"
        }
    },
    config_file_end: {
	    audio_output: {
            type: "alsa",
            name: "audio out",
            device: "bluetooth",
	        format: "44100:16:2",
	        driver: "software"
        }
    }
};

