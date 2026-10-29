# Launch development environment (Backend + Interviewer Dashboard)
Write-Host "Starting Interview Integrity Monitoring System..." -ForegroundColor Cyan

# Set environment
$env:PORT = "3000"
$env:SUPABASE_URL = "https://mock-supabase.local"
$env:SUPABASE_ANON_KEY = "mock-anon-key"
$env:SUPABASE_SERVICE_KEY = "mock-service-key"
$env:JWT_SECRET = "dev-secret-key-32-chars-minimum-length-req!"

Write-Host "Starting Backend on http://localhost:3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev --workspace=apps/backend"

Write-Host "Starting Interviewer Dashboard on http://localhost:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev --workspace=apps/interviewer-dashboard"

Write-Host "Services launched in background PowerShell windows." -ForegroundColor Cyan
