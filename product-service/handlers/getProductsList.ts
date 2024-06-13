import { products } from "../mockData/products"
import { createResponse } from "../utils/createResponse"

export const handler = async () => {
  try {
    return createResponse(200, products)
  } catch (error: any) {
    return createResponse(500, error.message)
  }
}

