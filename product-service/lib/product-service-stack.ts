import * as cdk from 'aws-cdk-lib';
import { aws_apigatewayv2, aws_lambda } from "aws-cdk-lib";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from 'constructs';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const commonProps: Partial<NodejsFunctionProps> =  {
      runtime: aws_lambda.Runtime.NODEJS_20_X,
      environment: {
        PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
      }
    }

    const getProductsList = new NodejsFunction(this, 'GetProductsListLambda', {
      ...commonProps,
      entry: 'handlers/getProductsList.ts',
      functionName: 'getProductsList',
    });

    const apiGateway = new aws_apigatewayv2.HttpApi(this, 'GetProductsListApi', {
      apiName: 'GetProductsListApi',
      corsPreflight: {
        allowHeaders: ['*'],
        allowOrigins: ['*'],
        allowMethods: [aws_apigatewayv2.CorsHttpMethod.GET],
      }
    });

    apiGateway.addRoutes({
      path: '/products',
      methods: [aws_apigatewayv2.HttpMethod.GET],
      integration: new HttpLambdaIntegration('GetProductsListIntegration', getProductsList),
    });

  }
}
