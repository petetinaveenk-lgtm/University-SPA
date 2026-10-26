Write-Host "=== Testing GET /api/health with Origin: http://localhost:57179 ==="
$res1 = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Headers @{ "Origin" = "http://localhost:57179" } -Method Get
Write-Host "Status Code:" $res1.StatusCode
Write-Host "Access-Control-Allow-Origin:" $res1.Headers["Access-Control-Allow-Origin"]
Write-Host "Content:" $res1.Content

Write-Host "`n=== Testing GET /api/dashboard/stats with Origin: http://localhost:57179 ==="
$res2 = Invoke-WebRequest -Uri "http://localhost:3000/api/dashboard/stats" -Headers @{ "Origin" = "http://localhost:57179" } -Method Get
Write-Host "Status Code:" $res2.StatusCode
Write-Host "Access-Control-Allow-Origin:" $res2.Headers["Access-Control-Allow-Origin"]

Write-Host "`n=== Testing OPTIONS Preflight for /api/students ==="
$res3 = Invoke-WebRequest -Uri "http://localhost:3000/api/students" -Headers @{ 
    "Origin" = "http://localhost:57179"; 
    "Access-Control-Request-Method" = "POST";
    "Access-Control-Request-Headers" = "Content-Type" 
} -Method Options
Write-Host "Preflight Status Code:" $res3.StatusCode
Write-Host "Access-Control-Allow-Origin:" $res3.Headers["Access-Control-Allow-Origin"]
Write-Host "Access-Control-Allow-Methods:" $res3.Headers["Access-Control-Allow-Methods"]
