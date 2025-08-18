import { Test, TestingModule } from '@nestjs/testing';
import { ItemPricingController } from './item-pricing.controller';

describe('ItemPricingController', () => {
  let controller: ItemPricingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemPricingController],
    }).compile();

    controller = module.get<ItemPricingController>(ItemPricingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
