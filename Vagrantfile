# -*- mode: ruby -*-
# vi: set ft=ruby :

VAGRANTFILE_API_VERSION = "2"
Vagrant::DEFAULT_SERVER_URL.replace('https://vagrantcloud.com') 

Vagrant.configure("2") do |config|

    config.vm.box = "debian/jessie64"
    config.vm.network "private_network", ip: "192.178.44.44"
    config.vm.hostname = "streamingserver"
    config.vm.network "forwarded_port", guest: 80, host: 11000, host_ip: "127.0.0.1"
    config.vm.network "forwarded_port", guest: 8100, host: 8100, host_ip: "127.0.0.1"

    config.vm.synced_folder ".", "/data/apps/node-playlist-automation", id: "vagrant-root", owner: "pi", group: "pi", mount_options: ["dmode=775,fmode=664"]
    config.vm.boot_timeout = 900

#    config.vm.provision "init/update", type: "shell" do |s|
#        s.inline = "sh /data/apps/node-playlist-automation/config/install.sh"
#    end

    config.vm.provider "virtualbox" do |v|
        v.memory = 4096
        v.cpus = 1
        v.gui = false
    end

end
