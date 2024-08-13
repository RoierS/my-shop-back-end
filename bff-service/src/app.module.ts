import { Module } from '@nestjs/common';
import { BffController } from './bff/bff.controller';
import { BffService } from './bff/bff.service';

@Module({
  imports: [],
  controllers: [BffController],
  providers: [BffService],
})
export class AppModule {}
