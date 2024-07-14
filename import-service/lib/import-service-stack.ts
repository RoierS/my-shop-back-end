import {
  aws_apigatewayv2,
  aws_lambda,
  aws_s3_notifications,
  CfnOutput,
  Duration,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Bucket, EventType } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as dotenv from "dotenv";
import {
  HttpLambdaAuthorizer,
  HttpLambdaResponseType,
} from "aws-cdk-lib/aws-apigatewayv2-authorizers";

dotenv.config();

const BUCKET_NAME = "my-import-csv-bucket";
const UPLOADED_FOLDER = "uploaded/";
const awsRegion = "eu-west-1";

export class ImportServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = Bucket.fromBucketName(this, "import bucket", BUCKET_NAME);

    const queue = sqs.Queue.fromQueueArn(
      this,
      "importItemsQueue",
      "arn:aws:sqs:eu-west-1:992382621053:importItemsQueue",
    );

    console.log("queue.queueUrl:", queue.queueUrl);

    const commonProps: Partial<NodejsFunctionProps> = {
      runtime: aws_lambda.Runtime.NODEJS_20_X,
      environment: {
        PRODUCT_AWS_REGION: awsRegion,
        BUCKET_NAME,
        UPLOADED_FOLDER,
        IMPORT_QUEUE_URL: queue.queueUrl,
      },
    };

    const importProductFile = new NodejsFunction(
      this,
      "ImportProductFileLambda",
      {
        ...commonProps,
        entry: "handlers/importProductFile.ts",
        functionName: "importProductFile",
      },
    );

    bucket.grantReadWrite(importProductFile);

    const importFileParser = new NodejsFunction(
      this,
      "ImportFileParserLambda",
      {
        ...commonProps,
        entry: "handlers/importFileParser.ts",
        functionName: "importFileParser",
      },
    );

    bucket.grantReadWrite(importFileParser);
    bucket.grantDelete(importFileParser);
    queue.grantSendMessages(importFileParser);

    bucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new aws_s3_notifications.LambdaDestination(importFileParser),
      { prefix: UPLOADED_FOLDER },
    );

    const basicAuthorizer = aws_lambda.Function.fromFunctionArn(
      this,
      "basicAuthorizer",
      "arn:aws:lambda:eu-west-1:992382621053:function:basicAuthorizer",
    );

    const authorizer = new HttpLambdaAuthorizer(
      "basicAuthorizer",
      basicAuthorizer,
      {
        responseTypes: [HttpLambdaResponseType.IAM],
        resultsCacheTtl: Duration.seconds(0),
      },
    );

    new aws_lambda.CfnPermission(this, "importPermission", {
      action: "lambda:InvokeFunction",
      functionName: basicAuthorizer.functionName,
      principal: "apigateway.amazonaws.com",
      sourceAccount: this.account,
    });

    const apiGateway = new aws_apigatewayv2.HttpApi(this, "ImportProductApi", {
      apiName: "ImportProductApi",
      corsPreflight: {
        allowHeaders: ["*"],
        allowOrigins: ["*"],
        allowMethods: [aws_apigatewayv2.CorsHttpMethod.ANY],
      },
    });

    apiGateway.addRoutes({
      path: "/import",
      methods: [aws_apigatewayv2.HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        "ImportProductFileIntegration",
        importProductFile,
      ),
      authorizer,
    });

    new CfnOutput(this, "ImportService URL", {
      value: `${apiGateway.url}import`,
    });
    new CfnOutput(this, "importQueueURL", {
      value: queue.queueUrl,
    });
    new CfnOutput(this, "importQueueARN", {
      value: queue.queueArn,
    });
  }
}
