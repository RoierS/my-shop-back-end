import { Injectable, Logger } from '@nestjs/common';
import * as NodeCache from 'node-cache';
import { Request } from 'express';
import axios, { AxiosResponse } from 'axios';

@Injectable()
export class BffService {
  private cache = new NodeCache({ stdTTL: 120 });
  private readonly logger = new Logger(BffService.name);

  async proxyRequest(
    service: string,
    query: Record<string, any>,
    req: Request,
  ) {
    this.logger.log(`Processing request for service: ${service}`);
    const recipientURL = process.env[`${service.toUpperCase()}_SERVICE_URL`];

    if (!recipientURL) {
      return { status: 502, error: 'Cannot process request', data: null };
    }

    this.logger.log(`Recipient URL: ${recipientURL}`);

    const url = `${recipientURL}`;

    const method = req.method.toLowerCase();

    this.logger.log(`Request Method: ${method}`);

    if (
      service === 'products' &&
      method === 'get' &&
      req.url === '/products' &&
      this.cache.has('productsList')
    ) {
      return { status: 200, data: this.cache.get('productsList') };
    }

    try {
      const response: AxiosResponse = await axios({
        method,
        url,
        data: req.body,
      });

      if (
        service === 'products' &&
        method === 'get' &&
        req.url === '/products'
      ) {
        this.cache.set('productsList', response.data);
      }

      return { status: response.status, data: response.data };
    } catch (error) {
      if (error.response) {
        return { status: error.response.status, data: error.response.data };
      } else {
        return {
          status: 500,
          data: { error: 'Internal Server Error' },
          error: true,
        };
      }
    }
  }
}
