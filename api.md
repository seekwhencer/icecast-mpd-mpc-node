# api definition

## scheme
> : PORT / command

#### default port
> 8090

#### get station stuff
> / station

#### get channel listing
> / channels

#### get channel by name
> / channel / id

#### (re)load playlist
> / channel / id / load-playlist

#### update playlist (flush the old, play the new)
> / channel / id / update-playlist

#### play channel
> / channel / id / play

#### stop channel
> / channel / id / stop

#### pause channel
> / channel / id / pause

#### skip track on channel
> / channel / id / skip

#### set crossfade channel
> / channel / id / crossfade / seconds

#### repeat channel
> / channel / id / repeat


