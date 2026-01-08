# Azure Deployment Guide

This guide provides step-by-step instructions for deploying Umbral EdTech to Microsoft Azure.

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  Azure Cloud                     │
│                                                  │
│  ┌────────────────────┐    ┌─────────────────┐ │
│  │  Static Web Apps   │    │  App Service    │ │
│  │  (Next.js)         │───▶│  (FastAPI)      │ │
│  │  Frontend          │    │  Backend API    │ │
│  └────────────────────┘    └─────────────────┘ │
│                                    │             │
│                                    ▼             │
│                          ┌─────────────────┐    │
│                          │  PostgreSQL DB  │    │
│                          │  (Flexible)     │    │
│                          └─────────────────┘    │
└─────────────────────────────────────────────────┘
```

## Prerequisites

1. **Azure Account**: Create a free account at [azure.microsoft.com](https://azure.microsoft.com/free/)
2. **Azure CLI**: Install from [docs.microsoft.com/cli/azure/install-azure-cli](https://docs.microsoft.com/cli/azure/install-azure-cli)
3. **Git**: For source control
4. **Node.js 18+**: For frontend build
5. **Python 3.11+**: For backend

### Verify Installation

```bash
az --version
node --version
python --version
```

## Azure Services Used

| Service | Purpose | Pricing Tier (Dev) |
|---------|---------|-------------------|
| **Azure Database for PostgreSQL** | Primary database | Burstable B1ms (~$12/month) |
| **Azure App Service** | Backend API hosting | B1 Basic (~$13/month) |
| **Azure Static Web Apps** | Frontend hosting | Free tier available |
| **Azure Storage Account** | File storage (optional) | Pay-as-you-go |

**Estimated Monthly Cost (Development):** ~$25-30/month

## Deployment Options

### Option 1: Automated Deployment (Recommended)

Use the provided scripts for quick deployment:

```bash
cd scripts/azure
./setup-azure.sh
```

This will deploy both frontend and backend automatically.

### Option 2: Manual Deployment via Azure CLI

Follow the step-by-step instructions below.

### Option 3: Azure Portal (GUI)

Use the Azure Portal web interface for manual resource creation.

---

## Step-by-Step Manual Deployment

### Part 1: Backend Deployment (FastAPI + PostgreSQL)

#### 1. Login to Azure

```bash
az login
```

#### 2. Create Resource Group

```bash
az group create \
  --name umbral-edtech-rg \
  --location eastus
```

#### 3. Create PostgreSQL Database

```bash
# Create PostgreSQL Flexible Server
az postgres flexible-server create \
  --resource-group umbral-edtech-rg \
  --name umbral-db-server \
  --location eastus \
  --admin-user umbral_admin \
  --admin-password <YOUR_SECURE_PASSWORD> \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 14 \
  --public-access 0.0.0.0

# Create database
az postgres flexible-server db create \
  --resource-group umbral-edtech-rg \
  --server-name umbral-db-server \
  --database-name umbral_db
```

**Important:** Save your database password securely!

#### 4. Get Database Connection String

```bash
echo "postgresql+asyncpg://umbral_admin:<PASSWORD>@umbral-db-server.postgres.database.azure.com:5432/umbral_db"
```

#### 5. Create App Service Plan

```bash
az appservice plan create \
  --name umbral-backend-plan \
  --resource-group umbral-edtech-rg \
  --location eastus \
  --is-linux \
  --sku B1
```

#### 6. Create App Service (Web App)

```bash
az webapp create \
  --resource-group umbral-edtech-rg \
  --plan umbral-backend-plan \
  --name umbral-backend-api \
  --runtime "PYTHON:3.11"
