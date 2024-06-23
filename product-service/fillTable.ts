import {
  DynamoDBClient,
  TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall } from "@aws-sdk/util-dynamodb";

import { products } from "./mockData/products";
import { PRODUCTS_TABLE_NAME, STOCKS_TABLE_NAME } from "./constants/constants";

const client = new DynamoDBClient({region: process.env.PRODUCT_AWS_REGION!})

const fillTable = async () => {
  for (const product of products) {
    const stock = {
      product_id: product.id,
      count: Math.floor(Math.random() * 100) + 1,
    };


    const transactItems = [
      {
        Put: {
          TableName: PRODUCTS_TABLE_NAME,
          Item: marshall(product),
        },
      },
      {
        Put: {
          TableName: STOCKS_TABLE_NAME,
          Item: marshall(stock),
        },
      },
    ];
  
    const command = new TransactWriteItemsCommand({ TransactItems: transactItems });

    try {
      await client.send(command);
    
      console.log(`Successfully created product and stock for product ID: ${product.id}`);
    } catch (error) {
      console.error(`Error creating product and stock for product ID: ${product.id}`, error);
    }
  }
}

fillTable();