output "sqs_url" {
  value = aws_sqs_queue.terraform-aws-sqs-comprehend-lambda-queue.id
}
