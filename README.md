# icecast-mpd-mpc-node

With this app:

- generate configuration files for icecast2 audio streaming server
- generate configuration files for music player daemon (MPD)
- create multiple streams as endpoints as channels
- run it at once with PM2
- stop it graceful

> This setup was tested on debian

You can use this setup on a Raspberry Pi like me. But: on my Raspberry Pi for some unknown reasons
the connection between MPD and icecast drops after a random time up to six hours.

# Configuration

 - Before the first run: configure it!
 - The app configuration files are stored in `config/`
 - The folder `prod` contains all needed app config files, required by `config/prod.js`.
 - Set the environment with in the `.env` file - this equals a configuration root file in `config/`
 - Set relative or absolute paths. If relative, folder will be created in `storage/...`, `storage` will be created
 - All created folders will be flushed on app start and all config files will be created again
 - All Icecast and MPD (per channel) configuration files will be created by the app.
 - "Backend for Frontend" Service with REST Api.

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


## Icecast2

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


## MPD + MPC
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


## node.js

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

## PM2
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


#### Bluetooth on raspberry pi

##### Device
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
ex it
```

##### Global ALSA Config
```bash
# Create global alsa config, not to user pi
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

##### Bluetooth Service

Edit the service
```bash
sudo nano /etc/systemd/system/bluetooth.target.wants/bluetooth.service
``` 
Change line
```bash
ExecStart=/usr/lib/bluetooth/bluetoothd --noplugin=sap
```
Reload Daemon
```bash
sudo systemctl deamon-reload
```
Service Restart
```bash
sudo systemctl restart bluetooth.service
```

##### bluealsa Service
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
Reload Daemon
```bash
sudo systemctl deamon-reload
```
Service Restart
```bash
sudo systemctl restart bluealsa.service
```