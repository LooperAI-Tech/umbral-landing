variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "umbral"
}

variable "environment" {
  description = "Environment (prod, staging)"
  type        = string
  default     = "prod"
}

# Lambda
variable "lambda_zip_path" {
  description = "Path to the Lambda deployment zip file"
  type        = string
  default     = "../../backend/lambda.zip"
}

variable "lambda_memory" {
  description = "Lambda memory in MB (128-512 recommended for free tier)"
  type        = number
  default     = 256
}

# App secrets (pass via CLI: -var secret_key=xxx)
variable "database_url" {
  description = "Supabase PostgreSQL connection string"
  type        = string
  sensitive   = true
}

variable "clerk_secret_key" {
  description = "Clerk secret key"
  type        = string
  sensitive   = true
}

variable "clerk_publishable_key" {
  description = "Clerk publishable key"
  type        = string
  sensitive   = true
}

variable "gemini_api_key" {
  description = "Google Gemini API key"
  type        = string
  sensitive   = true
}

variable "gemini_model" {
  description = "Gemini model name"
  type        = string
  default     = "gemini-2.5-flash"
}

variable "secret_key" {
  description = "Application secret key for JWT signing"
  type        = string
  sensitive   = true
}

variable "cors_origins" {
  description = "Comma-separated list of allowed CORS origins"
  type        = string
  default     = "http://localhost:3000"
}
