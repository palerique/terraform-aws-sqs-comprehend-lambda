data "archive_file" "terraform-aws-sqs-comprehend-lambda" {
  type = "zip"
  source_dir = "${path.module}/lambda"
  output_path = "${path.module}/terraform-aws-sqs-comprehend-lambda.js.zip"
}

resource "aws_lambda_function" "terraform-aws-sqs-comprehend-lambda" {
  function_name = "terraform-aws-sqs-comprehend-lambda"
  handler = "terraform-aws-sqs-comprehend-lambda.handler"
  role = aws_iam_role.terraform-aws-sqs-comprehend-lambda.arn
  runtime = "nodejs12.x"

  filename = data.archive_file.terraform-aws-sqs-comprehend-lambda.output_path
  source_code_hash = data.archive_file.terraform-aws-sqs-comprehend-lambda.output_base64sha256

  timeout = 30
  memory_size = 128
}
