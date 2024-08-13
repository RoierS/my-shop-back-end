import { Test, TestingModule } from '@nestjs/testing';
import { BffController } from './bff.controller';

describe('BffController', () => {
  let controller: BffController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BffController],
    }).compile();

    controller = module.get<BffController>(BffController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
