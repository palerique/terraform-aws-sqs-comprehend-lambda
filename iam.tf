resource "aws_iam_role" "terraform-aws-sqs-comprehend-lambda" {
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": [
            "lambda.amazonaws.com",
            "comprehend.amazonaws.com"
        ]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "terraform-aws-sqs-comprehend-lambda" {
  policy_arn = aws_iam_policy.terraform-aws-sqs-comprehend-lambda.arn
  role = aws_iam_role.terraform-aws-sqs-comprehend-lambda.name
}

resource "aws_iam_policy" "terraform-aws-sqs-comprehend-lambda" {
  policy = data.aws_iam_policy_document.terraform-aws-sqs-comprehend-lambda.json
}

data "aws_iam_policy_document" "terraform-aws-sqs-comprehend-lambda" {
  statement {
    sid = "AllowSQSPermissions"
    effect = "Allow"
    resources = [
      "arn:aws:sqs:*"]
    actions = [
      "sqs:ChangeMessageVisibility",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
      "sqs:ReceiveMessage",
      "sqs:SendMessage",
    ]
  }

  statement {
    sid = "AllowInvokingLambdas"
    effect = "Allow"
    resources = [
      "arn:aws:lambda:us-east-1:*:function:*"]
    actions = [
      "lambda:InvokeFunction"]
  }

  statement {
    sid = "AllowCreatingLogGroups"
    effect = "Allow"
    resources = [
      "arn:aws:logs:us-east-1:*:*"]
    actions = [
      "logs:CreateLogGroup"]
  }

  statement {
    sid = "AllowWritingLogs"
    effect = "Allow"
    resources = [
      "arn:aws:logs:us-east-1:*:log-group:/aws/lambda/*:*"]

    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
  }

  statement {
    sid = "AllowUsingComprehend"
    effect = "Allow"
    resources = [
      "*"
    ]
    actions = [
      "comprehend:*",
      "s3:ListAllMyBuckets",
      "s3:ListBucket",
      "s3:GetBucketLocation",
      "iam:ListRoles",
      "iam:GetRole"
    ]
  }

  statement {
    sid = "AllowUsingS3"
    effect = "Allow"
    resources = [
      "*"
    ]
    actions = [
      "s3:*"
    ]
  }

  statement {
    sid = "AllowIAMPassRole"
    effect = "Allow"
    resources = [
      "*"
    ]
    actions = [
      "iam:*",
      "iam:PassRole",
      "organizations:DescribeAccount",
      "organizations:DescribeOrganization",
      "organizations:DescribeOrganizationalUnit",
      "organizations:DescribePolicy",
      "organizations:ListChildren",
      "organizations:ListParents",
      "organizations:ListPoliciesForTarget",
      "organizations:ListRoots",
      "organizations:ListPolicies",
      "organizations:ListTargetsForPolicy"
    ]
  }

  statement {
    sid = "AllowAllComprehendActions"
    effect = "Allow"
    resources = [
      "*"
    ]
    actions = [
      "comprehend:*",
      "iam:ListRoles",
      "iam:GetRole",
      "s3:ListAllMyBuckets",
      "s3:ListBucket",
      "s3:GetBucketLocation",
      "iam:CreateRole",
      "iam:CreatePolicy",
      "iam:AttachRolePolicy",
      "iam:PassRole",
      "kms:CreateGrant",
      "kms:Decrypt",
      "kms:GenerateDatakey"
    ]
  }
}

resource "aws_lambda_permission" "allow_bucket" {
  statement_id = "AllowExecutionFromS3Bucket"
  action = "lambda:InvokeFunction"
  function_name = aws_lambda_function.languageProcessorLambda.arn
  principal = "s3.amazonaws.com"
  source_arn = aws_s3_bucket.terraform-aws-sqs-comprehend-lambda-s3-bucket.arn
}
