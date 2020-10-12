# terraform-aws-sqs-comprehend-lambda
A lab testing terraform on aws with sqs, comprehend and lambda

## Usage

```
$ terraform init
$ terraform plan
$ terraform apply
$ aws sqs send-message --queue-url $(terraform output sqs_url) --message-body "hello, world"
```

```
aws sqs send-message-batch \
    --queue-url https://sqs.us-east-1.amazonaws.com/799098231639/terraform-aws-sqs-comprehend-lambda-queue \
    --entries file://send-message-batch.json
```

## Resources

* https://github.com/flosell/terraform-sqs-lambda-trigger-example
* https://github.com/gruntwork-io/cloud-nuke

## Interesting/Useful commands:

```shell script
terraform destroy -auto-approve ||  cloud-nuke aws --region us-east-1 
terraform apply -auto-approve && aws sqs send-message-batch --queue-url https://sqs.us-east-1.amazonaws.com/799098231639/terraform-aws-sqs-comprehend-lambda-queue --entries file://send-message-batch.json
```


