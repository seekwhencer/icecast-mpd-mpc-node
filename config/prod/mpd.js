module.exports = {
    bin: "/usr/bin/mpd",
    path : {
        config : "storage/mpd",
        music: "/data/storage/music",
        log: "/data/log",

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
        buffer_before_play: "30%",
        port: 6600,
        log_level: "default",
        bind_to_address: "127.0.0.1",
        zeroconf_enabled: "yes",
        zeroconf_name: "icecast-mpd-mpc-node",
        audio_output: {
            type: "shout",
            encoding: "mp3",
            name: "icecast-mpd-mpc-node",
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