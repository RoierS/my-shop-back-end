import { products } from "../data/product"
import { IProduct } from "../interfaces/Product"
import { createResponse } from "../utils/createResponse"

export const handler = async (event: any) => {
  try {
    const productId = event.pathParameters.productId;
    const product = products.find((product: IProduct) => product.id === productId);
    
    if (!product) {
      return createResponse(404, `Product with id ${productId} not found`)
    }

    return createResponse(200, product)

  } catch (error: any) {
    return createResponse(500, error.message)
  }
}

