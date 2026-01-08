#!/bin/bash
# Complete Azure setup script for Umbral EdTech

set -e

echo "========================================="
echo "Umbral EdTech - Complete Azure Setup"
echo "========================================="

# Install Azure CLI if not present
if ! command -v az &> /dev/null; then
    echo "Azure CLI not found. Please install it first:"
    echo "https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

echo "This script will deploy:"
echo "  1. PostgreSQL Database (Azure Database for PostgreSQL)"
echo "  2. Backend API (Azure App Service)"
echo "  3. Frontend (Azure Static Web Apps)"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
fi

# Deploy backend
echo ""
echo "========================================="
echo "Deploying Backend..."
echo "========================================="
./deploy-backend.sh

# Deploy frontend
echo ""
echo "========================================="
echo "Deploying Frontend..."
echo "========================================="
./deploy-frontend.sh

echo ""
echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Verify backend is running: Check health endpoint"
echo "2. Configure Clerk authentication with your Azure URLs"
echo "3. Update frontend environment variables with backend URL"
echo "4. Test the application end-to-end"
