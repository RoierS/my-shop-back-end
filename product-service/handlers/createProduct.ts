import { v4 as uuidv4 } from 'uuid';
import { PRODUCTS_TABLE_NAME, STOCKS_TABLE_NAME } from "../constants/constants";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { createResponse } from "../utils/createResponse";

const client = new DynamoDBClient({ region: process.env.PRODUCT_AWS_REGION })

export const handler = async (event: any) => {
  console.log('Create Product Lambda:', event);
  try {
    const { title, description, price, count } = JSON.parse(event.body);
    const productId = uuidv4();

    const newProductItem = {
      id: productId,
      title,
      description,
      price,
    }

    const newStockItem = {
      product_id: productId,
      count: count,
    }

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
      ]
    }

    await client.send(new TransactWriteCommand(params))

    return createResponse(201, newProductItem)
  } catch (error: any) {
    console.error('Error creating product:', error);
    
    return createResponse(500, error.message);
  }
}