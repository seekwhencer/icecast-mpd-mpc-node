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
station = global.station
 
// array
station.channels
 
// object
station.icecast
 
// function
station.flushStorage
 
// function
station.updateDatabases
 
// function
station.shutdown
```

> Events
```javascript
ready
saved-runscript (runscript_file)
```

### icecast
```javascript
 
// object
icecast = global.station.icecast
 
// object
icecast.options
```

> Events
```javascript
ready
saved (the icecast object)
```

### channels
```javascript
// array
channels = global.station.channels
 
// array
channels.data
 
// function
channels.get('key','value')
 
// function
channels.checkready
 
// object
channels.options
```

### channel
```javascript
//channel
channel = channels.data[index]
channel = channels.get('id', 'channel-id-hash')
channel = channels.get('slug', 'name-the-show')
 
 
// string
channel.id
 
// boolean
channel.ready 
 
// array
channel.shows
 
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
channel.pause
 
// function
channel.skip
 
// function
channel.stop
 
// function
channel.shutdown 
 
// function
channel.spawn 
 
// function
channel.respawn
 
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
