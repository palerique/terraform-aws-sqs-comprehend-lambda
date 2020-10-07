resource "aws_vpc" "terraform-aws-sqs-comprehend-lambda-vpc" {
  cidr_block = "10.0.0.0/16"
}
