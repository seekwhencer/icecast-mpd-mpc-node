module.exports = {
    bin: "/usr/bin/mpd",
    ready_delay: 200,
    skip_timeout: 10000,
    debug : {
        stderr : false
    },
    path : {
        config : "storage/mpd",
        music: "/data/storage/music",
        log: "storage/mpd/log",

        db: "storage/mpd/db",
        pid: "storage/mpd/pid",
        playlist: "storage/playlist"
    },

    config: {
        user: "pi",
        playlist_directory: "/data/storage/playlist",
        music_directory: "/data/storage/music",
        db_file: "/data/apps/mpd/mpd.cache",
        pid_file: "/data/apps/mpd/playlist.pid",
        log_file: "/data/log/mpd_playlist.log",
        buffer_before_play: "50%",
        audio_buffer_size: 20480,
        port: 6600,
        log_level: "verbose", // secure
        bind_to_address: "0.0.0.0",
        zeroconf_enabled: "yes",
        zeroconf_name: "piradio",
        audio_output: {
            type: "shout",
            encoding: "mp3",
            name: "piradio",
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
            name: "fake out",
            driver: "null"
        }
    }
};
