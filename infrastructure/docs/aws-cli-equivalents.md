# AWS CLI Equivalents

Manual AWS CLI commands equivalent to what Terraform provisions.
Run these if you prefer manual setup over Terraform.

## Prerequisites

```bash
# Install AWS CLI
# https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

# Configure credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output (json)
```

## 1. ACM Certificate

```bash
# Request certificate
aws acm request-certificate \
  --domain-name learn.loopertech.net \
  --validation-method DNS \
  --region us-east-1

# Get validation DNS records (add these to Cloudflare)
aws acm describe-certificate \
  --certificate-arn <CERT_ARN> \
  --query "Certificate.DomainValidationOptions"
```

## 2. S3 Bucket (Frontend)

```bash
# Create bucket
aws s3 mb s3://umbral-frontend-prod --region us-east-1

# Block public access (CloudFront will serve it)
aws s3api put-public-access-block \
  --bucket umbral-frontend-prod \
  --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# Deploy frontend (after building)
aws s3 sync frontend/out/ s3://umbral-frontend-prod --delete
```

## 3. CloudFront Distribution

```bash
# Create OAI
aws cloudfront create-cloud-front-origin-access-identity \
  --cloud-front-origin-access-identity-config \
  CallerReference=$(date +%s),Comment="umbral-frontend"

# Create distribution (use JSON config file)
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json

# Invalidate cache after deploy
aws cloudfront create-invalidation \
  --distribution-id <DIST_ID> \
  --paths "/*"
```

## 4. RDS PostgreSQL

```bash
# Create database instance
aws rds create-db-instance \
  --db-instance-identifier umbral-db-prod \
  --db-instance-class db.t4g.micro \
  --engine postgres \
  --engine-version 15 \
  --master-username umbral_user \
  --master-user-password <PASSWORD> \
  --allocated-storage 20 \
  --storage-type gp3 \
  --db-name umbral_db \
  --publicly-accessible \
  --backup-retention-period 7 \
  --no-deletion-protection

# Get endpoint
aws rds describe-db-instances \
  --db-instance-identifier umbral-db-prod \
  --query "DBInstances[0].Endpoint"
```

## 5. ECR Repository

```bash
# Create repository
aws ecr create-repository --repository-name umbral-backend

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# Build and push backend image
docker build -t umbral-backend -f docker/backend/Dockerfile .
docker tag umbral-backend:latest <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/umbral-backend:latest
docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/umbral-backend:latest
```

## 6. App Runner (Backend)

```bash
# Create App Runner service
aws apprunner create-service \
  --service-name umbral-api-prod \
  --source-configuration '{
    "AuthenticationConfiguration": {
      "AccessRoleArn": "<APPRUNNER_ECR_ROLE_ARN>"
    },
    "AutoDeploymentsEnabled": false,
    "ImageRepository": {
      "ImageIdentifier": "<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/umbral-backend:latest",
      "ImageRepositoryType": "ECR",
      "ImageConfiguration": {
        "Port": "8000",
        "RuntimeEnvironmentVariables": {
          "DATABASE_URL": "postgresql+asyncpg://umbral_user:<PASSWORD>@<RDS_ENDPOINT>/umbral_db",
          "GEMINI_API_KEY": "<KEY>",
          "GEMINI_MODEL": "gemini-2.0-flash",
          "CORS_ORIGINS": "[\"https://learn.loopertech.net\"]"
        }
      }
    }
  }' \
  --instance-configuration '{"Cpu": "0.25 vCPU", "Memory": "0.5 GB"}' \
  --health-check-configuration '{"Protocol": "HTTP", "Path": "/health"}'

# Get service URL
aws apprunner describe-service \
  --service-arn <SERVICE_ARN> \
  --query "Service.ServiceUrl"
```

## Deployment Workflow

```bash
# 1. Build and push backend
docker build -t umbral-backend -f docker/backend/Dockerfile .
docker tag umbral-backend:latest <ECR_URL>:latest
docker push <ECR_URL>:latest

# 2. Deploy backend (trigger App Runner redeployment)
aws apprunner start-deployment --service-arn <SERVICE_ARN>

# 3. Build and deploy frontend
cd frontend && npm run build
aws s3 sync out/ s3://umbral-frontend-prod --delete
aws cloudfront create-invalidation --distribution-id <DIST_ID> --paths "/*"

# 4. Run migrations (connect to RDS)
cd backend && DATABASE_URL=<PROD_URL> alembic upgrade head
```

## Using Terraform Instead

```bash
cd infrastructure/terraform

# Initialize
terraform init

# Plan (review changes)
terraform plan -var-file=environments/prod.tfvars -var "db_password=<PASSWORD>"

# Apply
terraform apply -var-file=environments/prod.tfvars -var "db_password=<PASSWORD>"

# Destroy (careful!)
terraform destroy -var-file=environments/prod.tfvars -var "db_password=<PASSWORD>"
```
