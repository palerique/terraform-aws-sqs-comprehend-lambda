//************************************************
//EVENT_PROCESSOR_LAMBDA:
//************************************************
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

  timeout = 3
  memory_size = 128

  environment {
    variables = {
      ROLE_ARN = aws_iam_role.terraform-aws-sqs-comprehend-lambda.arn
      SQS_INTERNAL_QUEUE = aws_sqs_queue.internalQueue.id
      SQS_ERROR_QUEUE = aws_sqs_queue.errorQueue.id
      BUCKET = aws_s3_bucket.terraform-aws-sqs-comprehend-lambda-s3-bucket.bucket
    }
  }
}

//************************************************
//LANGUAGE_PROCESSOR_LAMBDA:
//************************************************
data "archive_file" "languageProcessorLambdaFile" {
  type = "zip"
  source_dir = "${path.module}/languageProcessorLambda"
  output_path = "${path.module}/languageProcessorLambda.js.zip"
}

resource "aws_lambda_function" "languageProcessorLambda" {
  function_name = "languageProcessorLambda"
  handler = "languageProcessorLambda.handler"
  role = aws_iam_role.terraform-aws-sqs-comprehend-lambda.arn
  runtime = "nodejs12.x"

  filename = data.archive_file.languageProcessorLambdaFile.output_path
  source_code_hash = data.archive_file.languageProcessorLambdaFile.output_base64sha256

  timeout = 3
  memory_size = 128

  environment {
    variables = {
      ROLE_ARN = aws_iam_role.terraform-aws-sqs-comprehend-lambda.arn
      SQS_INTERNAL_QUEUE = aws_sqs_queue.internalQueue.id
      SQS_ERROR_QUEUE = aws_sqs_queue.errorQueue.id
      BUCKET = aws_s3_bucket.terraform-aws-sqs-comprehend-lambda-s3-bucket.bucket
    }
  }
}

//************************************************
//ANALYZER_LAMBDA:
//************************************************
data "archive_file" "analyzerLambdaFile" {
  type = "zip"
  source_dir = "${path.module}/analyzerLambda"
  output_path = "${path.module}/analyzerLambda.js.zip"
}

resource "aws_lambda_function" "analyzerLambda" {
  function_name = "analyzerLambda"
  handler = "analyzerLambda.handler"
  role = aws_iam_role.terraform-aws-sqs-comprehend-lambda.arn
  runtime = "nodejs12.x"

  filename = data.archive_file.analyzerLambdaFile.output_path
  source_code_hash = data.archive_file.analyzerLambdaFile.output_base64sha256

  timeout = 3
  memory_size = 128

  environment {
    variables = {
      ROLE_ARN = aws_iam_role.terraform-aws-sqs-comprehend-lambda.arn
      SQS_INTERNAL_QUEUE = aws_sqs_queue.internalQueue.id
      SQS_ERROR_QUEUE = aws_sqs_queue.errorQueue.id
      BUCKET = aws_s3_bucket.terraform-aws-sqs-comprehend-lambda-s3-bucket.bucket
    }
  }
}
