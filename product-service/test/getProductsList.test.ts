import { handler as getProductsList } from "../handlers/getProductsList";
import {products} from "../data/product";
import * as createResponseModule from '../utils/createResponse';

describe('getProductsList', () => {
  test('Should return the list of products with status code 200', async () => {
    const {body, statusCode} = await getProductsList();

    expect(statusCode).toBe(200);
    expect(body).toEqual(JSON.stringify(products));
  })

  test('Should return an error with status code 500', async () => {
    const mockCreateResponse = jest.fn().mockImplementationOnce(() => {
      return {statusCode: 500, body: JSON.stringify({message: 'Internal Server Error'})}
    })

    jest.spyOn(createResponseModule, 'createResponse').mockImplementation(mockCreateResponse);
    
    const {body, statusCode} = await getProductsList(); 

    expect(statusCode).toBe(500);
    expect(body).toEqual(JSON.stringify({message: 'Internal Server Error'}));

    jest.restoreAllMocks();
  })
})