# Deploy the backend to AWS Lambda via Terraform.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File infrastructure\scripts\deploy-backend.ps1
#   powershell -ExecutionPolicy Bypass -File infrastructure\scripts\deploy-backend.ps1 -Env staging
#
# Prerequisites:
#   - AWS CLI configured (aws configure)
#   - Terraform installed
#   - Python 3.12 (for packaging)

param(
    [string]$Env = "prod"
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path "$ScriptDir\..\.."
$TfDir = "$RepoRoot\infrastructure\terraform"
$TfVars = "$TfDir\environments\$Env.tfvars"

if (-not (Test-Path $TfVars)) {
    Write-Error "ERROR: Environment file not found: $TfVars"
    exit 1
}

Write-Host "========================================="
Write-Host "  Umbral Backend Deploy ($Env)"
Write-Host "========================================="

# Step 1: Package backend
Write-Host ""
Write-Host "[1/3] Packaging backend for Lambda..."
& powershell -ExecutionPolicy Bypass -File "$ScriptDir\package-backend.ps1"
if ($LASTEXITCODE -ne 0) { throw "Packaging failed" }

# Step 2: Terraform init
Write-Host ""
Write-Host "[2/3] Initializing Terraform..."
Push-Location $TfDir
try {
    terraform init -input=false
    if ($LASTEXITCODE -ne 0) { throw "Terraform init failed" }

    # Step 3: Terraform apply
    Write-Host ""
    Write-Host "[3/3] Applying Terraform..."
    terraform apply -var-file="$TfVars" -auto-approve
    if ($LASTEXITCODE -ne 0) { throw "Terraform apply failed" }

    Write-Host ""
    Write-Host "========================================="
    Write-Host "  Deploy complete!"
    Write-Host "========================================="
    Write-Host ""
    terraform output api_gateway_url
    Write-Host ""
    Write-Host "Set this URL as NEXT_PUBLIC_API_URL in Vercel."
}
finally {
    Pop-Location
}
