module.exports = {
    enable: false,
    bin: '/usr/bin/ffmpeg',
    source_channel: 0,
    name_addition: 'Mix',
    endpoint_addition: '-mix',
    respawn_on_fail: true,
    respawn_delay: 5,
    id3v2_version: 3,
    codec: 'libmp3lame',
    bitrate: '128k',
    muxpreload: 1,
    content_type: 'audio/mpeg'
};