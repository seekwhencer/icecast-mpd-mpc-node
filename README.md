# node-playlist-automation

This a node.js app to generate smart playlists and start playlist by timetable.
Developed by using a Raspberry Pi 3 but usable on every Ubuntu / Debian platform.

# Permissions
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


# Folder

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

```bash
cd /data/apps
git clone ... node-playlist-automation
cd node-playlist-automation 
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
cd icecast-2.4.99.1
./configure
make
sudo make install
```

#### copy the program to your app place
```bash
mkdir /data/apps/icecast2
cp ~/icecast-2.3.99.3/src/icecast /data/apps/icecast2/
cp ~/icecast-2.3.99.3/conf/icecast.xml.dist /data/apps/icecast2/icecast.xml
cp -R ~/icecast-2.3.99.3/web /data/apps/icecast2/
cp -R ~/icecast-2.3.99.3/admin /data/apps/icecast2/
```

#### edit config
```bash
nano /data/apps/icecast2/icecast.xml
```

change to

```bash
<basedir>/data/apps/icecast2</basedir>
<logdir>/data/log</logdir>
<webroot>/data/apps/icecast2/web</webroot>
<adminroot>/data/apps/icecast2/admin</adminroot>
<accesslog>icecast_access.log</accesslog>
<errorlog>icecast_error.log</errorlog>
```


# MPD + MPC
```bash
sudo apt-get install mpd mpc -y
```

#### disabling service
```bash
sudo systemctl disable mpd
```

#### Folder
```bash
mkdir /data/apps/mpd
mkdir /data/storage/music
mkdir /data/storage/playlist
```

#### Copy Config
```bash
cp /data/apps/node-playlist-automation/config/mpd/playlist.conf /data/apps/mpd/
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

# PM2
```bash
# install it
npm install pm2 -g
 
# create folder
mkdir /data/storage/pm2
mkdir /data/log/pm2
 
# set env
sudo su
nano /root/.bashrc
```

add for root

```bash
export PM2_HOME=/data/storage/pm2
```

```bash
exit
nano ~/.bashrc
```

add the same

#### set pm2 start
```bash
# set it
sudo pm2 startup -u pi
  
# stop it
sudo systemctl stop pm2-pi.service
 
# edit service
sudo nano /etc/systemd/system/pm2-pi.service
```

use this:
```bash
[Unit]
Description=PM2 process manager
Documentation=https://pm2.keymetrics.io/
After=network.target
 
[Service]
Type=forking
User=pi
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
Environment=PATH=/usr/local/bin:/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin
Environment=PM2_HOME=/data/storage/pm2
PIDFile=/data/storage/pm2/pm2.pid
 
ExecStartPre=/data/npm-global/lib/node_modules/pm2/bin/pm2 kill
ExecStart=/data/npm-global/lib/node_modules/pm2/bin/pm2 resurrect
ExecReload=/data/npm-global/lib/node_modules/pm2/bin/pm2 reload all
 
ExecStop=/data/npm-global/lib/node_modules/pm2/bin/pm2 dump
ExecStop=/data/npm-global/lib/node_modules/pm2/bin/pm2 delete all
ExecStop=/data/npm-global/lib/node_modules/pm2/bin/pm2 kill
 
[Install]
WantedBy=multi-user.target
```

#### reload service
```bash
sudo systemctl daemon-reload
sudo systemctl start pm2-pi.service
```

# run icecast as PM2 daemon
```bash
nano /data/apps/icecast2/icecast.sh
```
 
use this
 
```bash
#!/bin/bash
/data/apps/icecast2/icecast -c /data/apps/icecast2/icecast.xml
```

add it as daemon, name it as you want

```bash
sudo chmod +x /data/apps/icecast2/icecast.sh
pm2 start /data/apps/icecast2/icecast.sh --name "icecast2"
pm2 logs icecast2
```

# run mpd as PM2 daemon
```bash
sudo systemctl disable mpd
sudo update-rc.d mpd disable
sudo rm /lib/systemd/system/mpd.service
nano /data/apps/mpd/mpd.sh
```
 
use this
 
```bash
#!/bin/bash
/usr/bin/mpd /data/apps/mpd/playlist.conf --no-daemon --stderr --verbose
```

add it as daemon, name it as you want

```bash
sudo chmod +x /data/apps/mpd/mpd.sh
pm2 start /data/apps/mpd/mpd.sh --name "mpd"
pm2 logs mpd
```

# Configuration

 - The app configuration file are stored in `config/`, in the root folder of the node app.
 - Inside this folder there will be some folders created by the app: `mpd, icecast`. 
   But only if needed.
 - The folder `prod` contains needed app config files, required by `prod.js`.
 - Inside the created folder `config/mpd` there will be some subfolder created: `db, pid, playlist, music, log` - if needed (eng. relative)
 - If a path is relative oder absolute, set it in `config/prod/mpd.js` inside the `path` object.
 - If relative, folder will be created in `config/mpd` or `coonfig/icecast`
 - All created folders will be flushed on app start and all config files will be created.
 - All Icecast and MPD (per channel) configuration files will be created by the app.
 