aws_region    = "us-east-1"
environment   = "prod"
lambda_memory = 256

# Secrets - pass via CLI or terraform.tfvars (gitignored):
# terraform apply -var-file=environments/prod.tfvars \
#   -var database_url="postgresql+asyncpg://..." \
#   -var clerk_secret_key="sk_live_..." \
#   -var clerk_publishable_key="pk_live_..." \
#   -var gemini_api_key="..." \
#   -var secret_key="..." \
#   -var cors_origins="https://umbral.aiplaygrounds.org,https://umbral-edtech.vercel.app"
