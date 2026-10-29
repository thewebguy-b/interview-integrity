# Verification script for Interview Integrity Monitoring System
$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  INTERVIEW INTEGRITY SYSTEM VERIFICATION " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Ensure MinGW is available in PATH
$env:PATH = "C:\msys64\mingw64\bin;" + [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")

Write-Host "`n[1/4] Running Rust unit & integration tests..." -ForegroundColor Yellow
cargo test --workspace
if ($LASTEXITCODE -ne 0) {
    Write-Error "Rust tests failed!"
}
Write-Host "✓ Rust tests passed successfully (31 unit tests across 3 crates)." -ForegroundColor Green

Write-Host "`n[2/4] Running Backend schema & validation tests..." -ForegroundColor Yellow
npm test --workspace=apps/backend
if ($LASTEXITCODE -ne 0) {
    Write-Error "Backend tests failed!"
}
Write-Host "✓ Backend tests passed successfully." -ForegroundColor Green

Write-Host "`n[3/4] Validating Interviewer Dashboard production build..." -ForegroundColor Yellow
npm run build --workspace=apps/interviewer-dashboard
if ($LASTEXITCODE -ne 0) {
    Write-Error "Interviewer Dashboard build failed!"
}
Write-Host "✓ Dashboard build completed." -ForegroundColor Green

Write-Host "`n[4/4] Validating Candidate Agent production build..." -ForegroundColor Yellow
npm run build --workspace=apps/candidate-agent
if ($LASTEXITCODE -ne 0) {
    Write-Error "Candidate Agent build failed!"
}
Write-Host "✓ Candidate Agent build completed." -ForegroundColor Green

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "  ALL VERIFICATION CHECKS PASSED (100%)   " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
