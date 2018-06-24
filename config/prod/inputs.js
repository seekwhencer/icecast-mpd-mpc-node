module.exports = {
    enable: false,
    path: 'inputs',
    load: true,
    generate_from_config: false,
    inputs: [{
        name: "Line Input",
        id: "",
        path: "inputs",
        darkice: {
            config: {
                input: {
                    device: "external"
                },
                'icecast2-0': {
                    mountPoint: "input"
                }
            }
        },
        ffmix : {
            source_channel: 0,
            name_addition: 'Mix',
            endpoint_addition: '-mix',
            respawn_delay: 5
        }
    }]
};