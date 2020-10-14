resource "aws_sqs_queue" "terraform-aws-sqs-comprehend-lambda-queue" {
  name = "terraform-aws-sqs-comprehend-lambda-queue"
}

resource "aws_sqs_queue" "internalQueue" {
  name = "internalQueue"
}

resource "aws_sqs_queue" "errorQueue" {
  name = "errorQueue"
}
