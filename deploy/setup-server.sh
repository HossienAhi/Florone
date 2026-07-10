#!/bin/bash
# First-time VPS setup for Florone (Ubuntu/Debian). Run as root or with sudo.
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  SUDO="sudo"
fi

echo "==> Updating packages..."
$SUDO apt-get update -y
$SUDO apt-get upgrade -y

echo "==> Installing base tools..."
$SUDO apt-get install -y curl git nginx ufw

echo "==> Installing Node.js 20..."
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO -E bash -
  $SUDO apt-get install -y nodejs
fi

echo "==> Installing PM2..."
$SUDO npm install -g pm2

echo "==> Firewall..."
$SUDO ufw allow OpenSSH
$SUDO ufw allow 'Nginx Full'
$SUDO ufw allow 8080/tcp
echo "y" | $SUDO ufw enable || true

echo "==> App directory..."
$SUDO mkdir -p /var/www/florone
$SUDO chown -R "$(whoami):$(whoami)" /var/www/florone

echo "==> Setup complete."
node -v
npm -v
nginx -v
pm2 -v
