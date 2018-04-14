#!/bin/bash

ROOT_PATH="/data"

sudo apt-get install git curl libxslt1-dev libvorbis-dev mpd mpc npm alsa-base alsa-utils -y

# --------------------------------------------------------
#
# https://github.com/powerline/fonts

## enable ssh login with password
#   sudo nano /etc/ssh/sshd_config
#
# change to
#   PasswordAuthentication yes
#
# restart service
#   sudo systemctl restart ssh.service
#

## add user
#   useradd -m pi -G pi
#   sudo passwd pi
#
# pi visudo
#   sudo visudo
#
# change to
#   # User privilege specification
#   root    ALL=(ALL:ALL) ALL
#   pi      ALL=(ALL:ALL) ALL
#

## edit .bashrc for pi and root
#   nano ~/.bashrc
#   sudo nano /root/.bashrc
#
# add on the end
#   export NPM_CONFIG_PREFIX=/data/npm-global
#   export PATH=/data/npm-global/bin:$PATH
#

# --------------------------------------------------------

#sudo apt-get update -y
#sudo apt-get upgrade -y

sudo mkdir "$ROOT_PATH"
sudo chown pi -R "$ROOT_PATH"
sudo chmod 777 -R "$ROOT_PATH"

cd "$ROOT_PATH"
mkdir logs
mkdir apps
mkdir storage
mkdir npm-global
mkdir .npm-cache

cd "$ROOT_PATH/apps"
mkdir node-playlist-automation
mkdir icecast2

cd "$ROOT_PATH/storage"
mkdir music
mkdir playlist

cd ~/
wget https://ftp.osuosl.org/pub/xiph/releases/icecast/icecast-2.5-beta1.tar.gz .
tar xfv icecast-2.5-beta1.tar.gz
cd icecast-2.4.99.1
./configure
make
sudo make install

cp ~/icecast-2.4.99.1/src/icecast "$ROOT_PATH/apps/icecast2/"
cp -R ~/icecast-2.4.99.1/web "$ROOT_PATH/apps/icecast2/"
cp -R ~/icecast-2.4.99.1/admin "$ROOT_PATH/apps/icecast2/"

sudo systemctl disable mpd

sudo npm config set prefix "$ROOT_PATH/npm-global"
npm config set prefix "$ROOT_PATH/npm-global"
sudo npm config set cache "$ROOT_PATH/.npm-cache"
npm config set cache "$ROOT_PATH/.npm-cache"

sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
sudo chown -R $(whoami) /usr/local/

npm install npm@latest -g
npm install n -g
n latest

# sudo reboot
