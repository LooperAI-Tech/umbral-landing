#!/bin/bash
# Azure CLI deployment script for FastAPI backend

set -e

echo "========================================="
echo "Umbral EdTech - Backend Deployment"
echo "========================================="

# Configuration variables
RESOURCE_GROUP="umbral-edtech-rg"
LOCATION="eastus"
APP_SERVICE_PLAN="umbral-backend-plan"
APP_SERVICE_NAME="umbral-backend-api"
DATABASE_SERVER="umbral-db-server"
DATABASE_NAME="umbral_db"
DATABASE_ADMIN="umbral_admin"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Logging into Azure...${NC}"
az login

echo -e "${YELLOW}Step 2: Creating Resource Group...${NC}"
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

echo -e "${YELLOW}Step 3: Creating PostgreSQL Server...${NC}"
echo "Enter PostgreSQL admin password:"
read -s DB_PASSWORD

az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $DATABASE_SERVER \
  --location $LOCATION \
  --admin-user $DATABASE_ADMIN \
  --admin-password $DB_PASSWORD \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 14 \
  --public-access 0.0.0.0

echo -e "${YELLOW}Step 4: Creating Database...${NC}"
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name $DATABASE_SERVER \
  --database-name $DATABASE_NAME

echo -e "${YELLOW}Step 5: Creating App Service Plan (Linux)...${NC}"
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --is-linux \
  --sku B1

echo -e "${YELLOW}Step 6: Creating App Service (Web App)...${NC}"
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --name $APP_SERVICE_NAME \
  --runtime "PYTHON:3.11" \
  --deployment-local-git

echo -e "${YELLOW}Step 7: Configuring App Settings...${NC}"
echo "Enter Clerk Secret Key:"
read -s CLERK_SECRET

echo "Enter OpenAI API Key:"
read -s OPENAI_KEY

echo "Enter Anthropic API Key:"
read -s ANTHROPIC_KEY

# Build connection string
DB_CONNECTION_STRING="postgresql+asyncpg://${DATABASE_ADMIN}:${DB_PASSWORD}@${DATABASE_SERVER}.postgres.database.azure.com:5432/${DATABASE_NAME}"

az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_SERVICE_NAME \
  --settings \
    DATABASE_URL="$DB_CONNECTION_STRING" \
    CLERK_SECRET_KEY="$CLERK_SECRET" \
    OPENAI_API_KEY="$OPENAI_KEY" \
    ANTHROPIC_API_KEY="$ANTHROPIC_KEY" \
    SECRET_KEY="$(openssl rand -hex 32)" \
    CORS_ORIGINS='["https://${APP_SERVICE_NAME}.azurewebsites.net"]' \
    DEBUG="false" \
    PYTHONUNBUFFERED="1"

echo -e "${YELLOW}Step 8: Configuring Startup Command...${NC}"
az webapp config set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_SERVICE_NAME \
  --startup-file "startup.sh"

echo -e "${YELLOW}Step 9: Deploying Application...${NC}"
cd ../../backend

# Create deployment package
echo "Creating deployment package..."
zip -r deploy.zip . -x "venv/*" -x "__pycache__/*" -x "*.pyc" -x ".env"

# Deploy using ZIP deploy
az webapp deployment source config-zip \
  --resource-group $RESOURCE_GROUP \
  --name $APP_SERVICE_NAME \
  --src deploy.zip

# Clean up
rm deploy.zip

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Backend URL: https://${APP_SERVICE_NAME}.azurewebsites.net"
echo "Health Check: https://${APP_SERVICE_NAME}.azurewebsites.net/health"
echo "API Docs: https://${APP_SERVICE_NAME}.azurewebsites.net/docs"
echo ""
echo "To view logs:"
echo "az webapp log tail --resource-group $RESOURCE_GROUP --name $APP_SERVICE_NAME"
