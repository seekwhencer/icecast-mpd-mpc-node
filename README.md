# icecast-mpd-mpc-node

![ScreenShot](/docs/berlin_sunset.png?raw=true "a debian in the wild")

With this app:

- generate configuration files for [icecast2](https://github.com/xiph/Icecast-Server) audio streaming server | [Website](http://icecast.org)
- generate configuration files for [music player daemon (MPD)](https://github.com/MusicPlayerDaemon/MPD) | [Website](https://www.musicpd.org)
- generate configuration files for [darkice](https://github.com/rafael2k/darkice) | [Website](http://www.darkice.org)
- for talk over mixing two streams in realtime using [ffmpeg](https://github.com/FFmpeg/FFmpeg) | [Website](https://www.ffmpeg.org)
- create multiple streams as endpoints as channels
- run it at once with PM2
- stop it graceful

> This setup was tested on debian

You can use this setup on a Raspberry Pi like me. But on a Raspberry Pi only one stream is stable.
Multiple streams / mpd instances are not stable 

# Configuration

 - Before the first run: configure it!
 - The app configuration files are stored in `config/`
 - The folder `prod` contains all needed app config files, required by `config/prod.js`.
 - Set the environment with in the `.env` file - this equals a configuration root file in `config/`
 - Set relative or absolute paths. If relative, folder will be created in `storage/...`, `storage` will be created
 - All created folders will be flushed on app start and all config files will be created again
 - All Icecast and MPD (per channel) configuration files will be created by the app.
 - "Backend for Frontend" Service with REST Api.

# Installation

```bash
    git clone https://github.com/seekwhencer/icecast-mpd-mpc-node.git station
    cd station
    npm install
```
# Dependencies

 - [icecast2](#icecast2)
 - [music player daemon (MPD) and music player client (MPC)](#mpd)
 - [darkice](#darkice)
 - [ffmpeg](#ffmpeg)
 - [pm2](#pm2)
 - [blueasla](#bluealsa)

# Setup on a Raspberry Pi

## Permissions
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


## Folder

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
git clone https://github.com/seekwhencer/icecast-mpd-mpc-node.git
cd icecast-mpd-mpc-node
npm install
```


## <a name="icecast2"></a>Icecast2

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

#### create a xsl file for a web based status output
```bash
nano /data/apps/icecast2/web/json.xsl
```

Use this content
```xsl
<xsl:stylesheet version="1.1" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:import href="xml2json.xslt"/>
<xsl:output indent="no" omit-xml-declaration="yes" method="text" encoding="UTF-8" media-type="application/json"/>
<xsl:strip-space elements="*"/>
 
<!-- override imported transform variable to enable output -->
<xsl:variable name="output">true</xsl:variable>
 
<!-- hide certain nodes from all sources -->
<xsl:template match="icestats/source/max_listeners"><xsl:if test="not(following-sibling::*)">"dummy":null}</xsl:if></xsl:template>
<xsl:template match="icestats/source/public"><xsl:if test="not(following-sibling::*)">"dummy":null}</xsl:if></xsl:template>
<xsl:template match="icestats/source/source_ip"><xsl:if test="not(following-sibling::*)">"dummy":null}</xsl:if></xsl:template>
<xsl:template match="icestats/source/slow_listeners"><xsl:if test="not(following-sibling::*)">"dummy":null}</xsl:if></xsl:template>
<xsl:template match="icestats/source/*[contains(name(), 'total_bytes')]"><xsl:if test="not(following-sibling::*)">"dummy":null}</xsl:if></xsl:template>
<xsl:template match="icestats/source/user_agent" ><xsl:if test="not(following-sibling::*)">"dummy":null}</xsl:if></xsl:template>
<xsl:template match="icestats/source/listener" ><xsl:if test="not(following-sibling::*)">"dummy":null}</xsl:if></xsl:template>
 
<!-- hide certain global nodes -->
<xsl:template match="icestats/sources"><xsl:if test="not(following-sibling::*)">"dummy":null}</xsl:if></xsl:template>
<xsl:template match="icestats/clients"><xsl:if test="not(following-sibling::*)">"dummy":null}</xsl:if></xsl:template>
<xsl:template match="icestats/stats"><xsl:if test="not(following-sibling::*)">"dummy":null}</xsl:if></xsl:template>
<xsl:template match="icestats/listeners"><xsl:if test="not(following-sibling::*)">"dummy":null}</xsl:if></xsl:template>
</xsl:stylesheet>
```


## <a name="mpd"></a><a name="mpc"></a> MPD + MPC
```bash
sudo apt-get install mpd mpc -y
```

#### disabling service
```bash
sudo systemctl disable mpd
```

## Build MPD from source (Raspberry Pi)

For me worked version 0.20.19. This is not the version which comes with an apt-get install. So you have to build mpd from source.
 
Run this script:
```bash
sudo sh /data/apps/icecast-mpd-mpc-node/config/install_mpd.sh
```


#### Folder
```bash
mkdir /data/storage/music
```


## <a name="nodejs"></a>node.js

```bash
# create npm global folder
mkdir /data/npm-global
mkdir /data/npm-global/lib
mkdir /data/npm-global/lib/node_modules
mkdir /data/npm-global/bin
mkdir /data/npm-global/share
 
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

