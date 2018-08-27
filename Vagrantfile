# -*- mode: ruby -*-
# vi: set ft=ruby :

VAGRANTFILE_API_VERSION = "2"
Vagrant::DEFAULT_SERVER_URL.replace('https://vagrantcloud.com') 

Vagrant.configure("2") do |config|

    config.vm.box = "bento/ubuntu-16.04"
    #config.vm.box = "bento/ubuntu-18.04"
    #config.vm.box = "debian/stretch64"
    #config.vm.box = "debian/jessie64"
    #config.vm.box = "bento/debian-9.5"
    #config.vm.box = "generic/debian9"


    config.vm.network "private_network", ip: "192.168.44.10"
    config.vm.hostname = "station"

    # the web app
    config.vm.network "forwarded_port", guest: 8080, host: 8080, host_ip: "127.0.0.1"

    # icecast2 stream and web
    config.vm.network "forwarded_port", guest: 8100, host: 8100, host_ip: "127.0.0.1"

    # music player daemon
    config.vm.network "forwarded_port", guest: 6100, host: 6100, host_ip: "127.0.0.1"

    config.vm.synced_folder ".", "/data/apps/station", id: "app-folder", owner: "vagrant", group: "vagrant", mount_options: ["dmode=775,fmode=664"]
    config.vm.synced_folder "D:/Data/Music/station", "/data/audio", id: "audio-folder", owner: "vagrant", group: "vagrant", mount_options: ["dmode=775,fmode=664"]

    config.vm.boot_timeout = 900

    config.vm.provider "virtualbox" do |v|
        v.name = "vagrant-playlist-automation";
        v.memory = 4096
        v.cpus = 4
        v.gui = false
        v.customize ["modifyvm", :id, "--vram", "128"]
        v.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
        v.customize ["modifyvm", :id, "--natdnsproxy1", "on"]
        v.customize ["modifyvm", :id, "--ioapic", "on"]
        v.customize ["modifyvm", :id, "--nictype1", "virtio" ]
        v.customize ["modifyvm", :id, "--nictype2", "virtio" ]
        v.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/v-root", "1"]
    end

    # Run Ansible from the Vagrant VM
    config.vm.provision "ansible_local" do |ansible|
        ansible.playbook = "/data/apps/station/ansible/vagrant.yml"
#        ansible.verbose = "v"
        ansible.provisioning_path = "/data/apps/station/ansible"
    end

end
