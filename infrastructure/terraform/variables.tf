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

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "learn.loopertech.net"
}

variable "acm_certificate_validated" {
  description = "Set to true after DNS validation of ACM certificate is complete"
  type        = bool
  default     = false
}

# Database
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "umbral_db"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "umbral_user"
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

# Backend
variable "backend_image" {
  description = "ECR image URI for the backend (e.g. 123456.dkr.ecr.us-east-1.amazonaws.com/umbral-backend:latest)"
  type        = string
  default     = ""
}

variable "gemini_api_key" {
  description = "Google Gemini API key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "apprunner_url" {
  description = "App Runner service URL (set after first deploy)"
  type        = string
  default     = ""
}
