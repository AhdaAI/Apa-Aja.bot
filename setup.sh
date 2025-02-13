#!/bin/bash

# Update system and install nodejs
sudo apt update -y
sudo apt install -y nodejs npm

# Checking for GCP Credentials
SERVICE_ACCOUNT="GCP_Service_Account.json"

if [ -f "$SERVICE_ACCOUNT" ]; then
    echo "GCP service account file found! Setting environment variable..."
    export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/$SERVICE_ACCOUNT_FILE"
else
    echo "No GCP service account file found. Running with .env file only."
fi

# Install pm2 globally
if ! command -v pm2 &> /dev/null; then
    echo "PM2 not found! Installing..."
    sudo npm install -g pm2
fi

# Navigate to bot directory
cd "$(dirname "$0")" || exit

# Install dependency
npm install

# pm2 command
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd | sudo tee /etc/systemd/system/pm2-init.sh
sudo chmod +x /etc/systemd/system/pm2-init.sh
sudo bash /etc/systemd/system/pm2-init.sh