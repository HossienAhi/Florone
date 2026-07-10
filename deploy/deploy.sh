#!/bin/bash
# Deploy Florone on the VPS (run from /var/www/florone after code is uploaded)
set -euo pipefail

APP_DIR="/var/www/florone"
cd "$APP_DIR"

echo "==> Backend..."
cd backend
npm ci --omit=dev
if [ ! -f .env ]; then
  cp .env.example .env
fi
npx prisma migrate deploy
if [ ! -f prisma/prod.db ]; then
  node prisma/seed.mjs || true
  npm run seed:admin || true
fi
pm2 delete florone-api 2>/dev/null || true
pm2 start server.js --name florone-api
pm2 save

echo "==> Frontend..."
cd "$APP_DIR/florone-app"
npm ci
npm run build

echo "==> Nginx..."
SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  SUDO="sudo"
fi
$SUDO cp "$APP_DIR/deploy/nginx-menu.conf" /etc/nginx/sites-available/florone-menu
$SUDO cp "$APP_DIR/deploy/nginx-admin.conf" /etc/nginx/sites-available/florone-admin
$SUDO ln -sf /etc/nginx/sites-available/florone-menu /etc/nginx/sites-enabled/
$SUDO ln -sf /etc/nginx/sites-available/florone-admin /etc/nginx/sites-enabled/
$SUDO rm -f /etc/nginx/sites-enabled/default
$SUDO nginx -t
$SUDO systemctl reload nginx

echo "==> Deploy done."
echo "Menu (customer): http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_IP')/"
echo "Admin (cashier): http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_IP'):8080/Cashier"
pm2 status
