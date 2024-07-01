import {
  aws_apigatewayv2,
  aws_lambda,
  aws_s3_notifications,
  CfnOutput,
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

const BUCKET_NAME = "my-import-csv-bucket";
const UPLOADED_FOLDER = "uploaded/";
const awsRegion = "eu-west-1";

export class ImportServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = Bucket.fromBucketName(this, "import bucket", BUCKET_NAME);

    const commonProps: Partial<NodejsFunctionProps> = {
      runtime: aws_lambda.Runtime.NODEJS_20_X,
      environment: {
        PRODUCT_AWS_REGION: awsRegion,
        BUCKET_NAME,
        UPLOADED_FOLDER,
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

    bucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new aws_s3_notifications.LambdaDestination(importFileParser),
      { prefix: UPLOADED_FOLDER },
    );

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
    });

    new CfnOutput(this, "ImportService URL", {
      value: `${apiGateway.url}import`,
    });
  }
}
