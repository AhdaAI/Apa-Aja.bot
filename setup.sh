#!/bin/bash

# Update system and install nodejs
sudo apt update -y
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed! Installing now..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -  # Change version if needed
    sudo apt-get install -y nodejs npm
else
    echo "✅ Node.js is installed! Version: $(node -v)"
fi

# Setting development and production mode
ENV_MODE=${1:-production}

echo "Starting bot in $ENV_MODE mode..."

# Checking for GCP Credentials
SERVICE_ACCOUNT="GCP_Service_Account.json"

if [ -f "$SERVICE_ACCOUNT" ]; then
    echo "GCP service account file found! Setting environment variable..."
    export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/$SERVICE_ACCOUNT"
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
pm2 start ecosystem.config.js --env "$ENV_MODE"
pm2 save
pm2 startup systemd | sudo tee /etc/systemd/system/pm2-init.sh
sudo chmod +x /etc/systemd/system/pm2-init.sh
sudo bash /etc/systemd/system/pm2-init.sh

echo "### Started in $ENV_MODE mode ###"