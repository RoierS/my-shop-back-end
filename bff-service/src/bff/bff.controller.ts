import {
  All,
  Controller,
  HttpStatus,
  Param,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { BffService } from './bff.service';
import { Request, Response } from 'express';

@Controller()
export class BffController {
  constructor(private readonly bffService: BffService) {}

  @All(':service')
  async handleRequest(
    @Param('service') service: string,
    @Query() query: Record<string, any>,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.bffService.proxyRequest(service, query, req);

    if (result.error) {
      return res
        .status(HttpStatus.BAD_GATEWAY)
        .json({ error: 'Cannot process request' });
    }

    res.status(HttpStatus.OK).json(result.data);
  }
}