## <a name="pm2"></a>PM2
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

add the same for user pi:

```bash
exit
nano ~/.bashrc
```

#### pm2 system daemon on system start
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

## Running in a Virtual Machine

To use the `Vagrantfile` install:

- Oracle VM VirtualBox
- Vagrant
- Vagrant VB Guest Additions 

Then set it up like on the raspberry pi - but replace the user `pi` with the user `vagrant`. Don't forget:
if you completed the vagrant setup, save the VM state with VirtualBox directly or with a `vagrant suspend`.
To load the VM state, enter `vagrant resume`.
 
You can skip the icecast build from source. Inside the VM you can use: `sudo apt-get install icecast2`
 
Before the first VM up, change the the VM port when changing the stream port.
Edit the `Vagrantfile` and change the `guest` port.

```
    config.vm.network "forwarded_port", guest: 8100, host: 8100, host_ip: "127.0.0.1"
```

If the VM is running and you want to change the port later, do it in VirtualBox directly under: 

 - settings of the vm
 - network > adapter > advanced > port forwarding
 - add a new rule or change an existing

#### run
```bash
# start the vm
vagrant up
 
# save the vm state
vagrant suspend
 
# resume the saved state
vagrant resume
 
# destroy the vm
vagrant destroy
```

But beware: if you're destroying the vm, all installed things gone lost - except the shared folder.
After this you have to repeat the whole setup. :)  yay!


## <a name="bluetooth"></a>Bluetooth on raspberry pi

#### Device
```bash
# Check MAC-Address
sudo bluetoothctl
 
# Scan for your device. Make sure that the device is in pairing mode.
agent on
default-agent
scan on
 
# Wait a while… after a few seconds, you’re getting the MAC address of your device. After that, you can stop the scanning.
scan off
 
# Now: pair and trust
pair XX:XX:XX:XX:XX:XX
trust XX:XX:XX:XX:XX:XX
connect XX:XX:XX:XX:XX:XX
 
# Now you can exit the bluetoothctl program - and forget it. For now when the system starts, the Raspberry Pi connects automatically with your device.
exit
```

#### Global ALSA Config
Create global alsa config, not to user pi
```bash
sudo nano /etc/asound.conf
``` 
With this content
```bash

defaults.bluealsa {
     interface "hci0"
     device "XX:XX:XX:XX:XX:XX"
     profile "a2dp"
}
 
pcm.bluetooth {
  type plug
  slave {
    pcm {
      type bluealsa
      device XX:XX:XX:XX:XX:XX
      profile "a2dp"
    }
  }
  hint {
    show on
    description "changeme"
  }
}
 
ctl.bluetooth {
  type bluealsa
}
```

## Bluetooth Service

Edit the service
```bash
sudo nano /etc/systemd/system/bluetooth.target.wants/bluetooth.service
``` 
Change line
```bash
ExecStart=/usr/lib/bluetooth/bluetoothd --noplugin=sap
```
Reload and restart Daemon
```bash
sudo systemctl deamon-reload
sudo systemctl restart bluetooth.service
```

## <a name="bluealsa"></a>bluealsa Service
Install it
```bash
sudo apt-get install bluealsa
```
Edit the Service
```bash
sudo nano /lib/systemd/system/bluealsa.service
```
Change line
```bash
ExecStart=/usr/bin/bluealsa --disable-hfp
```
Reload and restart Daemon
```bash
sudo systemctl deamon-reload
sudo systemctl restart bluealsa.service
```

## <a name="darkice"></a>Darkice

Install it
```bash
sudo apt-get install darkice
``` 
Name the external USB audio input device by editing the global asound.conf
```bash
sudo nano /etc/asound.conf
``` 
Add this
```bash
pcm.external {
  type plug slave {
    pcm "hw:1,0"
  }
}
```

## The Buttons

... follows