```

#### 7. Configure Environment Variables

```bash
az webapp config appsettings set \
  --resource-group umbral-edtech-rg \
  --name umbral-backend-api \
  --settings \
    DATABASE_URL="<YOUR_CONNECTION_STRING>" \
    CLERK_SECRET_KEY="<YOUR_CLERK_SECRET>" \
    OPENAI_API_KEY="<YOUR_OPENAI_KEY>" \
    ANTHROPIC_API_KEY="<YOUR_ANTHROPIC_KEY>" \
    SECRET_KEY="$(openssl rand -hex 32)" \
    CORS_ORIGINS='["https://umbral-frontend.azurestaticapps.net"]' \
    DEBUG="false"
```

#### 8. Configure Startup Command

```bash
az webapp config set \
  --resource-group umbral-edtech-rg \
  --name umbral-backend-api \
  --startup-file "startup.sh"
```

#### 9. Deploy Backend Code

**Option A: ZIP Deployment**

```bash
cd backend
zip -r deploy.zip . -x "venv/*" -x "__pycache__/*" -x "*.pyc" -x ".env"

az webapp deployment source config-zip \
  --resource-group umbral-edtech-rg \
  --name umbral-backend-api \
  --src deploy.zip

rm deploy.zip
```

**Option B: Git Deployment**

```bash
# Get Git URL
GIT_URL=$(az webapp deployment source config-local-git \
  --resource-group umbral-edtech-rg \
  --name umbral-backend-api \
  --query url --output tsv)

# Add remote and push
cd backend
git remote add azure $GIT_URL
git push azure main
```

#### 10. Verify Backend Deployment

```bash
# Check health endpoint
curl https://umbral-backend-api.azurewebsites.net/health

# View logs
az webapp log tail \
  --resource-group umbral-edtech-rg \
  --name umbral-backend-api
```

---

### Part 2: Frontend Deployment (Next.js)

#### 1. Create Static Web App

```bash
az staticwebapp create \
  --name umbral-frontend \
  --resource-group umbral-edtech-rg \
  --location eastus
```

#### 2. Get Deployment Token

```bash
az staticwebapp secrets list \
  --name umbral-frontend \
  --resource-group umbral-edtech-rg \
  --query "properties.apiKey" \
  --output tsv
```

Save this token - you'll need it for deployment.

#### 3. Configure Environment Variables

Go to Azure Portal:
1. Navigate to Static Web Apps → umbral-frontend
2. Click "Configuration" in the left menu
3. Add the following variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Your Clerk publishable key |
| `CLERK_SECRET_KEY` | Your Clerk secret key |
| `NEXT_PUBLIC_API_URL` | `https://umbral-backend-api.azurewebsites.net` |
| `NEXT_PUBLIC_WS_URL` | `wss://umbral-backend-api.azurewebsites.net` |

#### 4. Deploy Frontend

**Option A: Using SWA CLI**

```bash
npm install -g @azure/static-web-apps-cli

cd frontend
npm run build

swa deploy \
  --deployment-token <YOUR_DEPLOYMENT_TOKEN> \
  --app-location . \
  --output-location .next
```

**Option B: GitHub Actions (Recommended)**

Connect your GitHub repository:

```bash
az staticwebapp update \
  --name umbral-frontend \
  --resource-group umbral-edtech-rg \
  --source https://github.com/<YOUR_USERNAME>/umbral-edtech \
  --branch main \
  --app-location "/frontend" \
  --output-location ".next"
```

This will create a GitHub Actions workflow automatically.

#### 5. Verify Frontend Deployment

Visit: `https://umbral-frontend.azurestaticapps.net`

---

## Post-Deployment Configuration

### 1. Update Clerk Authentication

In your Clerk Dashboard:
- Add authorized domains:
  - `https://umbral-frontend.azurestaticapps.net`
  - `https://umbral-backend-api.azurewebsites.net`
- Configure callback URLs

### 2. Update CORS Settings

```bash
az webapp cors add \
  --resource-group umbral-edtech-rg \
  --name umbral-backend-api \
  --allowed-origins https://umbral-frontend.azurestaticapps.net
```

