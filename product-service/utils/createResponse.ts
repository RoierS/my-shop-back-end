import { IProduct } from "../interfaces/Product"

export const createResponse = (statusCode: number = 200, body: IProduct[]) => {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(body),
  }
}