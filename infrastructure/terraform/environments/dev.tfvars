aws_region    = "us-east-1"
environment   = "dev"
lambda_memory = 128

# Secrets - pass via CLI or terraform.tfvars (gitignored):
# terraform apply -var-file=environments/staging.tfvars \
#   -var database_url="postgresql+asyncpg://..." \
#   -var clerk_secret_key="sk_test_..." \
#   -var clerk_publishable_key="pk_test_..." \
#   -var gemini_api_key="..." \
#   -var secret_key="..." \
#   -var cors_origins="http://localhost:3000"
