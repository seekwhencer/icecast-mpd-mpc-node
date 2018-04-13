module.exports = {
    name: "icecast-mpd-mpc-node",
    bin: "/data/apps/icecast2/icecast",
    autostart: true,
    checkup_delay: 100,
    run: '',
    path: {
        config: "storage/icecast",
        basedir: "/data/apps/icecast2",
        logdir: "/data/log",
        webroot: "/data/apps/icecast2/web",
        adminroot: "/data/apps/icecast2/admin"
    },

    config: {
        location: "Home",
        hostname: "localhost",
        admin: "....",
        limits: {
            clients: 100,
            sources: 10,
            threadpool: 20,
            "queue-size": 524288,
            "client-timeout": 30,
            "header-timeout": 15,
            "source-timeout": 30,
            "burst-on-connect": 1,
            "burst-size": 65535
        },
        authentication: {
            "source-password": "changeme",
            "relay-password": "changeme",
            "admin-user": "admin",
            "admin-password": "changeme"
        },
        "listen-socket": {
            port: 8100
        },
        fileserve: 1,
        paths: {
            basedir: "/data/apps/icecast2",
            logdir: "/data/log",
            webroot: "/data/apps/icecast2/web",
            adminroot: "/data/apps/icecast2/admin",
            alias: [
                {source: "/"},
                {destination: "/status.xsl"}
            ]
        },
        logging: {
            accesslog: "icecast_access.log",
            errorlog: "icecast_error.log",
            loglevel: 4,
            logsize: 10000,
        },
        security: {
            chroot: 0
        }
    }

};