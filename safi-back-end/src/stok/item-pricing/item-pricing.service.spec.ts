import { Test, TestingModule } from '@nestjs/testing';
import { ItemPricingService } from './item-pricing.service';

describe('ItemPricingService', () => {
  let service: ItemPricingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ItemPricingService],
    }).compile();

    service = module.get<ItemPricingService>(ItemPricingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
