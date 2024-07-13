import * as cdk from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as dotenv from "dotenv";

dotenv.config();

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
  }

  basicAuthorizer = new NodejsFunction(this, "GetProductsListLambda", {
    runtime: Runtime.NODEJS_20_X,
    functionName: "basicAuthorizer",
    entry: "handlers/basicAuthorizer.ts",
    handler: "handler",
  });
}