### 3. Enable HTTPS Only

```bash
az webapp update \
  --resource-group umbral-edtech-rg \
  --name umbral-backend-api \
  --https-only true
```

### 4. Configure Custom Domain (Optional)

```bash
# Add custom domain
az webapp config hostname add \
  --resource-group umbral-edtech-rg \
  --webapp-name umbral-backend-api \
  --hostname api.umbral.com

# Enable SSL
az webapp config ssl bind \
  --resource-group umbral-edtech-rg \
  --name umbral-backend-api \
  --certificate-thumbprint <THUMBPRINT> \
  --ssl-type SNI
```

---

## Monitoring & Logging

### View Application Logs

```bash
# Backend logs
az webapp log tail \
  --resource-group umbral-edtech-rg \
  --name umbral-backend-api

# Download logs
az webapp log download \
  --resource-group umbral-edtech-rg \
  --name umbral-backend-api
```

### Enable Application Insights (Optional)

```bash
az monitor app-insights component create \
  --app umbral-insights \
  --location eastus \
  --resource-group umbral-edtech-rg \
  --application-type web

# Connect to App Service
az webapp config appsettings set \
  --resource-group umbral-edtech-rg \
  --name umbral-backend-api \
  --settings APPLICATIONINSIGHTS_CONNECTION_STRING="<CONNECTION_STRING>"
```

---

## Scaling & Performance

### Scale Backend (Horizontal)

```bash
az appservice plan update \
  --resource-group umbral-edtech-rg \
  --name umbral-backend-plan \
  --sku P1V2 \
  --number-of-workers 2
```

### Scale Database

```bash
az postgres flexible-server update \
  --resource-group umbral-edtech-rg \
  --name umbral-db-server \
  --sku-name Standard_D2s_v3
```

---

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
az webapp log tail --resource-group umbral-edtech-rg --name umbral-backend-api

# Check app settings
az webapp config appsettings list --resource-group umbral-edtech-rg --name umbral-backend-api

# Restart app
az webapp restart --resource-group umbral-edtech-rg --name umbral-backend-api
```

### Database Connection Issues

```bash
# Check firewall rules
az postgres flexible-server firewall-rule list \
  --resource-group umbral-edtech-rg \
  --name umbral-db-server

# Add firewall rule for Azure services
az postgres flexible-server firewall-rule create \
  --resource-group umbral-edtech-rg \
  --name umbral-db-server \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

### Frontend Build Errors

- Check environment variables in Static Web Apps configuration
- Verify Node.js version matches requirements
- Check GitHub Actions logs

---

## Clean Up Resources

To delete all resources:

```bash
az group delete \
  --name umbral-edtech-rg \
  --yes \
  --no-wait
```

---

## Cost Optimization

**Development Environment:**
- Use B1 tier for App Service (~$13/month)
- Use Burstable B1ms for PostgreSQL (~$12/month)
- Use Free tier for Static Web Apps

**Production Environment:**
- Upgrade to P1V2 for App Service (better performance)
- Use General Purpose for PostgreSQL (better reliability)
- Enable autoscaling based on metrics

---

## Next Steps

1. ✅ Deploy backend and frontend
2. ✅ Configure Clerk authentication
3. ✅ Test API endpoints
4. ⏳ Set up CI/CD pipeline with GitHub Actions
5. ⏳ Configure monitoring and alerts
6. ⏳ Implement backup strategy
7. ⏳ Set up staging environment

---

## Additional Resources

- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- [Azure Static Web Apps Documentation](https://docs.microsoft.com/azure/static-web-apps/)
- [Azure Database for PostgreSQL Documentation](https://docs.microsoft.com/azure/postgresql/)
- [Azure CLI Reference](https://docs.microsoft.com/cli/azure/)

---

## Support

For issues or questions:
- Check deployment logs
- Review Azure Portal health checks
- Contact the development team
