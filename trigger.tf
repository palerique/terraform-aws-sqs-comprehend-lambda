resource "aws_lambda_event_source_mapping" "terraform-aws-sqs-comprehend-lambda-event_source_mapping" {
  batch_size = 1
  event_source_arn = aws_sqs_queue.terraform-aws-sqs-comprehend-lambda-queue.arn
  enabled = true
  function_name = aws_lambda_function.eventProcessorLambda.arn
}

resource "aws_lambda_event_source_mapping" "internal-queue-event-sourcing" {
  batch_size = 1
  event_source_arn = aws_sqs_queue.internalQueue.arn
  enabled = true
  function_name = aws_lambda_function.analyzerLambda.arn
}
