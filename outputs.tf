output "sqs_url" {
  value = aws_sqs_queue.terraform-aws-sqs-comprehend-lambda-queue.id
}

output "bucket_id" {
  value = aws_s3_bucket.terraform-aws-sqs-comprehend-lambda-s3-bucket.id
}


output "bucket_name" {
  value = aws_s3_bucket.terraform-aws-sqs-comprehend-lambda-s3-bucket.bucket
}
