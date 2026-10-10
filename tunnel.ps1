# SmartPlate Auto-Reconnecting Public Tunnel Script
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "SmartPlate Auto-Reconnecting Public HTTPS Tunnel" -ForegroundColor Green
Write-Host "Forwarding local port 3001 to public HTTPS URL" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green

while ($true) {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Connecting tunnel to Serveo..." -ForegroundColor Yellow
    ssh -o ServerAliveInterval=15 -o ServerAliveCountMax=3 -o StrictHostKeyChecking=no -R 80:localhost:3001 serveo.net
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Tunnel connection closed. Reconnecting in 3 seconds..." -ForegroundColor Red
    Start-Sleep -Seconds 3
}
