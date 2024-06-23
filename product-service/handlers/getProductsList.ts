import { DynamoDB } from "aws-sdk";
import { createResponse } from "../utils/createResponse"

const dynamoDb = new DynamoDB.DocumentClient();
const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE_NAME!;
const STOCKS_TABLE_NAME = process.env.STOCKS_TABLE_NAME!;

export const handler = async () => {
  console.log('getting Products List...');
  try {
    const productsScaned = await dynamoDb.scan({TableName: PRODUCTS_TABLE_NAME}).promise();
    const stocksScaned = await dynamoDb.scan({TableName: STOCKS_TABLE_NAME}).promise();

    const products = productsScaned.Items;
    const stocks = stocksScaned.Items;

    console.log('Products List:', products);
    console.log('Stocks List:', stocks);

    const productList = products?.map(product=> {
      const stock = stocks?.find(stock => stock.product_id === product.id);

      return {
        ...product,
        count: stock ? stock.count : 0,
      };
    });

    return createResponse(200, productList)
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return createResponse(500, error.message)
  }
}

