Write-Host "Supabase Credentials Setup" -ForegroundColor Cyan
Write-Host ""

if (Test-Path .env) {
    Write-Host ".env already exists."
    $overwrite = Read-Host "Overwrite? (y/n)"
    if ($overwrite -ne "y") {
        Write-Host "Cancelled."
        exit 1
    }
}

Write-Host "Creating .env from template..."
Copy-Item .env.example .env

Write-Host "Enter your Supabase credentials:"
$url = Read-Host "Project URL (https://...supabase.co)"
$key = Read-Host "Anon Key (eyJ...)"

if ([string]::IsNullOrWhiteSpace($url) -or [string]::IsNullOrWhiteSpace($key)) {
    Write-Host "Error: Credentials cannot be empty"
    exit 1
}

$content = Get-Content .env -Raw
$content = $content -replace 'VITE_SUPABASE_URL=.*', "VITE_SUPABASE_URL=$url"
$content = $content -replace 'VITE_SUPABASE_ANON_KEY=.*', "VITE_SUPABASE_ANON_KEY=$key"
$content | Set-Content .env

Write-Host ""
Write-Host "Success! .env file updated." -ForegroundColor Green
Write-Host ""
Write-Host "Next: npm run dev"
