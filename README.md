# icecast-mpd-mpc-node

This Node.js app creates a audio streaming scenario on a raspberry pi with icecast and music player daemon.
 
The main use of this app is

- to create the specific configur_*ation files for icecast and mpd
- to run start and stop icecast and mpd
- to interact with mpd with mpc via ...

... per REST-Api - but it is not implemented. At this point you can only easy configure and run some audio streams on a raspberry pi. Not more.


# installation

```bash
cd /data/apps
git clone https://github.com/seekwhencer/icecast-mpd-mpc-node.git
cd icecast-mpd-mpc-node
npm install
```

# run
```bash
npm start
```



# setup Raspberry Pi

#### Permissions
```bash
sudo visudo
```

change to

```bash
# User privilege specification
root    ALL=(ALL:ALL) ALL
pi      ALL=(ALL:ALL) ALL
 
secure_path="/data/npm-global/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
```

... then reboot

#### Folder

```bash
# creating main folder
 
sudo mkdir /data
sudo chown pi:pi /data
sudo chmod 777 /data
cd /data
mkdir logs
mkdir apps
mkdir storage
```

# Icecast2

> https://ftp.osuosl.org/pub/xiph/releases/icecast/

#### installing some build needs
```bash 
sudo apt-get install libxslt1-dev libvorbis-dev
```

#### installing icecast2
```bash
cd ~/ && mkdir icecast2 && cd icecast2
wget https://ftp.osuosl.org/pub/xiph/releases/icecast/icecast-2.5-beta1.tar.gz .
tar xfv icecast-2.5-beta1.tar.gz
cd icecast-2.5-beta1.tar.gz
./configure
make
sudo make install
```

#### copy the program to your app place
```bash
mkdir /data/apps/icecast2
cp ~/icecast-2.3.99.3/src/icecast /data/apps/icecast2/
cp -R ~/icecast-2.3.99.3/web /data/apps/icecast2/
cp -R ~/icecast-2.3.99.3/admin /data/apps/icecast2/
```

# MPD + MPC
```bash
sudo apt-get install mpd mpc -y
```

#### disabling service
```bash
sudo systemctl disable mpd
sudo update-rc.d mpd disable
```

#### Folder
```bash
mkdir /data/storage/music
mkdir /data/storage/playlist
```

# node.js

```bash
# create npm global folder
mkdir /data/npm-global
 
# env vars
nano ~/.bashrc
 
# add
export NPM_CONFIG_PREFIX=/data/npm-global
export PATH=/data/npm-global/bin:$PATH
 
# again for root
sudo nano /root/.bashrc
 
# load it into actual shell
. ~/.bashrc
 
# install npm
sudo apt-get install npm
 
# Node Packet Manager set prefix config
sudo npm config set prefix /data/npm-global
 
# create cache folder
mkdir /data/.npm-cache
 
# set cache folder
npm config set cache /data/.npm-cache
 
# set user rights
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
sudo chown -R $(whoami) /usr/local/
 
# install latest npm version
npm install npm@latest -g
 
# installing n - node.js version manager
npm install n -g
 
# installing latest node version
n latest
 
# reboot
sudo reboot
```

# Configuration

 - The app configuration file are stored in `config/`, in the root folder of the node app.
 - Inside this folder there will be some folders created by the app: `mpd, icecast`. 
   But only if needed.
 - The config folder `config/prod` contains needed app config files, required by `config/prod.js`.
 - Inside the created folder `storage/mpd` there will be some subfolder created: `db, pid, playlist, music, log` - if needed (eng. relative)
 - If a path is relative or absolute, set it in `config/prod/mpd.js` inside the `path` object.
 - If relative, folder will be created in `storage/mpd` or `storage/icecast`
 - All created folders will be flushed on app start and all config files will be created.
 - All Icecast and MPD (per channel) configuration files will be created by the app.
 - To recreate the Channel-Json files, set `jsonload_channels` in `config/prod/station.js` to `false`
 - If `jsonload_channels` is `true`, all stored json data will be used and no new id will be generated
 - At this point the app creates a playlist file from the given music folder per channel, queue it und play it.