resource "aws_s3_bucket_notification" "output_language_bucket_notification" {
  bucket = aws_s3_bucket.terraform-aws-sqs-comprehend-lambda-s3-bucket.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.languageProcessorLambda.arn
    events = [
      "s3:ObjectCreated:*"
    ]
    filter_prefix = "output/language/"
    filter_suffix = ".tar.gz"
  }

  depends_on = [
    aws_lambda_permission.allow_bucket
  ]
}
