
import { createResponse } from "../utils/createResponse"

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.PRODUCT_AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE_NAME!;
const STOCKS_TABLE_NAME = process.env.STOCKS_TABLE_NAME!;

export const handler = async (event: any) => {
  console.log('Invoking getProductById:', event);
  const productId = event.pathParameters.productId;

  try {
    const productParams = {
      TableName: PRODUCTS_TABLE_NAME,
      Key: {id: `${productId}`},
    };

    const stockParams = {
      TableName: STOCKS_TABLE_NAME,
      Key: { product_id: `${productId}` },
    };

    const [productResult, stockResult] = await Promise.all([
      docClient.send(new GetCommand(productParams)),
      docClient.send(new GetCommand(stockParams)),
    ]);

    if (!productResult.Item || !stockResult.Item) {
      return createResponse(404, `Product with id ${productId} not found`);
    }

    const product = productResult.Item;
    const stock = stockResult.Item;

    const responseProduct = {
      ...product,
      price: product.price,
      count: stock.count,
    };

    return createResponse(200, responseProduct);
  } catch (error: any) {
    console.error('Error fetching product by id:', error);
    return createResponse(500, error.message);
  }
}

