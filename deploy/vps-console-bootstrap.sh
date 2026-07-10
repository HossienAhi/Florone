#!/bin/bash
# Run on VPS web console after uploading florone-deploy.tar.gz to /tmp/
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

if [ ! -f /tmp/florone-deploy.tar.gz ]; then
  echo "Upload florone-deploy.tar.gz to /tmp/ first."
  exit 1
fi

mkdir -p /var/www/florone
tar -xzf /tmp/florone-deploy.tar.gz -C /var/www/florone
chmod +x /var/www/florone/deploy/*.sh
bash /var/www/florone/deploy/setup-server.sh
bash /var/www/florone/deploy/deploy.sh
