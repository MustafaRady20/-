import { Test, TestingModule } from '@nestjs/testing';
import { StokController } from './stok.controller';

describe('StokController', () => {
  let controller: StokController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StokController],
    }).compile();

    controller = module.get<StokController>(StokController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
