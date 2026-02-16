output "api_gateway_url" {
  description = "API Gateway URL (use as NEXT_PUBLIC_API_URL)"
  value       = aws_apigatewayv2_api.main.api_endpoint
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.api.function_name
}

output "api_gateway_id" {
  description = "API Gateway ID"
  value       = aws_apigatewayv2_api.main.id
}
