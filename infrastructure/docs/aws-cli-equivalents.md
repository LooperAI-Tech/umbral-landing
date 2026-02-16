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

## 1. IAM Role for Lambda

```bash
# Create execution role
aws iam create-role \
  --role-name umbral-lambda-prod \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "lambda.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

# Attach basic execution policy (CloudWatch Logs)
aws iam attach-role-policy \
  --role-name umbral-lambda-prod \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

## 2. Lambda Function

```bash
# Create function (after packaging with package-backend.sh)
aws lambda create-function \
  --function-name umbral-api-prod \
  --runtime python3.12 \
  --handler lambda_handler.handler \
  --role <ROLE_ARN> \
  --zip-file fileb://backend/lambda.zip \
  --timeout 30 \
  --memory-size 256 \
  --environment "Variables={
    DATABASE_URL=<SUPABASE_URL>,
    CLERK_SECRET_KEY=<KEY>,
    CLERK_PUBLISHABLE_KEY=<KEY>,
    GEMINI_API_KEY=<KEY>,
    GEMINI_MODEL=gemini-2.5-flash,
    SECRET_KEY=<SECRET>,
    CORS_ORIGINS=[\"https://umbral.aiplaygrounds.org\"]
  }"

# Update function code (subsequent deploys)
aws lambda update-function-code \
  --function-name umbral-api-prod \
  --zip-file fileb://backend/lambda.zip
```

## 3. API Gateway (HTTP API)

```bash
# Create HTTP API
aws apigatewayv2 create-api \
  --name umbral-api-prod \
  --protocol-type HTTP \
  --cors-configuration '{
    "AllowOrigins": ["https://umbral.aiplaygrounds.org"],
    "AllowMethods": ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    "AllowHeaders": ["Authorization","Content-Type"],
    "AllowCredentials": true,
    "MaxAge": 86400
  }'

# Create Lambda integration
aws apigatewayv2 create-integration \
  --api-id <API_ID> \
  --integration-type AWS_PROXY \
  --integration-uri arn:aws:lambda:us-east-1:<ACCOUNT_ID>:function:umbral-api-prod \
  --payload-format-version 2.0

# Create catch-all route
aws apigatewayv2 create-route \
  --api-id <API_ID> \
  --route-key '$default' \
  --target integrations/<INTEGRATION_ID>

# Create auto-deploy stage
aws apigatewayv2 create-stage \
  --api-id <API_ID> \
  --stage-name '$default' \
  --auto-deploy

# Allow API Gateway to invoke Lambda
aws lambda add-permission \
  --function-name umbral-api-prod \
  --statement-id AllowAPIGatewayInvoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:us-east-1:<ACCOUNT_ID>:<API_ID>/*/*"

# Get API URL
aws apigatewayv2 get-api --api-id <API_ID> --query "ApiEndpoint"
```

## Using Terraform Instead

```bash
cd infrastructure/terraform

# Initialize
terraform init

# Plan (review changes)
terraform plan -var-file=environments/prod.tfvars \
  -var database_url="..." \
  -var clerk_secret_key="..." \
  -var clerk_publishable_key="..." \
  -var gemini_api_key="..." \
  -var secret_key="..." \
  -var cors_origins="https://umbral.aiplaygrounds.org"

# Apply
terraform apply -var-file=environments/prod.tfvars -var ...

# Destroy all AWS resources (Supabase, Clerk, Vercel unaffected)
terraform destroy -var-file=environments/prod.tfvars -var ...
```

## Domain Setup (Cloudflare)

```bash
# In Cloudflare DNS for aiplaygrounds.org:
# Add CNAME record:
#   Name: umbral
#   Target: cname.vercel-dns.com
#   Proxy: OFF (DNS only / gray cloud) — Vercel handles SSL
```
