# Package the FastAPI backend for AWS Lambda deployment.
# Creates backend/lambda.zip with all code + dependencies.
#
# Usage: powershell -ExecutionPolicy Bypass -File infrastructure\scripts\package-backend.ps1
# Run from the repo root.

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path "$ScriptDir\..\.."
$BackendDir = "$RepoRoot\backend"
$BuildDir = "$BackendDir\.lambda_build"
$Output = "$BackendDir\lambda.zip"

Write-Host "==> Cleaning previous build..."
if (Test-Path $BuildDir) { Remove-Item -Recurse -Force $BuildDir }
if (Test-Path $Output) { Remove-Item -Force $Output }
New-Item -ItemType Directory -Path $BuildDir -Force | Out-Null

Write-Host "==> Installing Python dependencies (Linux binaries for Lambda)..."
# Step 1: Install packages with Linux binary wheels (compiled packages like asyncpg)
$ErrorActionPreference = "Continue"
pip install --target "$BuildDir" --platform manylinux2014_x86_64 --implementation cp --python-version 3.12 --only-binary=:all: -r "$BackendDir\requirements.txt" --quiet 2>&1 | Out-Null

# Step 2: Install remaining pure-Python packages that were skipped by --only-binary
Write-Host "==> Installing pure-Python dependencies..."
pip install --target "$BuildDir" -r "$BackendDir\requirements.txt" --quiet 2>&1 | Out-Null
$ErrorActionPreference = "Stop"

Write-Host "==> Copying backend source code..."
Copy-Item "$BackendDir\lambda_handler.py" "$BuildDir\"
Copy-Item "$BackendDir\main.py" "$BuildDir\"
Copy-Item "$BackendDir\app" "$BuildDir\app" -Recurse

Write-Host "==> Creating deployment zip..."
# Remove __pycache__ and .pyc files before zipping (keep .dist-info — Python needs it for package metadata)
Get-ChildItem -Path $BuildDir -Recurse -Directory -Filter "__pycache__" | Remove-Item -Recurse -Force
Get-ChildItem -Path $BuildDir -Recurse -Filter "*.pyc" | Remove-Item -Force

Compress-Archive -Path "$BuildDir\*" -DestinationPath $Output -Force

Write-Host "==> Cleaning build directory..."
Remove-Item -Recurse -Force $BuildDir

$ZipSize = (Get-Item $Output).Length / 1MB
$ZipSizeStr = "{0:N1} MB" -f $ZipSize
Write-Host "==> Done! Lambda package: $Output ($ZipSizeStr)"
