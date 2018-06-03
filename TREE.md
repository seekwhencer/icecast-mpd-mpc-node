# public tree

### global
```javascript
// absolute app root folder
global.app_root
 
// ENV var to set prod or dev
global.environment
 
// the whole config tree
global.config
 
// the station with channels
global.station
 
// the storage toolset
global.storage
```

### station
```javascript
// object 
global.station
 
// function 
station.on()
 
// function
station.emit()
```

### icecast
```javascript
 
// object
icecast = global.station.icecast
 
// function
icecast.on()
 
// function
icecast.emit()
 
// object
icecast.options
```

### channels
```javascript
// array
channels = global.station.channels
 
// function
channels.on
  
// function
channels.emit
  
// function
channels.checkready
 
// object
channels.options
 
// array
channels.data
```

### channel
```javascript
//channel
channel = global.station.channels.data[index]
channel = global.station.channels.get('id', 'channel_id')

 
// string
channel.id
 
// boolean
channel.ready
 
// function
channel.on
 
// function
channel.emit
 
// function
channel.saveConfigMPD
 
// function
channel.updateDatabase
 
// function
channel.loadPlaylist
 
// function
channel.updatePlaylist
 
// function
channel.setCrossfade
 
// function
channel.play
 
// function
channel.repeat
 
// object
channel.options
 
// object
channel.mpd
 
// object
channel.mpc

```

### mpd

````javascript
// mpd per channel
mpd = channel.mpd
 
// function
mpd.on
 
// function
mpd.emit
 
// function
mpd.saveConfig
 
// function
mpd.ready
 
// function
mpd.getOptions
````

### mpc

````javascript

// the music player client object for this channel
mpc = channel.mpc
  
// function
mpc.on
 
// function
mpc.emit
 
// function
mpc.ready
 
// function
mpc.getOptions
 
// function
mpc.updateDatabase
 
// function
mpc.loadPlaylist
 
// function
mpc.updatePlaylist
 
// function
mpc.setCrossfade
 
// function
mpc.play
 
// function
mpc.repeat
  
// function
mpc.status
````

### shows
```javascript
// the listing object
shows = channel.shows

// the list as array
shows.data[index]

// getting one or matched show item (s)
shows.get('id', 'show_id')

// the parent channel object from this point
shows.channel

```

### show (one item)

```javascript
// one show item
show = shows.data[index]
show = shows.get('id', 'show_id')
 
// string
show.id
 
// string
show.name
 
//  string
show.slug
 
// the plalist object for the show
show.playlist
 
// parent shows object from this point
show.shows
 
// parent channel object from this point
show.channel
```

### playlist

```javascript
// the playlist object of the show
playlist = show.playlist
 
// generate the playlist function
playlist.generate

```

### storage

```javascript
// object
storage = global.storage
 
// function
storage.ready()
 
// function
storage.on()
 
// function
storage.emit()
 
// function
storage.fetchChannels()
 
// function
storage.fetchMusic()
```

# events

```javascript
station.on('ready', function(){});
station.on('saved-runscript', function(runscript_file){});
icecast.on('ready', function(){});
icecast.on('saved', function(){});
channel.on('ready', function(){});
channel.on('saved-json', function(){});
channel.on('saved-playlist', function(){});
channel.mpd.on('ready', function(){});
channel.mpd.on('saved-config', function(){});
channel.mpd.on('data', function(){});
channel.mpc.on('ready', function(){});
```