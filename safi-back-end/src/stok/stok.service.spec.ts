import { Test, TestingModule } from '@nestjs/testing';
import { StokService } from './stok.service';

describe('StokService', () => {
  let service: StokService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StokService],
    }).compile();

    service = module.get<StokService>(StokService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
