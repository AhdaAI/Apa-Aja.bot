#!/bin/bash

# Update system and install nodejs
sudo apt update -y
sudo apt install -y nodejs npm

# Install pm2 globally
sudo npm install -g pm2

# Navigate to bot directory
cd "$(dirname "$0")" || exit

# Install dependency
npm install

# pm2 command
pm2 start index.js --name "Discord-bot"
pm2 save
pm2 startup systemd | sudo tee /etc/systemd/system/pm2-init.sh
sudo chmod +x /etc/systemd/system/pm2-init.sh
sudo bash /etc/systemd/system/pm2-init.sh