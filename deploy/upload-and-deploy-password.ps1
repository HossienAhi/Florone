param(
  [string]$User = "roota",
  [string]$HostName = "185.231.112.254"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
$Tarball = Join-Path $env:TEMP "florone-deploy.tar.gz"
$SshTarget = "${User}@${HostName}"

Write-Host "==> Creating tarball..."
Push-Location $Root
tar -czf $Tarball --exclude=node_modules --exclude=dist --exclude="*.db" --exclude=".git" backend florone-app deploy
Pop-Location
Write-Host "    $Tarball"

Write-Host ""
Write-Host "==> Uploading (enter VPS password when prompted)..."
scp -o StrictHostKeyChecking=accept-new $Tarball "${SshTarget}:/tmp/florone-deploy.tar.gz"

Write-Host ""
Write-Host "==> Deploying on VPS (enter password again if asked)..."
$RemoteScript = @'
set -e
export DEBIAN_FRONTEND=noninteractive
mkdir -p /var/www/florone
tar -xzf /tmp/florone-deploy.tar.gz -C /var/www/florone
chmod +x /var/www/florone/deploy/*.sh
if ! command -v node >/dev/null 2>&1; then
  bash /var/www/florone/deploy/setup-server.sh
fi
bash /var/www/florone/deploy/deploy.sh
'@

ssh -o StrictHostKeyChecking=accept-new $SshTarget $RemoteScript

Write-Host ""
Write-Host "Done!"
Write-Host "Menu:  http://${HostName}/"
Write-Host "Admin: http://${HostName}:8080/Cashier"
