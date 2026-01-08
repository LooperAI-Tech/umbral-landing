#!/bin/bash
# Azure CLI deployment script for Next.js frontend (Static Web Apps)

set -e

echo "========================================="
echo "Umbral EdTech - Frontend Deployment"
echo "========================================="

# Configuration variables
RESOURCE_GROUP="umbral-edtech-rg"
LOCATION="eastus"
STATIC_WEB_APP_NAME="umbral-frontend"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Logging into Azure...${NC}"
az login

echo -e "${YELLOW}Step 2: Ensuring Resource Group exists...${NC}"
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION \
  --output none

echo -e "${YELLOW}Step 3: Creating Static Web App...${NC}"
az staticwebapp create \
  --name $STATIC_WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --source https://github.com/YOUR_GITHUB_USERNAME/umbral-edtech \
  --branch main \
  --app-location "/frontend" \
  --output-location ".next" \
  --login-with-github

echo -e "${YELLOW}Step 4: Retrieving deployment token...${NC}"
DEPLOYMENT_TOKEN=$(az staticwebapp secrets list \
  --name $STATIC_WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "properties.apiKey" \
  --output tsv)

echo -e "${YELLOW}Step 5: Setting environment variables...${NC}"
echo "Enter Clerk Publishable Key:"
read CLERK_PUB_KEY

echo "Enter Clerk Secret Key:"
read -s CLERK_SECRET

echo "Enter Backend API URL (e.g., https://umbral-backend-api.azurewebsites.net):"
read API_URL

# Note: Static Web Apps environment variables are set via Azure Portal or GitHub Actions
echo ""
echo -e "${YELLOW}Please set the following environment variables in Azure Portal:${NC}"
echo "  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$CLERK_PUB_KEY"
echo "  CLERK_SECRET_KEY=***"
echo "  NEXT_PUBLIC_API_URL=$API_URL"
echo "  NEXT_PUBLIC_WS_URL=ws://${API_URL#https://}"

echo ""
echo -e "${YELLOW}Step 6: Building and deploying frontend...${NC}"
cd ../../frontend

# Install dependencies
npm ci

# Build the application
npm run build

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Static Web App Created!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Frontend URL: https://${STATIC_WEB_APP_NAME}.azurestaticapps.net"
echo ""
echo "To complete deployment:"
echo "1. Go to Azure Portal > Static Web Apps > ${STATIC_WEB_APP_NAME}"
echo "2. Configure environment variables in 'Configuration' section"
echo "3. Connect your GitHub repository for automated deployments"
echo ""
echo "Deployment Token (save this): $DEPLOYMENT_TOKEN"
