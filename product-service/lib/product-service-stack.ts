import * as cdk from "aws-cdk-lib";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as sns from "aws-cdk-lib/aws-sns";

import { aws_apigatewayv2, aws_dynamodb, aws_lambda } from "aws-cdk-lib";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productsTable = aws_dynamodb.Table.fromTableName(
      this,
      "ProductsTable",
      "products_DB",
    );
    const stocksTable = aws_dynamodb.Table.fromTableName(
      this,
      "StocksTable",
      "stocks_DB",
    );

    const importQueue = new sqs.Queue(this, "importItemsQueue", {
      queueName: "importItemsQueue",
    });

    const importTopic = new sns.Topic(this, "importItemsTopic", {
      topicName: "importItemsTopic",
    });

    new sns.Subscription(this, "StockSubscription", {
      topic: importTopic,
      protocol: sns.SubscriptionProtocol.EMAIL,
      endpoint: process.env.STOCK_EMAIL!,
    });

    new sns.Subscription(this, "FilteredStockSubscription", {
      topic: importTopic,
      protocol: sns.SubscriptionProtocol.EMAIL,
      endpoint: process.env.STOCK_EMAIL!,
      filterPolicy: {
        price: sns.SubscriptionFilter.numericFilter({ lessThanOrEqualTo: 20 }),
      },
    });

    const commonProps: Partial<NodejsFunctionProps> = {
      runtime: aws_lambda.Runtime.NODEJS_20_X,
      environment: {
        PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        STOCKS_TABLE_NAME: stocksTable.tableName,
        IMPORT_TOPIC_ARN: importTopic.topicArn,
      },
    };

    const getProductsList = new NodejsFunction(this, "GetProductsListLambda", {
      ...commonProps,
      entry: "handlers/getProductsList.ts",
      functionName: "getProductsList",
    });

    const getProductById = new NodejsFunction(this, "GetProductByIdLambda", {
      ...commonProps,
      entry: "handlers/getProductById.ts",
      functionName: "getProductById",
    });

    const createProduct = new NodejsFunction(this, "CreateProductLambda", {
      ...commonProps,
      entry: "handlers/createProduct.ts",
      functionName: "createProduct",
    });

    const catalogBatchProcess = new NodejsFunction(
      this,
      "CatalogBatchProcessLambda",
      {
        ...commonProps,
        entry: "handlers/catalogBatchProcess.ts",
        functionName: "catalogBatchProcess",
      },
    );

    catalogBatchProcess.addEventSource(
      new SqsEventSource(importQueue, { batchSize: 5 }),
    );

    const apiGateway = new aws_apigatewayv2.HttpApi(
      this,
      "GetProductsListApi",
      {
        apiName: "GetProductsListApi",
        corsPreflight: {
          allowHeaders: ["*"],
          allowOrigins: ["*"],
          allowMethods: [aws_apigatewayv2.CorsHttpMethod.GET],
        },
      },
    );

    productsTable.grantReadData(getProductsList);
    productsTable.grantReadData(getProductById);
    productsTable.grantWriteData(createProduct);
    productsTable.grantReadWriteData(catalogBatchProcess);

    stocksTable.grantReadData(getProductsList);
    stocksTable.grantReadData(getProductById);
    stocksTable.grantWriteData(createProduct);
    stocksTable.grantReadWriteData(catalogBatchProcess);

    importTopic.grantPublish(catalogBatchProcess);

    apiGateway.addRoutes({
      path: "/products",
      methods: [aws_apigatewayv2.HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        "GetProductsListIntegration",
        getProductsList,
      ),
    });

    apiGateway.addRoutes({
      path: "/products/{productId}",
      methods: [aws_apigatewayv2.HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        "GetProductByIdIntegration",
        getProductById,
      ),
    });

    apiGateway.addRoutes({
      path: "/products",
      methods: [aws_apigatewayv2.HttpMethod.POST],
      integration: new HttpLambdaIntegration(
        "CreateProductIntegration",
        createProduct,
      ),
    });
  }
}
