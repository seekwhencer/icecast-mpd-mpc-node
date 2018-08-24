module.exports = {
    name: "station",
    bin: "icecast2",
    autostart: true,
    checkup_delay: 500,
    status_delay: 500,
    run: '',
    status_endpoint: 'json.xsl',

    path: {
        config: "storage/icecast",
        basedir: "/usr/share/icecast2",
        logdir: "/data/log",
        webroot: "/usr/share/icecast2/web",
        adminroot: "/usr/share/icecast2/admin",
    },

    config: {
        location: "Home",
        hostname: "station",
        admin: "",
        limits: {
            clients: 100,
            sources: 10,
            threadpool: 20,
            "queue-size": 524288,
            "client-timeout": 60,
            "header-timeout": 30,
            "source-timeout": 60,
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
            basedir: "/usr/share/icecast2",
            logdir: "/data/log",
            webroot: "/usr/share/icecast2/web",
            adminroot: "/usr/share/icecast2/admin",
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
