aws_region  = "us-east-1"
environment = "prod"
domain_name = "learn.loopertech.net"

# Database
db_instance_class = "db.t4g.micro"
db_name           = "umbral_db"
db_username       = "umbral_user"
# db_password     = "SET_VIA_CLI: -var db_password=xxx"

# Backend (set after pushing image to ECR)
# backend_image = "123456.dkr.ecr.us-east-1.amazonaws.com/umbral-backend:latest"
# gemini_api_key = "SET_VIA_CLI: -var gemini_api_key=xxx"
