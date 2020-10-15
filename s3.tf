resource "aws_s3_bucket" "terraform-aws-sqs-comprehend-lambda-s3-bucket" {
  bucket = var.s3_bucket_name
  acl = "private"
  tags = {
    Name = "terraform-aws-s3-bucket"
  }
}
