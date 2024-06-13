import { handler as getProductByIdHandler } from '../handlers/getProductById';
import { products } from '../mockData/products';
import * as createResponseModule from '../utils/createResponse';

describe('getProductById', () => {
  test('Should return the product by id with status code 200', async () => {
    const productId = products[0].id;
    const { body, statusCode } = await getProductByIdHandler({ pathParameters: { productId } });

    expect(statusCode).toBe(200);
    expect(body).toEqual(JSON.stringify(products[0]));

  })

  test('Should return an error with status code 500 if there is an unexpected error', async () => {
    const mockCreateResponse = jest.fn().mockImplementationOnce(() => {
      return { statusCode: 500, body: JSON.stringify({ message: 'Internal Server Error' }) }
    })
    jest.spyOn(createResponseModule, 'createResponse').mockImplementation(mockCreateResponse);

    const productId = products[0].id;
    const { body, statusCode } = await getProductByIdHandler({ pathParameters: { productId } });

    expect(statusCode).toBe(500);
    expect(body).toEqual(JSON.stringify({ message: 'Internal Server Error' }
    ));

    jest.restoreAllMocks();
  })


  test('Should return an error with status code 404 when product not found', async () => {
    const event = {
      pathParameters: { productId: 'invalid-id' },
    };
    const { body, statusCode } = await getProductByIdHandler(event);
    expect(statusCode).toBe(404);
    expect(body).toEqual(JSON.stringify('Product with id invalid-id not found'));
  })

})