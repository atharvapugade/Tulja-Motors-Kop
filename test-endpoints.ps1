$proc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npx next dev -p 3005" -PassThru -NoNewWindow

Write-Host "Waiting for Next.js dev server on port 3005..."
Start-Sleep -Seconds 6

try {
    Write-Host "`n=== 1. Probing /panels landing page ==="
    $r1 = Invoke-WebRequest -Uri "http://localhost:3005/panels" -UseBasicParsing -TimeoutSec 25
    Write-Host "[SUCCESS] /panels status code:" $r1.StatusCode

    Write-Host "`n=== 2. Testing /panels/admin login page ==="
    $r2 = Invoke-WebRequest -Uri "http://localhost:3005/panels/admin" -UseBasicParsing -TimeoutSec 25
    Write-Host "[SUCCESS] /panels/admin status code:" $r2.StatusCode

    Write-Host "`n=== 3. Testing /panels/technician login page ==="
    $r3 = Invoke-WebRequest -Uri "http://localhost:3005/panels/technician" -UseBasicParsing -TimeoutSec 25
    Write-Host "[SUCCESS] /panels/technician status code:" $r3.StatusCode

    Write-Host "`n=== 4. Testing /api/auth/login POST ==="
    $loginBody = @{
        email = "admin@tuljamotors.com"
        password = "Password@123"
        panelSlug = "admin"
    } | ConvertTo-Json
    $r4 = Invoke-RestMethod -Uri "http://localhost:3005/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -TimeoutSec 25
    Write-Host "[SUCCESS] Login success:" $r4.success
    Write-Host "Redirect URL:" $r4.redirectUrl
    Write-Host "Authenticated User:" $r4.user.name "(" $r4.user.role ")"

    Write-Host "`n=== 5. Testing /api/stats GET ==="
    $r5 = Invoke-RestMethod -Uri "http://localhost:3005/api/stats" -Method Get -TimeoutSec 25
    Write-Host "[SUCCESS] Stats active jobs:" $r5.stats.activeJobs
    Write-Host "Stats total employees:" $r5.stats.totalEmployees
    Write-Host "Stats total revenue:" $r5.stats.totalRevenue

    Write-Host "`n=== 6. Testing /api/job-cards GET ==="
    $r6 = Invoke-RestMethod -Uri "http://localhost:3005/api/job-cards" -Method Get -TimeoutSec 25
    Write-Host "[SUCCESS] Total job cards:" $r6.jobCards.Count
    Write-Host "First Job Card:" $r6.jobCards[0].jobCardNumber "-" $r6.jobCards[0].vehicleRegistration "(" $r6.jobCards[0].currentStage ")"

    Write-Host "`n=== 7. Testing /panels/admin/dashboard page ==="
    $r7 = Invoke-WebRequest -Uri "http://localhost:3005/panels/admin/dashboard" -UseBasicParsing -TimeoutSec 25
    Write-Host "[SUCCESS] /panels/admin/dashboard status code:" $r7.StatusCode

    Write-Host "`n========================================================"
    Write-Host " ALL 7 LIVE WORKSHOP VERIFICATION TESTS PASSED SUCCESSFULLY! "
    Write-Host "========================================================"
}
catch {
    Write-Error $_
}
finally {
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    # Kill any node listening on 3005
    Get-NetTCPConnection -LocalPort 3005 -ErrorAction SilentlyContinue | ForEach-Object {
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}
