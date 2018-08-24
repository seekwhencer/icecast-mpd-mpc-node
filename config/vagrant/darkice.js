module.exports = {
    enable: false,
    bin: "/usr/bin/darkice",
    path: "darkice",
    respawn_on_fail: true,
    respawn_delay: 5,
    config: {
        general: {
            duration: 0,
            bufferSecs: 1,
            reconnect: "yes"
        },
        input: {
            device: "external",
            sampleRate: 44100,
            bitsPerSample: 16,
            channel: 2
        },
        'icecast2-0': {
            format: "mp3",
            bitrateMode: "cbr",
            bitrate: 128,
            quality: 0.8,
            server: "127.0.0.1",
            port: 8100,
            user: "source",
            password: "changeme",
            mountPoint: "mic",
            name: "OVERRIDE",
            description: "Stream Description",
            public: "no"
        }
    }
};