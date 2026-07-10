param(
  [string]$User = "roota",
  [string]$HostName = "185.231.112.254"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
$Tarball = Join-Path $env:TEMP "florone-deploy.tar.gz"

Write-Host "==> Creating tarball..."
Push-Location $Root
tar -czf $Tarball --exclude=node_modules --exclude=dist --exclude="*.db" --exclude=".git" backend florone-app deploy
Pop-Location
Write-Host "Tarball: $Tarball"

Write-Host ""
Write-Host "==> Step 1: Upload (enter VPS password when prompted)"
scp -o StrictHostKeyChecking=accept-new $Tarball "${User}@${HostName}:/tmp/florone-deploy.tar.gz"

Write-Host ""
Write-Host "==> Step 2: Deploy on VPS (enter password again if prompted)"
$Remote = "mkdir -p /var/www/florone && tar -xzf /tmp/florone-deploy.tar.gz -C /var/www/florone && chmod +x /var/www/florone/deploy/*.sh && bash /var/www/florone/deploy/setup-server.sh && bash /var/www/florone/deploy/deploy.sh"
ssh -o StrictHostKeyChecking=accept-new "${User}@${HostName}" $Remote

Write-Host ""
Write-Host "Done!"
Write-Host "Menu:  http://${HostName}/"
Write-Host "Admin: http://${HostName}:8080/Cashier"
