data "archive_file" "eventProcessorLambdaFile" {
  type = "zip"
  source_dir = "${path.module}/eventProcessorLambda"
  output_path = "${path.module}/eventProcessorLambda.js.zip"
}

resource "aws_lambda_function" "eventProcessorLambda" {
  function_name = "eventProcessorLambda"
  handler = "eventProcessorLambda.handler"
  role = aws_iam_role.terraform-aws-sqs-comprehend-lambda.arn
  runtime = "nodejs12.x"

  filename = data.archive_file.eventProcessorLambdaFile.output_path
  source_code_hash = data.archive_file.eventProcessorLambdaFile.output_base64sha256

  timeout = 30
  memory_size = 128

  environment {
    variables = {
      ROLE_ARN = aws_iam_role.terraform-aws-sqs-comprehend-lambda.arn
    }
  }
}
