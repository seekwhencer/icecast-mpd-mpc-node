# public tree

### global
````bash
# put before all lines:
 
global.app_root
global.environment
global.config
global.station
global.storage
````

```bash
# string
app_root
 
# string
environment
 
# object
config
  
# object
station
```

### station
```bash
# object 
global.station
 
# function 
station.on()
 
# function
station.emit()
```

### icecast
```bash
 
# object
global.station.icecast
 
# function
icecast.on()
 
# function
icecast.emit()
 
# object
icecast.options
```

### channels
```bash
# array
global.station.channels
 
# function
channels.on
  
# function
channels.emit
  
# function
channels.checkready
 
# object
channels.options
 
# array
channels.data
```

### channel
```bash
#channel
global.station.channels.data[i] = channel
 
# string
channel.id
 
# boolean
channel.ready
 
# function
channel.on
 
# function
channel.emit
 
# function
channel.saveConfigMPD
 
# function
channel.updateDatabase
 
# function
channel.loadPlaylist
 
# function
channel.updatePlaylist
 
# function
channel.setCrossfade
 
# function
channel.play
 
# function
channel.repeat
 
# object
channel.options
 
# object
channel.mpd
 
# object
channel.mpc

```

### mpd

````bash
# mpd per channel
channel.mpd
 
# function
mpd.on
 
# function
mpd.emit
 
# function
mpd.saveConfig
 
# function
mpd.ready
 
# function
mpd.getOptions
````

### mpc

````bash
channel.mpc
  
# function
mpc.on
 
# function
mpc.emit
 
# function
mpc.ready
 
# function
mpc.getOptions
 
# function
mpc.updateDatabase
 
# function
mpc.loadPlaylist
 
# function
mpc.updatePlaylist
 
# function
mpc.setCrossfade
 
# function
mpc.play
 
# function
mpc.repeat
  
# function
mpc.status
````

### storage

```bash
# object
global.storage
 
# function
storage.ready()
 
# function
storage.on()
 
# function
storage.emit()
 
# function
storage.fetchChannels()
 
# function
storage.fetchMusic()
```

# events

```bash
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