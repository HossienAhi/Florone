param(
  [string]$User = "roota",
  [string]$HostName = "185.231.112.254",
  [string]$KeyPath = "$env:USERPROFILE\.ssh\florone_deploy"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent

$Tarball = Join-Path $env:TEMP "florone-deploy.tar.gz"
$SshTarget = "${User}@${HostName}"
$SshArgs = @("-i", $KeyPath, "-o", "StrictHostKeyChecking=accept-new")

Write-Host "==> Creating tarball..."
Push-Location $Root
tar -czf $Tarball --exclude=node_modules --exclude=dist --exclude="*.db" --exclude=".git" backend florone-app deploy
Pop-Location

Write-Host "==> Uploading to VPS..."
scp @SshArgs $Tarball "${SshTarget}:/tmp/florone-deploy.tar.gz"

Write-Host "==> Running setup + deploy on VPS..."
$RemoteScript = @'
set -e
export DEBIAN_FRONTEND=noninteractive
if ! command -v node >/dev/null 2>&1; then
  bash /var/www/florone/deploy/setup-server.sh 2>/dev/null || true
fi
mkdir -p /var/www/florone
tar -xzf /tmp/florone-deploy.tar.gz -C /var/www/florone
chmod +x /var/www/florone/deploy/*.sh
if ! command -v node >/dev/null 2>&1; then
  bash /var/www/florone/deploy/setup-server.sh
fi
bash /var/www/florone/deploy/deploy.sh
'@

ssh @SshArgs $SshTarget $RemoteScript

Write-Host ""
Write-Host "Done!"
Write-Host "Menu:  http://${HostName}/"
Write-Host "Admin: http://${HostName}:8080/Cashier"
