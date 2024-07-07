import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { SQSEvent } from "aws-lambda";
import { createResponse } from "../utils/createResponse";
import { validateProductData } from "../utils/validateProductData";
import { PRODUCTS_TABLE_NAME, STOCKS_TABLE_NAME } from "../constants/constants";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({ region: process.env.PRODUCT_AWS_REGION });

export const handler = async (event: SQSEvent) => {
  console.log("SQS Event:", event);
  try {
    const { Records } = event;

    const snsClient = new SNSClient({
      region: process.env.PRODUCT_AWS_REGION!,
    });

    for (const record of Records) {
      const { body } = record;

      const productData = JSON.parse(body);

      console.log("New Product Data:", productData);

      validateProductData(productData);

      const productId = uuidv4();

      const newProductItem = {
        id: productId,
        title: productData.title,
        description: productData.description,
        price: productData.price,
      };

      const newStockItem = {
        product_id: productId,
        count: productData.count || 0,
      };

      const params = {
        TransactItems: [
          {
            Put: {
              TableName: PRODUCTS_TABLE_NAME,
              Item: newProductItem,
            },
          },
          {
            Put: {
              TableName: STOCKS_TABLE_NAME,
              Item: newStockItem,
            },
          },
        ],
      };

      await client.send(new TransactWriteCommand(params));

      const publishParams = new PublishCommand({
        Subject: "New Products Added",
        Message: JSON.stringify(productData),
        TopicArn: process.env.IMPORT_TOPIC_ARN,
        MessageAttributes: {
          count: {
            DataType: "Number",
            StringValue: productData.count.toString(),
          },
        },
      });

      await snsClient.send(publishParams);
    }

    return createResponse(200, Records);
  } catch (error) {
    console.error(error);

    return createResponse(500, error);
  }
};
